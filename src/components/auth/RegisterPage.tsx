// app/register/page.tsx - REDESIGNED WITH SAME LAYOUT AS LOGIN
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  Building2,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  Sparkles,
  X,
  RefreshCw,
  Star,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { getDefaultRouteForRole } from "@/src/lib/auth";
import ThemeToggle from "@/src/components/admin/layout/ThemeToggle";
import { useTheme } from "@/src/contexts/ThemeContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const INPUT_STYLE =
  "w-full rounded-xl border-2 bg-white/90 p-4 text-lg text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-4 dark:bg-slate-800/90 dark:text-white dark:placeholder:text-slate-500";

const Notification = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border-2 backdrop-blur-md ${
        type === "success"
          ? "bg-green-500/95 border-green-400 text-white"
          : "bg-red-500/95 border-red-400 text-white"
      }`}
    >
      <span className="text-xl">{type === "success" ? "🎉" : "⚠️"}</span>
      <p className="font-semibold text-sm md:text-base">{message}</p>
      <button onClick={onClose} className="ml-3 hover:scale-110 transition-transform">
        <X size={18} />
      </button>
    </motion.div>
  );
};

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
      />
      <span>Creating account...</span>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, color, isDark }: any) => (
  <motion.div whileHover={{ y: -3 }} className="relative group">
    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${color} opacity-0 blur-md transition-opacity group-hover:opacity-60`} />
    <div className={`relative rounded-xl p-3.5 text-center transition-all group-hover:shadow-md ${isDark ? "bg-slate-800/60 border border-slate-700" : "bg-white/80 border border-white/60 shadow-sm"}`}>
      <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
        <Icon className="text-white" size={18} />
      </div>
      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{title}</p>
      <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
    </div>
  </motion.div>
);

const StatCard = ({ value, label, icon: Icon, isDark }: any) => (
  <div className={`rounded-xl p-3 text-center transition-all hover:shadow-md ${isDark ? "bg-slate-800/60 border border-slate-700" : "bg-white/80 border border-white/60"}`}>
    <Icon className="w-5 h-5 mx-auto mb-1.5 text-purple-500" />
    <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{value}</p>
    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
  </div>
);

// School Info Step
const SchoolInfoStep = ({
  formData,
  onChange,
  onNext,
  isDark,
}: {
  formData: any;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  isDark: boolean;
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "schoolName":
        if (!value.trim()) return "School name is required";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!value.includes("@") || !value.includes(".")) return "Enter a valid email";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        return "";
      case "location":
        if (!value.trim()) return "Location is required";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    onChange(field, value);
    if (touched[field]) {
      setErrors({ ...errors, [field]: validateField(field, value) });
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    setErrors({ ...errors, [field]: validateField(field, formData[field]) });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const fields = ["schoolName", "email", "phone", "location"];
    fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) onNext();
  };

  const inputFields = [
    { icon: Building2, name: "schoolName", label: "School Name", placeholder: "e.g., Green Hills Academy", type: "text", colSpan: "full" },
    { icon: Mail, name: "email", label: "School Email", placeholder: "admin@yourschool.com", type: "email", hint: "This will be your admin login email", colSpan: "full" },
    { icon: Phone, name: "phone", label: "Phone Number", placeholder: "+234 801 234 5678", type: "tel", colSpan: "half" },
    { icon: MapPin, name: "location", label: "Location", placeholder: "City, Country", type: "text", colSpan: "half" },
  ];

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={(e) => { e.preventDefault(); handleNext(); }}
      className="space-y-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {inputFields.map((field) => (
          <div key={field.name} className={field.colSpan === "full" ? "md:col-span-2" : ""}>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {field.label}
            </label>
            <div className="relative">
              <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={field.type}
                value={formData[field.name]}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                placeholder={field.placeholder}
                className={`
                  ${INPUT_STYLE} pl-11 pr-4
                  ${errors[field.name] && touched[field.name] ? "border-red-400 bg-red-50/50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700"}
                  focus:border-purple-500 focus:ring-purple-500/20
                `}
              />
            </div>
            <AnimatePresence>
              {errors[field.name] && touched[field.name] && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-red-500 text-xs font-medium mt-1 ml-1">
                  {errors[field.name]}
                </motion.p>
              )}
            </AnimatePresence>
            {field.hint && !errors[field.name] && (
              <p className="text-xs text-slate-500 mt-1 ml-1">{field.hint}</p>
            )}
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        Continue <ArrowRight size={18} />
      </motion.button>
    </motion.form>
  );
};

