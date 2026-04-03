// app/family/register/page.tsx - FIXED TYPESCRIPT ERRORS
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookHeart,
  HeartHandshake,
  Lock,
  Mail,
  Sparkles,
  User,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  Users,
  Star,
  BookOpen,
  X,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { getDefaultRouteForRole } from "@/src/lib/auth";
import ThemeToggle from "@/src/components/admin/layout/ThemeToggle";
import { useTheme } from "@/src/contexts/ThemeContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const INPUT_STYLE =
  "w-full rounded-xl border-2 bg-white/90 p-4 text-lg text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-4 dark:bg-slate-800/90 dark:text-white dark:placeholder:text-slate-500";

// Define the form data type
interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Define errors type
interface Errors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

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
    <Icon className="w-5 h-5 mx-auto mb-1.5 text-sky-500" />
    <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{value}</p>
    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
  </div>
);

// Family Registration Form
const FamilyRegisterForm = ({
  onSubmit,
  isLoading,
  isDark,
}: {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  isDark: boolean;
}) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateField = (field: keyof FormData, value: string): string => {
    switch (field) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!value.includes("@") || !value.includes(".")) return "Enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter";
        if (!/[0-9]/.test(value)) return "Include at least one number";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
    // Clear confirm password error when password changes
    if (field === "password" && touched.confirmPassword) {
      const confirmError = validateField("confirmPassword", formData.confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    const fields: (keyof FormData)[] = ["fullName", "email", "password", "confirmPassword"];
    fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getPasswordStrength = () => {
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
    const texts = ["Weak", "Fair", "Good", "Strong"];
    return pwd ? { color: colors[strength], text: texts[strength], strength } : null;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            onBlur={() => handleBlur("fullName")}
            placeholder="Rose Musa"
            className={`
              ${INPUT_STYLE} pl-11 pr-4
              ${errors.fullName && touched.fullName ? "border-red-400 bg-red-50/50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700"}
              focus:border-sky-500 focus:ring-sky-500/20
            `}
          />
        </div>
        <AnimatePresence>
          {errors.fullName && touched.fullName && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-red-500 text-xs font-medium mt-1 ml-1">
              {errors.fullName}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="rose@example.com"
            className={`
              ${INPUT_STYLE} pl-11 pr-4
              ${errors.email && touched.email ? "border-red-400 bg-red-50/50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700"}
              focus:border-sky-500 focus:ring-sky-500/20
            `}
          />
        </div>
        <AnimatePresence>
          {errors.email && touched.email && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-red-500 text-xs font-medium mt-1 ml-1">
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            placeholder="Create a secure password"
            className={`
              ${INPUT_STYLE} pl-11 pr-11
              ${errors.password && touched.password ? "border-red-400 bg-red-50/50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700"}
              focus:border-sky-500 focus:ring-sky-500/20
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

        {passwordStrength && formData.password && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < passwordStrength.strength ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className={`h-1 flex-1 rounded-full origin-left ${passwordStrength.color}`}
                />
              ))}
            </div>
            <p className={`text-xs ${passwordStrength.strength >= 2 ? "text-green-500" : "text-slate-500"}`}>
              Password strength: {passwordStrength.text}
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {errors.password && touched.password && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-red-500 text-xs font-medium mt-1 ml-1">
              {errors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            placeholder="Repeat your password"
            className={`
              ${INPUT_STYLE} pl-11 pr-11
              ${errors.confirmPassword && touched.confirmPassword ? "border-red-400 bg-red-50/50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700"}
              focus:border-sky-500 focus:ring-sky-500/20
            `}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <AnimatePresence>
          {errors.confirmPassword && touched.confirmPassword && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-red-500 text-xs font-medium mt-1 ml-1">
              {errors.confirmPassword}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className={`rounded-xl p-3 ${isDark ? "bg-sky-500/10 border border-sky-500/20" : "bg-sky-50 border border-sky-100"}`}>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          🔒 Your password must be at least 8 characters with one uppercase letter and one number.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white py-3.5 rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? <LoadingSpinner /> : <><HeartHandshake size={18} /> Register as Family</>}
      </motion.button>
    </motion.form>
  );
};

export default function FamilyRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isDark = theme === "dark";

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRegister = async (formData: FormData) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/family/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Family registration failed");
      showNotification(`Welcome to the family, ${formData.fullName.split(" ")[0]}! 🎉`, "success");
      login(data.accessToken, data.refreshToken ?? "", data.user, data.school);
      setTimeout(() => {
        router.push(getDefaultRouteForRole(data.user.role, data.user.accountMode ?? "family"));
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.message?.includes("Failed to fetch") ? "Unable to connect to server." : err.message || "Registration failed";
      setError(errorMsg);
      showNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: BookHeart, title: "Family Library", description: "Browse & add books", color: "from-sky-500 to-cyan-500" },
    { icon: HeartHandshake, title: "Child Profiles", description: "Track each child", color: "from-emerald-500 to-teal-500" },
    { icon: BookOpen, title: "Home Reading", description: "Evening stories", color: "from-purple-500 to-pink-500" },
    { icon: Star, title: "Progress Tracking", description: "See growth", color: "from-orange-500 to-red-500" },
  ];

  const stats = [
    { value: "10K+", label: "Families", icon: Users },
    { value: "500+", label: "Books", icon: BookOpen },
    { value: "95%", label: "Satisfaction", icon: Star },
  ];

  const bgClass = isDark
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    : "bg-gradient-to-br from-sky-50 via-white to-emerald-50";

  return (
    <main className={`relative min-h-screen ${bgClass} overflow-hidden`}>
      {/* Animated background orbs */}
      <div className="absolute top-0 -right-32 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -left-32 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-2000" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <Link href="/" className="group flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                <BookHeart className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl md:text-3xl font-black tracking-tight transition-all group-hover:scale-105 origin-left ${isDark ? "bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-sky-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent"}`}>
                PathSpring Family
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
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-5 py-2 rounded-full shadow-lg">
                  <Sparkles size={16} />
                  <span className="text-sm font-semibold">Independent Family Mode</span>
                  <HeartHandshake size={14} />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
                  Start Home Reading <span className="inline-block animate-wave">🏠</span>
                </h2>
                <p className={`text-lg md:text-xl ${isDark ? "text-slate-300" : "text-slate-600"} max-w-lg`}>
                  Register your family and start the easy way. Create child profiles and track progress without a school setup.
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
                <div className="flex items-center gap-1.5"><Shield size={14} /><span>Family Privacy</span></div>
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                <div className="flex items-center gap-1.5"><CheckCircle size={14} /><span>COPPA Compliant</span></div>
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                <div className="flex items-center gap-1.5"><Users size={14} /><span>Multi-Child</span></div>
              </motion.div>

              {/* Info Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className={`mt-6 rounded-xl p-4 ${isDark ? "bg-slate-800/60 border border-slate-700" : "bg-white/80 border border-white/60"}`}>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  💡 Family login uses the normal sign-in page after registration.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors">
                  Sign in to family mode <ArrowRight size={14} />
                </Link>
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
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 ${isDark ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "bg-sky-100 text-sky-700 border border-sky-200"}`}>
                    <HeartHandshake size={12} />
                    <span>Family Registration</span>
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    Create Family Account
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Independent family account for home reading
                  </p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 overflow-hidden"
                    >
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

                {/* Registration Form */}
                <FamilyRegisterForm onSubmit={handleRegister} isLoading={isLoading} isDark={isDark} />

                {/* Sign in link */}
                <div className="mt-6 text-center">
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Already have a family account?{" "}
                    <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
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