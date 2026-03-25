"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookHeart, Sparkles, Stars, AlertCircle } from "lucide-react";
import type { SchoolStoryContent } from "@/src/lib/school-content-api";

interface StoryBookCardProps {
  story: SchoolStoryContent;
  index: number;
  variant?: "compact" | "featured";
  href?: string;
}

const coverThemes = [
  "from-rose-400 via-orange-300 to-amber-200",
  "from-cyan-500 via-sky-400 to-indigo-300",
  "from-emerald-500 via-teal-400 to-cyan-300",
  "from-fuchsia-500 via-pink-400 to-rose-300",
  "from-violet-500 via-purple-400 to-indigo-300",
  "from-amber-500 via-orange-400 to-rose-300",
];

const getTheme = (index: number) => coverThemes[index % coverThemes.length];

const prettyDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "Ready to read";

export default function StoryBookCard({
  story,
  index,
  variant = "compact",
  href,
}: StoryBookCardProps) {
  const cardTheme = getTheme(index);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🎨 StoryBookCard rendered:", {
        title: story.title,
        coverImageUrl: story.coverImageUrl,
        hasImage: !!story.coverImageUrl,
        variant,
      });
    }
  }, [story, variant]);

  const handleImageError = () => {
    console.warn(`❌ Failed to load image for story: ${story.title}`, {
      url: story.coverImageUrl,
    });
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully: ${story.title}`);
    setImageLoaded(true);
    setImageError(false);
  };

  // Consistent card heights
  const cardHeight = variant === "featured" ? "h-[500px]" : "h-[440px]";
  const coverHeight =
    variant === "featured" ? "min-h-[23rem] md:min-h-[25rem]" : "min-h-[21rem]";
  const padding = variant === "featured" ? "p-6 md:p-7" : "p-5";

  const hasValidImage = story.coverImageUrl && !imageError;

  return (
    <Link
      href={href ?? `/student/books/${story._id}`}
      className={`group block h-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-white/5 ${cardHeight}`}
    >
      {/* Cover Section */}
      <div
        className={`relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br ${cardTheme} ${coverHeight} ${padding} text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] flex flex-col justify-between`}
      >
        {/* Background Image Layer */}
        {hasValidImage && (
          <>
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            {/* Dark overlay for text contrast - adjusted for better readability */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                imageLoaded
                  ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.3),rgba(15,23,42,0.6))]"
                  : "bg-[linear-gradient(180deg,rgba(15,23,42,0.12),rgba(15,23,42,0.52))]"
              }`}
            />
          </>
        )}

        {/* Edge light effect */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.12))]" />

        {/* Decorative elements */}
        <div className="pointer-events-none absolute right-5 top-5 flex gap-2 opacity-80">
          <Sparkles size={18} />
          <Stars size={18} />
        </div>

        {/* Blur effects */}
        <div className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 top-1/3 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Header Section */}
          {variant === "featured" && (
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/95 backdrop-blur-sm">
                Story Book
              </span>
              <BookHeart className="text-white/95" size={20} />
            </div>
          )}

          {/* Middle Section - Title Content */}
          <div className="">
            {variant === "featured" && (
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">
                Written by PathSpring
              </p>
            )}
            <h3
              className={`mt-3 font-black leading-[1.1] text-white drop-shadow-lg ${
                variant === "featured"
                  ? "text-2xl md:text-3xl line-clamp-3"
                  : "text-xl line-clamp-3"
              }`}
            >
              {story.title}
            </h3>

            {/* Optional: Show summary on featured variant */}
            {variant === "featured" && story.summary && (
              <p className="mt-3 text-sm line-clamp-2 text-white/85 drop-shadow">
                {story.summary}
              </p>
            )}
          </div>

          {/* Footer Section */}
          <div className="flex items-end justify-between gap-4 pt-4">
            {variant === "featured" ? (
              <>
                <div className="flex min-w-0 flex-wrap gap-2">
                  {(story.gradeLevels?.slice(0, 2) ?? []).map((grade) => (
                    <span
                      key={grade}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-sm"
                    >
                      {grade}
                    </span>
                  ))}
                </div>
                <span className="rounded-full bg-black/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                  Open
                </span>
              </>
            ) : (
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                Open
              </span>
            )}
          </div>
        </div>

        {/* Image Error Indicator (debug mode only) */}
        {process.env.NODE_ENV === "development" && imageError && (
          <div className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 backdrop-blur">
            <AlertCircle size={16} className="text-white" />
          </div>
        )}

        {/* No Image Indicator (debug mode only) */}
        {process.env.NODE_ENV === "development" && !story.coverImageUrl && (
          <div className="absolute right-2 top-2 text-xs bg-yellow-500/80 text-white px-2 py-1 rounded-full backdrop-blur">
            No image
          </div>
        )}
      </div>

      {/* Metadata Footer - Featured variant only */}
      {variant === "featured" && (
        <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="truncate">
            {prettyDate(story.publishedAt ?? story.updatedAt ?? story.createdAt)}
          </span>
          <span className="font-semibold text-emerald-700 transition-colors group-hover:text-emerald-600 dark:text-emerald-300">
            Read Book
          </span>
        </div>
      )}
    </Link>
  );
}