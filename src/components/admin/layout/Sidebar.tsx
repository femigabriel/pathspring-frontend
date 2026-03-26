// src/components/dashboard/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  LibraryBig,
  ShoppingBag,
  LogOut,
  Medal,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  School,
  Bell,
  X,
  Shield,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { getSchoolWorkspaceBaseRoute } from "@/src/lib/auth";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const workspaceBase = getSchoolWorkspaceBaseRoute(user?.role);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: `${workspaceBase}/dashboard`,
      roles: ["SCHOOL_ADMIN", "TEACHER"],
    },
    {
      name: "Students",
      icon: GraduationCap,
      href: `${workspaceBase}/students`,
      roles: ["SCHOOL_ADMIN", "TEACHER"],
    },
    {
      name: "Teachers",
      icon: Users,
      href: `${workspaceBase}/teachers`,
      roles: ["SCHOOL_ADMIN"],
    },
    {
      name: "Classes",
      icon: School,
      href: `${workspaceBase}/classes`,
      roles: ["SCHOOL_ADMIN", "TEACHER"],
    },
    {
      name: "Catalog",
      icon: ShoppingBag,
      href: "/admin/catalog",
      roles: ["SCHOOL_ADMIN"],
    },
    {
      name: "Story Book",
      icon: LibraryBig,
      href: `${workspaceBase}/story-book`,
      roles: ["SCHOOL_ADMIN", "TEACHER"],
    },
    {
      name: "Notifications",
      icon: Bell,
      href: `${workspaceBase}/notifications`,
      roles: ["SCHOOL_ADMIN", "TEACHER"],
    },
    {
      name: "Submissions",
      icon: ClipboardCheck,
      href: "/admin/submissions",
      roles: ["SCHOOL_ADMIN"],
    },
    {
      name: "Scoreboard",
      icon: Medal,
      href: "/admin/scoreboard",
      roles: ["SCHOOL_ADMIN"],
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );
  const roleLabel = user?.role === "TEACHER" ? "Teacher" : "Admin";
  const RoleIcon = user?.role === "TEACHER" ? UserCog : Shield;
  const emailInitial = user?.email?.charAt(0).toUpperCase() || "U";

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 100 : 240,
      }}
      transition={{ duration: 0.3 }}
      className="hidden lg:block fixed left-0 top-0 h-full bg-white dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 z-30"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
          {!collapsed && (
            <Link href={`${workspaceBase}/dashboard`} className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                PathSpring
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href={`${workspaceBase}/dashboard`}>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            {collapsed ? (
              <ChevronRight size={18} className="text-gray-500 dark:text-slate-400" />
            ) : (
              <ChevronLeft size={18} className="text-gray-500 dark:text-slate-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-6 py-3 mx-2 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-purple-50 dark:bg-gradient-to-r dark:from-purple-500/20 dark:to-pink-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  }
                `}
              >
                <Icon size={20} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-6 border-t border-gray-200 dark:border-white/10">
          {!collapsed && (
            <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm">
                  <span className="text-sm font-bold">{emailInitial}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.email || "No email"}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-300">
                    <RoleIcon size={12} />
                    <span>{roleLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 w-72 h-full bg-white dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 z-50 lg:hidden"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
              <Link href={`${workspaceBase}/dashboard`} className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  PathSpring
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={20} className="text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-6 py-3 mx-2 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-purple-50 dark:bg-gradient-to-r dark:from-purple-500/20 dark:to-pink-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30"
                          : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-gray-200 dark:border-white/10">
              <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm">
                    <span className="text-sm font-bold">{emailInitial}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.email || "No email"}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-300">
                      <RoleIcon size={12} />
                      <span>{roleLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;
