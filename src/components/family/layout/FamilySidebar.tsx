"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BookHeart, BookOpen, Home, LogOut, Users, X } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";

interface FamilySidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const menuItems = [
  { name: "Dashboard", href: "/family/dashboard", icon: Home },
  { name: "Children", href: "/family/children", icon: Users },
  { name: "Family Library", href: "/family/library", icon: BookOpen },
];

export default function FamilySidebar({ sidebarOpen, setSidebarOpen }: FamilySidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-sky-100 px-5 py-5 dark:border-white/10">
        <Link href="/family/dashboard" className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 p-3 shadow-lg">
            <BookHeart className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 dark:text-white">PathSpring</p>
            <p className="text-xs uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
              Family Mode
            </p>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-slate-500 lg:hidden">
          <X size={18} />
        </button>
      </div>

      <div className="mx-4 mt-5 rounded-[1.6rem] border border-sky-100 bg-gradient-to-br from-sky-50 to-emerald-50 p-4 dark:border-white/10 dark:from-sky-500/10 dark:to-emerald-500/10">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg">
            <span className="text-sm font-black">
              {(user?.fullName ?? user?.email ?? "F").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {user?.fullName ?? "Family Parent"}
            </p>
            <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
              {user?.email ?? "No email"}
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300">
              <BookHeart size={12} />
              <span>Family</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Parent-led reading, family library, and child progress
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
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                active
                  ? "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300"
                  : "border-transparent bg-white/70 text-slate-600 hover:border-sky-200 hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/10"
              }`}
            >
              <Icon size={18} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sky-100 px-4 py-5 dark:border-white/10">
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-sky-100 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:block">
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
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-sky-100 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
