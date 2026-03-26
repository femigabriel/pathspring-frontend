// app/dashboard/students/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import AppStatCard from "@/src/components/shared/ui/AppStatCard";
import { getAccessToken } from "@/src/lib/auth";
import {
  filterClassesForTeacher,
  filterStudentsForTeacher,
  getAdminClasses,
  getAdminStudents,
  type AdminClassroom,
  type AdminStudent,
} from "@/src/lib/admin-api";
import { createParentLink } from "@/src/lib/parent-api";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  Star,
  Eye,
  EyeOff,
  UserPlus,
  RefreshCw,
  Mail,
  Phone,
  User,
  Clock,
  CheckCircle,
  Lock,
  TrendingUp,
  Award,
  School,
  Filter,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// ============ NOTIFICATION COMPONENT ============
const Notification = ({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) => {
  const colors = {
    success: "bg-green-500 dark:bg-green-500 border-green-600 dark:border-green-600",
    error: "bg-red-500 dark:bg-red-500 border-red-600 dark:border-red-600",
    info: "bg-blue-500 dark:bg-blue-500 border-blue-600 dark:border-blue-600",
  };
  
  const icons = {
    success: "✅",
    error: "⚠️",
    info: "ℹ️",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border-2 ${colors[type]} text-white`}
    >
      <span className="text-2xl">{icons[type]}</span>
      <p className="font-bold text-lg">{message}</p>
      <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform">
        <X size={20} />
      </button>
    </motion.div>
  );
};

// ============ STUDENT CARD COMPONENT ============
const StudentCard = ({ student, classes, onEdit, onDelete, onView, onLinkParent }: any) => {
  const studentClass = classes.find((c: any) => c.id === student.classroom);
  const [showCredentials, setShowCredentials] = useState(false);
  
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
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              student.isActive !== false 
                ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                : "bg-gradient-to-r from-gray-500 to-slate-500"
            }`}>
              <span className="text-white font-bold text-lg">
                {student.fullName?.charAt(0) || "S"}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-base">{student.fullName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-blue-600 dark:text-blue-400">{student.gradeLevel || "Not set"}</p>
                {student.isActive !== false && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="relative group">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <MoreVertical size={18} className="text-gray-500 dark:text-slate-400" />
            </button>
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onView(student)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
              >
                <Eye size={14} /> View Details
              </button>
              <button
                onClick={() => onEdit(student)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => onLinkParent(student)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <UserPlus size={14} /> Link Parent
              </button>
              <button
                onClick={() => onDelete(student)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {studentClass && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
              <School size={14} />
              <span>Class: {studentClass.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <Mail size={14} />
            <span className="truncate">{student.parentEmail || "No email"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <Phone size={14} />
            <span>{student.parentPhone || "No phone"}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
              <Lock size={14} />
              <span>Student Login</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCredentials((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {showCredentials ? <EyeOff size={14} /> : <Eye size={14} />}
              {showCredentials ? "Hide" : "Show"}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <User size={14} />
            <span>{showCredentials ? `@${student.username || "not-set"}` : "Credentials hidden"}</span>
          </div>
          <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 ${showCredentials ? "" : "hidden"}`}>
            <Lock size={14} />
            <span>PIN: ••••</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <Calendar size={14} />
            <span>Age: {student.age || "N/A"} years</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CheckCircle size={14} className={student.isActive !== false ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"} />
            <span className="text-xs text-gray-600 dark:text-slate-400">
              {student.isActive !== false ? "Active" : "Inactive"}
            </span>
          </div>
          <Link href="/admin/students" className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300">
            View Profile →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ============ STUDENT TABLE ROW COMPONENT ============
const StudentTableRow = ({ student, classes, onEdit, onDelete, onView, onLinkParent, index }: any) => {
  const studentClass = classes.find((c: any) => c.id === student.classroom);
  const [showCredentials, setShowCredentials] = useState(false);
  
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            student.isActive !== false 
              ? "bg-gradient-to-r from-green-500 to-emerald-500" 
              : "bg-gradient-to-r from-gray-500 to-slate-500"
          }`}>
            <span className="text-white font-semibold text-sm">
              {student.fullName?.charAt(0) || "S"}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{student.fullName}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {showCredentials ? `@${student.username || student.fullName?.toLowerCase().replace(" ", ".")}` : "Credentials hidden"}
            </p>
            <p className={`text-xs text-gray-400 dark:text-slate-500 ${showCredentials ? "" : "hidden"}`}>PIN: ••••</p>
          </div>
        </div>
          </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-500 dark:text-slate-400" />
          <span className="text-gray-700 dark:text-slate-300 text-sm">{student.parentEmail || "—"}</span>
        </div>
          </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
          {student.gradeLevel || "Not set"}
        </span>
          </td>
      <td className="px-6 py-4">
        {studentClass ? (
          <div className="flex items-center gap-2">
            <School size={14} className="text-purple-600 dark:text-purple-400" />
            <span className="text-gray-700 dark:text-slate-300 text-sm">{studentClass.name}</span>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-slate-400 text-sm">Not assigned</span>
        )}
          </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <CheckCircle size={14} className={student.isActive !== false ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"} />
          <span className="text-gray-700 dark:text-slate-300 text-sm">
            {student.isActive !== false ? "Active" : "Inactive"}
          </span>
        </div>
          </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCredentials((current) => !current)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title={showCredentials ? "Hide login details" : "Show login details"}
          >
            {showCredentials ? (
              <EyeOff size={16} className="text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400" />
            ) : (
              <Eye size={16} className="text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400" />
            )}
          </button>
          <button
            onClick={() => onView(student)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" />
          </button>
          <button
            onClick={() => onEdit(student)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-gray-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400" />
          </button>
          <button
            onClick={() => onLinkParent(student)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Link Parent"
          >
            <UserPlus size={16} className="text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400" />
          </button>
          <button
            onClick={() => onDelete(student)}
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

// ============ CREATE STUDENT MODAL ============
const CreateStudentModal = ({ isOpen, onClose, onCreate, classes, showNotification }: any) => {
  const [formData, setFormData] = useState({
    fullName: "",
    pin: "",
    gradeLevel: "",
    classroom: "",
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
    if (!formData.classroom) newErrors.classroom = "Please select a class";
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
          classroom: formData.classroom,
          age: formData.age ? parseInt(formData.age) : undefined,
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create student");
      }
      
      showNotification(`Student "${formData.fullName}" created successfully! 🎉`, "success");
      onCreate(data.student || data);
      onClose();
      setFormData({
        fullName: "",
        pin: "",
        gradeLevel: "",
        classroom: "",
        age: "",
        parentEmail: "",
        parentPhone: "",
      });
    } catch (error: any) {
      console.error("Error creating student:", error);
      setErrors({ submit: error.message });
      showNotification(error.message || "Failed to create student", "error");
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <UserPlus size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Student</h2>
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
              placeholder="e.g., John Doe"
            />
            {errors.fullName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              PIN (4 digits) *
            </label>
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Grade Level *
            </label>
            <select
              required
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.gradeLevel ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
            >
              <option value="">Select Grade Level</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {errors.gradeLevel && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.gradeLevel}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Class *
            </label>
            <select
              required
              value={formData.classroom}
              onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.classroom ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
            >
              <option value="">Select Class</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.gradeLevel}
                </option>
              ))}
            </select>
            {errors.classroom && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.classroom}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Age
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.age ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="e.g., 8"
              min="3"
              max="18"
            />
            {errors.age && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Parent Email
            </label>
            <input
              type="email"
              value={formData.parentEmail}
              onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.parentEmail ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="parent@example.com"
            />
            {errors.parentEmail && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.parentEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Parent Phone
            </label>
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
              disabled={isLoading || classes.length === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Student
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============ EDIT STUDENT MODAL ============
const EditStudentModal = ({ isOpen, onClose, onUpdate, student, classes, showNotification }: any) => {
  const [formData, setFormData] = useState({
    fullName: "",
    gradeLevel: "",
    classroom: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        fullName: student.fullName || "",
        gradeLevel: student.gradeLevel || "",
        classroom: student.classroom || "",
        isActive: student.isActive !== false,
      });
    }
  }, [student]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.gradeLevel.trim()) newErrors.gradeLevel = "Grade level is required";
    if (!formData.classroom) newErrors.classroom = "Please select a class";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/students/${student.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          gradeLevel: formData.gradeLevel,
          classroom: formData.classroom,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update student");
      }
      
      showNotification(`Student "${formData.fullName}" updated successfully! ✨`, "success");
      onUpdate(data.student || data);
      onClose();
    } catch (error: any) {
      console.error("Error updating student:", error);
      setErrors({ submit: error.message });
      showNotification(error.message || "Failed to update student", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !student) return null;

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
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-gray-200 dark:border-purple-500/30 shadow-xl dark:shadow-none"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <Edit size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Student</h2>
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
              placeholder="e.g., John Doe"
            />
            {errors.fullName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Grade Level *
            </label>
            <select
              required
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.gradeLevel ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
            >
              <option value="">Select Grade Level</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {errors.gradeLevel && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.gradeLevel}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Class *
            </label>
            <select
              required
              value={formData.classroom}
              onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
              className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border ${errors.classroom ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
            >
              <option value="">Select Class</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.gradeLevel}
                </option>
              ))}
            </select>
            {errors.classroom && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.classroom}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.isActive === true}
                  onChange={() => setFormData({ ...formData, isActive: true })}
                  className="w-4 h-4 text-green-500 focus:ring-green-500"
                />
                <span className="text-gray-700 dark:text-slate-300">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.isActive === false}
                  onChange={() => setFormData({ ...formData, isActive: false })}
                  className="w-4 h-4 text-red-500 focus:ring-red-500"
                />
                <span className="text-gray-700 dark:text-slate-300">Inactive</span>
              </label>
            </div>
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============ VIEW STUDENT MODAL ============
const ViewStudentModal = ({ student, classes, isOpen, onClose }: any) => {
  const studentClass = classes.find((c: any) => c.id === student?.classroom);
  const [showCredentials, setShowCredentials] = useState(false);
  
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-gray-200 dark:border-purple-500/30 max-h-[90vh] overflow-y-auto shadow-xl dark:shadow-none"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                student.isActive !== false 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                  : "bg-gradient-to-r from-gray-500 to-slate-500"
              }`}>
                <span className="text-white font-bold text-lg">
                  {student.fullName?.charAt(0) || "S"}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{student.fullName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-blue-600 dark:text-blue-400">@{student.username || student.fullName?.toLowerCase().replace(" ", ".")}</p>
                  {student.isActive !== false && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
              <X size={20} className="text-gray-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Details */}
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <GraduationCap size={18} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Grade Level</p>
                  <p className="text-gray-900 dark:text-white">{student.gradeLevel || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Age</p>
                  <p className="text-gray-900 dark:text-white">{student.age || "N/A"} years</p>
                </div>
              </div>
              {studentClass && (
                <div className="flex items-center gap-3">
                  <School size={18} className="text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Class</p>
                    <p className="text-gray-900 dark:text-white">{studentClass.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{studentClass.gradeLevel}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className={student.isActive !== false ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Status</p>
                  <p className={`font-medium ${student.isActive !== false ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}>
                    {student.isActive !== false ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Parent Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{student.parentEmail || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Phone</p>
                  <p className="text-gray-900 dark:text-white">{student.parentPhone || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login Info */}
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Login Information</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Hidden by default for privacy.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCredentials((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {showCredentials ? <EyeOff size={14} /> : <Eye size={14} />}
                {showCredentials ? "Hide" : "Show"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <User size={18} className="text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Username</p>
                <p className="text-gray-900 dark:text-white font-mono">
                  {showCredentials ? `@${student.username || student.fullName?.toLowerCase().replace(" ", ".")}` : "Hidden"}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${showCredentials ? "" : "hidden"}`}>
              <Lock size={18} className="text-red-600 dark:text-red-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">PIN</p>
                <p className="text-gray-900 dark:text-white font-mono">••••</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Set during registration</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const LinkParentModal = ({
  isOpen,
  onClose,
  student,
  onLinked,
  showNotification,
}: any) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    relationship: "Mother",
    phone: "",
    isPrimaryContact: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || !student) return;

    setFormData({
      fullName: "",
      email: student.parentEmail || "",
      password: "",
      relationship: "Mother",
      phone: student.parentPhone || "",
      isPrimaryContact: true,
    });
    setErrors({});
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) nextErrors.fullName = "Parent full name is required";
    if (!formData.email.trim()) nextErrors.email = "Parent email is required";
    if (formData.email && !formData.email.includes("@")) nextErrors.email = "Enter a valid email";
    if (!formData.password.trim()) nextErrors.password = "Temporary password is required";
    if (formData.password && formData.password.length < 8) nextErrors.password = "Use at least 8 characters";
    if (!formData.relationship.trim()) nextErrors.relationship = "Relationship is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    try {
      await createParentLink({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        studentId: student.id,
        relationship: formData.relationship.trim(),
        phone: formData.phone.trim() || undefined,
        isPrimaryContact: formData.isPrimaryContact,
      });

      onLinked(student.id, {
        parentEmail: formData.email.trim(),
        parentPhone: formData.phone.trim(),
      });
      showNotification(`Parent account linked to ${student.fullName} successfully.`, "success");
      onClose();
    } catch (error: any) {
      const message = error?.message || "Failed to link parent account.";
      setErrors({ submit: message });
      showNotification(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm dark:bg-black/70">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-purple-500/30 dark:bg-slate-900 dark:shadow-none"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Link Parent Account</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Create a parent login for {student.fullName}.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={20} className="text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                Parent Full Name *
              </label>
              <input
                value={formData.fullName}
                onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                className={`w-full rounded-xl border p-3 text-gray-900 outline-none transition-colors dark:bg-slate-800 dark:text-white ${
                  errors.fullName ? "border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
                placeholder="e.g., Rose Musa"
              />
              {errors.fullName ? <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.fullName}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                Relationship *
              </label>
              <input
                value={formData.relationship}
                onChange={(event) => setFormData({ ...formData, relationship: event.target.value })}
                className={`w-full rounded-xl border p-3 text-gray-900 outline-none transition-colors dark:bg-slate-800 dark:text-white ${
                  errors.relationship ? "border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
                placeholder="Mother, Father, Guardian"
              />
              {errors.relationship ? <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.relationship}</p> : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                Parent Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className={`w-full rounded-xl border p-3 text-gray-900 outline-none transition-colors dark:bg-slate-800 dark:text-white ${
                  errors.email ? "border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
                placeholder="rose@example.com"
              />
              {errors.email ? <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                Phone
              </label>
              <input
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 outline-none transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="08012345678"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              Temporary Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              className={`w-full rounded-xl border p-3 text-gray-900 outline-none transition-colors dark:bg-slate-800 dark:text-white ${
                errors.password ? "border-red-500" : "border-gray-200 dark:border-slate-700"
              }`}
              placeholder="SecureParent123!"
            />
            {errors.password ? <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password}</p> : null}
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            <input
              type="checkbox"
              checked={formData.isPrimaryContact}
              onChange={(event) => setFormData({ ...formData, isPrimaryContact: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            Mark this parent as the primary contact for the child.
          </label>

          {errors.submit ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {errors.submit}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-semibold text-white transition-all disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {isSaving ? "Linking Parent..." : "Create Parent Login"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============ MAIN STUDENTS PAGE ============
export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [classes, setClasses] = useState<AdminClassroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentList, classList] = await Promise.all([
        getAdminStudents(),
        getAdminClasses(),
      ]);

      const scopedClasses = user?.role === "TEACHER" ? filterClassesForTeacher(classList, user) : classList;
      const scopedStudents =
        user?.role === "TEACHER"
          ? filterStudentsForTeacher(studentList, classList, user)
          : studentList;

      setStudents(scopedStudents);
      setClasses(scopedClasses);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Error connecting to server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudent = (newStudent: any) => {
    setStudents([newStudent, ...students]);
  };

  const handleUpdateStudent = (updatedStudent: any) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleOpenParentLink = (student: any) => {
    setSelectedStudent(student);
    setShowParentModal(true);
  };

  const handleParentLinked = (
    studentId: string,
    details: { parentEmail: string; parentPhone?: string },
  ) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              parentEmail: details.parentEmail,
              parentPhone: details.parentPhone || student.parentPhone,
            }
          : student,
      ),
    );

    setSelectedStudent((current: any) =>
      current && current.id === studentId
        ? {
            ...current,
            parentEmail: details.parentEmail,
            parentPhone: details.parentPhone || current.parentPhone,
          }
        : current,
    );
  };

  const handleDeleteStudent = async (student: any) => {
    if (confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) {
      try {
      const token = getAccessToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/students/${student.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setStudents(students.filter(s => s.id !== student.id));
          showNotification(`Student "${student.fullName}" deleted successfully`, "success");
        } else {
          throw new Error(data.message || "Failed to delete student");
        }
      } catch (error: any) {
        console.error("Error deleting student:", error);
        showNotification(error.message || "Error deleting student", "error");
      }
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = !filterClass || student.classroom === filterClass;
    const matchesGrade = !filterGrade || student.gradeLevel === filterGrade;
    const matchesStatus = !filterStatus || 
      (filterStatus === "active" && student.isActive !== false) ||
      (filterStatus === "inactive" && student.isActive === false);
    
    return matchesSearch && matchesClass && matchesGrade && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive !== false).length;
  const studentsWithParent = students.filter(s => s.parentEmail).length;

  // Unique grade levels for filter
  const gradeLevels = [...new Set(students.map(s => s.gradeLevel).filter(Boolean))];

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "TEACHER"]}>
      <div className="space-y-6">
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Students</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              {user?.role === "TEACHER"
                ? "Manage the students in your assigned class."
                : "Manage all students in your school"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} className="text-gray-600 dark:text-slate-400" />
            </button>
            <AppActionButton
              onClick={() => setShowCreateModal(true)}
              tone="primary"
              size="lg"
            >
              <Plus size={20} />
              Add Student
            </AppActionButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AppStatCard label="Total Students" value={totalStudents} icon={Users} tone="cyan" helper={`${activeStudents} active`} />
          <AppStatCard label="Active Classes" value={classes.length} icon={GraduationCap} tone="purple" helper="Current class spaces" />
          <AppStatCard label="Parent Contact" value={studentsWithParent} icon={Mail} tone="emerald" helper="Linked family contact" />
          <AppStatCard label="Active Rate" value={`${Math.round((activeStudents / totalStudents) * 100) || 0}%`} icon={Award} tone="amber" helper="Student availability" />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search students by name or parent email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Filter size={18} />
                Filters
                {(filterClass || filterGrade || filterStatus) && (
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "table"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Table View
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                        Class
                      </label>
                      <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="w-full p-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">All Classes</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                        Grade Level
                      </label>
                      <select
                        value={filterGrade}
                        onChange={(e) => setFilterGrade(e.target.value)}
                        className="w-full p-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">All Grades</option>
                        {gradeLevels.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                        Status
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => {
                        setFilterClass("");
                        setFilterGrade("");
                        setFilterStatus("");
                      }}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <AppEmptyState
            icon={Users}
            title="No students found"
            body={searchQuery || filterClass || filterGrade || filterStatus ? "Try adjusting your filters." : "Click 'Add Student' to get started."}
            className="py-20 [&_h3]:text-gray-900 dark:[&_h3]:text-white [&_p]:text-gray-600 dark:[&_p]:text-slate-400 [&_svg]:text-gray-400 dark:[&_svg]:text-slate-600"
          />
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedStudents.map((student, index) => (
              <StudentCard
                key={student.id || index}
                student={student}
                classes={classes}
                onView={handleViewStudent}
                onEdit={handleEditStudent}
                onLinkParent={handleOpenParentLink}
                onDelete={handleDeleteStudent}
              />
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-x-auto shadow-sm dark:shadow-none">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Parent Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, index) => (
                  <StudentTableRow
                    key={student.id || index}
                    student={student}
                    classes={classes}
                    index={index}
                    onView={handleViewStudent}
                    onEdit={handleEditStudent}
                    onLinkParent={handleOpenParentLink}
                    onDelete={handleDeleteStudent}
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
                        ? "bg-green-600 text-white"
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
      <CreateStudentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateStudent}
        classes={classes}
        showNotification={showNotification}
      />
      
      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        onUpdate={handleUpdateStudent}
        student={selectedStudent}
        classes={classes}
        showNotification={showNotification}
      />
      
      <ViewStudentModal
        student={selectedStudent}
        classes={classes}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStudent(null);
        }}
      />

      <LinkParentModal
        isOpen={showParentModal}
        student={selectedStudent}
        onLinked={handleParentLinked}
        showNotification={showNotification}
        onClose={() => {
          setShowParentModal(false);
          setSelectedStudent(null);
        }}
      />
    </ProtectedRoute>
  );
}
