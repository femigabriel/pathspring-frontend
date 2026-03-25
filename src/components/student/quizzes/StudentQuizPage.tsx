"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlarmClock, ArrowLeft, CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import StudentShell from "@/src/components/student/layout/StudentShell";
import { isBookAllowedForStudent } from "@/src/lib/student-book-eligibility";
import {
  getPublishedSchoolStoryBundle,
  submitStudentContentAnswers,
  type SchoolQuestion,
  type SchoolStoryBundle,
} from "@/src/lib/school-content-api";

const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const normalizeAnswer = (value?: string) => (value ?? "").trim().toLowerCase();

export default function StudentQuizPage({ bookId }: { bookId: string }) {
  const { user } = useAuth();
  const [bundle, setBundle] = useState<SchoolStoryBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      setError("");

      try {
        const nextBundle = await getPublishedSchoolStoryBundle(bookId);
        const restrictedContent =
          nextBundle.story?.content ?? nextBundle.contentPack ?? nextBundle.requestedContent;

        if (!isBookAllowedForStudent(restrictedContent, user)) {
          throw new Error("This quiz is for another class level, so it is not available to you.");
        }

        setBundle(nextBundle);
        startTimeRef.current = Date.now();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load this quiz.");
      } finally {
        setLoading(false);
      }
    };

    void loadBundle();
  }, [bookId, user]);

  useEffect(() => {
    if (loading || error) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loading, error]);

  const quizQuestions = useMemo(
    () => ((bundle?.quiz?.questions?.length ? bundle.quiz.questions : bundle?.story?.questions) ?? []) as SchoolQuestion[],
    [bundle],
  );
  const storyContentId = bundle?.requestedContent?._id ?? bundle?.story?.content._id ?? bookId;
  const title =
    bundle?.story?.content.title ?? bundle?.contentPack?.title ?? bundle?.requestedContent?.title ?? "Quiz";

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

      await submitStudentContentAnswers(storyContentId, {
        answers,
        timeSpentSeconds: Math.max(60, elapsedSeconds),
        startedAt: new Date(startTimeRef.current).toISOString(),
        feedback: `Timed quiz completed in ${formatTimer(Math.max(1, elapsedSeconds))}.`,
      });

      setSubmissionMessage(`Quiz submitted. You scored ${score}% in ${formatTimer(Math.max(1, elapsedSeconds))}.`);
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
          <section className="overflow-hidden rounded-[2.3rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_24%),linear-gradient(180deg,#f0fdf4_0%,#fffbeb_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_24%),linear-gradient(180deg,#0b1120_0%,#111827_100%)] md:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-300">
                  <Sparkles size={16} />
                  Quiz Time
                </div>
                <h2 className="mt-5 text-3xl font-black leading-tight text-slate-900 dark:text-white">
                  {title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600 dark:text-slate-300">
                  Answer the questions for this book. Your timer started when the quiz opened.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/student/quizzes"
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-emerald-300"
                >
                  <ArrowLeft size={16} />
                  Back to Quizzes
                </Link>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 dark:border-white/10 dark:bg-white/5 dark:text-amber-300">
                  <div className="flex items-center gap-2">
                    <AlarmClock size={16} />
                    {formatTimer(elapsedSeconds)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2.2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Questions</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {quizQuestions.length} questions for this book
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={14} />
                  Timed quiz
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {quizQuestions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-5 py-10 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  No quiz questions were attached to this story yet.
                </div>
              ) : (
                quizQuestions.map((question, index) => {
                  const key = question._id ?? `question-${index}`;
                  return (
                    <div key={key} className="rounded-[1.6rem] border border-emerald-100 bg-emerald-50 p-5 dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                        Question {index + 1}
                      </p>
                      <p className="mt-3 text-lg font-bold leading-8 text-slate-900 dark:text-white">
                        {question.prompt ?? "Question"}
                      </p>
                      <div className="mt-4 grid gap-3">
                        {(question.options ?? []).map((option) => {
                          const active = selectedAnswers[key] === option;
                          return (
                            <button
                              key={option}
                              onClick={() => handleAnswerChange(key, option)}
                              className={`rounded-2xl border px-4 py-4 text-left text-sm transition-all ${
                                active
                                  ? "border-emerald-400 bg-white text-emerald-700 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"
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
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg disabled:opacity-60"
                >
                  <CheckCircle2 size={18} />
                  {submitting ? "Saving your score..." : "Submit Quiz"}
                </button>
                {submissionMessage ? (
                  <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {submissionMessage}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </StudentShell>
  );
}
