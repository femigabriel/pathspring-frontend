"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ClipboardCheck, Clock3, Sparkles, Users } from "lucide-react";
import FamilyShell from "@/src/components/family/layout/FamilyShell";
import { getFamilyChildOverview, type FamilyChildOverview } from "@/src/lib/family-api";

const prettyMinutes = (seconds: number) => `${Math.max(1, Math.round(seconds / 60))} mins`;

const getRecordLabel = (value: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (typeof candidate === "number") return String(candidate);
  }

  return "Not available yet";
};

export default function FamilyChildOverviewPage({ childId }: { childId: string }) {
  const [overview, setOverview] = useState<FamilyChildOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        setOverview(await getFamilyChildOverview(childId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load family child overview.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [childId]);

  const recentItems = useMemo(
    () => [
      ...(overview?.recentProgress ?? []).map((item) => ({ type: "progress" as const, item })),
      ...(overview?.recentSubmissions ?? []).map((item) => ({ type: "submission" as const, item })),
    ],
    [overview],
  );

  const child = overview?.child;

  return (
    <FamilyShell>
      <div className="space-y-8">
        <div className="flex items-center">
          <Link
            href="/family/children"
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
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : child ? (
          <>
            <section className="rounded-[2.2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_22%),linear-gradient(180deg,#ecfeff_0%,#f8fafc_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_22%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-300">
                <Sparkles size={16} />
                Family Child Overview
              </div>
              <h1 className="mt-6 text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
                {child.fullName}
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                {child.gradeLevel ?? "Grade not set"}{child.age ? ` • Age ${child.age}` : ""}
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-xl dark:border-white/10 dark:bg-white/5">
                <BookOpen size={22} className="text-amber-500" />
                <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{overview?.stats.selectedBooks ?? 0}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Selected books</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-xl dark:border-white/10 dark:bg-white/5">
                <ClipboardCheck size={22} className="text-cyan-500" />
                <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{overview?.stats.completedThisWeek ?? 0}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Completed this week</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-xl dark:border-white/10 dark:bg-white/5">
                <Users size={22} className="text-sky-500" />
                <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{overview?.stats.averageScore ?? 0}%</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Average score</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-xl dark:border-white/10 dark:bg-white/5">
                <Clock3 size={22} className="text-emerald-500" />
                <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{prettyMinutes(overview?.stats.timeSpentSeconds ?? 0)}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Reading time</p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Recent family reading activity</h2>
              <div className="mt-5 space-y-4">
                {recentItems.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No family reading records have been returned yet.</p>
                ) : (
                  recentItems.map(({ type, item }, index) => (
                    <article
                      key={`${type}-${index}`}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
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
            </section>
          </>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/80 px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-xl font-bold text-slate-900 dark:text-white">This child could not be found</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              The family child overview is unavailable right now.
            </p>
          </div>
        )}
      </div>
    </FamilyShell>
  );
}
