"use client";

import { GraduationCap, Menu, School2, Sparkles } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";

interface StudentHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function StudentHeader({ setSidebarOpen }: StudentHeaderProps) {
  const { user, school } = useAuth();

  return (
    <header className="border-b border-emerald-100 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-2xl border border-emerald-100 bg-white p-3 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
              Story Adventure
            </p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
              Hi, {user?.fullName?.split(" ")[0] ?? user?.username ?? "Reader"}
            </h1>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <School2 size={16} />
              <span className="text-xs uppercase tracking-[0.18em]">School</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {school?.name ?? user?.school ?? "PathSpring School"}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3 shadow-sm dark:border-white/10 dark:from-emerald-500/10 dark:to-cyan-500/10">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Sparkles size={16} />
              <span className="text-xs uppercase tracking-[0.18em]">Reader ID</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              @{user?.username ?? "reader"}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <GraduationCap size={16} />
              <span className="text-xs uppercase tracking-[0.18em]">Class</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {user?.classroom?.name ?? user?.gradeLevel ?? "Ready to read"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
