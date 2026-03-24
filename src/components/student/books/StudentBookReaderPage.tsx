"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import HTMLFlipBook from "react-pageflip";
import {
  BookOpen,
  Headphones,
  Pause,
  Play,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import StudentShell from "@/src/components/student/layout/StudentShell";
import BookReaderPageSheet from "@/src/components/student/books/BookReaderPageSheet";
import { isBookAllowedForStudent } from "@/src/lib/student-book-eligibility";
import {
  getPublishedSchoolStoryBundle,
  submitStudentContentAnswers,
  type SchoolQuestion,
  type SchoolStoryBundle,
} from "@/src/lib/school-content-api";

interface ReaderPage {
  id: string;
  title: string;
  body: string;
  label: string;
  kind: "cover" | "story" | "end";
  chapterNumber?: number;
  sectionNumber?: number;
}

const defaultRate = 0.95;
const chapterPageCharacterLimit = 980;

const splitChapterIntoSections = (body?: string) => {
  const normalized = (body ?? "").trim();
  if (!normalized) return ["No chapter text returned yet."];

  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [normalized];

  const sections: string[] = [];
  let current = "";

  paragraphs.forEach((paragraph) => {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > chapterPageCharacterLimit && current) {
      sections.push(current);
      current = paragraph;
      return;
    }

    current = candidate;
  });

  if (current) {
    sections.push(current);
  }

  return sections;
};

const buildReaderPages = (bundle: SchoolStoryBundle | null): ReaderPage[] => {
  if (!bundle) return [];

  const title =
    bundle.story?.content.title ?? bundle.contentPack?.title ?? bundle.requestedContent?.title ?? "Story Book";
  const summary =
    bundle.story?.content.summary ??
    bundle.story?.content.description ??
    "Open the book and begin your adventure.";

  const pages: ReaderPage[] = [
    {
      id: "front-cover",
      title,
      body: `${summary}\n\nWritten by PathSpring`,
      label: "Cover",
      kind: "cover",
    },
  ];

  (bundle.story?.chapters ?? []).forEach((chapter, index) => {
    const sections = splitChapterIntoSections(chapter.body);

    sections.forEach((section, sectionIndex) => {
      pages.push({
        id: `${chapter._id ?? `chapter-${index}`}-section-${sectionIndex + 1}`,
        title: chapter.title ?? `Chapter ${index + 1}`,
        body: section,
        label: `Page ${pages.length + 1}`,
        kind: "story",
        chapterNumber: index + 1,
        sectionNumber: sections.length > 1 ? sectionIndex + 1 : undefined,
      });
    });
  });

  pages.push({
    id: "back-cover",
    title: "The End",
    body: "You finished the story. Keep exploring the quiz and activities below to complete your reading adventure.",
    label: "Back Cover",
    kind: "end",
  });

  return pages;
};

const normalizeAnswer = (value?: string) => (value ?? "").trim().toLowerCase();

