"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Headphones, School2, Sparkles, Star, Waves } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import StudentShell from "@/src/components/student/layout/StudentShell";
import StoryBookCard from "@/src/components/student/books/StoryBookCard";
import { filterBooksForStudent } from "@/src/lib/student-book-eligibility";
import { getPublishedSchoolContents, type SchoolStoryContent } from "@/src/lib/school-content-api";

export default function StudentDashboardPage() {
  const { user, school } = useAuth();
  const [stories, setStories] = useState<SchoolStoryContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      setError("");

      try {
        setStories(await getPublishedSchoolContents());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stories.");
      } finally {
        setLoading(false);
      }
    };

    void loadStories();
  }, []);

  const allowedStories = useMemo(() => filterBooksForStudent(stories, user), [stories, user]);
  const featuredStory = allowedStories[0] ?? null;
  const recentStories = useMemo(() => allowedStories.slice(0, 6), [allowedStories]);

  return (
    <StudentShell>
      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2.4rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.24),transparent_28%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.22),transparent_24%),linear-gradient(180deg,#fffdf0_0%,#f0fdff_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_24%),linear-gradient(180deg,#0b1120_0%,#111827_100%)] md:p-8"
        >
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-300">
              <Sparkles size={16} />
              Your Story Adventure
            </div>
            <h2 className="mt-6 max-w-2xl text-4xl font-black leading-tight text-slate-900 dark:text-white md:text-5xl">
              Ready to read, {user?.fullName?.split(" ")[0] ?? user?.username ?? "Reader"}?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Pick a bright story, hear it read aloud, flip pages like a real book, and answer fun questions after each adventure.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.7rem] border border-emerald-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <BookOpen className="text-emerald-600 dark:text-emerald-300" size={24} />
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{allowedStories.length}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Books waiting on your shelf</p>
            </div>
            <div className="rounded-[1.7rem] border border-cyan-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <School2 className="text-cyan-600 dark:text-cyan-300" size={24} />
              <p className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                {school?.name ?? user?.school ?? "PathSpring School"}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Your reading home</p>
            </div>
            <div className="rounded-[1.7rem] border border-amber-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <Headphones className="text-orange-600 dark:text-orange-300" size={24} />
              <p className="mt-4 text-lg font-black text-slate-900 dark:text-white">Read with voice</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Play, pause, and continue any page</p>
            </div>
            <div className="rounded-[1.7rem] border border-rose-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <Star className="text-rose-500 dark:text-rose-300" size={24} />
              <p className="mt-4 text-lg font-black text-slate-900 dark:text-white">Today&apos;s idea</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Read one chapter and share your favorite part.</p>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                <Waves size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Reading Mode</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Use the flip-book reader for a calmer page-by-page experience.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Read</p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Open the story and flip through each chapter like a real book.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Listen</p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Turn on voice reading when you want the story read aloud.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Think</p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Pause after a page and think about what the characters learned.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Answer</p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Finish the quiz and activities after reading to save your work.
                </p>
              </div>
            </div>
          </div>

          <div>
            {featuredStory ? (
              <StoryBookCard story={featuredStory} index={0} variant="featured" />
            ) : (
              <div className="rounded-[2rem] border border-dashed border-emerald-200 bg-white/70 p-8 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No published story is available yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Bookshelf</h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                Pick a cover you love and open it like a real book. Everything below is spaced to be easy for kids to scan and tap.
              </p>
            </div>
            <Link href="/student/books" className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-white/10 dark:bg-white/10 dark:text-emerald-300">
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 flex items-center justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {recentStories.map((story, index) => (
                <StoryBookCard key={story._id} story={story} index={index + 1} />
              ))}
            </div>
          )}
        </section>
      </div>
    </StudentShell>
  );
}
