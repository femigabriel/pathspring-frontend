// app/login/page.tsx - TAG ALIGNED TO LEFT SIDE
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Award,
  Shield,
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
      <span>Signing in...</span>
    </div>
  );
};

const LoginForm = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email is required";
    if (!value.includes("@") || !value.includes(".")) return "Enter a valid email";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 3) return "Password must be at least 3 characters";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (!emailError && !passwordError) {
      onSubmit(email, password);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              setTouched({ ...touched, email: true });
              setErrors({ ...errors, email: validateEmail(email) });
            }}
            placeholder="admin@school.com"
            className={`
              ${INPUT_STYLE} pl-11 pr-4
              ${errors.email && touched.email ? "border-red-400 bg-red-50/50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700"}
              focus:border-purple-500 focus:ring-purple-500/20
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => {
              setTouched({ ...touched, password: true });
              setErrors({ ...errors, password: validatePassword(password) });
            }}
            placeholder="Enter your password"
            className={`
              ${INPUT_STYLE} pl-11 pr-11
              ${errors.password && touched.password ? "border-red-400 bg-red-50/50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700"}
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
        <AnimatePresence>
          {errors.password && touched.password && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-red-500 text-xs font-medium mt-1 ml-1">
              {errors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-2 border-slate-300 bg-white checked:bg-purple-500 checked:border-purple-500 dark:border-slate-600 dark:bg-slate-700"
          />
          <span className="text-sm text-slate-600 group-hover:text-slate-800 dark:text-slate-400 transition-colors">
            Remember me
          </span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? <LoadingSpinner /> : <>Sign In <ArrowRight size={18} /></>}
      </motion.button>
    </motion.form>
  );
};

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

export default function LoginPage() {
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

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passwordOrPin: password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid email or password");
      showNotification(`Welcome back, ${data.user.name || "User"}! 🎉`, "success");
      login(data.accessToken, data.refreshToken, data.user, data.school);
      setTimeout(() => {
        const routes: Record<string, string> = {
          PLATFORM_ADMIN: "/premium-admin/dashboard",
          SCHOOL_ADMIN: "/admin/dashboard",
          TEACHER: "/teacher/dashboard",
          STUDENT: "/student/dashboard",
          PARENT: getDefaultRouteForRole(data.user.role, data.user.accountMode),
        };
        router.push(routes[data.user.role] || "/login");
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.message?.includes("Failed to fetch") ? "Unable to connect to server. Please check your connection." : err.message || "Login failed. Please check your credentials.";
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
        {/* Header Section - Logo on left, Theme toggle on right */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          {/* Logo */}
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

          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <div className="rounded-xl bg-white/20 backdrop-blur-md p-1.5 border border-white/20 shadow-lg">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16">
          {/* LEFT COLUMN - Centered Welcome Content with Left-Aligned Tag */}
          <div className="flex-1 flex items-center">
            <div className="w-full">
              {/* Tag - Left aligned */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full shadow-lg">
                  <Sparkles size={16} />
                  <span className="text-sm font-semibold">Join 50,000+ happy readers</span>
                  <Star size={14} fill="currentColor" />
                </div>
              </motion.div>

              {/* Welcome Text - Left aligned */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
                  Welcome Back! <span className="inline-block animate-wave">👋</span>
                </h2>
                <p className={`text-lg md:text-xl ${isDark ? "text-slate-300" : "text-slate-600"} max-w-lg`}>
                  Sign in to continue your reading adventure and discover amazing stories.
                </p>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 md:mt-10"
              >
                {features.map((feature, idx) => (
                  <FeatureCard key={idx} {...feature} isDark={isDark} />
                ))}
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-3 gap-3 mt-4"
              >
                {stats.map((stat, idx) => (
                  <StatCard key={idx} {...stat} isDark={isDark} />
                ))}
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 mt-6 text-xs text-slate-500 dark:text-slate-400"
              >
                <div className="flex items-center gap-1.5">
                  <Shield size={14} />
                  <span>Secure Login</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  <span>SSL Encrypted</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>24/7 Support</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN - Login Form */}
          <div className="w-full lg:w-[480px] xl:w-[520px]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl shadow-2xl ${isDark ? "bg-slate-900/80 backdrop-blur-xl border border-white/10" : "bg-white/90 backdrop-blur-xl border border-white/60"}`}
            >
              <div className="p-6 md:p-8">
                {/* Form Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 ${isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-purple-100 text-purple-700 border border-purple-200"}`}>
                    <Lock size={12} />
                    <span>Secure Access</span>
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    Access Your Account
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Enter your credentials to continue
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
                          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-red-500 text-sm flex-1">{error}</p>
                        </div>
                        {error.includes("connect") && (
                          <button onClick={() => window.location.reload()} className="mt-2 flex items-center gap-1 text-red-500 text-xs font-medium">
                            <RefreshCw size={12} />
                            Retry Connection
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

                {/* Sign up links */}
                <div className="mt-6 text-center space-y-2">
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    New to PathSpring?{" "}
                    <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors">
                      Create school account
                    </Link>
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Student reader?{" "}
                    <Link href="/student/login" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">
                      Sign in with username & PIN
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
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 6s ease-in-out infinite;
        }
        .delay-1000 { animation-delay: 1s; }
        .delay-2000 { animation-delay: 2s; }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wave {
          display: inline-block;
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}