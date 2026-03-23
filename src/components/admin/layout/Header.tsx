// src/components/dashboard/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, Bell, Search, ChevronDown, X } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { user, school } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const notifications = [
    { id: 1, message: "New student registered", time: "5 min ago", read: false },
    { id: 2, message: "Teacher account created", time: "1 hour ago", read: false },
    { id: 3, message: "New story added to library", time: "2 hours ago", read: true },
  ];

  return (
    <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
          >
            <Menu size={20} className="text-slate-400" />
          </button>
          <div className="hidden md:block">
            <h2 className="text-sm md:text-lg font-semibold text-white">
              {school?.name || "PathSpring"}
            </h2>
            <p className="text-xs text-slate-400 hidden md:block">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search students, teachers, stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Search Button */}
          {isMobile && (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Search size={20} className="text-slate-400" />
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bell size={20} className="text-slate-400" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                          !notification.read ? "bg-purple-500/10" : ""
                        }`}
                      >
                        <p className="text-sm text-white">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <ChevronDown size={16} className="text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-700">
                    <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                    <p className="text-xs text-purple-400 mt-1">{user?.role?.replace("_", " ")}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                      Profile Settings
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors">
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
            className="fixed inset-x-0 top-0 z-50 bg-slate-900 border-b border-slate-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;