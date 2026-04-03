"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookHeart, HeartHandshake, Lock, Mail, Sparkles, User } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { getDefaultRouteForRole } from "@/src/lib/auth";
import ThemeToggle from "@/src/components/admin/layout/ThemeToggle";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function FamilyRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/family/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string" && data.message.trim()
            ? data.message
            : "Family registration failed.",
        );
      }

      if (data?.accessToken && data?.user) {
        login(data.accessToken, data.refreshToken ?? "", data.user, data.school);
        router.push(getDefaultRouteForRole(data.user.role, data.user.accountMode ?? "family"));
        return;
      }

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Family registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_22%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_55%,#f0fdf4_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_22%),linear-gradient(180deg,#020617_0%,#111827_100%)] dark:text-white sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-40 rounded-xl border border-slate-200 bg-white/85 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2.2rem] border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-700 dark:text-sky-200">
              <Sparkles size={16} />
              Independent Family Mode
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              Register your family and start home reading the easy way.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Family accounts let parents create child profiles, choose books for home reading, and track progress without needing a school setup first.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 dark:border-white/10 dark:bg-slate-950/45">
                <BookHeart className="text-sky-300" size={22} />
                <p className="mt-4 text-xl font-bold">Family Library</p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">Browse the family catalog and add books for evening reading.</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 dark:border-white/10 dark:bg-slate-950/45">
                <HeartHandshake className="text-emerald-300" size={22} />
                <p className="mt-4 text-xl font-bold">Child Profiles</p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">Create one or more child profiles and track each reading journey separately.</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-slate-200 bg-white/85 p-5 dark:border-white/10 dark:bg-slate-950/45">
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                Family login uses the normal sign-in page after registration.
              </p>
              <Link href="/login" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-300">
                Sign in to family mode
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          <section className="rounded-[2.2rem] border border-slate-200 bg-white/88 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
            <h2 className="text-3xl font-black">Create Family Account</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              This creates an independent family account, not a school-linked parent account.
            </p>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <User size={16} />
                  Full Name
                </span>
                <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Rose Musa" />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Mail size={16} />
                  Email
                </span>
                <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="rose@example.com" />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Lock size={16} />
                  Password
                </span>
                <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Create a secure password" />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Lock size={16} />
                  Confirm Password
                </span>
                <input type="password" value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Repeat your password" />
              </label>

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-3 font-semibold text-white disabled:opacity-60">
                <HeartHandshake size={18} />
                {loading ? "Creating account..." : "Register as Family"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
              Already have a family account?{" "}
              <Link href="/login" className="font-semibold text-sky-600 hover:underline dark:text-sky-300">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
