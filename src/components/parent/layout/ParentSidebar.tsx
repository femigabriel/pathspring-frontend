"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Home, LogOut, Users, X } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";

interface ParentSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const menuItems = [
  { name: "Dashboard", href: "/parent/dashboard", icon: Home },
  { name: "Children", href: "/parent/children", icon: Users },
  { name: "Notifications", href: "/parent/notifications", icon: Bell },
];

export default function ParentSidebar({ sidebarOpen, setSidebarOpen }: ParentSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-rose-100 px-5 py-5 dark:border-white/10">
        <Link href="/parent/dashboard" className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-rose-400 via-orange-400 to-amber-400 p-3 shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 dark:text-white">PathSpring</p>
            <p className="text-xs uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
              Parent Portal
            </p>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-slate-500 lg:hidden">
          <X size={18} />
        </button>
      </div>

      <div className="mx-4 mt-5 rounded-[1.6rem] border border-rose-100 bg-gradient-to-br from-rose-50 to-amber-50 p-4 dark:border-white/10 dark:from-rose-500/10 dark:to-amber-500/10">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Parent</p>
        <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
          {user?.fullName ?? user?.email ?? "Parent"}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Read-only child progress and school updates
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
                  ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300"
                  : "border-transparent bg-white/70 text-slate-600 hover:border-rose-200 hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/10"
              }`}
            >
              <Icon size={18} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-rose-100 px-4 py-5 dark:border-white/10">
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-rose-100 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:block">
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
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-rose-100 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
