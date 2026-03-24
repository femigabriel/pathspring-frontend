"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, KeyRound, LogIn, School2, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { getStudentProfile } from "@/src/lib/student-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function StudentLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/students/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          passwordOrPin: pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid username or PIN.");
      }

      const profile = await getStudentProfile(data.accessToken).catch(() => null);

      login(
        data.accessToken,
        data.refreshToken,
        profile?.user ?? data.user,
        profile?.school ?? {
          id: "",
          name: data.user.school ?? "PathSpring School",
          schoolCode: data.user.schoolCode ?? "",
        },
      );

      router.push("/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Student login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_24%),linear-gradient(180deg,#effef8_0%,#f4fbff_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2.2rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              <Sparkles size={16} />
              Student Reader Login
            </div>

            <h1 className="mt-6 text-4xl font-black text-slate-900 md:text-5xl">
              Welcome to your reading world.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
              Sign in with your student username and PIN to open books, listen to stories, flip pages, and answer activities.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-emerald-100 bg-emerald-50 p-4">
                <BookOpen className="text-emerald-600" size={22} />
                <p className="mt-3 font-bold text-slate-900">Book Adventures</p>
                <p className="mt-1 text-sm text-slate-600">Read published classroom stories in a book-style reader.</p>
              </div>
              <div className="rounded-[1.6rem] border border-cyan-100 bg-cyan-50 p-4">
                <School2 className="text-cyan-600" size={22} />
                <p className="mt-3 font-bold text-slate-900">School Space</p>
                <p className="mt-1 text-sm text-slate-600">See your school name and your own reading corner.</p>
              </div>
              <div className="rounded-[1.6rem] border border-orange-100 bg-orange-50 p-4">
                <KeyRound className="text-orange-600" size={22} />
                <p className="mt-3 font-bold text-slate-900">Quick PIN Login</p>
                <p className="mt-1 text-sm text-slate-600">Easy for young readers and mobile-friendly too.</p>
              </div>
            </div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.2rem] border border-emerald-100 bg-white p-8 shadow-xl"
          >
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg">
                <UserRound className="text-white" size={28} />
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-900">Reader Sign In</h2>
              <p className="mt-2 text-sm text-slate-500">Use the username your school gave you and your PIN.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <UserRound size={18} className="text-slate-400" />
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="john-doe-k7m2"
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">PIN</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <KeyRound size={18} className="text-slate-400" />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    value={pin}
                    onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
                    placeholder="1234"
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading || !username.trim() || !pin.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                <LogIn size={18} />
                {loading ? "Opening your reading space..." : "Enter Reader Club"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Teacher or school admin?{" "}
              <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-500">
                Use the main sign in
              </Link>
            </p>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
