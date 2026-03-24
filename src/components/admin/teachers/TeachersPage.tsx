// app/dashboard/teachers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { getAccessToken } from "@/src/lib/auth";
import {
  getAdminTeachers,
  type AdminTeacher,
} from "@/src/lib/admin-api";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  BookOpen,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  Award,
  Star,
  Eye,
  UserPlus,
  RefreshCw,
} from "lucide-react";

// ============ TEACHER CARD COMPONENT ============
const TeacherCard = ({ teacher, onEdit, onDelete, onView }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {teacher.fullName?.charAt(0) || teacher.email?.charAt(0) || "T"}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-base">{teacher.fullName}</h4>
              <p className="text-xs text-purple-600 dark:text-purple-400">{teacher.role?.replace("_", " ") || "TEACHER"}</p>
            </div>
          </div>
          <div className="relative group">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <MoreVertical size={18} className="text-gray-500 dark:text-slate-400" />
            </button>
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onView(teacher)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
              >
                <Eye size={14} /> View Details
              </button>
              <button
                onClick={() => onEdit(teacher)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => onDelete(teacher)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <Mail size={14} />
            <span className="truncate">{teacher.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <BookOpen size={14} />
            <span>Specialization: {teacher.specialization || "Not specified"}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < (teacher.rating || 4) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-slate-600"}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-slate-500">
            {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "Recently joined"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============ TEACHER TABLE ROW COMPONENT ============
const TeacherTableRow = ({ teacher, onEdit, onDelete, onView, index }: any) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {teacher.fullName?.charAt(0) || teacher.email?.charAt(0) || "T"}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{teacher.fullName}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">{teacher.role?.replace("_", " ") || "TEACHER"}</p>
          </div>
        </div>
        </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-500 dark:text-slate-400" />
          <span className="text-gray-700 dark:text-slate-300 text-sm">{teacher.email}</span>
        </div>
        </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
          {teacher.specialization || "General"}
        </span>
        </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < (teacher.rating || 4) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-slate-600"}
            />
          ))}
        </div>
        </td>
      <td className="px-6 py-4">
        <span className="text-gray-600 dark:text-slate-400 text-sm">{teacher.studentsCount || 0} students</span>
        </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(teacher)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400" />
          </button>
          <button
            onClick={() => onEdit(teacher)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" />
          </button>
          <button
            onClick={() => onDelete(teacher)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
          </button>
        </div>
        </td>
    </motion.tr>
  );
};

// ============ CREATE TEACHER MODAL ============
const CreateTeacherModal = ({ isOpen, onClose, onCreate }: any) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.email.includes("@")) newErrors.email = "Please enter a valid email";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!/[A-Z]/.test(formData.password)) newErrors.password = "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(formData.password)) newErrors.password = "Password must contain at least one number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          specialization: formData.specialization,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create teacher");
      }
      
      onCreate(data.teacher);
      onClose();
      setFormData({ fullName: "", email: "", password: "", specialization: "" });
    } catch (error: any) {
      console.error("Error creating teacher:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-gray-200 dark:border-purple-500/30 max-h-[90vh] overflow-y-auto shadow-xl dark:shadow-none"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <UserPlus size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Teacher</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <X size={20} className="text-gray-500 dark:text-slate-400" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="e.g., Grace Mensah"
            />
            {errors.fullName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="teacher@school.com"
            />
            {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="Create a secure password"
            />
            {errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
            <p className="text-gray-500 dark:text-slate-500 text-xs mt-1">
              At least 8 characters, one uppercase letter, one number
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Specialization
            </label>
            <select
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">Select Specialization</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Art">Art</option>
              <option value="Music">Music</option>
              <option value="Physical Education">Physical Education</option>
            </select>
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Teacher
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============ VIEW TEACHER MODAL ============
const ViewTeacherModal = ({ teacher, isOpen, onClose }: any) => {
  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-gray-200 dark:border-purple-500/30 shadow-xl dark:shadow-none"
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {teacher.fullName?.charAt(0) || teacher.email?.charAt(0) || "T"}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{teacher.fullName}</h2>
                <p className="text-sm text-purple-600 dark:text-purple-400">{teacher.role?.replace("_", " ") || "TEACHER"}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
              <X size={20} className="text-gray-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Email</p>
                <p className="text-gray-900 dark:text-white">{teacher.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Specialization</p>
                <p className="text-gray-900 dark:text-white">{teacher.specialization || "Not specified"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap size={18} className="text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">School</p>
                <p className="text-gray-900 dark:text-white">{teacher.school || teacher.schoolName || "PathSpring"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award size={18} className="text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < (teacher.rating || 4) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-slate-600"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============ MAIN TEACHERS PAGE ============
export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const teachersList = await getAdminTeachers();
      setTeachers(teachersList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeacher = (newTeacher: any) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    void fetchTeachers();
  };

  const handleViewTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  const handleEditTeacher = (teacher: any) => {
    console.log("Edit teacher:", teacher);
    // Implement edit functionality
  };

  const handleDeleteTeacher = async (teacher: any) => {
    if (confirm(`Are you sure you want to delete ${teacher.fullName || teacher.email}?`)) {
      try {
      const token = getAccessToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/teachers/${teacher.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setTeachers(teachers.filter(t => t.id !== teacher.id));
        }
      } catch (error) {
        console.error("Error deleting teacher:", error);
      }
    }
  };

  const handleRefresh = () => {
    fetchTeachers();
  };

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(teacher =>
    teacher.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Teachers</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">Manage your school's teaching staff</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} className="text-gray-600 dark:text-slate-400" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30 dark:shadow-none"
            >
              <Plus size={20} />
              Add Teacher
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <Users size={20} className="text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-green-600 dark:text-green-400">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{teachers.length}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">Total Teachers</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <GraduationCap size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {teachers.filter(t => t.specialization && t.specialization !== "").length}
            </p>
            <p className="text-sm text-gray-600 dark:text-slate-400">With Specialization</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <Star size={20} className="text-yellow-500 dark:text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">Average Rating</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <Calendar size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {teachers.filter(t => {
                if (!t.createdAt) return false;
                const createdDate = new Date(t.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - createdDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30;
              }).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-slate-400">New This Month</p>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search teachers by name, email, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "table"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-20">
            <Users size={48} className="text-gray-400 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No teachers found</h3>
            <p className="text-gray-600 dark:text-slate-400">
              {searchQuery ? "Try a different search term" : "Click 'Add Teacher' to create your first teacher account"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedTeachers.map((teacher, index) => (
              <TeacherCard
                key={teacher.id || index}
                teacher={teacher}
                onView={handleViewTeacher}
                onEdit={handleEditTeacher}
                onDelete={handleDeleteTeacher}
              />
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-x-auto shadow-sm dark:shadow-none">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Specialization</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.map((teacher, index) => (
                  <TeacherTableRow
                    key={teacher.id || index}
                    teacher={teacher}
                    index={index}
                    onView={handleViewTeacher}
                    onEdit={handleEditTeacher}
                    onDelete={handleDeleteTeacher}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 pt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      currentPage === pageNum
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-gray-500 dark:text-slate-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTeacherModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTeacher}
      />
      
      <ViewTeacherModal
        teacher={selectedTeacher}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTeacher(null);
        }}
      />
    </ProtectedRoute>
  );
}
