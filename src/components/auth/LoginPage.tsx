// app/login/page.tsx - FIXED ROUTING
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
  Cloud,
  Rocket,
  Flower2,
  Rainbow,
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { getDefaultRouteForRole } from "@/src/lib/auth";
import ThemeToggle from "@/src/components/admin/layout/ThemeToggle";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const INPUT_STYLE =
  "w-full rounded-xl border-2 border-slate-200 bg-white/85 p-5 text-lg text-slate-900 transition-all placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500";

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
        <Link href="/" className="inline-block mb-6 group">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl transform group-hover:scale-110 transition-all duration-300 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              PathSpring
            </h1>
          </div>
        </Link>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4 text-4xl font-black text-slate-900 md:text-5xl dark:text-white"
      >
        Welcome Back! 👋
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-300"
      >
        Sign in to continue your reading adventure and discover amazing stories!
      </motion.p>
    </motion.div>
  );
};

const FeatureCards = () => {
  const features = [
    {
      icon: BookOpen,
      title: "1000+ Stories",
      description: "Explore our library",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "Fun Games",
      description: "Learn while playing",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "See your growth",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Award,
      title: "Earn Badges",
      description: "Celebrate achievements",
      color: "from-orange-500 to-red-500",
    },
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
          <div
            className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}
          />
          <div className="relative rounded-xl border border-slate-200 bg-white/80 p-4 text-center shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/50">
            <div
              className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-2`}
            >
              <feature.icon className="text-white" size={24} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{feature.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

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
        <div
          key={index}
          className="rounded-xl border border-slate-200 bg-white/80 p-3 text-center backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50"
        >
          <stat.icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
        </div>
      ))}
    </motion.div>
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
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <div className="relative group">
          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-purple-400"
            size={20}
          />
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
              ${errors.email ? "border-red-500 bg-red-500/10" : ""}
              ${
                focused === "email"
                  ? "border-purple-500 shadow-lg bg-white dark:bg-slate-700/50"
                  : ""
              }
            `}
          />
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-medium mt-1"
          >
            {errors.email}
          </motion.p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Password
        </label>
        <div className="relative group">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors"
            size={20}
          />
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
              ${errors.password ? "border-red-500 bg-red-500/10" : ""}
              ${
                focused === "password"
                  ? "border-purple-500 shadow-lg bg-white dark:bg-slate-700/50"
                  : ""
              }
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-medium mt-1"
          >
            {errors.password}
          </motion.p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-2 border-slate-300 bg-white transition-colors group-hover:border-purple-500 dark:border-slate-600 dark:bg-slate-800"
          />
          <span className="text-sm text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
            Remember me
          </span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
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
          {isLoading ? (
            <LoadingSpinner />
          ) : (
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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Login attempt for:", email);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          passwordOrPin: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password!");
      }

      console.log("Login success:", data.user.role);

      showNotification("Welcome back! Logging in... 🎉", "success");

      login(data.accessToken, data.refreshToken, data.user, data.school);

      // FIXED ROUTING - Redirect based on EXACT role
      setTimeout(() => {
        const userRole = data.user.role;

        console.log("Routing user with role:", userRole);

        switch (userRole) {
          case "PLATFORM_ADMIN":
            console.log("→ Redirecting to premium-admin dashboard");
            router.push("/premium-admin/dashboard");
            break;

          case "SCHOOL_ADMIN":
            console.log("→ Redirecting to school admin dashboard");
            router.push("/admin/dashboard");
            break;

          case "TEACHER":
            console.log("→ Redirecting to teacher dashboard");
            router.push("/teacher/dashboard");
            break;

          case "STUDENT":
            console.log("→ Redirecting to student dashboard");
            router.push("/student/dashboard");
            break;

          case "PARENT":
            console.log("Redirecting to parent workspace");
            router.push(getDefaultRouteForRole(userRole, data.user.accountMode));
            break;

          default:
            console.warn("Unknown role:", userRole);
            router.push("/login");
        }
      }, 1500);
    } catch (err: unknown) {
      console.error("Login error:", err);

      let errorMsg = "";
      const message = err instanceof Error ? err.message : "";

      if (
        message.includes("ERR_CONNECTION_REFUSED") ||
        message.includes("Failed to fetch")
      ) {
        errorMsg =
          "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (message) {
        errorMsg = message;
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

  const floatingElements = [
    {
      icon: BookOpen,
      color: "text-purple-400",
      delay: 0,
      top: "5%",
      left: "2%",
      size: 28,
    },
    {
      icon: Star,
      color: "text-yellow-400",
      delay: 1,
      top: "8%",
      right: "3%",
      size: 24,
    },
    {
      icon: Cloud,
      color: "text-blue-400",
      delay: 2,
      top: "70%",
      left: "1%",
      size: 40,
    },
    {
      icon: Rocket,
      color: "text-pink-400",
      delay: 1.5,
      bottom: "15%",
      right: "2%",
      size: 32,
    },
    {
      icon: Flower2,
      color: "text-green-400",
      delay: 2.5,
      top: "80%",
      right: "8%",
      size: 26,
    },
    {
      icon: Rainbow,
      color: "text-purple-400",
      delay: 1.8,
      bottom: "25%",
      left: "5%",
      size: 35,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {floatingElements.map((element, index) => {
        const Icon = element.icon;
        return (
          <motion.div
            key={index}
            className="absolute hidden lg:block"
            style={{
              top: element.top,
              left: element.left,
              right: element.right,
              bottom: element.bottom,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className={`${element.color} opacity-30`} size={element.size} />
          </motion.div>
        );
      })}

      <div className="fixed right-4 top-4 z-40 rounded-xl border border-slate-200 bg-white/85 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <ThemeToggle />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}
          </AnimatePresence>

          <LoginHero />
          <FeatureCards />
          <StatsSection />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient" />

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/88 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/15 to-pink-500/15 px-4 py-2 dark:from-purple-500/20 dark:to-pink-500/20">
                    <Sparkles className="text-purple-400" size={16} />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      Secure Login
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Access Your Account</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enter your credentials to continue
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
                  >
                    <p className="text-red-400 font-medium flex items-center gap-2">
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

                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8"
          >
            <p className="text-slate-500 dark:text-slate-400">
              New to PathSpring?{" "}
              <Link
                href="/register"
                className="font-semibold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Create your school account
              </Link>
            </p>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Student reader?{" "}
              <Link
                href="/student/login"
                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
              >
                Sign in with username and PIN
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.05);
          }
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 1s;
        }
        .animation-delay-4000 {
          animation-delay: 2s;
        }
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
