"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Pause,
  Play,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import StudentShell from "@/src/components/student/layout/StudentShell";
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

interface SpreadPage {
  leftPage: ReaderPage | null;
  rightPage: ReaderPage | null;
  spreadIndex: number;
}

const defaultRate = 0.95;

const splitLongParagraph = (paragraph: string, limit: number) => {
  if (paragraph.length <= limit) return [paragraph];

  const sentenceChunks =
    paragraph.match(/[^.!?]+[.!?"]?\s*/g)?.map((chunk) => chunk.trim()) ?? [];
  const sourceChunks =
    sentenceChunks.length > 1 ? sentenceChunks : paragraph.split(/\s+/);
  const pieces: string[] = [];
  let current = "";

  sourceChunks.forEach((chunk) => {
    const candidate = current ? `${current} ${chunk}` : chunk;

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
    body: "You finished the story. Keep exploring the quiz and activities to complete your reading adventure.",
    label: "Back Cover",
    kind: "end",
  });

  return pages;
};

const createSpreads = (pages: ReaderPage[]): SpreadPage[] => {
  const spreads: SpreadPage[] = [];
  
  for (let i = 0; i < pages.length; i += 2) {
    const leftPage = pages[i];
    const rightPage = pages[i + 1] || null;
    
    spreads.push({
      leftPage,
      rightPage,
      spreadIndex: spreads.length,
    });
  }
  
  return spreads;
};

const renderInlineBold = (text: string) =>
  text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });

const renderStoryBody = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={`${paragraph.slice(0, 20)}-${index}`} className="mb-4 last:mb-0 text-base leading-relaxed">
        {renderInlineBold(paragraph)}
      </p>
    ));

