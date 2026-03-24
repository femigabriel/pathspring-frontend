"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Clock3, Filter, Sparkles, type LucideIcon } from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { getAdminClasses, type AdminClassroom } from "@/src/lib/admin-api";
import {
  getSchoolSubmissions,
  type AdminReviewSubmission,
  type AdminReviewSummary,
} from "@/src/lib/admin-review-api";
import { getPublishedSchoolContents, type SchoolStoryContent } from "@/src/lib/school-content-api";

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString() : "Not submitted yet";

const formatDuration = (seconds?: number) => {
  if (!seconds) return "0m";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}m`;
};

const MetricCard = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: string;
}) => (
  <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`rounded-2xl bg-gradient-to-br ${tone} p-3 text-white shadow-lg`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

export default function SubmissionsPage() {
  const [classes, setClasses] = useState<AdminClassroom[]>([]);
  const [contents, setContents] = useState<SchoolStoryContent[]>([]);
  const [submissions, setSubmissions] = useState<AdminReviewSubmission[]>([]);
  const [summary, setSummary] = useState<AdminReviewSummary>({
    totalSubmissions: 0,
    averageScore: 0,
  });
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedContentId, setSelectedContentId] = useState("");
  const [activeSubmissionId, setActiveSubmissionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError("");

      try {
        const [classrooms, storyContents, review] = await Promise.all([
          getAdminClasses(),
          getPublishedSchoolContents(),
          getSchoolSubmissions(),
        ]);

        setClasses(classrooms);
        setContents(storyContents);
        setSubmissions(review.submissions);
        setSummary(review.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (loading) return;

    const loadFiltered = async () => {
      setFilterLoading(true);
      setError("");

      try {
        const review = await getSchoolSubmissions({
          classId: selectedClassId || undefined,
          contentId: selectedContentId || undefined,
        });
        setSubmissions(review.submissions);
        setSummary(review.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to refresh submissions.");
      } finally {
        setFilterLoading(false);
      }
    };

    void loadFiltered();
  }, [selectedClassId, selectedContentId, loading]);

  const averageTime = useMemo(() => {
    if (submissions.length === 0) return "0m";
    const totalSeconds = submissions.reduce((sum, item) => sum + (item.timeSpentSeconds ?? 0), 0);
    return formatDuration(totalSeconds / submissions.length);
  }, [submissions]);

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_24%),linear-gradient(135deg,#eff6ff_0%,#f8fafc_42%,#ecfeff_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_24%),linear-gradient(135deg,#0f172a_0%,#111827_42%,#082f49_100%)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-300">
                <Sparkles size={16} />
                Student Answer Review
              </div>
              <h1 className="mt-5 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
                Live submissions from your school stories.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Review who submitted answers, how well they scored, and the exact responses they gave for each question.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Class Filter
                </span>
                <select
                  value={selectedClassId}
                  onChange={(event) => setSelectedClassId(event.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white"
                >
                  <option value="">All Classes</option>
                  {classes.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Story Filter
                </span>
                <select
                  value={selectedContentId}
                  onChange={(event) => setSelectedContentId(event.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white"
                >
                  <option value="">All Stories</option>
                  {contents.map((content) => (
                    <option key={content._id} value={content._id}>
                      {content.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Total Submissions" value={summary.totalSubmissions} icon={BookOpen} tone="from-sky-500 to-cyan-500" />
          <MetricCard label="Average Score" value={`${summary.averageScore}%`} icon={CheckCircle2} tone="from-emerald-500 to-teal-500" />
          <MetricCard label="Average Time" value={averageTime} icon={Clock3} tone="from-orange-500 to-pink-500" />
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : (
          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Submission Feed</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {filterLoading ? "Refreshing filters..." : "Open any submission to review the student answers."}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                <Filter size={14} />
                Live Data
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="mt-6 rounded-[1.6rem] border border-dashed border-sky-200 bg-sky-50 px-6 py-16 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No submissions matched the current filter yet.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {submissions.map((submission) => {
                  const isOpen = activeSubmissionId === submission.id;
                  return (
                    <motion.article
                      key={submission.id}
                      layout
                      className="rounded-[1.7rem] border border-slate-200 bg-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/40"
                    >
                      <button
                        onClick={() => setActiveSubmissionId(isOpen ? "" : submission.id)}
                        className="w-full text-left"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:bg-white/10 dark:text-sky-300">
                                {submission.submissionType ?? "Submission"}
                              </span>
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                {submission.scorePercent ?? 0}%
                              </span>
                            </div>
                            <h3 className="mt-3 text-xl font-black text-slate-900 dark:text-white">
                              {submission.content?.title ?? "Untitled story"}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                              {submission.student?.fullName ?? "Unknown student"} in {submission.classroom?.name ?? "No class"} submitted on{" "}
                              {formatDateTime(submission.submittedAt)}.
                            </p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[22rem]">
                            <div className="rounded-2xl bg-white px-4 py-3 dark:bg-white/5">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Correct</p>
                              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                                {submission.correctCount ?? 0}/{submission.totalQuestions ?? 0}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white px-4 py-3 dark:bg-white/5">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Time</p>
                              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                                {formatDuration(submission.timeSpentSeconds)}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white px-4 py-3 dark:bg-white/5">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Student</p>
                              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                                @{submission.student?.username ?? "reader"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>

                      {isOpen ? (
                        <div className="mt-5 space-y-4 border-t border-slate-200 pt-5 dark:border-white/10">
                          {submission.feedback ? (
                            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-slate-200">
                              <span className="font-semibold text-sky-700 dark:text-sky-300">Feedback:</span> {submission.feedback}
                            </div>
                          ) : null}

                          <div className="space-y-3">
                            {(submission.answers ?? []).map((answer, index) => (
                              <div
                                key={`${submission.id}-${answer.questionId ?? index}`}
                                className="rounded-[1.4rem] border border-white bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-white/10 dark:text-slate-300">
                                    Question {index + 1}
                                  </span>
                                  <span
                                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                      answer.isCorrect
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                        : "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                                    }`}
                                  >
                                    {answer.isCorrect ? "Correct" : "Needs Review"}
                                  </span>
                                </div>
                                <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                                  {answer.prompt ?? "Question prompt not available"}
                                </p>
                                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                      Student Answer
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">
                                      {answer.answerText || answer.answerParts?.join(", ") || "No answer submitted"}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 dark:bg-emerald-500/10">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                                      Expected Answer
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">
                                      {answer.correctAnswers?.join(", ") || "Not provided"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </ProtectedRoute>
  );
}
