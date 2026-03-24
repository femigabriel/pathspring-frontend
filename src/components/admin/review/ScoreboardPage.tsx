"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Medal, School, Sparkles, TimerReset, Trophy } from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { getAdminClasses, type AdminClassroom } from "@/src/lib/admin-api";
import {
  getClassScoreboard,
  getClassSubmissions,
  type AdminReviewSubmission,
  type ClassroomScoreboardResponse,
} from "@/src/lib/admin-review-api";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "No submission yet";

const formatMinutes = (seconds: number) => `${Math.max(1, Math.round(seconds / 60))}m`;

const podiumTones = [
  "from-amber-400 to-orange-500",
  "from-slate-400 to-slate-600",
  "from-orange-400 to-rose-500",
];

export default function ScoreboardPage() {
  const [classes, setClasses] = useState<AdminClassroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [scoreboard, setScoreboard] = useState<ClassroomScoreboardResponse>({
    classroom: null,
    scoreboard: [],
  });
  const [submissions, setSubmissions] = useState<AdminReviewSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [classLoading, setClassLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError("");

      try {
        const classroomList = await getAdminClasses();
        setClasses(classroomList);

        if (classroomList[0]?.id) {
          setSelectedClassId(classroomList[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load classes.");
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;

    const loadClassData = async () => {
      setClassLoading(true);
      setError("");

      try {
        const [scoreboardResult, submissionsResult] = await Promise.all([
          getClassScoreboard(selectedClassId),
          getClassSubmissions(selectedClassId),
        ]);

        setScoreboard(scoreboardResult);
        setSubmissions(submissionsResult.submissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load scoreboard.");
      } finally {
        setClassLoading(false);
      }
    };

    void loadClassData();
  }, [selectedClassId]);

  const leaderboard = scoreboard.scoreboard.slice(0, 3);
  const totalSubmissions = useMemo(
    () => scoreboard.scoreboard.reduce((sum, row) => sum + row.stats.totalSubmissions, 0),
    [scoreboard.scoreboard],
  );
  const averageScore = useMemo(() => {
    if (scoreboard.scoreboard.length === 0) return 0;
    return Math.round(
      scoreboard.scoreboard.reduce((sum, row) => sum + row.stats.averageScore, 0) / scoreboard.scoreboard.length,
    );
  }, [scoreboard.scoreboard]);

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_24%),linear-gradient(135deg,#fff7ed_0%,#fffbeb_42%,#eff6ff_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_24%),linear-gradient(135deg,#111827_0%,#0f172a_42%,#172554_100%)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm dark:bg-white/10 dark:text-amber-300">
                <Sparkles size={16} />
                Class Scoreboard
              </div>
              <h1 className="mt-5 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
                Track class reading performance live.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                See who is leading, how many story submissions each learner made, and which class needs more support.
              </p>
            </div>

            <label className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Select Class
              </span>
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                className="mt-2 min-w-72 bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white"
              >
                {classes.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Class
                    </p>
                    <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                      {scoreboard.classroom?.name ?? "No class selected"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-3 text-white shadow-lg">
                    <School size={20} />
                  </div>
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Avg Score
                    </p>
                    <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{averageScore}%</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 text-white shadow-lg">
                    <Award size={20} />
                  </div>
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Total Submissions
                    </p>
                    <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{totalSubmissions}</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-3 text-white shadow-lg">
                    <BookOpen size={20} />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Podium</h2>
                  {classLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                  ) : null}
                </div>

                {leaderboard.length === 0 ? (
                  <div className="mt-6 rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50 px-5 py-12 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    No scoreboard entries yet for this class.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.student.id ?? `${entry.student.username}-${index}`}
                        className={`rounded-[1.6rem] bg-gradient-to-br ${podiumTones[index] ?? "from-slate-500 to-slate-700"} p-[1px] shadow-lg`}
                      >
                        <div className="rounded-[1.55rem] bg-white/95 p-5 dark:bg-slate-950/90">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${podiumTones[index] ?? "from-slate-500 to-slate-700"} text-white shadow-lg`}>
                                {index === 0 ? <Trophy size={24} /> : <Medal size={24} />}
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Rank #{index + 1}
                                </p>
                                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                                  {entry.student.fullName ?? "Unknown student"}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  @{entry.student.username ?? "reader"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-black text-slate-900 dark:text-white">
                                {entry.stats.averageScore}%
                              </p>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                Average score
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Full Class Standing</h2>
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left dark:border-white/10">
                        <th className="px-3 py-3 font-semibold text-slate-500 dark:text-slate-400">Student</th>
                        <th className="px-3 py-3 font-semibold text-slate-500 dark:text-slate-400">Average</th>
                        <th className="px-3 py-3 font-semibold text-slate-500 dark:text-slate-400">Completed</th>
                        <th className="px-3 py-3 font-semibold text-slate-500 dark:text-slate-400">Submissions</th>
                        <th className="px-3 py-3 font-semibold text-slate-500 dark:text-slate-400">Time</th>
                        <th className="px-3 py-3 font-semibold text-slate-500 dark:text-slate-400">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreboard.scoreboard.map((entry) => (
                        <tr key={entry.student.id ?? entry.student.username} className="border-b border-slate-100 dark:border-white/5">
                          <td className="px-3 py-4">
                            <p className="font-semibold text-slate-900 dark:text-white">{entry.student.fullName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">@{entry.student.username}</p>
                          </td>
                          <td className="px-3 py-4 font-bold text-emerald-700 dark:text-emerald-300">
                            {entry.stats.averageScore}%
                          </td>
                          <td className="px-3 py-4 text-slate-700 dark:text-slate-300">
                            {entry.stats.completedContents}/{entry.stats.contentsAttempted}
                          </td>
                          <td className="px-3 py-4 text-slate-700 dark:text-slate-300">
                            {entry.stats.totalSubmissions}
                          </td>
                          <td className="px-3 py-4 text-slate-700 dark:text-slate-300">
                            {formatMinutes(entry.stats.totalTimeSpentSeconds)}
                          </td>
                          <td className="px-3 py-4 text-slate-500 dark:text-slate-400">
                            {formatDate(entry.latestSubmissionAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Latest Class Submissions</h2>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-white/10 dark:text-slate-300">
                  <TimerReset size={14} />
                  Recent Work
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  No submissions have been recorded for this class yet.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {submissions.slice(0, 8).map((submission) => (
                    <div
                      key={submission.id}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            {submission.student?.fullName ?? "Unknown student"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {submission.content?.title ?? "Story"} • {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {submission.scorePercent ?? 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
