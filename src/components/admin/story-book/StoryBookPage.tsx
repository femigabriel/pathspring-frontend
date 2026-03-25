"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LibraryBig,
  Loader2,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import {
  filterClassesForTeacher,
  filterStudentsForTeacher,
  getAdminClasses,
  getAdminStudents,
  type AdminClassroom,
  type AdminStudent,
} from "@/src/lib/admin-api";
import {
  createContentAssignment,
  getContentAssignments,
  getPublishedSchoolContents,
  getPublishedSchoolStoryBundle,
  type SchoolContentAssignment,
  type SchoolActivity,
  type SchoolStoryBundle,
  type SchoolStoryContent,
} from "@/src/lib/school-content-api";

const prettyDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "Recently published";

const getBundleTitle = (bundle: SchoolStoryBundle | null) =>
  bundle?.story?.content.title ?? bundle?.contentPack?.title ?? bundle?.requestedContent?.title ?? "Story Bundle";

export default function StoryBookPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<SchoolStoryContent[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<SchoolStoryBundle | null>(null);
  const [classes, setClasses] = useState<AdminClassroom[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [assignments, setAssignments] = useState<SchoolContentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [assignmentDraft, setAssignmentDraft] = useState({
    classroomId: "",
    dueAt: "",
    notes: "",
    studentUserIds: [] as string[],
  });
  const canAssign = user?.role === "SCHOOL_ADMIN" || user?.role === "TEACHER";
  const isTeacher = user?.role === "TEACHER";

  useEffect(() => {
    void loadStories();
  }, []);

  useEffect(() => {
    if (!canAssign) return;
    void loadAssignmentOptions();
  }, [canAssign, user?.id, user?.email]);

  const loadStories = async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const published = await getPublishedSchoolContents();
      setStories(published);

      if (published.length > 0) {
        await openBundle(published[0]._id);
      } else {
        setSelectedBundle(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the story book.");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignmentOptions = async () => {
    try {
      const [classList, studentList, assignmentList] = await Promise.all([
        getAdminClasses(),
        getAdminStudents(),
        getContentAssignments().catch(() => []),
      ]);

      const scopedClasses = isTeacher ? filterClassesForTeacher(classList, user) : classList;
      const scopedStudents = isTeacher
        ? filterStudentsForTeacher(studentList, classList, user)
        : studentList;

      setClasses(scopedClasses);
      setStudents(scopedStudents);
      setAssignments(assignmentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignment options.");
    }
  };

  const openBundle = async (contentId: string) => {
    setOpeningId(contentId);
    setError("");
    try {
      const bundle = await getPublishedSchoolStoryBundle(contentId);
      setSelectedBundle(bundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open the selected story.");
    } finally {
      setOpeningId("");
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setAssignmentDraft((current) => ({
      ...current,
      studentUserIds: current.studentUserIds.includes(studentId)
        ? current.studentUserIds.filter((item) => item !== studentId)
        : [...current.studentUserIds, studentId],
      classroomId: "",
    }));
  };

  const handleAssignStory = async () => {
    const selectedStoryId =
      selectedBundle?.story?.content._id ??
      selectedBundle?.requestedContent?._id ??
      "";

    if (!selectedStoryId) {
      setError("Select a story before creating an assignment.");
      return;
    }

    if (!assignmentDraft.classroomId && assignmentDraft.studentUserIds.length === 0) {
      setError("Choose a class or select at least one student for the assignment.");
      return;
    }

    setAssigning(true);
    setError("");
    setNotice("");

    try {
      await createContentAssignment({
        contentId: selectedStoryId,
        classroomId: assignmentDraft.classroomId || undefined,
        studentUserIds:
          assignmentDraft.classroomId.length > 0 ? undefined : assignmentDraft.studentUserIds,
        dueAt: assignmentDraft.dueAt ? new Date(assignmentDraft.dueAt).toISOString() : undefined,
        notes: assignmentDraft.notes.trim() || undefined,
      });

      setNotice("Assignment created successfully. Notifications have been triggered.");
      setAssignmentDraft({
        classroomId: "",
        dueAt: "",
        notes: "",
        studentUserIds: [],
      });
      setAssignments(await getContentAssignments().catch(() => assignments));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign story.");
    } finally {
      setAssigning(false);
    }
  };

  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return stories;

    return stories.filter((story) =>
      [story.title, story.subject, story.theme, ...(story.gradeLevels ?? [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [stories, searchQuery]);

  const storyChapters = selectedBundle?.story?.chapters ?? [];
  const storyQuestions = selectedBundle?.story?.questions ?? [];
  const activities = selectedBundle?.activities ?? [];
  const selectedStoryId = selectedBundle?.story?.content._id ?? selectedBundle?.requestedContent?._id ?? "";
  const assignmentCount = assignments.filter((assignment) => assignment.contentId === selectedStoryId).length;

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10 dark:via-slate-900 dark:to-cyan-500/10"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
                School Story Book
              </p>
              <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
                Published premium stories for school reading time.
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                Open live published bundles, read the chapters, review the questions, and use the attached activities in class.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[22rem] xl:w-[24rem]">
              <div className="min-w-0 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-center backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="truncate text-[11px] uppercase tracking-[0.18em] text-slate-500">Published</p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stories.length}</p>
              </div>
              <div className="min-w-0 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-center backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="truncate text-[11px] uppercase tracking-[0.18em] text-slate-500">Chapters</p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{storyChapters.length}</p>
              </div>
              <div className="min-w-0 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-center backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="truncate text-[11px] uppercase tracking-[0.18em] text-slate-500">Activities</p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{activities.length}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {notice ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search published stories by title, subject, theme..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                </div>
              ) : filteredStories.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center dark:border-white/10 dark:bg-white/5">
                  <LibraryBig size={38} className="mx-auto text-emerald-500" />
                  <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">No published stories yet</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    When the premium admin publishes bundles, they will appear here for schools.
                  </p>
                </div>
              ) : (
                filteredStories.map((story) => {
                  const activeId =
                    selectedBundle?.contentPack?._id ??
                    selectedBundle?.requestedContent?._id ??
                    selectedBundle?.story?.content._id;
                  const isActive = activeId === story._id;

                  return (
                    <button
                      key={story._id}
                      onClick={() => void openBundle(story._id)}
                      className={`w-full rounded-[1.5rem] border p-4 text-left transition-all ${isActive ? "border-emerald-400 bg-emerald-50 dark:border-emerald-400/40 dark:bg-emerald-500/10" : "border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{story.title}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{story.subject ?? story.theme ?? "General"}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:bg-white/10 dark:text-emerald-300">
                          {story.type === "CONTENT_PACK" ? "Bundle" : "Story"}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {story.summary ?? story.description ?? "A published story bundle ready for class."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {story.gradeLevels?.slice(0, 2).map((grade) => (
                          <span key={grade} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {grade}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{prettyDate(story.publishedAt ?? story.updatedAt ?? story.createdAt)}</span>
                        <span>{openingId === story._id ? "Opening..." : "Open Story"}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            {selectedBundle ? (
              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50 p-5 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-cyan-500/10">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-white/10 dark:text-emerald-300">
                      {selectedBundle.story?.content.theme ?? "Story"}
                    </span>
                    {selectedBundle.story?.content.estimatedDurationMinutes ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {selectedBundle.story.content.estimatedDurationMinutes} mins
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{getBundleTitle(selectedBundle)}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {selectedBundle.story?.content.summary ??
                      selectedBundle.story?.content.description ??
                      "This published story bundle is ready for reading and class activities."}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/80 px-4 py-3 dark:bg-white/5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <BookOpen size={16} />
                        <span className="text-xs uppercase tracking-[0.18em]">Chapters</span>
                      </div>
                      <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{storyChapters.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3 dark:bg-white/5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <GraduationCap size={16} />
                        <span className="text-xs uppercase tracking-[0.18em]">Questions</span>
                      </div>
                      <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{storyQuestions.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3 dark:bg-white/5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Sparkles size={16} />
                        <span className="text-xs uppercase tracking-[0.18em]">{canAssign ? "Assignments" : "Activities"}</span>
                      </div>
                      <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{canAssign ? assignmentCount : activities.length}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {storyChapters.map((chapter, index) => (
                    <article key={chapter._id ?? `${chapter.title}-${index}`} className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                        Chapter {chapter.order ?? index + 1}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                        {chapter.title ?? `Chapter ${index + 1}`}
                      </h3>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {chapter.body ?? "No chapter body returned for this section yet."}
                      </p>
                    </article>
                  ))}
                </div>

                {canAssign ? (
                  <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign this story</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          Assign this published story to your class or hand-pick students. The backend will notify students, linked parents, and school staff automatically.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {isTeacher ? "Teacher scope" : "School scope"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Assign to class
                          </label>
                          <select
                            value={assignmentDraft.classroomId}
                            onChange={(event) =>
                              setAssignmentDraft({
                                ...assignmentDraft,
                                classroomId: event.target.value,
                                studentUserIds: [],
                              })
                            }
                            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                          >
                            <option value="">Select a class</option>
                            {classes.map((classroom) => (
                              <option key={classroom.id} value={classroom.id}>
                                {classroom.name} {classroom.gradeLevel ? `- ${classroom.gradeLevel}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Due date
                          </label>
                          <input
                            type="datetime-local"
                            value={assignmentDraft.dueAt}
                            onChange={(event) =>
                              setAssignmentDraft({ ...assignmentDraft, dueAt: event.target.value })
                            }
                            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Notes
                          </label>
                          <textarea
                            rows={4}
                            value={assignmentDraft.notes}
                            onChange={(event) =>
                              setAssignmentDraft({ ...assignmentDraft, notes: event.target.value })
                            }
                            placeholder="Please finish this story before Friday."
                            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Or choose students
                        </label>
                        <div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950/60">
                          {students.length === 0 ? (
                            <p className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">
                              No students are available in your current scope.
                            </p>
                          ) : (
                            students.map((student) => {
                              const checked = assignmentDraft.studentUserIds.includes(student.id);
                              return (
                                <label
                                  key={student.id}
                                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition-colors ${
                                    checked
                                      ? "border-emerald-300 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/10"
                                      : "border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={assignmentDraft.classroomId.length > 0}
                                    onChange={() => toggleStudentSelection(student.id)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300"
                                  />
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{student.fullName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {student.gradeLevel ?? "No grade"}{student.classroomName ? ` • ${student.classroomName}` : ""}
                                    </p>
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => void handleAssignStory()}
                      disabled={assigning || !selectedStoryId}
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-semibold text-white disabled:opacity-60"
                    >
                      {assigning ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      {assigning ? "Assigning story..." : "Assign story"}
                    </button>
                  </div>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Questions</h3>
                      <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {storyQuestions.length}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {storyQuestions.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No questions were attached yet.</p>
                      ) : (
                        storyQuestions.map((question, index) => (
                          <div key={question._id ?? `${question.prompt}-${index}`} className="rounded-2xl border border-white bg-white p-4 dark:border-white/10 dark:bg-slate-950/50">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {question.prompt ?? `Question ${index + 1}`}
                            </p>
                            {question.explanation ? (
                              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                {question.explanation}
                              </p>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Class Activities</h3>
                      <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {activities.length}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {activities.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No extra activities were attached yet.</p>
                      ) : (
                        activities.map((activity: SchoolActivity, index) => (
                          <div key={activity._id ?? `${activity.title}-${index}`} className="rounded-2xl border border-white bg-white p-4 dark:border-white/10 dark:bg-slate-950/50">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-semibold text-slate-900 dark:text-white">{activity.title}</h4>
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                {activity.configuration?.activityType ?? "activity"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                              {activity.summary ?? activity.description ?? "Classroom activity attached to this story."}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                              {activity.configuration?.materialsNeeded?.slice(0, 3).map((material) => (
                                <span key={material} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
                                  {material}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock3 size={16} />
                      <span>{prettyDate(selectedBundle.story?.content.publishedAt ?? selectedBundle.story?.content.updatedAt)}</span>
                    </div>
                    {selectedBundle.story?.content.gradeLevels?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedBundle.story.content.gradeLevels.map((grade) => (
                          <span key={grade} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {grade}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="ml-auto flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 size={16} />
                      <span>Published and ready for school use</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[40rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-gray-200 bg-gray-50 px-6 text-center dark:border-white/10 dark:bg-white/5">
                <BookOpen size={40} className="text-emerald-500" />
                <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Choose a published story</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Pick a story from the Story Book list to read the chapters and see the attached school activities.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
