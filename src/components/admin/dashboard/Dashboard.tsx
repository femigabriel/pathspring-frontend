// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import AppStatCard from "@/src/components/shared/ui/AppStatCard";
import { getSchoolWorkspaceBaseRoute, getAccessToken } from "@/src/lib/auth";
import {
  filterClassesForTeacher,
  filterStudentsForTeacher,
  filterTeachersForTeacher,
  getAdminDashboardSnapshot,
  getTeacherDashboard,
  type AdminStudent,
  type TeacherAssignmentOverviewItem,
  type TeacherCompletionItem,
  type TeacherDashboardData,
  type TeacherLowScoreItem,
} from "@/src/lib/admin-api";
import {
  AlertTriangle,
  Bell,
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
  ClipboardCheck,
  Clock3,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";

// Quick Action Button
const QuickAction = ({ icon: Icon, label, onClick, color }: any) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 md:p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all group shadow-sm dark:shadow-none"
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="text-white" size={20} />
      </div>
      <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-slate-300">{label}</span>
    </motion.button>
  );
};

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "No date";

const TeacherAssignmentCard = ({ assignment }: { assignment: TeacherAssignmentOverviewItem }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-none">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {assignment.title ?? "Story Assignment"}
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          {assignment.classroomName ?? "Classroom not set"}
        </p>
      </div>
      <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
        {assignment.status ?? "active"}
      </span>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-slate-400">
      <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-900/50">
        <p>Assigned</p>
        <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{assignment.assignedCount ?? 0}</p>
      </div>
      <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-900/50">
        <p>Completed</p>
        <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{assignment.completedCount ?? 0}</p>
      </div>
    </div>
    <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">
      Due {assignment.dueAt ? formatDateTime(assignment.dueAt) : "when you decide"}
    </p>
  </div>
);

const TeacherEventCard = ({
  title,
  subtitle,
  meta,
  accent,
}: {
  title: string;
  subtitle: string;
  meta: string;
  accent: string;
}) => (
  <div className={`rounded-xl border p-4 shadow-sm dark:shadow-none ${accent}`}>
    <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
    <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{subtitle}</p>
    <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">{meta}</p>
  </div>
);

