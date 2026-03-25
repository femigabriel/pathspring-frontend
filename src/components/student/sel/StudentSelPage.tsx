"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, HeartHandshake, ShieldCheck, Sparkles, SunMedium } from "lucide-react";
import StudentShell from "@/src/components/student/layout/StudentShell";
import { getPublishedSchoolContents, type SchoolStoryContent } from "@/src/lib/school-content-api";
import { selFocusDescriptions, selFocusOptions, prettifySelFocus, type SelFocusOption } from "@/src/lib/sel-focus";
import { filterBooksForStudent } from "@/src/lib/student-book-eligibility";
import { useAuth } from "@/src/contexts/AuthContext";

const selIcons: Record<SelFocusOption, typeof Brain> = {
  "self-awareness": Brain,
  "self-management": ShieldCheck,
  "social-awareness": Sparkles,
  "relationship-skills": HeartHandshake,
  "responsible-decision-making": ArrowRight,
  "optimistic-thinking": SunMedium,
};

const groupStoriesBySelFocus = (stories: SchoolStoryContent[]) =>
  selFocusOptions
    .map((focus) => ({
      focus,
      stories: stories.filter((story) => story.selFocus?.includes(focus)),
    }))
    .filter((group) => group.stories.length > 0);

export default function StudentSelPage() {
  const { user } = useAuth();
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
        setError(err instanceof Error ? err.message : "Failed to load SEL stories.");
      } finally {
        setLoading(false);
      }
    };

    void loadStories();
  }, []);

  const allowedStories = useMemo(() => filterBooksForStudent(stories, user), [stories, user]);
  const selGroups = useMemo(() => groupStoriesBySelFocus(allowedStories), [allowedStories]);

  return (
    <StudentShell>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2.4rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_24%),linear-gradient(180deg,#f7fffe_0%,#f8fafc_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_24%),linear-gradient(180deg,#04111b_0%,#0b1120_100%)] md:p-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-300">
              <HeartHandshake size={16} />
              SEL Reading Corner
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 dark:text-white md:text-5xl">
              Stories that help you grow from the inside out
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Every story can teach reading skills and life skills together. Pick a focus below to explore books about feelings, friendship, wise choices, and brave thinking.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.7rem] border border-emerald-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">SEL themes available</p>
              <p className="mt-2 text-4xl font-black text-slate-900 dark:text-white">{selGroups.length}</p>
            </div>
            <div className="rounded-[1.7rem] border border-cyan-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Books for your class</p>
              <p className="mt-2 text-4xl font-black text-slate-900 dark:text-white">{allowedStories.length}</p>
            </div>
            <div className="rounded-[1.7rem] border border-amber-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Today&apos;s idea</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">Read a story, then talk about how the character felt.</p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : selGroups.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-emerald-200 bg-white/70 p-8 text-sm leading-7 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            No SEL-tagged stories are available for this student yet. Once premium admin adds SEL focus to stories for this class, they will show here automatically.
          </div>
        ) : (
          <div className="space-y-6">
            {selGroups.map(({ focus, stories: focusStories }) => {
              const Icon = selIcons[focus];

              return (
                <section
                  key={focus}
                  className="rounded-[2.1rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-3 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <Icon size={16} />
                        {prettifySelFocus(focus)}
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {selFocusDescriptions[focus]}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      {focusStories.length} {focusStories.length === 1 ? "book" : "books"}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {focusStories.map((story) => (
                      <Link
                        key={`${focus}-${story._id}`}
                        href={`/student/books/${story._id}`}
                        className="group rounded-[1.7rem] border border-slate-200 bg-slate-50/90 p-5 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/30"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                          Story Book
                        </p>
                        <h2 className="mt-3 text-xl font-black leading-tight text-slate-900 dark:text-white">
                          {story.title}
                        </h2>
                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {story.summary ?? story.description ?? "Open this story to explore the characters, feelings, and choices inside it."}
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 flex-wrap gap-2">
                            {(story.gradeLevels ?? []).slice(0, 2).map((grade) => (
                              <span
                                key={`${story._id}-${grade}`}
                                className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                              >
                                {grade}
                              </span>
                            ))}
                          </div>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 group-hover:text-emerald-600 dark:text-emerald-300">
                            Open
                            <ArrowRight size={16} />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
