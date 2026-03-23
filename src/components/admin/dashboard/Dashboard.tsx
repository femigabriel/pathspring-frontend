// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Award,
  Star,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }: any) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
      <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="text-white" size={20} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-green-400 text-xs md:text-sm font-semibold">
              <TrendingUp size={14} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <p className="text-2xl md:text-3xl font-black text-white mb-1">{value}</p>
        <p className="text-xs md:text-sm text-slate-400 font-medium">{title}</p>
      </div>
    </motion.div>
  );
};

// Quick Action Button
const QuickAction = ({ icon: Icon, label, onClick, color }: any) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 md:p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all group"
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="text-white" size={20} />
      </div>
      <span className="text-xs md:text-sm font-semibold text-slate-300">{label}</span>
    </motion.button>
  );
};

// Student Card Component
const StudentCard = ({ student }: any) => {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-purple-500/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {student.fullName?.charAt(0) || "S"}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm md:text-base">{student.fullName}</h4>
            <p className="text-xs text-slate-400">Grade {student.gradeLevel}</p>
          </div>
        </div>
        <button className="p-1 rounded-lg hover:bg-slate-700">
          <MoreVertical size={16} className="text-slate-400" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
          <Mail size={14} />
          <span className="truncate">{student.parentEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
          <Phone size={14} />
          <span>{student.parentPhone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
          <Award size={14} />
          <span>{student.storiesRead || 0} stories read</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < (student.rating || 4) ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
          ))}
        </div>
        <Link href={`/dashboard/students/${student.id}`} className="text-purple-400 text-xs md:text-sm hover:text-purple-300">
          View Profile →
        </Link>
      </div>
    </div>
  );
};

// Create Student Modal
const CreateStudentModal = ({ isOpen, onClose, onCreate }: any) => {
  const [formData, setFormData] = useState({
    fullName: "",
    pin: "",
    gradeLevel: "",
    age: "",
    parentEmail: "",
    parentPhone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          pin: formData.pin,
          gradeLevel: formData.gradeLevel,
          age: parseInt(formData.age),
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
        }),
      });

      if (!response.ok) throw new Error("Failed to create student");
      
      onCreate();
      onClose();
    } catch (error) {
      console.error("Error creating student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 rounded-2xl max-w-md w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Create New Student</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">PIN (4 digits)</label>
            <input
              type="password"
              required
              maxLength={4}
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="1234"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Grade Level</label>
            <select
              required
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select Grade</option>
              <option value="Primary 1">Primary 1</option>
              <option value="Primary 2">Primary 2</option>
              <option value="Primary 3">Primary 3</option>
              <option value="Primary 4">Primary 4</option>
              <option value="Primary 5">Primary 5</option>
              <option value="Primary 6">Primary 6</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Age</label>
            <input
              type="number"
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="8"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Parent Email</label>
            <input
              type="email"
              required
              value={formData.parentEmail}
              onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="parent@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Parent Phone</label>
            <input
              type="tel"
              required
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="08012345678"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Main Dashboard Page
export default function AdminDashboard() {
  const { user, school } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStories: 0,
    avgProgress: 0,
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    fetchStudents();
    fetchStats();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/students`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/dashboard/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const quickActions = [
    { icon: GraduationCap, label: "Add Student", onClick: () => setShowCreateStudent(true), color: "from-purple-500 to-pink-500" },
    { icon: Users, label: "Add Teacher", onClick: () => console.log("Add Teacher"), color: "from-blue-500 to-cyan-500" },
    { icon: BookOpen, label: "Add Story", onClick: () => console.log("Add Story"), color: "from-green-500 to-emerald-500" },
    { icon: Calendar, label: "Create Class", onClick: () => console.log("Create Class"), color: "from-orange-500 to-red-500" },
  ];

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 md:p-6 text-white"
        >
          <h1 className="text-xl md:text-2xl font-bold mb-2">
            {greeting}, {user?.email?.split("@")[0]}! 👋
          </h1>
          <p className="text-sm md:text-base text-white/90">
            Welcome back to {school?.name}. Here's what's happening with your school today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={GraduationCap}
            color="from-purple-500 to-pink-500"
            trend="+12%"
          />
          <StatsCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={Users}
            color="from-blue-500 to-cyan-500"
            trend="+2"
          />
          <StatsCard
            title="Stories Read"
            value={stats.totalStories}
            icon={BookOpen}
            color="from-green-500 to-emerald-500"
            trend="+23%"
          />
          <StatsCard
            title="Avg Progress"
            value={`${stats.avgProgress}%`}
            icon={TrendingUp}
            color="from-orange-500 to-red-500"
            trend="+5%"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Students */}
        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-semibold text-white">Recent Students</h2>
            <Link href="/dashboard/students" className="text-purple-400 text-xs md:text-sm hover:text-purple-300 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.slice(0, 3).map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </div>
      </div>

      {/* Create Student Modal */}
      <CreateStudentModal
        isOpen={showCreateStudent}
        onClose={() => setShowCreateStudent(false)}
        onCreate={fetchStudents}
      />
    </ProtectedRoute>
  );
}