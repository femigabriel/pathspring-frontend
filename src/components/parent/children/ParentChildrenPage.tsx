"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, HeartHandshake, School2, Users } from "lucide-react";
import ParentShell from "@/src/components/parent/layout/ParentShell";
import { getParentChildren, type ParentChild } from "@/src/lib/parent-api";

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChildren = async () => {
      setLoading(true);
      setError("");

      try {
        setChildren(await getParentChildren());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load linked children.");
      } finally {
        setLoading(false);
      }
    };

    void loadChildren();
  }, []);

  return (
    <ParentShell>
      <div className="space-y-8">
        <section className="rounded-[2.2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_22%),linear-gradient(180deg,#fff7ed_0%,#fffaf5_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_22%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm dark:bg-white/10 dark:text-rose-300">
            <HeartHandshake size={16} />
            Linked Children
          </div>
          <h1 className="mt-6 text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
            Every child linked to this parent account
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Open any child card to view their reading summary, story progress, and recent learning activity.
          </p>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          </div>
        ) : children.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/80 px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <Users size={40} className="mx-auto text-rose-400" />
            <p className="mt-4 text-xl font-bold text-slate-900 dark:text-white">No linked children yet</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Once the school links a child to this account, their profile will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/parent/children/${child.id}`}
                className="rounded-[1.8rem] border border-white/70 bg-white/85 p-6 shadow-xl transition-all hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{child.fullName}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {child.gradeLevel ?? "Grade not set"}{child.classroomName ? ` • ${child.classroomName}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                    {child.relationship ?? "Child"}
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <School2 size={16} className="text-amber-500" />
                    <span>{child.schoolName ?? "PathSpring School"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-cyan-500" />
                    <span>{child.classroomName ?? "Classroom not set yet"}</span>
                  </div>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
                  Open child detail
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ParentShell>
  );
}
