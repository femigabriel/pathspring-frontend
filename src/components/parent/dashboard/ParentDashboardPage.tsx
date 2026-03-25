"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Eye, EyeOff, Lock, Sparkles, User, Users } from "lucide-react";
import ParentShell from "@/src/components/parent/layout/ParentShell";
import { getParentChildren, getParentChildOverview, getParentProfile, type ParentChild, type ParentChildOverview, type ParentProfile } from "@/src/lib/parent-api";

const minutesFromSeconds = (value: number) => `${Math.max(1, Math.round(value / 60))}m`;

export default function ParentDashboardPage() {
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [overview, setOverview] = useState<ParentChildOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    const loadParentPortal = async () => {
      setLoading(true);
      setError("");

      try {
        const [profileData, childrenData] = await Promise.all([
          getParentProfile(),
          getParentChildren(),
        ]);

        setProfile(profileData);
        setChildren(childrenData);

        if (childrenData[0]?.id) {
          setOverview(await getParentChildOverview(childrenData[0].id));
        } else {
          setOverview(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load the parent dashboard.");
      } finally {
        setLoading(false);
      }
    };

    void loadParentPortal();
  }, []);

  const featuredChild = overview?.child ?? children[0] ?? null;

  return (
    <ParentShell>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2.4rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_24%),linear-gradient(180deg,#fff7ed_0%,#fffaf5_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_24%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm dark:bg-white/10 dark:text-rose-300">
              <Sparkles size={16} />
              Parent Dashboard
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 dark:text-white md:text-5xl">
              Welcome, {profile?.fullName ?? "Parent"}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Follow your child&apos;s reading progress, check recent learning activity, and keep up with school messages in one calm space.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.7rem] border border-rose-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <Users className="text-rose-600 dark:text-rose-300" size={24} />
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{children.length}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Linked children</p>
            </div>
            <div className="rounded-[1.7rem] border border-amber-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <BookOpen className="text-amber-600 dark:text-amber-300" size={24} />
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{overview?.stats.storiesRead ?? 0}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Stories completed</p>
            </div>
            <div className="rounded-[1.7rem] border border-cyan-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <Clock3 className="text-cyan-600 dark:text-cyan-300" size={24} />
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{minutesFromSeconds(overview?.stats.timeSpentSeconds ?? 0)}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Learning time</p>
            </div>
          </div>
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
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Children</h2>
              <div className="mt-5 space-y-3">
                {children.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No children have been linked to this parent account yet.</p>
                ) : (
                  children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/parent/children/${child.id}`}
                      className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-1 hover:border-rose-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-rose-400/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{child.fullName}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {child.gradeLevel ?? "Grade level not set"}{child.classroomName ? ` • ${child.classroomName}` : ""}
                          </p>
                        </div>
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                          {child.relationship ?? "Child"}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>{child.schoolName ?? "PathSpring School"}</span>
                        <span className="font-semibold text-rose-700 dark:text-rose-300">View overview</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Featured Child Overview</h2>
              {featuredChild ? (
                <div className="mt-5 space-y-5">
                  <div className="rounded-[1.6rem] border border-rose-100 bg-gradient-to-br from-rose-50 to-amber-50 p-5 dark:border-white/10 dark:from-rose-500/10 dark:to-amber-500/10">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-300">
                      {featuredChild.relationship ?? "Child"}
                    </p>
                    <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                      {featuredChild.fullName}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {featuredChild.gradeLevel ?? "Grade not set"}{featuredChild.classroomName ? ` • ${featuredChild.classroomName}` : ""}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
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
                    <div className={`rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 ${showCredentials ? "" : "hidden"}`}>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Average Score</p>
                      <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{overview?.stats.averageScore ?? 0}%</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Quiz Submissions</p>
                      <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{overview?.stats.totalSubmissions ?? 0}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <User size={16} />
                        <p className="text-xs uppercase tracking-[0.18em]">Student Username</p>
                      </div>
                      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                        {showCredentials ? `@${featuredChild.username ?? "not-set"}` : "Hidden"}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Lock size={16} />
                        <p className="text-xs uppercase tracking-[0.18em]">Student PIN</p>
                      </div>
                      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">••••</p>
                    </div>
                  </div>

                  <Link href={`/parent/children/${featuredChild.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-3 font-semibold text-white">
                    Open Child Detail
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Once a child is linked to this account, their overview will appear here.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </ParentShell>
  );
}
