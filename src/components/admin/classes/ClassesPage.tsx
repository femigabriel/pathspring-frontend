// app/dashboard/classes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import {
  School,
  Plus,
  Search,
  MoreVertical,
  Users,
  BookOpen,
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
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Bell,
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

// ============ CLASS CARD COMPONENT ============
const ClassCard = ({ classItem, onEdit, onDelete, onView }: any) => {
  const teacher = classItem.teacher;
  
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
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              classItem.isActive !== false 
                ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                : "bg-gradient-to-r from-gray-500 to-slate-500"
            }`}>
              <School size={24} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">{classItem.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-blue-400">{classItem.gradeLevel}</p>
                {classItem.isActive !== false && (
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
                onClick={() => onView(classItem)}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
              >
                <Eye size={14} /> View Details
              </button>
              <button
                onClick={() => onEdit(classItem)}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => onDelete(classItem)}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {teacher && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <User size={14} />
              <span>Teacher: {teacher.fullName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users size={14} />
            <span>Students: {classItem.studentCount || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar size={14} />
            <span>Created: {classItem.createdAt ? new Date(classItem.createdAt).toLocaleDateString() : "Recently"}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, classItem.studentCount || 0))].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-purple-500/30 rounded-full border border-purple-500 flex items-center justify-center">
                  <span className="text-xs text-purple-300">S</span>
                </div>
              ))}
              {(classItem.studentCount || 0) > 3 && (
                <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-xs text-slate-400">+{(classItem.studentCount || 0) - 3}</span>
                </div>
              )}
            </div>
          </div>
          <Link href={`/dashboard/classes/${classItem.id}`} className="text-blue-400 text-sm hover:text-blue-300">
            View Class →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ============ CLASS TABLE ROW COMPONENT ============
const ClassTableRow = ({ classItem, onEdit, onDelete, onView, index }: any) => {
  const teacher = classItem.teacher;
  
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            classItem.isActive !== false 
              ? "bg-gradient-to-r from-green-500 to-emerald-500" 
              : "bg-gradient-to-r from-gray-500 to-slate-500"
          }`}>
            <School size={18} className="text-white" />
          </div>
          <div>
            <p className="font-medium text-white">{classItem.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-blue-400">{classItem.gradeLevel}</p>
              {classItem.isActive !== false && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
        </td>
      <td className="px-6 py-4">
        {teacher ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <User size={14} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white">{teacher.fullName}</p>
              <p className="text-xs text-slate-400">{teacher.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">Not assigned</span>
        )}
        </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-slate-400" />
          <span className="text-slate-300 text-sm">{classItem.studentCount || 0} students</span>
        </div>
        </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-slate-300 text-sm">
            {classItem.createdAt ? new Date(classItem.createdAt).toLocaleDateString() : "N/A"}
          </span>
        </div>
        </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(classItem)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-slate-400 hover:text-blue-400" />
          </button>
          <button
            onClick={() => onEdit(classItem)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-slate-400 hover:text-yellow-400" />
          </button>
          <button
            onClick={() => onDelete(classItem)}
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

// ============ CREATE CLASS MODAL ============
const CreateClassModal = ({ isOpen, onClose, onCreate, teachers, showNotification }: any) => {
  const [formData, setFormData] = useState({
    name: "",
    gradeLevel: "",
    teacherId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Class name is required";
    if (!formData.gradeLevel.trim()) newErrors.gradeLevel = "Grade level is required";
    if (!formData.teacherId) newErrors.teacherId = "Please select a teacher";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          gradeLevel: formData.gradeLevel,
          teacherId: formData.teacherId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create class");
      }
      
      showNotification(`Class "${formData.name}" created successfully! 🎉`, "success");
      onCreate(data.class || data);
      onClose();
      setFormData({ name: "", gradeLevel: "", teacherId: "" });
    } catch (error: any) {
      console.error("Error creating class:", error);
      setErrors({ submit: error.message });
      showNotification(error.message || "Failed to create class", "error");
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
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <School size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Create New Class</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Class Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full p-3 bg-slate-800 border ${errors.name ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="e.g., Green Class, Blue Class"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
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
              Class Teacher *
            </label>
            <select
              required
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className={`w-full p-3 bg-slate-800 border ${errors.teacherId ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors`}
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher: any) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName} - {teacher.email}
                </option>
              ))}
            </select>
            {errors.teacherId && <p className="text-red-400 text-xs mt-1">{errors.teacherId}</p>}
            {teachers.length === 0 && (
              <p className="text-yellow-400 text-xs mt-1">
                No teachers available. Please create a teacher first.
              </p>
            )}
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
              disabled={isLoading || teachers.length === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <School size={18} />
                  Create Class
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============ VIEW CLASS MODAL ============
const ViewClassModal = ({ classItem, isOpen, onClose }: any) => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  
  useEffect(() => {
    if (isOpen && classItem?.id) {
      fetchStudents();
    }
  }, [isOpen, classItem]);
  
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/classes/${classItem.id}/students`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : data.students || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoadingStudents(false);
    }
  };
  
  const teacher = classItem?.teacher;
  
  if (!isOpen || !classItem) return null;

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
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                classItem.isActive !== false 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                  : "bg-gradient-to-r from-gray-500 to-slate-500"
              }`}>
                <School size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{classItem.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-blue-400">{classItem.gradeLevel}</p>
                  {classItem.isActive !== false && (
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
          {/* Class Details */}
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Class Details</h3>
            {teacher && (
              <div className="flex items-center gap-3">
                <User size={18} className="text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Class Teacher</p>
                  <p className="text-white">{teacher.fullName}</p>
                  <p className="text-xs text-slate-400">{teacher.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Users size={18} className="text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Total Students</p>
                <p className="text-white">{classItem.studentCount || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-green-400" />
              <div>
                <p className="text-xs text-slate-400">Created Date</p>
                <p className="text-white">{classItem.createdAt ? new Date(classItem.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className={classItem.isActive !== false ? "text-green-400" : "text-gray-400"} />
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <p className={`font-medium ${classItem.isActive !== false ? "text-green-400" : "text-gray-400"}`}>
                  {classItem.isActive !== false ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Students in Class</h3>
            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : students.length > 0 ? (
              <div className="space-y-2">
                {students.map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 text-sm font-semibold">
                          {student.fullName?.charAt(0) || "S"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-white">{student.fullName}</p>
                        <p className="text-xs text-slate-400">{student.parentEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-xs text-slate-400">Enrolled</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-4">No students enrolled in this class yet</p>
            )}
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============ MAIN CLASSES PAGE ============
export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schoolDetails, setSchoolDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
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
      
      // Fetch classes
      const classesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/classes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (classesResponse.ok) {
        const data = await classesResponse.json();
        // Handle the response structure with "classrooms" key
        setClasses(data.classrooms || []);
      } else {
        console.error("Failed to fetch classes:", classesResponse.status);
        showNotification("Failed to fetch classes", "error");
      }

      // Fetch teachers for dropdown
      const teachersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/school/teachers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.teachers || []);
      }

      // Fetch school details
      const schoolResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/school/details`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json();
        setSchoolDetails(schoolData);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Error connecting to server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = (newClass: any) => {
    setClasses([newClass, ...classes]);
  };

  const handleViewClass = (classItem: any) => {
    setSelectedClass(classItem);
    setShowViewModal(true);
  };

  const handleEditClass = (classItem: any) => {
    console.log("Edit class:", classItem);
    // Implement edit functionality
  };

  const handleDeleteClass = async (classItem: any) => {
    if (confirm(`Are you sure you want to delete ${classItem.name}?`)) {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/classes/${classItem.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setClasses(classes.filter(c => c.id !== classItem.id));
          showNotification(`Class "${classItem.name}" deleted successfully`, "success");
        } else {
          showNotification("Failed to delete class", "error");
        }
      } catch (error) {
        console.error("Error deleting class:", error);
        showNotification("Error deleting class", "error");
      }
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Filter classes based on search
  const filteredClasses = classes.filter(classItem =>
    classItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.gradeLevel?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const activeClasses = classes.filter(c => c.isActive !== false).length;
  const classesWithTeacher = classes.filter(c => c.teacher).length;

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
            <h1 className="text-2xl md:text-3xl font-bold text-white">Classes</h1>
            <p className="text-slate-400 mt-1">Manage your school's classes and assignments</p>
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
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Plus size={20} />
              Create Class
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <School size={20} className="text-blue-400" />
              <span className="text-xs text-green-400">{activeClasses} Active</span>
            </div>
            <p className="text-2xl font-bold text-white">{classes.length}</p>
            <p className="text-sm text-slate-400">Total Classes</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <Users size={20} className="text-purple-400" />
              <TrendingUp size={14} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalStudents}</p>
            <p className="text-sm text-slate-400">Total Students</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <GraduationCap size={20} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{teachers.length}</p>
            <p className="text-sm text-slate-400">Available Teachers</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle size={20} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">{classesWithTeacher}</p>
            <p className="text-sm text-slate-400">Classes with Teacher</p>
          </div>
        </div>

        {/* School Details Card */}
        {schoolDetails && (
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <School size={24} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">School</p>
                  <p className="text-lg font-semibold text-white">{schoolDetails.name || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-slate-400">School Code</p>
                  <p className="font-mono font-semibold text-white">{schoolDetails.schoolCode || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="text-sm text-white">{schoolDetails.location || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Established</p>
                  <p className="text-sm text-white">{schoolDetails.createdAt ? new Date(schoolDetails.createdAt).getFullYear() : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search classes by name or grade level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-20">
            <School size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No classes found</h3>
            <p className="text-slate-400">
              {searchQuery ? "Try a different search term" : "Click 'Create Class' to get started"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedClasses.map((classItem, index) => (
              <ClassCard
                key={classItem.id || index}
                classItem={classItem}
                onView={handleViewClass}
                onEdit={handleEditClass}
                onDelete={handleDeleteClass}
              />
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClasses.map((classItem, index) => (
                  <ClassTableRow
                    key={classItem.id || index}
                    classItem={classItem}
                    index={index}
                    onView={handleViewClass}
                    onEdit={handleEditClass}
                    onDelete={handleDeleteClass}
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
                        ? "bg-blue-600 text-white"
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
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateClass}
        teachers={teachers}
        showNotification={showNotification}
      />
      
      <ViewClassModal
        classItem={selectedClass}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedClass(null);
        }}
      />
    </ProtectedRoute>
  );
}