"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import HTMLFlipBook from "react-pageflip";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Pause,
  Play,
  Sparkles,
  Volume2,
  Maximize2,
  Minimize2,
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

const getBundleTitle = (bundle: SchoolStoryBundle | null) =>
  bundle?.story?.content.title ??
  bundle?.contentPack?.title ??
  bundle?.requestedContent?.title ??
  "Story Book";

const BookPage = ({ page, pageNumber }: { page: ReaderPage | null; pageNumber: number }) => {
  if (!page) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <p className="text-center text-gray-400 italic font-serif">End of Book</p>
      </div>
    );
  }

  const hasImage = page.imageUrl && page.kind !== "end";
  const isLeftPage = pageNumber % 2 === 0;
  
  const pageBgColor = isLeftPage 
    ? "bg-gradient-to-br from-amber-50/90 to-orange-50/90" 
    : "bg-gradient-to-br from-emerald-50/90 to-teal-50/90";
  
  const pageBorderColor = isLeftPage ? "border-amber-200/50" : "border-emerald-200/50";
  const accentColor = isLeftPage ? "text-amber-700" : "text-emerald-700";
  const accentLightColor = isLeftPage ? "text-amber-600" : "text-emerald-600";

  return (
    <div className={`relative h-full w-full overflow-hidden ${pageBgColor}`}>
      {/* Decorative corner elements */}
      <div className={`absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 ${pageBorderColor} rounded-tl-lg opacity-50 md:w-12 md:h-12`} />
      <div className={`absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 ${pageBorderColor} rounded-tr-lg opacity-50 md:w-12 md:h-12`} />
      <div className={`absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 ${pageBorderColor} rounded-bl-lg opacity-50 md:w-12 md:h-12`} />
      <div className={`absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 ${pageBorderColor} rounded-br-lg opacity-50 md:w-12 md:h-12`} />
      
      {/* Page number */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-gray-400 font-serif md:bottom-6">
        {page.label}
      </div>
      
      <div className="h-full overflow-y-auto p-6 md:p-8 lg:p-10 scrollbar-thin scrollbar-thumb-gray-300">
        {/* Chapter/Section info */}
        <div className="mb-4 flex items-center gap-2 md:mb-5">
          {page.chapterNumber && (
            <span className={`text-xs md:text-sm font-semibold uppercase tracking-wider ${accentLightColor}`}>
              Chapter {page.chapterNumber}
            </span>
          )}
          {page.sectionNumber && (
            <>
              <span className="text-gray-300">•</span>
              <span className={`text-xs md:text-sm font-semibold uppercase tracking-wider ${accentLightColor}`}>
                Part {page.sectionNumber}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className={`mb-5 text-2xl md:text-3xl lg:text-4xl font-bold leading-tight ${accentColor} font-serif`}>
          {page.title}
        </h2>

        {/* Image and Text layout */}
        {hasImage ? (
          <div className="space-y-5 md:space-y-6">
            <div className={`relative overflow-hidden rounded-xl shadow-md border ${pageBorderColor}`}>
              <img
                src={page.imageUrl}
                alt={page.title}
                className="w-full object-cover max-h-64 md:max-h-80 lg:max-h-96"
              />
              <div className="absolute inset-0 shadow-inner pointer-events-none" />
            </div>
            <div className="prose prose-base md:prose-lg max-w-none font-serif text-gray-700">
              {renderStoryBody(page.body)}
            </div>
          </div>
        ) : (
          <div className="prose prose-base md:prose-lg max-w-none font-serif text-gray-700">
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
  const [currentPage, setCurrentPage] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceRate, setVoiceRate] = useState(defaultRate);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookOrientation, setBookOrientation] = useState<"portrait" | "landscape">("landscape");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        setCurrentPage(0);
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

  const getCurrentPageText = () => {
    const page = readerPages[currentPage];
    if (!page) return "";
    return `${page.title}. ${page.body}`;
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const speakCurrentPage = () => {
    if (typeof window === "undefined" || !readerPages[currentPage]) return;

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(getCurrentPageText());
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

  const goToNextPage = () => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const goToPreviousPage = () => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const onFlip = useCallback((e: any) => {
    const newPage = e.data;
    setCurrentPage(newPage);
    stopSpeaking();
  }, []);

  const onInit = useCallback((e: any) => {
    setCurrentPage(e.data.page);
    setBookOrientation(e.data.mode);
  }, []);

  const onChangeOrientation = useCallback((e: any) => {
    setBookOrientation(e.data);
  }, []);

    // Calculate book dimensions - MUCH LARGER now
  const getBookDimensions = () => {
    if (isFullscreen) {
      // In fullscreen mode, use almost full viewport
      return {
        width: Math.min(window.innerWidth - 80, 1400),
        height: Math.min(window.innerHeight - 120, 900),
      };
    }
    
    if (isMobile) {
      return {
        width: window.innerWidth - 40,
        height: 550, // Good height for mobile
      };
    }
    
    // Desktop - large book with good proportions (3:4 ratio is classic book proportion)
    return {
      width: 900,  // Good width for desktop
      height: 1200, // Taller book like a real children's book
    };
  };

  const { width: bookWidth, height: bookHeight } = getBookDimensions();

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
        <div ref={containerRef} className="flex h-full flex-col gap-4 md:gap-5 lg:gap-6">
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

              <div className="flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-white md:px-4 md:py-2 md:text-sm"
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
                <Link
                  href="/student/books"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-white md:px-4 md:py-2 md:text-sm"
                >
                  <BookOpen size={14} className="md:w-4 md:h-4" />
                  Back to Bookshelf
                </Link>
              </div>
            </div>
          </section>

          {/* Controls Section */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={speakCurrentPage}
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
                Page {currentPage + 1} of {readerPages.length}
              </div>
            </div>
          </div>

          {/* Flip Book Container - Larger and more prominent */}
          <div className="flex justify-center items-center py-6 md:py-8">
            <HTMLFlipBook
              ref={flipBookRef}
              width={600}
            height={1400}
              size="stretch"
              minWidth={300}
              maxWidth={1400}
              minHeight={600}
              maxHeight={1500}             
              drawShadow={true}
              flippingTime={800}
              usePortrait={true}
              startZIndex={0}
              autoSize={true}
              maxShadowOpacity={0.8}
              showCover={true}
              mobileScrollSupport={true}
              swipeDistance={30}
              clickEventForward={true}
              useMouseEvents={true}
              startPage={currentPage}
              showPageCorners={true}
              disableFlipByClick={false}
              onFlip={onFlip}
              onInit={onInit}
              onChangeOrientation={onChangeOrientation}
              className="shadow-2xl rounded-lg"
              style={{ margin: "0 auto" }}
            >
              {readerPages.map((page: ReaderPage, index: number) => (
                <div key={page.id}>
                  <BookPage page={page} pageNumber={index} />
                </div>
              ))}
            </HTMLFlipBook>
          
          </div>

          {/* Navigation Buttons - Larger and more visible */}
          <div className="flex justify-center gap-6 pb-6">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-white px-6 py-3 text-base font-semibold text-emerald-700 transition-all hover:bg-emerald-50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-md"
            >
              <ChevronLeft size={20} />
              Previous Page
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === readerPages.length - 1}
              className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-white px-6 py-3 text-base font-semibold text-emerald-700 transition-all hover:bg-emerald-50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-md"
            >
              Next Page
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </StudentShell>
  );
}