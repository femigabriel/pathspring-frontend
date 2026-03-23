// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Link from "next/link";
import { 
  BookOpen, Users, TrendingUp, Award, Calendar, 
  Settings, LogOut, ChevronRight, Star, Sparkles,
  Mail, Phone, MapPin, School, BarChart3, Clock,
  UserPlus, BookMarked, Activity, Bell
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import ProtectedRoute from "@/src/components/ProtectedRoute";

// ============ STATS CARD ============
const StatsCard = ({ title, value, icon: Icon, color, trend }: any) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
      <div className="relative bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="text-white" size={24} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <TrendingUp size={14} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
      </div>
    </motion.div>
  );
};

// ============ ACTIVITY CARD ============
const ActivityCard = ({ activity }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
    >
      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
        {activity.icon === "user" ? <UserPlus size={20} className="text-purple-600" /> : 
         activity.icon === "book" ? <BookMarked size={20} className="text-purple-600" /> :
         <Activity size={20} className="text-purple-600" />}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{activity.title}</p>
        <p className="text-sm text-gray-500">{activity.time}</p>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </motion.div>
  );
};

// ============ QUICK ACTION BUTTON ============
const QuickAction = ({ icon: Icon, label, color, onClick }: any) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all"
    >
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="text-white" size={24} />
      </div>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </motion.button>
  );
};

// ============ MAIN DASHBOARD ============
export default function DashboardPage() {
  const { user, school, logout } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // Mock data - replace with real API calls
  const stats = [
    { title: "Total Students", value: "1,234", icon: Users, color: "from-blue-500 to-cyan-500", trend: "+12%" },
    { title: "Active Teachers", value: "24", icon: Users, color: "from-purple-500 to-pink-500", trend: "+2" },
    { title: "Stories Read", value: "8,456", icon: BookOpen, color: "from-green-500 to-emerald-500", trend: "+23%" },
    { title: "Badges Earned", value: "456", icon: Award, color: "from-orange-500 to-red-500", trend: "+45" },
  ];

  const recentActivities = [
    { title: "New teacher registered: Mrs. Adeola", time: "2 hours ago", icon: "user" },
    { title: "Class 3A read 50 stories this week!", time: "5 hours ago", icon: "book" },
    { title: "5 new students joined PathSpring", time: "Yesterday", icon: "user" },
    { title: "Achievement unlocked: Reading Champion", time: "Yesterday", icon: "award" },
  ];

  const quickActions = [
    { icon: UserPlus, label: "Add Teacher", color: "from-purple-500 to-pink-500", action: () => console.log("Add teacher") },
    { icon: BookOpen, label: "Add Story", color: "from-blue-500 to-cyan-500", action: () => console.log("Add story") },
    { icon: Users, label: "View Students", color: "from-green-500 to-emerald-500", action: () => console.log("View students") },
    { icon: BarChart3, label: "Reports", color: "from-orange-500 to-red-500", action: () => console.log("Reports") },
  ];

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PathSpring
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600 font-semibold">Dashboard</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                    <p className="text-xs text-gray-500">School Administrator</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {school?.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <LogOut size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-32 -mr-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -mb-24 -ml-24"></div>
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={20} className="text-yellow-300" />
                  <span className="text-white/90 font-semibold">{currentTime}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-2">
                  {greeting}, {user?.email?.split("@")[0]}! 👋
                </h1>
                <p className="text-white/90 text-lg">
                  Welcome back to {school?.name}. Here's what's happening with your school today.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-purple-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <QuickAction key={index} {...action} />
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* School Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <School className="text-purple-600" size={24} />
                  <h2 className="text-xl font-black text-gray-900">School Info</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">School Name</p>
                    <p className="font-semibold text-gray-800">{school?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">School Code</p>
                    <div className="inline-block bg-purple-100 px-3 py-1 rounded-lg">
                      <code className="font-mono font-bold text-purple-700">{school?.schoolCode}</code>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Share this with teachers to join</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Admin Email</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Mail size={14} />
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Type</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                        SCHOOL ADMINISTRATOR
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="text-purple-600" size={24} />
                    <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
                  </div>
                  <button className="text-purple-600 text-sm font-semibold hover:text-purple-700">
                    View All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <ActivityCard key={index} activity={activity} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-500">
              © 2024 PathSpring. Making learning magical for kids everywhere! 💚
            </p>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}