// app/dashboard/students/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import ProtectedRoute from "@/src/components/ProtectedRoute";
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
  UserPlus,
  RefreshCw,
  Mail,
  Phone,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  School,
  Filter,
  Download,
  Lock,
} from "lucide-react";
import Link from "next/link";

// ============ NOTIFICATION COMPONENT ============
const Notification = ({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) => {
  const colors = {
    success: "bg-green-500 border-green-600",
    error: "bg-red-500 border-red-600",
    info: "bg-blue-500 border-blue-600",
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
const StudentCard = ({ student, classes, onEdit, onDelete, onView }: any) => {
  const studentClass = classes.find((c: any) => c.id === student.classroom);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all overflow-hidden"
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
              <h4 className="font-semibold text-white text-base">{student.fullName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-blue-400">{student.gradeLevel || "Not set"}</p>
                {student.isActive !== false && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="relative group">
            <button className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
              <MoreVertical size={18} className="text-slate-400" />
            </button>
            <div className="absolute right-0 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onView(student)}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
              >
                <Eye size={14} /> View Details
              </button>
              <button
                onClick={() => onEdit(student)}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => onDelete(student)}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {studentClass && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <School size={14} />
              <span>Class: {studentClass.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Mail size={14} />
            <span className="truncate">{student.parentEmail || "No email"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Phone size={14} />
            <span>{student.parentPhone || "No phone"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar size={14} />
            <span>Age: {student.age || "N/A"} years</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              <CheckCircle size={14} className={student.enrollmentStatus !== "Inactive" ? "text-green-400" : "text-yellow-400"} />
              <span className="text-xs text-slate-400">
                {student.enrollmentStatus || "Enrolled"}
              </span>
            </div>
          </div>
          <Link href={`/dashboard/students/${student.id}`} className="text-blue-400 text-sm hover:text-blue-300">
            View Profile →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ============ STUDENT TABLE ROW COMPONENT ============
const StudentTableRow = ({ student, classes, onEdit, onDelete, onView, index }: any) => {
  const studentClass = classes.find((c: any) => c.id === student.classroom);
  
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors"
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
            <p className="font-medium text-white">{student.fullName}</p>
            <p className="text-xs text-slate-400">@{student.username || student.fullName?.toLowerCase().replace(" ", ".")}</p>
          </div>
        </div>
        </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-slate-400" />
          <span className="text-slate-300 text-sm">{student.parentEmail || "—"}</span>
        </div>
        </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
          {student.gradeLevel || "Not set"}
        </span>
        </td>
      <td className="px-6 py-4">
        {studentClass ? (
          <div className="flex items-center gap-2">
            <School size={14} className="text-purple-400" />
            <span className="text-slate-300 text-sm">{studentClass.name}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">Not assigned</span>
        )}
        </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <CheckCircle size={14} className={student.isActive !== false ? "text-green-400" : "text-gray-400"} />
          <span className="text-slate-300 text-sm">
            {student.isActive !== false ? "Active" : "Inactive"}
          </span>
        </div>
        </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(student)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-slate-400 hover:text-blue-400" />
          </button>
          <button
            onClick={() => onEdit(student)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-slate-400 hover:text-yellow-400" />
          </button>
          <button
            onClick={() => onDelete(student)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-slate-400 hover:text-red-400" />
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 rounded-2xl max-w-md w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <UserPlus size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Add New Student</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full p-3 bg-slate-800 border ${errors.fullName ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="e.g., John Doe"
            />
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              PIN (4 digits) *
            </label>
            <input
              type="password"
              required
              maxLength={4}
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
              className={`w-full p-3 bg-slate-800 border ${errors.pin ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="1234"
            />
            {errors.pin && <p className="text-red-400 text-xs mt-1">{errors.pin}</p>}
            <p className="text-slate-500 text-xs mt-1">
              Used for student login
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Grade Level *
            </label>
            <select
              required
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              className={`w-full p-3 bg-slate-800 border ${errors.gradeLevel ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors`}
            >
              <option value="">Select Grade Level</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {errors.gradeLevel && <p className="text-red-400 text-xs mt-1">{errors.gradeLevel}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Class *
            </label>
            <select
              required
              value={formData.classroom}
              onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
              className={`w-full p-3 bg-slate-800 border ${errors.classroom ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors`}
            >
              <option value="">Select Class</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.gradeLevel}
                </option>
              ))}
            </select>
            {errors.classroom && <p className="text-red-400 text-xs mt-1">{errors.classroom}</p>}
            {classes.length === 0 && (
              <p className="text-yellow-400 text-xs mt-1">
                No classes available. Please create a class first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Age
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className={`w-full p-3 bg-slate-800 border ${errors.age ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="e.g., 8"
              min="3"
              max="18"
            />
            {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Parent Email
            </label>
            <input
              type="email"
              value={formData.parentEmail}
              onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              className={`w-full p-3 bg-slate-800 border ${errors.parentEmail ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="parent@example.com"
            />
            {errors.parentEmail && <p className="text-red-400 text-xs mt-1">{errors.parentEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Parent Phone
            </label>
            <input
              type="tel"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="08012345678"
            />
          </div>

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

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
              disabled={isLoading || classes.length === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

// ============ VIEW STUDENT MODAL ============
const ViewStudentModal = ({ student, classes, isOpen, onClose }: any) => {
  const studentClass = classes.find((c: any) => c.id === student?.classroom);
  
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 rounded-2xl max-w-2xl w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-700">
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
                <h2 className="text-xl font-bold text-white">{student.fullName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-blue-400">@{student.username || student.fullName?.toLowerCase().replace(" ", ".")}</p>
                  {student.isActive !== false && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Details */}
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <GraduationCap size={18} className="text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Grade Level</p>
                  <p className="text-white">{student.gradeLevel || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Age</p>
                  <p className="text-white">{student.age || "N/A"} years</p>
                </div>
              </div>
              {studentClass && (
                <div className="flex items-center gap-3">
                  <School size={18} className="text-purple-400" />
                  <div>
                    <p className="text-xs text-slate-400">Class</p>
                    <p className="text-white">{studentClass.name}</p>
                    <p className="text-xs text-slate-400">{studentClass.gradeLevel}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className={student.isActive !== false ? "text-green-400" : "text-gray-400"} />
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <p className={`font-medium ${student.isActive !== false ? "text-green-400" : "text-gray-400"}`}>
                    {student.isActive !== false ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Parent Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-white">{student.parentEmail || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-white">{student.parentPhone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users size={18} className="text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Enrollment Status</p>
                  <p className="text-white">{student.enrollmentStatus || "Enrolled"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login Info */}
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Login Information</h3>
            <div className="flex items-center gap-3">
              <User size={18} className="text-yellow-400" />
              <div>
                <p className="text-xs text-slate-400">Username</p>
                <p className="text-white font-mono">@{student.username || student.fullName?.toLowerCase().replace(" ", ".")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-red-400" />
              <div>
                <p className="text-xs text-slate-400">PIN</p>
                <p className="text-white font-mono">••••</p>
                <p className="text-xs text-slate-400">Set during registration</p>
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

// ============ MAIN STUDENTS PAGE ============
export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
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
      const token = localStorage.getItem("accessToken");
      
      // Fetch students
      const studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/school/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (studentsResponse.ok) {
        const data = await studentsResponse.json();
        setStudents(Array.isArray(data) ? data : data.students || []);
      } else {
        console.error("Failed to fetch students:", studentsResponse.status);
        showNotification("Failed to fetch students", "error");
      }

      // Fetch classes for filtering and assignment
      const classesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/classes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (classesResponse.ok) {
        const data = await classesResponse.json();
        setClasses(data.classrooms || []);
      }
      
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

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEditStudent = (student: any) => {
    console.log("Edit student:", student);
    // Implement edit functionality
  };

  const handleDeleteStudent = async (student: any) => {
    if (confirm(`Are you sure you want to delete ${student.fullName}?`)) {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/${student.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setStudents(students.filter(s => s.id !== student.id));
          showNotification(`Student "${student.fullName}" deleted successfully`, "success");
        } else {
          showNotification("Failed to delete student", "error");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        showNotification("Error deleting student", "error");
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
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}>
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
            <h1 className="text-2xl md:text-3xl font-bold text-white">Students</h1>
            <p className="text-slate-400 mt-1">Manage all students in your school</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} className="text-slate-400" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-green-500/30"
            >
              <Plus size={20} />
              Add Student
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <Users size={20} className="text-blue-400" />
              <span className="text-xs text-green-400">{activeStudents} Active</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStudents}</p>
            <p className="text-sm text-slate-400">Total Students</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <GraduationCap size={20} className="text-purple-400" />
              <TrendingUp size={14} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{classes.length}</p>
            <p className="text-sm text-slate-400">Active Classes</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <Mail size={20} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{studentsWithParent}</p>
            <p className="text-sm text-slate-400">With Parent Contact</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <Award size={20} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.round((activeStudents / totalStudents) * 100) || 0}%
            </p>
            <p className="text-sm text-slate-400">Active Rate</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search students by name or parent email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Filter size={18} />
                Filters
                {(filterClass || filterGrade || filterStatus) && (
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "table"
                      ? "bg-green-600 text-white"
                      : "text-slate-400 hover:text-white"
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
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Class
                      </label>
                      <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">All Classes</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Grade Level
                      </label>
                      <select
                        value={filterGrade}
                        onChange={(e) => setFilterGrade(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">All Grades</option>
                        {gradeLevels.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Status
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
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
                      className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
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
          <div className="text-center py-20">
            <Users size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No students found</h3>
            <p className="text-slate-400">
              {searchQuery || filterClass || filterGrade || filterStatus 
                ? "Try adjusting your filters" 
                : "Click 'Add Student' to get started"}
            </p>
          </div>
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
                onDelete={handleDeleteStudent}
              />
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Parent Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
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
              className="px-4 py-2 bg-slate-800 rounded-lg text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
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
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-slate-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-800 rounded-lg text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
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
      
      <ViewStudentModal
        student={selectedStudent}
        classes={classes}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStudent(null);
        }}
      />
    </ProtectedRoute>
  );
}