// Student Card Component
const StudentCard = ({ student, workspaceBase }: any) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {student.fullName?.charAt(0) || "S"}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{student.fullName}</h4>
            <p className="text-xs text-gray-600 dark:text-slate-400">Grade {student.gradeLevel}</p>
          </div>
        </div>
        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
          <MoreVertical size={16} className="text-gray-500 dark:text-slate-400" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-slate-400">
          <Mail size={14} />
          <span className="truncate">{student.parentEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-slate-400">
          <Phone size={14} />
          <span>{student.parentPhone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-slate-400">
          <Award size={14} />
          <span>{student.storiesRead || 0} stories read</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < (student.rating || 4) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-slate-600"} />
          ))}
        </div>
        <Link href={`${workspaceBase}/students`} className="text-purple-600 dark:text-purple-400 text-xs md:text-sm hover:text-purple-700 dark:hover:text-purple-300">
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.pin.trim()) newErrors.pin = "PIN is required";
    if (formData.pin.length !== 4) newErrors.pin = "PIN must be exactly 4 digits";
    if (!/^\d+$/.test(formData.pin)) newErrors.pin = "PIN must contain only numbers";
    if (!formData.gradeLevel.trim()) newErrors.gradeLevel = "Grade level is required";
    if (formData.age && (parseInt(formData.age) < 3 || parseInt(formData.age) > 18)) {
      newErrors.age = "Age must be between 3 and 18";
    }
    if (formData.parentEmail && !formData.parentEmail.includes("@")) {
      newErrors.parentEmail = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const token = getAccessToken();
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
      setFormData({
        fullName: "",
        pin: "",
        gradeLevel: "",
        age: "",
        parentEmail: "",
        parentPhone: "",
      });
    } catch (error) {
      console.error("Error creating student:", error);
      setErrors({ submit: "Failed to create student. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const gradeLevels = [
    "Preschool",
    "Kindergarten",
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "Junior Secondary 1",
    "Junior Secondary 2",
    "Junior Secondary 3",
    "Senior Secondary 1",
    "Senior Secondary 2",
    "Senior Secondary 3",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-gray-200 dark:border-purple-500/30 max-h-[90vh] overflow-y-auto shadow-xl dark:shadow-none"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Student</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
              <X size={20} className="text-gray-500 dark:text-slate-400" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">PIN (4 digits) *</label>
            <input
              type="password"
              required
              maxLength={4}
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.pin ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="1234"
            />
            {errors.pin && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.pin}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Grade Level *</label>
            <select
              required
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.gradeLevel ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
            >
              <option value="">Select Grade</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {errors.gradeLevel && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.gradeLevel}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.age ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="8"
              min="3"
              max="18"
            />
            {errors.age && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.age}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Parent Email *</label>
            <input
              type="email"
              required
              value={formData.parentEmail}
              onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.parentEmail ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="parent@example.com"
            />
            {errors.parentEmail && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.parentEmail}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Parent Phone</label>
            <input
              type="tel"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="08012345678"
            />
          </div>
          
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
  const workspaceBase = getSchoolWorkspaceBaseRoute(user?.role);
  const isTeacher = user?.role === "TEACHER";
  const [greeting, setGreeting] = useState("");
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [teacherClassCount, setTeacherClassCount] = useState(0);
  const [teacherDashboard, setTeacherDashboard] = useState<TeacherDashboardData | null>(null);
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

    void loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      if (isTeacher) {
        const [teacherData, snapshot] = await Promise.all([
          getTeacherDashboard(),
          getAdminDashboardSnapshot(),
        ]);
        const scopedClasses = filterClassesForTeacher(snapshot.classes, user);
        const scopedStudents = filterStudentsForTeacher(snapshot.students, snapshot.classes, user);
        setStudents(scopedStudents);
        setTeacherDashboard(teacherData);
        setTeacherClassCount(teacherData.summary.classCount || scopedClasses.length);
        setStats({
          totalStudents: teacherData.summary.studentCount || scopedStudents.length,
          totalTeachers: teacherData.summary.activeAssignments,
          totalStories: teacherData.summary.completionsThisWeek,
          avgProgress: teacherData.summary.lowScoreCount,
        });
        return;
      }

      const snapshot = await getAdminDashboardSnapshot();
      setStudents(snapshot.students);
      setTeacherDashboard(null);
      setTeacherClassCount(snapshot.classes.length);
      setStats(snapshot.stats);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  const quickActions = isTeacher
    ? [
        { icon: GraduationCap, label: "Add Student", onClick: () => setShowCreateStudent(true), color: "from-purple-500 to-pink-500" },
        { icon: Calendar, label: "My Class", onClick: () => (window.location.href = `${workspaceBase}/classes`), color: "from-orange-500 to-red-500" },
        { icon: BookOpen, label: "Story Book", onClick: () => (window.location.href = `${workspaceBase}/story-book`), color: "from-green-500 to-emerald-500" },
        { icon: Users, label: "Notifications", onClick: () => (window.location.href = `${workspaceBase}/notifications`), color: "from-blue-500 to-cyan-500" },
      ]
    : [
        { icon: GraduationCap, label: "Add Student", onClick: () => setShowCreateStudent(true), color: "from-purple-500 to-pink-500" },
        { icon: Users, label: "Add Teacher", onClick: () => (window.location.href = `${workspaceBase}/teachers`), color: "from-blue-500 to-cyan-500" },
        { icon: BookOpen, label: "Add Story", onClick: () => (window.location.href = `${workspaceBase}/story-book`), color: "from-green-500 to-emerald-500" },
        { icon: Calendar, label: "Create Class", onClick: () => (window.location.href = `${workspaceBase}/classes`), color: "from-orange-500 to-red-500" },
      ];

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "TEACHER"]}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 md:p-6 text-white shadow-lg dark:shadow-none"
        >
          <h1 className="text-xl md:text-2xl font-bold mb-2">
            {greeting}, {user?.email?.split("@")[0]}! 👋
          </h1>
          <p className="text-sm md:text-base text-white/90">
            Welcome back to {school?.name}. {isTeacher ? "Here is your teaching space for today." : "Here's what's happening with your school today."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <AppBadge
              label={isTeacher ? "My Class Workspace" : "School Operations"}
              icon={isTeacher ? GraduationCap : Users}
              tone="default"
              className="border-white/20 bg-white/10 text-white dark:border-white/20 dark:bg-white/10 dark:text-white"
            />
            {isTeacher && teacherDashboard ? (
              <AppBadge
                label={`${teacherDashboard.summary.unreadNotifications} unread`}
                icon={Bell}
                tone="default"
                className="border-white/20 bg-white/10 text-white dark:border-white/20 dark:bg-white/10 dark:text-white"
              />
            ) : null}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <AppStatCard
            label={isTeacher ? "My Students" : "Total Students"}
            value={stats.totalStudents}
            icon={GraduationCap}
            tone="purple"
            helper={isTeacher ? `${teacherClassCount} class${teacherClassCount === 1 ? "" : "es"}` : "School-wide learners"}
          />
          <AppStatCard
            label={isTeacher ? "Active Assignments" : "Total Teachers"}
            value={isTeacher ? stats.totalTeachers : stats.totalTeachers}
            icon={isTeacher ? ClipboardCheck : Users}
            tone="cyan"
            helper={isTeacher ? `${teacherDashboard?.summary.overdueAssignments ?? 0} overdue` : "Current staff count"}
          />
          <AppStatCard
            label={isTeacher ? "Completions This Week" : "Stories Read"}
            value={stats.totalStories}
            icon={BookOpen}
            tone="emerald"
            helper={isTeacher ? `${teacherDashboard?.summary.unreadNotifications ?? 0} unread alerts` : "Reading activity snapshot"}
          />
          <AppStatCard
            label={isTeacher ? "Low-Score Alerts" : "Avg Progress"}
            value={isTeacher ? stats.avgProgress : `${stats.avgProgress}%`}
            icon={isTeacher ? AlertTriangle : TrendingUp}
            tone="amber"
            helper={isTeacher ? "Needs follow-up" : "Average learner progress"}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </div>

        {isTeacher && teacherDashboard ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Assignment Overview</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Live tracking from your teacher dashboard feed.</p>
                </div>
                <AppBadge label={`${teacherDashboard.summary.activeAssignments} active`} icon={Clock3} tone="cyan" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {teacherDashboard.assignments.length > 0 ? (
                  teacherDashboard.assignments.slice(0, 4).map((assignment) => (
                    <TeacherAssignmentCard key={assignment.id} assignment={assignment} />
                  ))
                ) : (
                  <AppEmptyState
                    icon={ClipboardCheck}
                    title="No assignments yet"
                    body="Once you assign stories to your class, live progress tracking will appear here."
                    className="md:col-span-2 min-h-[14rem] dark:border-slate-700 dark:bg-slate-900/50 [&_h3]:text-gray-900 dark:[&_h3]:text-white [&_p]:text-gray-500 dark:[&_p]:text-slate-400"
                  />
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-none">
                <div className="flex items-center gap-2 mb-4">
                  <Bell size={18} className="text-blue-600 dark:text-blue-400" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Recent Completions</h2>
                </div>
                <div className="space-y-3">
                  {teacherDashboard.recentCompletions.length > 0 ? (
                    teacherDashboard.recentCompletions.slice(0, 4).map((completion) => (
                      <TeacherEventCard
                        key={completion.id}
                        title={completion.studentName ?? "Student"}
                        subtitle={completion.contentTitle ?? "Completed an assignment"}
                        meta={`${completion.score ?? 0}% • ${formatDateTime(completion.completedAt)}`}
                        accent="border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10"
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">No recent completions yet.</p>
                  )}
                </div>
                <div className="mt-4">
                  <Link href={`${workspaceBase}/story-book`}>
                    <AppActionButton tone="secondary" size="md">
                      <BookOpen size={15} />
                      <span>Open Story Book</span>
                    </AppActionButton>
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-none">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={18} className="text-orange-600 dark:text-orange-400" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Students Needing Support</h2>
                </div>
                <div className="space-y-3">
                  {teacherDashboard.lowScoreStudents.length > 0 ? (
                    teacherDashboard.lowScoreStudents.slice(0, 4).map((item) => (
                      <TeacherEventCard
                        key={item.id}
                        title={item.studentName ?? "Student"}
                        subtitle={item.contentTitle ?? "Low score alert"}
                        meta={`${item.score ?? 0}% • ${item.classroomName ?? "Classroom"}`}
                        accent="border-orange-200 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/10"
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">No low-score alerts right now.</p>
                  )}
                </div>
                <div className="mt-4">
                  <Link href={`${workspaceBase}/students`}>
                    <AppActionButton tone="secondary" size="md">
                      <Users size={15} />
                      <span>Review Students</span>
                    </AppActionButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Recent Students */}
        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Recent Students</h2>
            <Link href={`${workspaceBase}/students`} className="text-purple-600 dark:text-purple-400 text-xs md:text-sm hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.slice(0, 3).map((student) => (
              <StudentCard key={student.id} student={student} workspaceBase={workspaceBase} />
            ))}
            {students.length === 0 && (
              <AppEmptyState
                icon={GraduationCap}
                title="No students yet"
                body='Click "Add Student" to get started.'
                className="col-span-full min-h-[14rem] dark:border-slate-700 dark:bg-slate-900/50 [&_h3]:text-gray-900 dark:[&_h3]:text-white [&_p]:text-gray-600 dark:[&_p]:text-slate-400"
              />
            )}
          </div>
        </div>
      </div>

      {/* Create Student Modal */}
      <CreateStudentModal
        isOpen={showCreateStudent}
        onClose={() => setShowCreateStudent(false)}
        onCreate={loadDashboard}
      />
    </ProtectedRoute>
  );
}
