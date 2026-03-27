"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Users } from "lucide-react";
import FamilyShell from "@/src/components/family/layout/FamilyShell";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import { createFamilyChild, getFamilyChildren, type FamilyChild } from "@/src/lib/family-api";

export default function FamilyChildrenPage() {
  const [children, setChildren] = useState<FamilyChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    fullName: "",
    gradeLevel: "",
    age: "",
  });

  const loadChildren = async () => {
    setLoading(true);
    setError("");

    try {
      setChildren(await getFamilyChildren());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load family children.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadChildren();
  }, []);

  const handleCreateChild = async () => {
    if (!draft.fullName.trim() || !draft.gradeLevel.trim()) {
      setError("Child name and grade level are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createFamilyChild({
        fullName: draft.fullName.trim(),
        gradeLevel: draft.gradeLevel.trim(),
        age: draft.age ? Number(draft.age) : undefined,
      });
      setDraft({ fullName: "", gradeLevel: "", age: "" });
      await loadChildren();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create child profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FamilyShell>
      <div className="space-y-8">
        <section className="rounded-[2.2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_22%),linear-gradient(180deg,#ecfeff_0%,#f8fafc_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_22%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-300">
            <Users size={16} />
            Family Children
          </div>
          <h1 className="mt-6 text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
            Create and manage child profiles
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Add children directly to your family workspace so you can build their reading routine, library, and progress history at home.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <AppBadge label={`${children.length} profile${children.length === 1 ? "" : "s"}`} tone="cyan" />
            <AppBadge label="Parent-managed" tone="emerald" />
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Add Child</h2>
            <div className="mt-5 space-y-4">
              <input value={draft.fullName} onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))} placeholder="Child full name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5" />
              <input value={draft.gradeLevel} onChange={(event) => setDraft((current) => ({ ...current, gradeLevel: event.target.value }))} placeholder="Grade level" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5" />
              <input value={draft.age} onChange={(event) => setDraft((current) => ({ ...current, age: event.target.value }))} placeholder="Age (optional)" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5" />
              <AppActionButton onClick={() => void handleCreateChild()} disabled={saving} tone="primary" className="w-full justify-center">
                <Plus size={18} />
                <span>{saving ? "Creating..." : "Create Child Profile"}</span>
              </AppActionButton>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Children</h2>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
              </div>
            ) : children.length === 0 ? (
              <AppEmptyState
                title="No child profiles yet"
                body="Create your first child profile to start using family mode."
                icon={Users}
                className="mt-5 min-h-[14rem] border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:text-slate-500 dark:[&_p]:text-slate-400"
              />
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/family/children/${child.id}`}
                    className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:border-sky-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-sky-400/30"
                  >
                    <p className="text-xl font-black text-slate-900 dark:text-white">{child.fullName}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {child.gradeLevel ?? "Grade not set"}{child.age ? ` • Age ${child.age}` : ""}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300">
                      Open child detail
                      <ArrowRight size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </FamilyShell>
  );
}
