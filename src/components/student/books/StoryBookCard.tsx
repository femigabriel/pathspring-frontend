"use client";

import Link from "next/link";
import { BookHeart, Sparkles, Stars } from "lucide-react";
import type { SchoolStoryContent } from "@/src/lib/school-content-api";

interface StoryBookCardProps {
  story: SchoolStoryContent;
  index: number;
  variant?: "compact" | "featured";
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
}: StoryBookCardProps) {
  const cardTheme = getTheme(index);
  const summary =
    story.summary ?? story.description ?? "Tap to open this story and start reading.";

  return (
    <Link
      href={`/student/books/${story._id}`}
      className={`group block overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-white/5 ${
        variant === "featured" ? "h-full min-h-[25rem]" : "h-full"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br ${cardTheme} ${
          variant === "featured" ? "min-h-[22rem] p-6 md:min-h-[24rem] md:p-7" : "min-h-[20rem] p-5"
        } text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]`}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.12))]" />
        <div className="pointer-events-none absolute right-5 top-5 flex gap-2 opacity-80">
          <Sparkles size={18} />
          <Stars size={18} />
        </div>
        <div className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 top-1/3 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
              Story Book
            </span>
            <BookHeart className="text-white/90" size={20} />
          </div>

          <div className="mt-7 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/75">
              Written by PathSpring
            </p>
            <h3
              className={`mt-3 font-black leading-tight text-white drop-shadow-sm ${
                variant === "featured"
                  ? "max-w-[12ch] text-3xl [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] md:text-[2.7rem]"
                  : "max-w-[12ch] text-[2rem] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]"
              }`}
            >
              {story.title}
            </h3>

            <div className="mt-5 max-w-xl rounded-[1.5rem] border border-white/20 bg-white/14 px-4 py-4 backdrop-blur-sm">
              <p
                className={`overflow-hidden text-white/90 ${
                  variant === "featured"
                    ? "text-sm leading-7 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]"
                    : "text-sm leading-6 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]"
                }`}
              >
                {summary}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-wrap gap-2">
              {(story.gradeLevels?.slice(0, 2) ?? []).map((grade) => (
                <span
                  key={grade}
                  className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur"
                >
                  {grade}
                </span>
              ))}
            </div>
            <span className="rounded-full bg-slate-950/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              Open
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="truncate">{prettyDate(story.publishedAt ?? story.updatedAt ?? story.createdAt)}</span>
        <span className="font-semibold text-emerald-700 transition-colors group-hover:text-emerald-600 dark:text-emerald-300">
          Read Book
        </span>
      </div>
    </Link>
  );
}