export default function StudentBookReaderPage({ bookId }: { bookId: string }) {
  const { user } = useAuth();
  const [bundle, setBundle] = useState<SchoolStoryBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceRate, setVoiceRate] = useState(defaultRate);
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const startTimeRef = useRef<number>(Date.now());
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      setError("");

      try {
        const nextBundle = await getPublishedSchoolStoryBundle(bookId);
        const restrictedContent =
          nextBundle.story?.content ?? nextBundle.contentPack ?? nextBundle.requestedContent;

        if (!isBookAllowedForStudent(restrictedContent, user)) {
          throw new Error("This book is for another class level, so it is not available in your reader.");
        }

        setBundle(nextBundle);
        setCurrentPage(0);
        startTimeRef.current = Date.now();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load this story.");
      } finally {
        setLoading(false);
      }
    };

    void loadBundle();

    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, [bookId, user]);

  const readerPages = useMemo(() => buildReaderPages(bundle), [bundle]);
  const activePage = readerPages[currentPage];
  const quizQuestions = (bundle?.quiz?.questions?.length ? bundle.quiz.questions : bundle?.story?.questions) ?? [];
  const storyContentId = bundle?.requestedContent?._id ?? bundle?.story?.content._id ?? bookId;

  const stopSpeaking = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const speakPage = () => {
    if (typeof window === "undefined" || !activePage) return;

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(`${activePage.title}. ${activePage.body}`);
    utterance.rate = voiceRate;
    utterance.pitch = 1;
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (typeof window === "undefined" || !isSpeaking) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizQuestions.length) return;

    setSubmitting(true);
    setSubmissionMessage("");

    try {
      let correctCount = 0;
      const answers = quizQuestions.map((question, index) => {
        const key = question._id ?? `question-${index}`;
        const answer = selectedAnswers[key] ?? "";
        return {
          questionId: key,
          answer,
        };
      });

      quizQuestions.forEach((question, index) => {
        const key = question._id ?? `question-${index}`;
        const chosen = normalizeAnswer(selectedAnswers[key]);
        const acceptedAnswers = (question.correctAnswers ?? []).map((answer) => normalizeAnswer(answer));
        if (chosen && acceptedAnswers.includes(chosen)) {
          correctCount += 1;
        }
      });

      const score = Math.round((correctCount / quizQuestions.length) * 100);
      const elapsedSeconds = Math.max(60, Math.round((Date.now() - startTimeRef.current) / 1000));

      const strengths = quizQuestions
        .filter((question, index) => {
          const key = question._id ?? `question-${index}`;
          const chosen = normalizeAnswer(selectedAnswers[key]);
          return (question.correctAnswers ?? []).map(normalizeAnswer).includes(chosen);
        })
        .map((question) => question.prompt ?? "Correct answer");

      const struggleAreas = quizQuestions
        .filter((question, index) => {
          const key = question._id ?? `question-${index}`;
          const chosen = normalizeAnswer(selectedAnswers[key]);
          return !(question.correctAnswers ?? []).map(normalizeAnswer).includes(chosen);
        })
        .map((question) => question.prompt ?? "Needs review");

      await submitStudentContentAnswers(storyContentId, {
        answers,
        timeSpentSeconds: elapsedSeconds,
        startedAt: new Date(startTimeRef.current).toISOString(),
        feedback:
          [
            strengths.length ? `Strengths: ${strengths.slice(0, 3).join(", ")}` : "",
            struggleAreas.length ? `Review: ${struggleAreas.slice(0, 3).join(", ")}` : "",
          ]
            .filter(Boolean)
            .join(" | ") || undefined,
      });

      setSubmissionMessage(`Quiz submitted. You scored ${score}%.`);
    } catch (err) {
      setSubmissionMessage(err instanceof Error ? err.message : "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentShell>
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[2.4rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_24%),linear-gradient(180deg,#fffef2_0%,#eefcf6_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_24%),linear-gradient(180deg,#0b1120_0%,#111827_100%)] md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-300">
                  <Sparkles size={16} />
                  Storybook Reader
                </div>
                <h2 className="mt-5 text-4xl font-black leading-tight text-slate-900 dark:text-white">
                  {getBundleTitle(bundle)}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600 dark:text-slate-300">
                  Flip each page like a real book, listen with voice reading, and then finish the quiz and story activities below.
                </p>
              </div>

              <Link
                href="/student/books"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-emerald-300"
              >
                <BookOpen size={18} />
                Back to Bookshelf
              </Link>
            </div>
          </section>

          <section className="rounded-[2.3rem] border border-white/70 bg-white/90 p-5 shadow-[0_35px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-7">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={speakPage}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg"
                >
                  <Volume2 size={18} />
                  Read Aloud
                </button>
                <button
                  onClick={togglePause}
                  disabled={!isSpeaking}
                  className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 font-semibold text-emerald-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-emerald-300"
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                  {isPaused ? "Continue" : "Pause"}
                </button>
                <button
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 font-semibold text-slate-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                >
                  <Headphones size={18} />
                  Stop Voice
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Voice Speed</span>
                  <input
                    type="range"
                    min="0.7"
                    max="1.2"
                    step="0.05"
                    value={voiceRate}
                    onChange={(event) => setVoiceRate(Number(event.target.value))}
                    className="accent-emerald-500"
                  />
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-white/10 dark:bg-white/5 dark:text-amber-300">
                  Page {currentPage + 1} of {readerPages.length}
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-sky-300">
                  Click a page edge or swipe to flip
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_26%),linear-gradient(180deg,#fff7db_0%,#fffdf4_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_26%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-6">
              <div className="flex items-center justify-center">
                <div className="w-full max-w-[76rem]">
                  <HTMLFlipBook
                    ref={bookRef}
                    width={860}
                    height={1060}
                    className="mx-auto"
                    style={{}}
                    minWidth={320}
                    maxWidth={860}
                    minHeight={560}
                    maxHeight={1060}
                    size="stretch"
                    drawShadow
                    flippingTime={1000}
                    usePortrait
                    startPage={0}
                    startZIndex={0}
                    autoSize
                    maxShadowOpacity={0.55}
                    showCover
                    mobileScrollSupport
                    clickEventForward
                    useMouseEvents
                    swipeDistance={20}
                    showPageCorners
                    disableFlipByClick={false}
                    onFlip={(event) => {
                      stopSpeaking();
                      setCurrentPage(event.data);
                    }}
                  >
                    {readerPages.map((page) => (
                      <BookReaderPageSheet
                        key={page.id}
                        title={page.title}
                        body={page.body}
                        label={page.label}
                        kind={page.kind}
                        chapterNumber={page.chapterNumber}
                        sectionNumber={page.sectionNumber}
                      />
                    ))}
                  </HTMLFlipBook>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {readerPages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      stopSpeaking();
                      bookRef.current?.pageFlip?.().flip(index);
                    }}
                    className={`rounded-full transition-all ${
                      index === currentPage
                        ? "w-10 bg-emerald-500 px-1 py-1.5"
                        : "w-3 bg-emerald-200 px-1 py-1.5 dark:bg-white/20"
                    }`}
                    aria-label={`Go to ${page.label}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Quiz Time</h3>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {quizQuestions.length} questions
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {quizQuestions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-5 py-10 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    No quiz questions were attached to this story yet.
                  </div>
                ) : (
                  quizQuestions.map((question: SchoolQuestion, index) => {
                    const key = question._id ?? `question-${index}`;
                    return (
                      <div key={key} className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <p className="text-sm font-bold leading-7 text-slate-900 dark:text-white">
                          {index + 1}. {question.prompt ?? "Question"}
                        </p>
                        <div className="mt-3 grid gap-2">
                          {(question.options ?? []).map((option) => {
                            const active = selectedAnswers[key] === option;
                            return (
                              <button
                                key={option}
                                onClick={() => handleAnswerChange(key, option)}
                                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                                  active
                                    ? "border-emerald-400 bg-white text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                    : "border-transparent bg-white/80 text-slate-700 hover:border-emerald-200 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-white/10"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {quizQuestions.length > 0 ? (
                <div className="mt-6">
                  <button
                    onClick={() => void handleSubmitQuiz()}
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg disabled:opacity-60"
                  >
                    <Sparkles size={18} />
                    {submitting ? "Saving your score..." : "Submit My Answers"}
                  </button>
                  {submissionMessage ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {submissionMessage}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Story Activities</h3>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                  {bundle?.activities.length ?? 0}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {(bundle?.activities ?? []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50 px-5 py-10 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    No extra activities were attached yet.
                  </div>
                ) : (
                  bundle?.activities.map((activity, index) => (
                    <div
                      key={activity._id ?? `${activity.title}-${index}`}
                      className="rounded-[1.5rem] border border-cyan-100 bg-cyan-50 p-4 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{activity.title}</h4>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-700 dark:bg-white/10 dark:text-cyan-300">
                          {activity.configuration?.activityType ?? "activity"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {activity.summary ?? activity.description ?? "Enjoy this classroom activity after reading."}
                      </p>
                      {activity.configuration?.tasks?.length ? (
                        <div className="mt-4 space-y-2">
                          {activity.configuration.tasks.map((task) => (
                            <div
                              key={task}
                              className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-700 dark:bg-slate-950/50 dark:text-slate-200"
                            >
                              {task}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </StudentShell>
  );
}

const getBundleTitle = (bundle: SchoolStoryBundle | null) =>
  bundle?.story?.content.title ?? bundle?.contentPack?.title ?? bundle?.requestedContent?.title ?? "Story Book";
