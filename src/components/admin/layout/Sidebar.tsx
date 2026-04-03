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
  CreditCard,
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
  Sparkles,
  Crown,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { getSchoolWorkspaceBaseRoute } from "@/src/lib/auth";
import { getAdminSchoolDetails } from "@/src/lib/admin-api";
import { getSchoolPlanSnapshot } from "@/src/lib/school-plan";
import { useTheme } from "@/src/contexts/ThemeContext";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface MenuItem {
  name: string;
  icon: any;
  href: string;
  roles: string[];
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["SCHOOL_ADMIN", "TEACHER"],
  },
  {
    name: "Students",
    icon: GraduationCap,
    href: "/students",
    roles: ["SCHOOL_ADMIN", "TEACHER"],
  },
  {
    name: "Teachers",
    icon: Users,
    href: "/teachers",
    roles: ["SCHOOL_ADMIN"],
  },
  {
    name: "Classes",
    icon: School,
    href: "/classes",
    roles: ["SCHOOL_ADMIN", "TEACHER"],
  },
  {
    name: "Catalog",
    icon: ShoppingBag,
    href: "/admin/catalog",
    roles: ["SCHOOL_ADMIN"],
    badge: "New",
  },
  {
    name: "Billing",
    icon: CreditCard,
    href: "/admin/billing",
    roles: ["SCHOOL_ADMIN"],
  },
  {
    name: "Story Book",
    icon: LibraryBig,
    href: "/story-book",
    roles: ["SCHOOL_ADMIN", "TEACHER"],
  },
  {
    name: "Notifications",
    icon: Bell,
    href: "/notifications",
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
    badge: "Beta",
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [planLabel, setPlanLabel] = useState<string | null>(null);
  const [planTier, setPlanTier] = useState<"starter" | "growth" | "premium" | null>(null);
  const workspaceBase = getSchoolWorkspaceBaseRoute(user?.role);

  const isDark = theme === "dark";

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

  useEffect(() => {
    if (user?.role !== "SCHOOL_ADMIN") {
      setPlanLabel(null);
      setPlanTier(null);
      return;
    }

    void getAdminSchoolDetails()
      .then((details) => {
        const plan = getSchoolPlanSnapshot(details);
        setPlanLabel(plan.label);
        if (plan.label?.toLowerCase().includes("premium")) setPlanTier("premium");
        else if (plan.label?.toLowerCase().includes("growth")) setPlanTier("growth");
        else if (plan.label?.toLowerCase().includes("starter")) setPlanTier("starter");
        else setPlanTier(null);
      })
      .catch(() => {
        setPlanLabel(null);
        setPlanTier(null);
      });
  }, [user?.role]);

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  ).map(item => ({
    ...item,
    href: item.href.startsWith("/admin") ? item.href : `${workspaceBase}${item.href}`
  }));

  const roleLabel = user?.role === "TEACHER" ? "Teacher" : "School Admin";
  const RoleIcon = user?.role === "TEACHER" ? UserCog : Shield;
  
  // Get user display info - using AuthUser properties
  const userEmail = user?.email || "";
  const userFullName = user?.fullName || "";
  const userUsername = user?.username || "";
  
  // Determine display name: fullName > username > email username
  let displayName = "User";
  if (userFullName) {
    displayName = userFullName.split(" ")[0]; // First name only
  } else if (userUsername) {
    displayName = userUsername;
  } else if (userEmail) {
    displayName = userEmail.split("@")[0];
  }
  
  // Get initial for avatar: first letter of fullName > first letter of username > first letter of email
  let avatarInitial = "U";
  if (userFullName && userFullName.length > 0) {
    avatarInitial = userFullName.charAt(0).toUpperCase();
  } else if (userUsername && userUsername.length > 0) {
    avatarInitial = userUsername.charAt(0).toUpperCase();
  } else if (userEmail && userEmail.length > 0) {
    avatarInitial = userEmail.charAt(0).toUpperCase();
  }

  const getPlanIcon = () => {
    if (planTier === "premium") return Crown;
    if (planTier === "growth") return TrendingUp;
    return Sparkles;
  };
  const PlanIcon = getPlanIcon();
  const planColors = {
    starter: "from-cyan-500 to-blue-500",
    growth: "from-emerald-500 to-teal-500",
    premium: "from-purple-500 to-pink-500",
  };
  const planColor = planTier ? planColors[planTier] : "from-slate-500 to-gray-500";

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 80 : 280,
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`hidden lg:block fixed left-0 top-0 h-full ${
        isDark 
          ? "bg-slate-900/95 backdrop-blur-xl border-r border-white/10" 
          : "bg-white/95 backdrop-blur-xl border-r border-gray-200"
      } z-30 shadow-xl`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className={`flex items-center justify-between p-5 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
          {!collapsed ? (
            <Link href={`${workspaceBase}/dashboard`} className="flex items-center gap-2.5 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg"
              >
                <BookOpen className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  PathSpring
                </span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">School Dashboard</p>
              </div>
            </Link>
          ) : (
            <Link href={`${workspaceBase}/dashboard`} className="mx-auto">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg"
              >
                <BookOpen className="w-5 h-5 text-white" />
              </motion.div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-lg transition-all ${
              isDark 
                ? "hover:bg-white/10 text-slate-400" 
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* User Profile Section */}
        <div className={`p-4 mx-3 mt-4 rounded-xl ${
          isDark 
            ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10" 
            : "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
        }`}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                  <span className="text-base font-bold">{avatarInitial}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <RoleIcon size={10} className="text-purple-500" />
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {roleLabel}
                  </span>
                </div>
                {userEmail && (
                  <p className="truncate text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                  <span className="text-sm font-bold">{avatarInitial}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              </motion.div>
            </div>
          )}
        </div>

        {/* Plan Badge */}
        {planLabel && !collapsed && (
          <div className={`mx-3 mt-3 p-3 rounded-xl ${
            isDark ? "bg-slate-800/50 border border-white/5" : "bg-gray-50 border border-gray-100"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${planColor} flex items-center justify-center`}>
                <PlanIcon size={12} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Plan</span>
            </div>
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{planLabel}</p>
          </div>
        )}

        {planLabel && collapsed && (
          <div className="flex justify-center mt-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${planColor} flex items-center justify-center shadow-md`}>
              <PlanIcon size={14} className="text-white" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-3">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${collapsed ? "justify-center" : ""}
                    ${
                      isActive
                        ? isDark
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border border-purple-200"
                        : isDark
                          ? "text-slate-400 hover:text-white hover:bg-white/5"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className={isActive ? "text-purple-500" : ""} />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.name}</span>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isDark 
                            ? "bg-purple-500/20 text-purple-300" 
                            : "bg-purple-100 text-purple-600"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                      {item.badge && ` (${item.badge})`}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className={`p-4 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <button
            onClick={logout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${collapsed ? "justify-center" : ""}
              text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10
            `}
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed top-0 left-0 w-72 h-full ${
              isDark 
                ? "bg-slate-900/95 backdrop-blur-xl border-r border-white/10" 
                : "bg-white/95 backdrop-blur-xl border-r border-gray-200"
            } z-50 shadow-2xl`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <Link href={`${workspaceBase}/dashboard`} className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                      PathSpring
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">School Dashboard</p>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`p-2 rounded-lg ${
                    isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                  }`}
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* User Profile */}
              <div className={`p-4 mx-3 mt-4 rounded-xl ${
                isDark 
                  ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10" 
                  : "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                    <span className="text-base font-bold">{avatarInitial}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <RoleIcon size={10} className="text-purple-500" />
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {roleLabel}
                        </span>
                      </div>
                      {planLabel && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <div className="flex items-center gap-1">
                            <PlanIcon size={10} className="text-emerald-500" />
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                              {planLabel}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    {userEmail && (
                      <p className="truncate text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-4 overflow-y-auto">
                <div className="space-y-1 px-3">
                  {filteredMenu.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                          ${
                            isActive
                              ? isDark
                                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border border-purple-200"
                              : isDark
                                ? "text-slate-400 hover:text-white hover:bg-white/5"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }
                        `}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-medium flex-1">{item.name}</span>
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isDark 
                              ? "bg-purple-500/20 text-purple-300" 
                              : "bg-purple-100 text-purple-600"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Logout */}
              <div className={`p-4 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
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