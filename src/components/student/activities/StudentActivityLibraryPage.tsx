"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import StudentShell from "@/src/components/student/layout/StudentShell";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import { filterBooksForStudent } from "@/src/lib/student-book-eligibility";
import { getPublishedSchoolContents, type SchoolStoryContent } from "@/src/lib/school-content-api";

export default function StudentActivityLibraryPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<SchoolStoryContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      setError("");

      try {
        setStories(await getPublishedSchoolContents());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load story activities.");
      } finally {
        setLoading(false);
      }
    };

    void loadStories();
  }, []);

  const allowedStories = useMemo(() => filterBooksForStudent(stories, user), [stories, user]);
  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allowedStories;

    return allowedStories.filter((story) => story.title.toLowerCase().includes(query));
  }, [allowedStories, searchQuery]);

  return (
    <StudentShell>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2.3rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.16),transparent_24%),linear-gradient(180deg,#eff6ff_0%,#f0fdf4_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_24%),linear-gradient(180deg,#0b1120_0%,#111827_100%)] md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-300">
                <Sparkles size={16} />
                Story Activities
              </div>
              <h2 className="mt-5 text-4xl font-black leading-tight text-slate-900 dark:text-white">
                Open activities for each book.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600 dark:text-slate-300">
                Choose a book title to see its classroom activities, prompts, and task steps in one clean page.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <AppBadge label={`${allowedStories.length} activity books`} tone="cyan" />
                <AppBadge label="Story tasks" tone="emerald" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search activity title..."
                className="w-full min-w-64 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-white"
              />
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
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : (
          <section className="rounded-[2.2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="space-y-4">
              {filteredStories.map((story, index) => (
                <Link
                  key={story._id}
                  href={`/student/activities/${story._id}`}
                  className="flex flex-col gap-4 rounded-[1.7rem] border border-slate-200 bg-slate-50 px-5 py-5 transition-all hover:border-sky-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-sky-400/20"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <AppBadge label={`Activity Set ${index + 1}`} icon={ClipboardList} tone="cyan" />
                      <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{story.title}</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Open this page to see the story-linked activities for the book.
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-bold text-white">
                      Open Activities
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}

              {filteredStories.length === 0 ? (
                <AppEmptyState
                  icon={ClipboardList}
                  title="No story activities are available right now"
                  body="When your school selects books for your class, their activity pages will appear here."
                  className="rounded-[1.7rem] border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:text-slate-600 dark:[&_p]:text-slate-300"
                />
              ) : null}
            </div>
          </section>
        )}
      </div>
    </StudentShell>
  );
}
