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
  type SchoolStoryBundle,
} from "@/src/lib/school-content-api";

interface ReaderPage {
  id: string;
  title: string;
  body: string;
  label: string;
  kind: "cover" | "story" | "end";
  imageUrl?: string;
  chapterNumber?: number;
  sectionNumber?: number;
}

const defaultRate = 0.95;
const pageWidthToHeightRatio = 0.76;
const desktopSidebarWidth = 288;

const splitLongParagraph = (paragraph: string, limit: number) => {
  if (paragraph.length <= limit) return [paragraph];

  const sentenceChunks =
    paragraph.match(/[^.!?]+[.!?"]?\s*/g)?.map((chunk) => chunk.trim()) ?? [];
  const sourceChunks = sentenceChunks.length > 1 ? sentenceChunks : paragraph.split(/\s+/);
  const pieces: string[] = [];
  let current = "";

  sourceChunks.forEach((chunk) => {
    const separator = sentenceChunks.length > 1 ? " " : " ";
    const candidate = current ? `${current}${separator}${chunk}` : chunk;

    if (candidate.length > limit && current) {
      pieces.push(current.trim());
      current = chunk;
      return;
    }

    current = candidate;
  });

  if (current.trim()) {
    pieces.push(current.trim());
  }

  return pieces.length ? pieces : [paragraph];
};

const splitChapterIntoSections = (
  body?: string,
  firstSectionLimit = 880,
  followingSectionLimit = 1120,
) => {
  const normalized = (body ?? "").trim();
  if (!normalized) return ["No chapter text returned yet."];

  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [normalized];

  const sections: string[] = [];
  let current = "";
  let currentLimit = firstSectionLimit;

  paragraphs.forEach((paragraph) => {
    splitLongParagraph(paragraph, currentLimit).forEach((piece) => {
      const candidate = current ? `${current}\n\n${piece}` : piece;
      if (candidate.length > currentLimit && current) {
        sections.push(current);
        current = piece;
        currentLimit = followingSectionLimit;
        return;
      }

      current = candidate;
    });
  });

  if (current) {
    sections.push(current);
  }

  return sections;
};

const buildReaderPages = (bundle: SchoolStoryBundle | null): ReaderPage[] => {
  if (!bundle) return [];

  const title =
    bundle.story?.content.title ??
    bundle.contentPack?.title ??
    bundle.requestedContent?.title ??
    "Story Book";
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
      imageUrl: bundle.story?.content.coverImageUrl,
    },
  ];

  (bundle.story?.chapters ?? []).forEach((chapter, index) => {
    const sections = splitChapterIntoSections(
      chapter.body,
      chapter.imageUrl ? 620 : 900,
      1120,
    );

    sections.forEach((section, sectionIndex) => {
      pages.push({
        id: `${chapter._id ?? `chapter-${index}`}-section-${sectionIndex + 1}`,
        title: chapter.title ?? `Chapter ${index + 1}`,
        body: section,
        label: `Page ${pages.length + 1}`,
        kind: "story",
        imageUrl: sectionIndex === 0 ? chapter.imageUrl : undefined,
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

export default function StudentBookReaderPage({ bookId }: { bookId: string }) {
  const { user } = useAuth();
  const [bundle, setBundle] = useState<SchoolStoryBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceRate, setVoiceRate] = useState(defaultRate);
  const [bookSize, setBookSize] = useState({ width: 520, height: 684 });
  const startTimeRef = useRef<number>(Date.now());
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const bookRef = useRef<any>(null);
  const bookViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      setError("");

      try {
        const nextBundle = await getPublishedSchoolStoryBundle(bookId);
        const restrictedContent =
          nextBundle.story?.content ??
          nextBundle.contentPack ??
          nextBundle.requestedContent;

        if (!isBookAllowedForStudent(restrictedContent, user)) {
          throw new Error(
            "This book is for another class level, so it is not available in your reader.",
          );
        }

        setBundle(nextBundle);
        setCurrentPage(0);
        startTimeRef.current = Date.now();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load this story.",
        );
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

    const utterance = new SpeechSynthesisUtterance(
      `${activePage.title}. ${activePage.body}`,
    );
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateBookSize = () => {
      const containerWidth =
        bookViewportRef.current?.clientWidth ??
        window.innerWidth - (window.innerWidth >= 1024 ? desktopSidebarWidth : 0);
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1280;
      const availableWidth = Math.max(260, containerWidth - (isMobile ? 12 : 36));
      const reservedHeight = isMobile ? 380 : isTablet ? 340 : 320;
      const availableHeight = Math.max(420, window.innerHeight - reservedHeight);
      const landscapePageWidth = (availableWidth - 28) / 2;
      const portraitPageWidth = availableWidth - 12;
      const targetPageWidth = availableWidth < 900 ? portraitPageWidth : landscapePageWidth;

      let width = Math.min(660, Math.max(240, targetPageWidth));
      let height = width / pageWidthToHeightRatio;

      if (height > availableHeight) {
        height = availableHeight;
        width = height * pageWidthToHeightRatio;
      }

      setBookSize({
        width: Math.round(width),
        height: Math.round(height),
      });
    };

    updateBookSize();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && bookViewportRef.current
        ? new ResizeObserver(() => updateBookSize())
        : null;

    resizeObserver?.observe(bookViewportRef.current as Element);
    window.addEventListener("resize", updateBookSize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateBookSize);
    };
  }, []);

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
        <div className="space-y-6 md:space-y-8">
          <section className="overflow-hidden rounded-[2.4rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_24%),linear-gradient(180deg,#fffef2_0%,#eefcf6_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_24%),linear-gradient(180deg,#0b1120_0%,#111827_100%)] md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-300">
                  <Sparkles size={16} />
                  Storybook Reader
                </div>
                <h2 className="mt-5 text-3xl font-black leading-tight text-slate-900 dark:text-white md:text-4xl">
                  {getBundleTitle(bundle)}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600 dark:text-slate-300">
                  Flip each page like a real book and listen with voice reading.
                  When you finish, open the separate quiz page from the Quiz
                  Time menu.
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

          <section className="rounded-[2.3rem] border border-white/70 bg-white/90 p-3 shadow-[0_35px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-4 md:p-6">
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
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Voice Speed
                  </span>
                  <input
                    type="range"
                    min="0.7"
                    max="1.2"
                    step="0.05"
                    value={voiceRate}
                    onChange={(event) =>
                      setVoiceRate(Number(event.target.value))
                    }
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

            <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_26%),linear-gradient(180deg,#fff7db_0%,#fffdf4_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_26%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] sm:p-3 md:p-5">
              <div
                ref={bookViewportRef}
                className="flex min-h-[52vh] items-start justify-center overflow-hidden rounded-[1.7rem] bg-slate-950/10 px-1 py-3 dark:bg-slate-950/20 md:min-h-[60vh] md:px-3"
              >
                <div className="w-full">
                  <HTMLFlipBook
                    key={`${readerPages.length}-${bookSize.width}-${bookSize.height}`}
                    ref={bookRef}
                    width={bookSize.width}
                    height={bookSize.height}
                    className="mx-auto rounded bg-[#FFFEE9] shadow-xl"
                    style={{}}
                    minWidth={220}
                    maxWidth={bookSize.width}
                    minHeight={360}
                    maxHeight={bookSize.height}
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
                        imageUrl={page.imageUrl}
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

        </div>
      )}
    </StudentShell>
  );
}

const getBundleTitle = (bundle: SchoolStoryBundle | null) =>
  bundle?.story?.content.title ??
  bundle?.contentPack?.title ??
  bundle?.requestedContent?.title ??
  "Story Book";