const BookPage = ({ page, isLeftPage = false, isMobile = false }: { page: ReaderPage | null; isLeftPage?: boolean; isMobile?: boolean }) => {
  if (!page) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <p className="text-center text-gray-400 italic font-serif">End of Book</p>
      </div>
    );
  }

  const hasImage = page.imageUrl && page.kind !== "end";
  
  // Different background colors for left and right pages (only for non-mobile)
  const pageBgColor = !isMobile 
    ? isLeftPage 
      ? "bg-gradient-to-br from-amber-50/90 to-orange-50/90" 
      : "bg-gradient-to-br from-emerald-50/90 to-teal-50/90"
    : "bg-gradient-to-br from-amber-50/90 via-orange-50/90 to-emerald-50/90";
  
  const pageBorderColor = !isMobile 
    ? isLeftPage ? "border-amber-200/50" : "border-emerald-200/50"
    : "border-amber-200/50";
  
  const accentColor = !isMobile 
    ? isLeftPage ? "text-amber-700" : "text-emerald-700"
    : "text-amber-700";
  
  const accentLightColor = !isMobile 
    ? isLeftPage ? "text-amber-600" : "text-emerald-600"
    : "text-amber-600";

  return (
    <div className={`relative h-full overflow-hidden ${pageBgColor}`}>
      {/* Decorative corner elements */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${pageBorderColor} rounded-tl-lg opacity-50 md:w-12 md:h-12`} />
      <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${pageBorderColor} rounded-tr-lg opacity-50 md:w-12 md:h-12`} />
      <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${pageBorderColor} rounded-bl-lg opacity-50 md:w-12 md:h-12`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${pageBorderColor} rounded-br-lg opacity-50 md:w-12 md:h-12`} />
      
      {/* Page number */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 font-serif md:bottom-6">
        {page.label}
      </div>
      
      <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-300">
        {/* Chapter/Section info */}
        <div className="mb-3 flex items-center gap-2 md:mb-4">
          {page.chapterNumber && (
            <span className={`text-xs font-semibold uppercase tracking-wider ${accentLightColor}`}>
              Chapter {page.chapterNumber}
            </span>
          )}
          {page.sectionNumber && (
            <>
              <span className="text-gray-300">•</span>
              <span className={`text-xs font-semibold uppercase tracking-wider ${accentLightColor}`}>
                Part {page.sectionNumber}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className={`mb-4 text-xl font-bold leading-tight ${accentColor} md:mb-6 md:text-2xl lg:text-3xl font-serif`}>
          {page.title}
        </h2>

        {/* Image and Text layout */}
        {hasImage ? (
          <div className="space-y-4 md:space-y-5">
            <div className={`relative overflow-hidden rounded-lg shadow-md border ${pageBorderColor}`}>
              <img
                src={page.imageUrl}
                alt={page.title}
                className="w-full object-cover max-h-48 md:max-h-64 lg:max-h-80"
              />
              <div className="absolute inset-0 shadow-inner pointer-events-none" />
            </div>
            <div className="prose prose-sm max-w-none font-serif text-gray-700">
              {renderStoryBody(page.body)}
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none font-serif text-gray-700 md:prose-base">
            {renderStoryBody(page.body)}
          </div>
        )}
      </div>
    </div>
  );
};

export default function StudentBookReaderPage({ bookId }: { bookId: string }) {
  const { user } = useAuth();
  const [bundle, setBundle] = useState<SchoolStoryBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSpread, setCurrentSpread] = useState(0);
  const [pageDirection, setPageDirection] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceRate, setVoiceRate] = useState(defaultRate);
  const [isMobile, setIsMobile] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check screen size for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        setCurrentSpread(0);
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
  const spreads = useMemo(() => createSpreads(readerPages), [readerPages]);
  const currentSpreadData = spreads[currentSpread];

  // For mobile, we need to handle single page navigation
  const totalMobilePages = readerPages.length;
  const currentMobilePage = currentSpread * 2; // Each spread contains up to 2 pages

  const getSpreadText = () => {
    const texts: string[] = [];
    if (currentSpreadData?.leftPage) {
      texts.push(`${currentSpreadData.leftPage.title}. ${currentSpreadData.leftPage.body}`);
    }
    if (currentSpreadData?.rightPage) {
      texts.push(`${currentSpreadData.rightPage.title}. ${currentSpreadData.rightPage.body}`);
    }
    return texts.join(". ");
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const speakSpread = () => {
    if (typeof window === "undefined" || !currentSpreadData) return;

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(getSpreadText());
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

  const goToNextSpread = () => {
    if (currentSpread < spreads.length - 1) {
      stopSpeaking();
      setPageDirection(1);
      setCurrentSpread((spread) => spread + 1);
    }
  };

  const goToPreviousSpread = () => {
    if (currentSpread > 0) {
      stopSpeaking();
      setPageDirection(-1);
      setCurrentSpread((spread) => spread - 1);
    }
  };

  const goToSpread = (index: number) => {
    stopSpeaking();
    setPageDirection(index >= currentSpread ? 1 : -1);
    setCurrentSpread(index);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goToNextSpread();
      if (event.key === "ArrowLeft") goToPreviousSpread();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSpread, spreads.length]);

  return (
    <StudentShell>
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="flex h-full flex-col gap-3 md:gap-4 lg:gap-5">
          {/* Header Section */}
          <section className="overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 p-4 shadow-lg md:p-5 lg:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm md:px-4 md:py-2 md:text-sm">
                  <Sparkles size={14} className="md:w-4 md:h-4" />
                  Storybook Reader
                </div>
                <h2 className="mt-2 text-xl font-black leading-tight text-gray-900 md:mt-3 md:text-2xl lg:text-3xl">
                  {getBundleTitle(bundle)}
                </h2>
              </div>

              <Link
                href="/student/books"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-white md:px-4 md:py-2 md:text-sm"
              >
                <BookOpen size={14} className="md:w-4 md:h-4" />
                Back to Bookshelf
              </Link>
            </div>
          </section>

          {/* Controls Section */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={speakSpread}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 md:gap-2 md:px-4 md:py-2 md:text-sm"
              >
                <Volume2 size={14} className="md:w-4 md:h-4" />
                <span className="hidden sm:inline">Read Aloud</span>
                <span className="sm:hidden">Read</span>
              </button>
              <button
                onClick={togglePause}
                disabled={!isSpeaking}
                className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all disabled:opacity-50 md:gap-2 md:px-4 md:py-2 md:text-sm"
              >
                {isPaused ? <Play size={14} className="md:w-4 md:h-4" /> : <Pause size={14} className="md:w-4 md:h-4" />}
                <span className="hidden sm:inline">{isPaused ? "Continue" : "Pause"}</span>
              </button>
              <button
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all disabled:opacity-50 md:gap-2 md:px-4 md:py-2 md:text-sm"
              >
                <Headphones size={14} className="md:w-4 md:h-4" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 md:gap-2 md:px-3 md:py-1.5">
                <span className="text-xs font-medium text-gray-600">Speed</span>
                <input
                  type="range"
                  min="0.7"
                  max="1.2"
                  step="0.05"
                  value={voiceRate}
                  onChange={(event) => setVoiceRate(Number(event.target.value))}
                  className="w-16 accent-emerald-500 md:w-20"
                />
              </div>
              <div className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 md:px-3 md:py-1.5">
                {isMobile ? `Page ${currentMobilePage + 1} of ${totalMobilePages}` : `Spread ${currentSpread + 1} of ${spreads.length}`}
              </div>
            </div>
          </div>

          {/* Book Spread/Single Page Section */}
          <div className="relative flex-1 min-h-[500px] md:min-h-[600px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isMobile ? currentMobilePage : currentSpread}
                initial={{
                  opacity: 0,
                  x: pageDirection > 0 ? 40 : -40,
                  rotateY: pageDirection > 0 ? -10 : 10,
                }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{
                  opacity: 0,
                  x: pageDirection > 0 ? -30 : 30,
                  rotateY: pageDirection > 0 ? 10 : -10,
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="relative h-full"
              >
                {isMobile ? (
                  // Mobile View - Single Page
                  <div className="h-full">
                    <div className="relative h-full overflow-hidden rounded-xl shadow-xl">
                      <BookPage 
                        page={readerPages[currentMobilePage]} 
                        isLeftPage={true}
                        isMobile={true}
                      />
                    </div>
                  </div>
                ) : (
                  // Desktop View - Two Pages Side by Side
                  <div className="flex h-full gap-1">
                    {/* Left Page */}
                    <div className="relative flex-1 overflow-hidden rounded-l-xl shadow-xl">
                      <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-amber-200/40 to-transparent pointer-events-none z-10 rounded-r-lg" />
                      <BookPage page={currentSpreadData?.leftPage} isLeftPage={true} isMobile={false} />
                    </div>

                    {/* Center Binding */}
                    <div className="relative w-4 flex-shrink-0">
                      <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-r from-amber-700/30 to-transparent" />
                      <div className="absolute inset-y-0 right-0 w-0.5 bg-gradient-to-l from-amber-700/30 to-transparent" />
                      <div className="h-full w-full bg-gradient-to-b from-amber-800/15 via-amber-900/25 to-amber-800/15" />
                      <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-amber-600/40 to-transparent" />
                      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-amber-700/20" />
                      <div className="absolute top-2/4 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-amber-700/20" />
                      <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-amber-700/20" />
                    </div>

                    {/* Right Page */}
                    <div className="relative flex-1 overflow-hidden rounded-r-xl shadow-xl">
                      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-emerald-200/40 to-transparent pointer-events-none z-10 rounded-l-lg" />
                      <BookPage page={currentSpreadData?.rightPage} isLeftPage={false} isMobile={false} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={goToPreviousSpread}
              disabled={currentSpread === 0}
              className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed z-20 hover:scale-110 md:left-2 md:p-2.5"
            >
              <ChevronLeft size={18} className="md:w-5 md:h-5" />
            </button>

            <button
              onClick={goToNextSpread}
              disabled={currentSpread === spreads.length - 1}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed z-20 hover:scale-110 md:right-2 md:p-2.5"
            >
              <ChevronRight size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-1.5 py-2 md:gap-2 md:py-3">
            {(isMobile ? readerPages : spreads).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSpread(isMobile ? Math.floor(index / 2) : index)}
                className={`transition-all rounded-full ${
                  (isMobile 
                    ? Math.floor(currentMobilePage / 2) === Math.floor(index / 2)
                    : index === currentSpread)
                    ? "h-2 w-6 bg-gradient-to-r from-amber-500 to-emerald-500 md:h-2.5 md:w-8"
                    : "h-1.5 w-1.5 bg-gray-300 hover:bg-gray-400 md:h-2 md:w-2"
                }`}
                aria-label={`Go to ${isMobile ? `page ${index + 1}` : `spread ${index + 1}`}`}
              />
            ))}
          </div>
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