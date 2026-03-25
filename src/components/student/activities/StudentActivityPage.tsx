"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Sparkles } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import StudentShell from "@/src/components/student/layout/StudentShell";
import { isBookAllowedForStudent } from "@/src/lib/student-book-eligibility";
import {
  getPublishedSchoolStoryBundle,
  type SchoolActivity,
  type SchoolStoryBundle,
} from "@/src/lib/school-content-api";

export default function StudentActivityPage({ bookId }: { bookId: string }) {
  const { user } = useAuth();
  const [bundle, setBundle] = useState<SchoolStoryBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      setError("");

      try {
        const nextBundle = await getPublishedSchoolStoryBundle(bookId);
        const restrictedContent =
          nextBundle.story?.content ?? nextBundle.contentPack ?? nextBundle.requestedContent;

        if (!isBookAllowedForStudent(restrictedContent, user)) {
          throw new Error("These activities are for another class level, so they are not available to you.");
        }

        setBundle(nextBundle);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load these activities.");
      } finally {
        setLoading(false);
      }
    };

    void loadBundle();
  }, [bookId, user]);

  const title =
    bundle?.story?.content.title ?? bundle?.contentPack?.title ?? bundle?.requestedContent?.title ?? "Story Activities";
  const activities = bundle?.activities ?? [];

  return (
    <StudentShell>
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[2.3rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.16),transparent_24%),linear-gradient(180deg,#eff6ff_0%,#f0fdf4_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_24%),linear-gradient(180deg,#0b1120_0%,#111827_100%)] md:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-300">
                  <Sparkles size={16} />
                  Story Activities
                </div>
                <h2 className="mt-5 text-3xl font-black leading-tight text-slate-900 dark:text-white">
                  {title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600 dark:text-slate-300">
                  Use these activities after reading the story. Each card shows what to do and how to complete it.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/student/activities"
                  className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-white/80 px-5 py-3 text-sm font-semibold text-sky-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-sky-300"
                >
                  <ArrowLeft size={16} />
                  Back to Activities
                </Link>
                <Link
                  href={`/student/books/${bookId}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-emerald-300"
                >
                  Read Book
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-[2.2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            {activities.length === 0 ? (
              <div className="rounded-[1.7rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No extra activities were attached to this story yet.
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2">
                {activities.map((activity: SchoolActivity, index) => (
                  <article
                    key={activity._id ?? `${activity.title}-${index}`}
                    className="rounded-[1.8rem] border border-sky-100 bg-sky-50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:bg-white/10 dark:text-sky-300">
                          <ClipboardList size={14} />
                          Activity {index + 1}
                        </div>
                        <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{activity.title}</h3>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-sky-700 dark:bg-white/10 dark:text-sky-300">
                        {activity.configuration?.activityType ?? "activity"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
                      {activity.summary ?? activity.description ?? "Enjoy this classroom activity after reading."}
                    </p>

                    {activity.instructions ? (
                      <div className="mt-5 rounded-2xl border border-white/80 bg-white/85 px-4 py-4 text-sm leading-7 text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Instructions
                        </p>
                        <p className="mt-2">{activity.instructions}</p>
                      </div>
                    ) : null}

                    {activity.configuration?.tasks?.length ? (
                      <div className="mt-5 space-y-3">
                        {activity.configuration.tasks.map((task, taskIndex) => (
                          <div
                            key={`${activity._id ?? index}-task-${taskIndex}`}
                            className="rounded-2xl bg-white/90 px-4 py-3 text-sm leading-7 text-slate-700 dark:bg-slate-950/50 dark:text-slate-200"
                          >
                            <span className="font-bold text-sky-700 dark:text-sky-300">{taskIndex + 1}.</span>{" "}
                            {task}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </StudentShell>
  );
}
