// app/login/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, RefreshCw, X, Sparkles, BookOpen, Users, Star, TrendingUp, Award } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";

// ============ API CONFIGURATION ============
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ============ DESIGN SYSTEM ============
const INPUT_STYLE = "w-full p-5 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 transition-all";

// ============ NOTIFICATION COMPONENT ============
const Notification = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border-2 ${
        type === "success" 
          ? "bg-green-500 border-green-600 text-white" 
          : "bg-red-500 border-red-600 text-white"
      }`}
    >
      <span className="text-2xl">{type === "success" ? "✅" : "⚠️"}</span>
      <p className="font-bold text-lg">{message}</p>
      <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform">
        <X size={20} />
      </button>
    </motion.div>
  );
};

// ============ LOADING SPINNER ============
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
      />
      <span>Logging in...</span>
    </div>
  );
};

// ============ HERO SECTION ============
const LoginHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg mb-8"
      >
        <Sparkles className="text-white" size={20} />
        <span className="font-bold">Join 50,000+ happy readers</span>
        <Star className="text-yellow-300" size={18} fill="currentColor" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/" className="inline-block mb-6">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
            PathSpring
          </h1>
        </Link>
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl md:text-5xl font-black text-gray-900 mb-4"
      >
        Welcome Back! 👋
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xl text-gray-600 max-w-2xl mx-auto"
      >
        Sign in to continue your reading adventure and discover amazing stories!
      </motion.p>
    </motion.div>
  );
};

// ============ FEATURE CARDS ============
const FeatureCards = () => {
  const features = [
    { icon: BookOpen, title: "1000+ Stories", description: "Explore our library", color: "from-blue-500 to-cyan-500" },
    { icon: Sparkles, title: "Fun Games", description: "Learn while playing", color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, title: "Track Progress", description: "See your growth", color: "from-green-500 to-emerald-500" },
    { icon: Award, title: "Earn Badges", description: "Celebrate achievements", color: "from-orange-500 to-red-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -5 }}
          className="relative group"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
          <div className="relative bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-lg transition-all">
            <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <feature.icon className="text-white" size={24} />
            </div>
            <p className="text-sm font-bold text-gray-700">{feature.title}</p>
            <p className="text-xs text-gray-500">{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// ============ STATS SECTION ============
const StatsSection = () => {
  const stats = [
    { value: "50K+", label: "Active Readers", icon: Users },
    { value: "1000+", label: "Stories", icon: BookOpen },
    { value: "98%", label: "Parent Satisfaction", icon: Star },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="grid grid-cols-3 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
          <stat.icon className="w-5 h-5 text-purple-600 mx-auto mb-2" />
          <p className="text-xl font-black text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </div>
      ))}
    </motion.div>
  );
};

// ============ LOGIN FORM ============
const LoginForm = ({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focused, setFocused] = useState<string>("");

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(email, password);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused("")}
            placeholder="admin@school.com"
            className={`
              ${INPUT_STYLE} pl-12
              border-gray-200 
              focus:border-purple-500 
              focus:ring-2 focus:ring-purple-100
              bg-gray-50
              transition-all duration-200
              ${errors.email ? "border-red-300 bg-red-50" : ""}
              ${focused === "email" ? "bg-white shadow-lg border-purple-500" : ""}
            `}
          />
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm font-medium mt-1"
          >
            {errors.email}
          </motion.p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused("")}
            placeholder="Enter your password"
            className={`
              ${INPUT_STYLE} pl-12 pr-12
              border-gray-200 
              focus:border-purple-500 
              focus:ring-2 focus:ring-purple-100
              bg-gray-50
              transition-all duration-200
              ${errors.password ? "border-red-300 bg-red-50" : ""}
              ${focused === "password" ? "bg-white shadow-lg border-purple-500" : ""}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm font-medium mt-1"
          >
            {errors.password}
          </motion.p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" className="w-4 h-4 rounded border-2 border-gray-300 group-hover:border-purple-500 transition-colors" />
          <span className="text-sm text-gray-600 group-hover:text-gray-800">Remember me</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-purple-600 font-semibold hover:text-purple-700 transition-colors">
          Forgot password?
        </Link>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-base shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative">
          {isLoading ? <LoadingSpinner /> : (
            <>
              Sign In
              <ArrowRight size={18} className="inline ml-2" />
            </>
          )}
        </span>
      </motion.button>
    </motion.form>
  );
};

// ============ MAIN LOGIN PAGE ============
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      console.log("Attempting login to:", `${API_BASE_URL}/api/v1/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          passwordOrPin: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password!");
      }

      // Use Auth Context to login
      login(data.accessToken, data.refreshToken, data.user, data.school);

      showNotification("Welcome back! Logging in... 🎉", "success");
      
      // Redirect based on user role
      setTimeout(() => {
        if (data.user.role === "SCHOOL_ADMIN") {
          router.push("/admin/dashboard");
        } else if (data.user.role === "TEACHER") {
          router.push("/teacher/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      }, 1500);
      
    } catch (err: any) {
      console.error("Login error:", err);
      
      let errorMsg = "";
      
      if (err.message?.includes("ERR_CONNECTION_REFUSED") || err.message?.includes("Failed to fetch")) {
        errorMsg = "Unable to connect to the server. Please make sure the backend server is running on port 5000.";
      } else if (err.message) {
        errorMsg = err.message;
      } else {
        errorMsg = "Login failed! Please check your email and password.";
      }
      
      setError(errorMsg);
      showNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
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

          {/* Hero Section */}
          <LoginHero />

          {/* Feature Cards */}
          <FeatureCards />

          {/* Stats Section */}
          <StatsSection />

          {/* Main Card with Gradient Border */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative group"
          >
            {/* Animated Gradient Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient" />
            
            {/* Card Content */}
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                {/* Decorative Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-4">
                    <Sparkles className="text-purple-600" size={16} />
                    <span className="text-sm font-semibold text-purple-900">Secure Login</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Access Your Account</h3>
                  <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                  >
                    <p className="text-red-700 font-medium flex items-center gap-2">
                      <AlertCircle size={18} /> {error}
                    </p>
                    {error.includes("Unable to connect") && (
                      <button
                        onClick={handleRetry}
                        className="mt-3 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all"
                      >
                        <RefreshCw size={14} />
                        Try Again
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Login Form */}
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
              </div>
            </div>
          </motion.div>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600">
              New to PathSpring?{" "}
              <Link href="/register" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                Create your school account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </main>
  );
}