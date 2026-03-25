// src/components/dashboard/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, Search, ChevronDown, X, Shield, UserCog } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import NotificationsBell from "@/src/components/shared/notifications/NotificationsBell";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { user, school } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const isTeacher = user?.role === "TEACHER";
  const HeaderBadgeIcon = isTeacher ? UserCog : Shield;
  const headerBadgeLabel = isTeacher ? "Teacher" : "Admin";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors lg:hidden"
          >
            <Menu size={20} className="text-gray-500 dark:text-slate-400" />
          </button>
          <div className="hidden md:block">
            <div className="flex items-center gap-3">
              <h2 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                {school?.name || "PathSpring"}
              </h2>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-300">
                <HeaderBadgeIcon size={12} />
                <span>{headerBadgeLabel}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 hidden md:block">
              {isTeacher ? "Classroom and student workspace" : "School operations workspace"}
            </p>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search students, teachers, stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Search Button */}
          {isMobile && (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <Search size={20} className="text-gray-500 dark:text-slate-400" />
            </button>
          )}

          <NotificationsBell />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <ChevronDown size={16} className="text-gray-500 dark:text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.email}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{user?.role?.replace("_", " ")}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      Profile Settings
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      Account Settings
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={24} className="text-gray-500 dark:text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
