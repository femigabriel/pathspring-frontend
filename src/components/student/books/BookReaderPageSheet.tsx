"use client";

import { forwardRef } from "react";
import { BookOpen, Sparkles, Stars } from "lucide-react";

interface BookReaderPageSheetProps {
  title: string;
  body: string;
  label: string;
  kind: "cover" | "story" | "end";
  imageUrl?: string;
  chapterNumber?: number;
  sectionNumber?: number;
}

const pageThemes = {
  cover:
    "bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.32),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_30%),linear-gradient(180deg,#fff4d6_0%,#fff9ec_100%)]",
  story:
    "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#fffdf4_0%,#fff8e7_100%)]",
  end:
    "bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.16),transparent_30%),linear-gradient(180deg,#fdf2f8_0%,#fff7ed_100%)]",
};

const BookReaderPageSheet = forwardRef<HTMLDivElement, BookReaderPageSheetProps>(
  ({ title, body, label, kind, imageUrl, chapterNumber, sectionNumber }, ref) => {
    return (
      <div ref={ref} className="h-full w-full p-1.5 md:p-3">
        <div
          className={`relative h-full w-full overflow-hidden rounded-[1.5rem] border border-[#d6c7a6] shadow-[0_24px_60px_rgba(120,53,15,0.12)] ${pageThemes[kind]}`}
        >
          <div className="absolute inset-y-0 left-0 w-5 bg-[linear-gradient(180deg,rgba(120,53,15,0.16),rgba(120,53,15,0.04))]" />
          <div className="absolute inset-y-0 right-0 w-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.12))]" />
          {kind === "cover" && imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.48))]" />
            </>
          ) : null}
          <div
            className={`relative flex h-full flex-col px-4 py-4 text-slate-800 md:px-8 md:py-7 ${
              kind === "cover" && imageUrl ? "text-white" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${
                  kind === "cover" && imageUrl
                    ? "bg-white/18 text-white backdrop-blur"
                    : "bg-white/70 text-slate-600"
                }`}
              >
                {label}
              </span>
              <div
                className={`flex items-center gap-2 ${
                  kind === "cover" && imageUrl ? "text-white/80" : "text-slate-500"
                }`}
              >
                {kind === "story" ? <BookOpen size={18} /> : <Sparkles size={18} />}
                <Stars size={16} />
              </div>
            </div>

            <div className="mt-6 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {chapterNumber ? (
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.24em] ${
                      kind === "cover" && imageUrl ? "text-white/80" : "text-emerald-700"
                    }`}
                  >
                    Chapter {chapterNumber}
                  </p>
                ) : null}
                {sectionNumber ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                    Part {sectionNumber}
                  </span>
                ) : null}
              </div>
              <h3
                className={`mt-2 text-[1.15rem] font-bold leading-snug md:text-[1.55rem] ${
                  kind === "cover" && imageUrl ? "text-white" : "text-slate-900"
                }`}
              >
                {title}
              </h3>
              {kind === "story" && imageUrl ? (
                <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-[#eadfc7] bg-[#fff8e7] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="h-36 w-full object-cover md:h-52"
                  />
                </div>
              ) : null}
              <div
                className={`mt-4 flex-1 rounded-[1.3rem] border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:px-5 md:py-5 ${
                  kind === "cover" && imageUrl
                    ? "border-white/20 bg-slate-950/28 backdrop-blur"
                    : "border-[#eadfc7] bg-white/72"
                }`}
              >
                <p
                  className={`whitespace-pre-line text-[12.5px] leading-7 md:text-[14px] md:leading-8 ${
                    kind === "cover" && imageUrl ? "text-white/95" : "text-slate-700"
                  }`}
                >
                  {body}
                </p>
              </div>
            </div>

            <div
              className={`mt-5 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] ${
                kind === "cover" && imageUrl ? "text-white/75" : "text-slate-500"
              }`}
            >
              <span>PathSpring Storybook</span>
              <span>{kind === "story" ? "Keep Flipping" : "Story Magic"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

BookReaderPageSheet.displayName = "BookReaderPageSheet";

export default BookReaderPageSheet;
