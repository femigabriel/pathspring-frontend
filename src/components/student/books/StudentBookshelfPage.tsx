"use client";

import { useEffect, useMemo, useState } from "react";
import { LibraryBig, Search, Sparkles } from "lucide-react";
import StudentShell from "@/src/components/student/layout/StudentShell";
import StoryBookCard from "@/src/components/student/books/StoryBookCard";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import AppSkeletonCard from "@/src/components/shared/ui/AppSkeletonCard";
import { useAuth } from "@/src/contexts/AuthContext";
import { filterBooksForStudent } from "@/src/lib/student-book-eligibility";
import { getPublishedSchoolContents, type SchoolStoryContent } from "@/src/lib/school-content-api";

export default function StudentBookshelfPage() {
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
        setError(err instanceof Error ? err.message : "Failed to load your bookshelf.");
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

    return allowedStories.filter((story) =>
      [story.title, story.theme, story.subject, ...(story.gradeLevels ?? [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [allowedStories, searchQuery]);

  return (
    <StudentShell>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2.3rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.25),transparent_26%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.22),transparent_24%),linear-gradient(180deg,#fefce8_0%,#eff6ff_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_24%),linear-gradient(180deg,#0b1120_0%,#111827_100%)] md:p-8">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-end">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-300">
                <Sparkles size={16} />
                Bookshelf
              </div>
              <h2 className="mt-5 text-4xl font-black leading-tight text-slate-900 dark:text-white">
                Choose a book and start flipping pages.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600 dark:text-slate-300">
                Your stories now sit in roomy, tidy cards so the titles and summaries stay inside the covers instead of spilling out.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <AppBadge label={`${allowedStories.length} shelf books`} tone="emerald" />
                <AppBadge label="Class-matched" tone="cyan" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                  <LibraryBig size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Total Books
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{filteredStories.length}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {searchQuery.trim() ? "Matching your search" : "Available for your class"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.7rem] border border-emerald-100 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Search your shelf</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Search by title, theme, subject, or grade level.
                </p>
              </div>
              <div className="md:w-[26rem]">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/40">
                  <Search size={18} className="shrink-0 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search title, theme, or grade..."
                    className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {!loading && filteredStories.length === 0 && searchQuery.trim() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
            No books matched "{searchQuery.trim()}". Try a title, theme, subject, or class level instead.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <AppSkeletonCard />
            <AppSkeletonCard />
            <AppSkeletonCard />
          </div>
        ) : (
          filteredStories.length === 0 ? (
            <AppEmptyState
              icon={LibraryBig}
              title="No books on this shelf yet"
              body="When your school selects books for your class, your bookshelf will fill up here."
              className="py-16 [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:text-slate-600 dark:[&_p]:text-slate-300"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredStories.map((story, index) => (
                <StoryBookCard key={story._id} story={story} index={index} />
              ))}
            </div>
          )
        )}
      </div>
    </StudentShell>
  );
}
