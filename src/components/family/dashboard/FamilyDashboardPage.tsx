"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookHeart, BookOpen, Clock3, Sparkles, Users } from "lucide-react";
import FamilyShell from "@/src/components/family/layout/FamilyShell";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import {
  getFamilyChildren,
  getFamilyProfile,
  getFamilySelectedProducts,
  type FamilyChild,
  type FamilyProfile,
} from "@/src/lib/family-api";

export default function FamilyDashboardPage() {
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [children, setChildren] = useState<FamilyChild[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ _id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [profileData, childrenData, productData] = await Promise.all([
          getFamilyProfile(),
          getFamilyChildren(),
          getFamilySelectedProducts(),
        ]);

        setProfile(profileData);
        setChildren(childrenData);
        setSelectedProducts(productData.map((item) => ({ _id: item._id, title: item.title })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load family dashboard.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <FamilyShell>
      <div className="space-y-8">
        <section className="rounded-[2.4rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_24%),linear-gradient(180deg,#ecfeff_0%,#f8fafc_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_24%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-300">
              <Sparkles size={16} />
              Family Dashboard
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 dark:text-white md:text-5xl">
              Welcome, {profile?.fullName ?? "Family Parent"}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Build a family reading rhythm, choose books for home reading, and track each child&apos;s learning journey in one place.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <AppBadge label="Family-led reading" tone="cyan" />
              <AppBadge label={`${children.length} child${children.length === 1 ? "" : "ren"}`} tone="emerald" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.7rem] border border-sky-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <Users className="text-sky-600 dark:text-sky-300" size={24} />
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{children.length}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Children</p>
            </div>
            <div className="rounded-[1.7rem] border border-emerald-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <BookOpen className="text-emerald-600 dark:text-emerald-300" size={24} />
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{selectedProducts.length}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Selected books</p>
            </div>
            <div className="rounded-[1.7rem] border border-amber-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <BookHeart className="text-amber-600 dark:text-amber-300" size={24} />
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{profile?.selectedProductsCount ?? selectedProducts.length}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Family library</p>
            </div>
            <div className="rounded-[1.7rem] border border-cyan-100/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <Clock3 className="text-cyan-600 dark:text-cyan-300" size={24} />
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{loading ? "..." : "Live"}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Family reading mode</p>
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
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Children</h2>
                <Link href="/family/children" className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                  Manage children
                </Link>
              </div>
              <div className="mt-5 space-y-3">
                {children.length === 0 ? (
                  <AppEmptyState
                    title="No child profiles yet"
                    body="Create your first child profile to start family reading."
                    icon={Users}
                    className="min-h-[14rem] border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:text-slate-500 dark:[&_p]:text-slate-400"
                  />
                ) : (
                  children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/family/children/${child.id}`}
                      className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-1 hover:border-sky-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-sky-400/30"
                    >
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{child.fullName}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {child.gradeLevel ?? "Grade not set"}{child.age ? ` • Age ${child.age}` : ""}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Family Library</h2>
                <Link href="/family/library" className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                  Open library
                </Link>
              </div>
              <div className="mt-5 space-y-3">
                {selectedProducts.length === 0 ? (
                  <AppEmptyState
                    title="No books in the family library yet"
                    body="Browse the catalog and add a story for your next evening reading session."
                    icon={BookOpen}
                    className="min-h-[14rem] border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:text-slate-500 dark:[&_p]:text-slate-400"
                  />
                ) : (
                  selectedProducts.slice(0, 4).map((product) => (
                    <div key={product._id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="font-semibold text-slate-900 dark:text-white">{product.title}</p>
                    </div>
                  ))
                )}
              </div>
              <Link href="/family/library" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-3 font-semibold text-white">
                Continue to family library
                <ArrowRight size={16} />
              </Link>
            </section>
          </div>
        )}
      </div>
    </FamilyShell>
  );
}
