"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, BookOpen, Home, LogOut, X } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";

interface StudentSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const menuItems = [
  { name: "My Space", href: "/student/dashboard", icon: Home },
  { name: "Bookshelf", href: "/student/books", icon: BookMarked },
];

export default function StudentSidebar({ sidebarOpen, setSidebarOpen }: StudentSidebarProps) {
  const pathname = usePathname();
  const { user, school, logout } = useAuth();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-5 dark:border-white/10">
        <Link href="/student/dashboard" className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-sky-500 p-3 shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 dark:text-white">PathSpring</p>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
              Reader Club
            </p>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-slate-500 lg:hidden">
          <X size={18} />
        </button>
      </div>

      <div className="mx-4 mt-5 rounded-[1.6rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 dark:border-white/10 dark:from-emerald-500/10 dark:to-cyan-500/10">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Reader</p>
        <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
          {user?.fullName ?? user?.username ?? "Young Reader"}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{school?.name ?? user?.school ?? "PathSpring School"}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
          {user?.classroom?.name ?? user?.gradeLevel ?? "Story Explorer"}
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${active ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-transparent bg-white/70 text-slate-600 hover:border-emerald-200 hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/10"}`}
            >
              <Icon size={18} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-emerald-100 px-4 py-5 dark:border-white/10">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 transition-all hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        >
          <LogOut size={18} />
          <span className="font-semibold">Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-80 border-r border-emerald-100 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen ? (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-80 border-r border-emerald-100 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