// Password Step
const PasswordStep = ({
  password,
  onChange,
  onBack,
  onSubmit,
  isLoading,
  isDark,
}: {
  password: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isDark: boolean;
}) => {
  const [errors, setErrors] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password needs at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Add at least one capital letter";
    if (!/[0-9]/.test(pwd)) return "Include a number";
    if (!/[!@#$%^&*]/.test(pwd)) return "Add a special character (!@#$%^&*)";
    return "";
  };

  const handleSubmit = () => {
    setTouched(true);
    const error = validatePassword(password);
    if (error) {
      setErrors(error);
      return;
    }
    setErrors("");
    onSubmit();
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];
    const texts = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    return { color: colors[strength], text: texts[strength], strength };
  };

  const strength = getPasswordStrength();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Create a Strong Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              onChange(e.target.value);
              if (errors) setErrors("");
            }}
            onBlur={() => setTouched(true)}
            placeholder="Create a secure password"
            className={`
              ${INPUT_STYLE} pl-11 pr-11
              ${errors && touched ? "border-red-400 bg-red-50/50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700"}
              focus:border-purple-500 focus:ring-purple-500/20
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {password && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < strength.strength ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className={`h-1 flex-1 rounded-full origin-left ${strength.color}`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${strength.strength >= 3 ? "text-green-500" : "text-slate-500"}`}>
              Password strength: {strength.text}
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {errors && touched && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1">
              <span>⚠️</span> {errors}
            </motion.p>
          )}
        </AnimatePresence>

        <div className={`mt-4 rounded-xl p-4 ${isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-100"}`}>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
            <Shield size={16} />
            Password Requirements
          </p>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">✓ At least 8 characters</li>
            <li className="flex items-center gap-2">✓ One uppercase letter (A-Z)</li>
            <li className="flex items-center gap-2">✓ One number (0-9)</li>
            <li className="flex items-center gap-2">✓ One special character (!@#$%^&*)</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border-2 border-slate-200 bg-white/80 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/50"
        >
          ← Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner /> : "Create Account"}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Success Modal
