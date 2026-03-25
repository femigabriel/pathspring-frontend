"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ClipboardCheck, Clock3, Eye, EyeOff, Lock, School2, Sparkles, User } from "lucide-react";
import ParentShell from "@/src/components/parent/layout/ParentShell";
import {
  getParentChildOverview,
  type ParentChildOverview,
} from "@/src/lib/parent-api";

const prettyMinutes = (seconds: number) => `${Math.max(1, Math.round(seconds / 60))} mins`;

const getRecordLabel = (value: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (typeof candidate === "number") return String(candidate);
  }

  return "Not available yet";
};

export default function ParentChildOverviewPage({ childId }: { childId: string }) {
  const [overview, setOverview] = useState<ParentChildOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError("");

      try {
        setOverview(await getParentChildOverview(childId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load child overview.");
      } finally {
        setLoading(false);
      }
    };

    void loadOverview();
  }, [childId]);

  const child = overview?.child;

  const recentItems = useMemo(
    () => [
      ...(overview?.recentProgress ?? []).map((item) => ({ type: "progress" as const, item })),
      ...(overview?.recentSubmissions ?? []).map((item) => ({ type: "submission" as const, item })),
    ],
    [overview],
  );

  return (
    <ParentShell>
      <div className="space-y-8">
        <div className="flex items-center">
          <Link
            href="/parent/children"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <ArrowLeft size={16} />
            Back to children
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          </div>
        ) : child ? (
          <>
            <section className="rounded-[2.2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_22%),linear-gradient(180deg,#fff7ed_0%,#fffaf5_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_22%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm dark:bg-white/10 dark:text-rose-300">
                <Sparkles size={16} />
                Child Overview
              </div>
              <h1 className="mt-6 text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
                {child.fullName}
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                {child.gradeLevel ?? "Grade not set"}{child.classroomName ? ` • ${child.classroomName}` : ""}{child.schoolName ? ` • ${child.schoolName}` : ""}
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-xl dark:border-white/10 dark:bg-white/5">
                <BookOpen size={22} className="text-amber-500" />
                <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{overview?.stats.storiesRead ?? 0}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Stories read</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-xl dark:border-white/10 dark:bg-white/5">
                <ClipboardCheck size={22} className="text-cyan-500" />
                <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{overview?.stats.quizzesCompleted ?? 0}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quizzes completed</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-xl dark:border-white/10 dark:bg-white/5">
                <School2 size={22} className="text-rose-500" />
                <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{overview?.stats.averageScore ?? 0}%</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Average score</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-xl dark:border-white/10 dark:bg-white/5">
                <Clock3 size={22} className="text-emerald-500" />
                <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{prettyMinutes(overview?.stats.timeSpentSeconds ?? 0)}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Learning time</p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Recent activity timeline</h2>
                <div className="mt-5 space-y-4">
                  {recentItems.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No progress or submission records have been returned yet.
                    </p>
                  ) : (
                    recentItems.map(({ type, item }, index) => (
                      <article
                        key={`${type}-${index}`}
                        className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/40"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                            {type}
                          </span>
                          <span className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                            {getRecordLabel(item, ["createdAt", "updatedAt", "submittedAt"])}
                          </span>
                        </div>
                        <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                          {getRecordLabel(item, ["title", "contentTitle", "name", "status"])}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {getRecordLabel(item, ["summary", "message", "description", "score"])}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Reading snapshot</h2>
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Student Login</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hidden by default for privacy.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCredentials((current) => !current)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        {showCredentials ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showCredentials ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className={`rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/40 ${showCredentials ? "" : "hidden"}`}>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <User size={16} />
                        <p className="text-xs uppercase tracking-[0.18em]">Student Username</p>
                      </div>
                      <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                        {showCredentials ? `@${child.username ?? "not-set"}` : "Hidden"}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/40">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Lock size={16} />
                        <p className="text-xs uppercase tracking-[0.18em]">Student PIN</p>
                      </div>
                      <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">••••</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Submissions</p>
                    <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                      {overview?.stats.totalSubmissions ?? 0}
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Total quiz and activity submissions recorded for this child.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Support note</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      This parent view is read-only. For changes to class placement, story assignments, or login details, please contact the school or classroom teacher.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/80 px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-xl font-bold text-slate-900 dark:text-white">This child could not be found</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              The linked child overview is unavailable right now.
            </p>
          </div>
        )}
      </div>
    </ParentShell>
  );
}
