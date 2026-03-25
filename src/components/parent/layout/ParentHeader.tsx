"use client";

import { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import ThemeToggle from "@/src/components/admin/layout/ThemeToggle";
import NotificationsBell from "@/src/components/shared/notifications/NotificationsBell";

interface ParentHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function ParentHeader({ setSidebarOpen }: ParentHeaderProps) {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden"
          >
            <Menu size={20} className="text-gray-500 dark:text-slate-400" />
          </button>
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white md:text-lg">
              Parent Portal
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Follow your child&apos;s reading journey</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <NotificationsBell />

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-500">
                <span className="text-sm font-semibold text-white">
                  {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "P"}
                </span>
              </div>
              <ChevronDown size={16} className="hidden text-gray-500 dark:text-slate-400 sm:block" />
            </button>

            <AnimatePresence>
              {showUserMenu ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="border-b border-gray-200 p-4 dark:border-slate-700">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.fullName ?? user?.email}
                    </p>
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">Parent</p>
                  </div>
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300">
                      Read-only access to child progress and school updates
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