const SuccessModal = ({ school, user, onClose, isDark }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className={`rounded-2xl max-w-md w-full shadow-2xl overflow-hidden ${isDark ? "bg-slate-900 border border-purple-500/30" : "bg-white"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-10 h-10 text-purple-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-white/90">Welcome to PathSpring, {school.name}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className={`rounded-xl p-4 text-center ${isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-100"}`}>
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-300 mb-1">Your School Code</p>
            <p className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400 tracking-wider">{school.schoolCode}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Share this code with teachers to join your school</p>
          </div>
          <div className="space-y-2 text-sm text-center">
            <p className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail size={16} /> <span className="font-medium">{user.email}</span>
            </p>
            <p className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
              <Building2 size={16} /> <span className="font-medium">School Administrator</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold text-sm transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({ schoolName: "", email: "", password: "", phone: "", location: "" });

  const isDark = theme === "dark";

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/school/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      login(data.accessToken, data.refreshToken, data.user, data.school);
      setRegisteredData(data);
      setShowSuccess(true);
      showNotification("School registered successfully! 🎉", "success");
      setTimeout(() => {
        router.push(getDefaultRouteForRole(data.user?.role));
      }, 3000);
    } catch (err: any) {
      const errorMsg = err.message?.includes("Failed to fetch") ? "Unable to connect to server." : err.message || "Registration failed";
      setError(errorMsg);
      showNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, title: "1000+ Stories", description: "Explore our library", color: "from-blue-500 to-cyan-500" },
    { icon: Sparkles, title: "Fun Games", description: "Learn while playing", color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, title: "Track Progress", description: "See your growth", color: "from-green-500 to-emerald-500" },
    { icon: Award, title: "Earn Badges", description: "Celebrate achievements", color: "from-orange-500 to-red-500" },
  ];

  const stats = [
    { value: "50K+", label: "Active Readers", icon: Users },
    { value: "1000+", label: "Stories", icon: BookOpen },
    { value: "98%", label: "Satisfaction", icon: Star },
  ];

  const bgClass = isDark
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    : "bg-gradient-to-br from-amber-50 via-white to-purple-50";

  return (
    <main className={`relative min-h-screen ${bgClass} overflow-hidden`}>
      {/* Animated background orbs */}
      <div className="absolute top-0 -right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -left-32 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <Link href="/" className="group flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl md:text-3xl font-black tracking-tight transition-all group-hover:scale-105 origin-left ${isDark ? "bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-purple-700 via-pink-600 to-orange-600 bg-clip-text text-transparent"}`}>
                PathSpring
              </h1>
            </div>
          </Link>
          <div className="flex-shrink-0">
            <div className="rounded-xl bg-white/20 backdrop-blur-md p-1.5 border border-white/20 shadow-lg">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16">
          {/* LEFT COLUMN */}
          <div className="flex-1 flex items-center">
            <div className="w-full">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full shadow-lg">
                  <Sparkles size={16} />
                  <span className="text-sm font-semibold">Join 50,000+ happy readers</span>
                  <Star size={14} fill="currentColor" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
                  Start Your Journey! <span className="inline-block animate-wave">🚀</span>
                </h2>
                <p className={`text-lg md:text-xl ${isDark ? "text-slate-300" : "text-slate-600"} max-w-lg`}>
                  Create your school account and unlock a world of amazing stories!
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 md:mt-10">
                {features.map((feature, idx) => (
                  <FeatureCard key={idx} {...feature} isDark={isDark} />
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-3 gap-3 mt-4">
                {stats.map((stat, idx) => (
                  <StatCard key={idx} {...stat} isDark={isDark} />
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-4 mt-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5"><Shield size={14} /><span>Secure Registration</span></div>
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                <div className="flex items-center gap-1.5"><CheckCircle size={14} /><span>SSL Encrypted</span></div>
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                <div className="flex items-center gap-1.5"><Users size={14} /><span>24/7 Support</span></div>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN - Registration Form */}
          <div className="w-full lg:w-[480px] xl:w-[520px]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl shadow-2xl ${isDark ? "bg-slate-900/80 backdrop-blur-xl border border-white/10" : "bg-white/90 backdrop-blur-xl border border-white/60"}`}
            >
              <div className="p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 ${isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-purple-100 text-purple-700 border border-purple-200"}`}>
                    <Shield size={12} />
                    <span>Create Account</span>
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    Get Started Today
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Fill in your school details to begin
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= s ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md" : isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}>
                        {s}
                      </div>
                      {s === 1 && <div className={`w-12 h-0.5 rounded-full transition-all ${step > 1 ? "bg-purple-500" : isDark ? "bg-slate-700" : "bg-slate-200"}`} />}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 text-sm flex-1">{error}</span>
                        </div>
                        {error.includes("connect") && (
                          <button onClick={() => window.location.reload()} className="mt-2 flex items-center gap-1 text-red-500 text-xs font-medium">
                            <RefreshCw size={12} /> Retry Connection
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <SchoolInfoStep key="step1" formData={formData} onChange={updateFormData} onNext={() => setStep(2)} isDark={isDark} />
                  )}
                  {step === 2 && (
                    <PasswordStep key="step2" password={formData.password} onChange={(value) => updateFormData("password", value)} onBack={() => setStep(1)} onSubmit={handleRegister} isLoading={isLoading} isDark={isDark} />
                  )}
                </AnimatePresence>

                <div className="mt-6 text-center">
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && registeredData && (
          <SuccessModal school={registeredData.school} user={registeredData.user} onClose={() => router.push(getDefaultRouteForRole(registeredData.user?.role))} isDark={isDark} />
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } }
        .animate-pulse { animation: pulse 6s ease-in-out infinite; }
        .delay-1000 { animation-delay: 1s; }
        .delay-2000 { animation-delay: 2s; }
        @keyframes wave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-10deg); } }
        .animate-wave { display: inline-block; animation: wave 1s ease-in-out infinite; }
      `}</style>
    </main>
  );
}