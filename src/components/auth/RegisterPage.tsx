// app/register/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Check, ArrowRight, Building2, Mail, Phone, MapPin, Lock, Shield, Sparkles, X, RefreshCw, Star, BookOpen, Users, TrendingUp } from "lucide-react";

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
      <span>Registering...</span>
    </div>
  );
};

// ============ HERO SECTION ============
const RegisterHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      {/* Stats Badge */}
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
      
      {/* PathSpring Logo */}
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
        Start Your Journey! 🚀
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xl text-gray-600 max-w-2xl mx-auto"
      >
        Create your school account and unlock a world of amazing stories!
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
    { icon: Shield, title: "Safe & Secure", description: "COPPA compliant", color: "from-orange-500 to-red-500" },
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

// ============ CHARACTER GUIDE ============
const RegisterGuide = ({ step, error }: { step: number; error?: string }) => {
  const messages = {
    1: "🎉 Welcome! Let's get your school set up. I'll help you every step!",
    2: "📝 Great! Now tell us about your school.",
    3: "🔐 Almost there! Create a secure password.",
    4: error || "✨ You're doing amazing! Let's finish up."
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 border border-purple-200 mb-6"
    >
      <div className="flex gap-3 items-center">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl"
        >
          {step === 1 ? "🌟" : step === 2 ? "🏫" : step === 3 ? "🔐" : "✨"}
        </motion.div>
        <div className="flex-1">
          <p className={`text-base font-bold ${error ? "text-red-600" : "text-gray-800"}`}>
            {messages[step as keyof typeof messages] || messages[4]}
          </p>
          {!error && (
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 4].map((s) => (
                <motion.div
                  key={s}
                  initial={false}
                  animate={{
                    width: s <= step ? "40px" : "8px",
                    backgroundColor: s <= step ? "#8B5CF6" : "#D1D5DB"
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 rounded-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============ FORM STEP 1: SCHOOL INFORMATION ============
const SchoolInfoStep = ({ 
  formData, 
  onChange, 
  onNext 
}: { 
  formData: any; 
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string>("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.schoolName.trim()) newErrors.schoolName = "School name is required";
    if (!formData.email.trim()) newErrors.email = "Email address is required";
    if (!formData.email.includes("@")) newErrors.email = "Please enter a valid email address";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.location.trim()) newErrors.location = "School location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const inputFields = [
    { 
      icon: Building2, 
      name: "schoolName", 
      label: "School Name", 
      placeholder: "e.g., Green Hills Academy",
      type: "text"
    },
    { 
      icon: Mail, 
      name: "email", 
      label: "School Email", 
      placeholder: "admin@yourschool.com",
      type: "email",
      hint: "This will be your admin login email"
    },
    { 
      icon: Phone, 
      name: "phone", 
      label: "Phone Number", 
      placeholder: "+234 801 234 5678",
      type: "tel"
    },
    { 
      icon: MapPin, 
      name: "location", 
      label: "Location", 
      placeholder: "City, Country (e.g., Lagos, Nigeria)",
      type: "text"
    }
  ];

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={(e) => { e.preventDefault(); handleNext(); }}
      className="space-y-5"
    >
      {inputFields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {field.label}
          </label>
          <div className="relative group">
            <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
            <input
              type={field.type}
              value={formData[field.name]}
              onChange={(e) => onChange(field.name, e.target.value)}
              onFocus={() => setFocused(field.name)}
              onBlur={() => setFocused("")}
              placeholder={field.placeholder}
              className={`
                ${INPUT_STYLE} pl-12
                border-gray-200 
                focus:border-purple-500 
                focus:ring-2 focus:ring-purple-100
                bg-gray-50
                transition-all duration-200
                ${errors[field.name] ? "border-red-300 bg-red-50" : ""}
                ${focused === field.name ? "bg-white shadow-lg border-purple-500" : ""}
              `}
            />
          </div>
          {errors[field.name] && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm font-medium mt-1"
            >
              {errors[field.name]}
            </motion.p>
          )}
          {field.hint && !errors[field.name] && (
            <p className="text-gray-500 text-xs mt-1">
              {field.hint}
            </p>
          )}
        </div>
      ))}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        Continue
        <ArrowRight size={18} />
      </motion.button>
    </motion.form>
  );
};

// ============ FORM STEP 2: PASSWORD & SECURITY ============
const PasswordStep = ({ 
  password, 
  onChange, 
  onBack, 
  onSubmit,
  isLoading 
}: { 
  password: string; 
  onChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}) => {
  const [errors, setErrors] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password needs at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Add at least one capital letter";
    if (!/[0-9]/.test(pwd)) return "Include a number";
    if (!/[!@#$%^&*]/.test(pwd)) return "Add a special character (!@#$%^&*)";
    return "";
  };

  const handleSubmit = () => {
    const error = validatePassword(password);
    if (error) {
      setErrors(error);
      return;
    }
    setErrors("");
    onSubmit();
  };

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    
    const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-600"];
    const texts = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    
    return { color: colors[strength], text: texts[strength], strength };
  };

  const strength = passwordStrength();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Create a Strong Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              onChange(e.target.value);
              if (errors) setErrors("");
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Create a secure password"
            className={`
              ${INPUT_STYLE} pl-12 pr-12
              border-gray-200 
              focus:border-purple-500 
              focus:ring-2 focus:ring-purple-100
              bg-gray-50
              transition-all duration-200
              ${errors ? "border-red-300 bg-red-50" : ""}
              ${focused ? "bg-white shadow-lg border-purple-500" : ""}
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
        
        {password && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < strength.strength ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`h-1 flex-1 rounded-full origin-left ${strength.color}`}
                />
              ))}
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs font-medium ${strength.strength >= 3 ? "text-green-600" : "text-gray-600"}`}
            >
              Password strength: {strength.text}
            </motion.p>
          </motion.div>
        )}
        
        {errors && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm font-medium mt-2 flex items-center gap-1"
          >
            <span>⚠️</span> {errors}
          </motion.p>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mt-4 border border-purple-100"
        >
          <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2 text-sm">
            <Shield size={16} />
            Password Requirements
          </p>
          <ul className="space-y-1 text-xs text-purple-800">
            <li className="flex items-center gap-2">✓ At least 8 characters</li>
            <li className="flex items-center gap-2">✓ One uppercase letter (A-Z)</li>
            <li className="flex items-center gap-2">✓ One number (0-9)</li>
            <li className="flex items-center gap-2">✓ One special character (!@#$%^&*)</li>
          </ul>
        </motion.div>
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-200 transition-all"
        >
          ← Back
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner /> : "Create Account"}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============ SUCCESS MODAL ============
const SuccessModal = ({ school, user, onClose }: { school: any; user: any; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Registration Successful!
          </h2>
          <p className="text-white/90">
            Welcome to PathSpring, {school.name}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200">
            <p className="text-sm font-semibold text-purple-900 mb-1">Your School Code</p>
            <p className="text-2xl font-mono font-bold text-purple-600 tracking-wider">
              {school.schoolCode}
            </p>
            <p className="text-xs text-purple-700 mt-2">
              Share this code with teachers to join your school
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="flex items-center justify-center gap-2 text-gray-600">
              <Mail size={16} />
              <span className="font-medium">{user.email}</span>
            </p>
            <p className="flex items-center justify-center gap-2 text-gray-600">
              <Building2 size={16} />
              <span className="font-medium">School Administrator</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============ MAIN REGISTER PAGE ============
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [formData, setFormData] = useState({
    schoolName: "",
    email: "",
    password: "",
    phone: "",
    location: ""
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolName: formData.schoolName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          location: formData.location
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again!");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("school", JSON.stringify(data.school));

      setRegisteredData(data);
      setShowSuccess(true);
      showNotification("School registered successfully! 🎉", "success");
      
      setTimeout(() => {
         router.push("/admin/dashboard");
      }, 3000);
      
    } catch (err: any) {
      console.error("Registration error:", err);
      
      let errorMsg = "";
      
      if (err.message?.includes("ERR_CONNECTION_REFUSED") || err.message?.includes("Failed to fetch")) {
        errorMsg = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (err.message) {
        errorMsg = err.message;
      } else {
        errorMsg = "Registration failed! Please check your details and try again.";
      }
      
      setError(errorMsg);
      showNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
    handleRegister();
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
          <RegisterHero />

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
                    <span className="text-sm font-semibold text-purple-900">Create Your Account</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Get Started Today</h3>
                  <p className="text-gray-500 text-sm mt-1">Fill in your school details to begin</p>
                </div>

                {/* Character Guide */}
                <RegisterGuide step={step} error={error} />

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                  >
                    <p className="text-red-700 font-medium flex items-center gap-2">
                      <span>⚠️</span> {error}
                    </p>
                    {error.includes("Unable to connect") && (
                      <button
                        onClick={handleRetry}
                        disabled={isLoading}
                        className="mt-3 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        Try Again
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Form Steps */}
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <SchoolInfoStep
                      key="step1"
                      formData={formData}
                      onChange={updateFormData}
                      onNext={() => setStep(2)}
                    />
                  )}
                  
                  {step === 2 && (
                    <PasswordStep
                      key="step2"
                      password={formData.password}
                      onChange={(value) => updateFormData("password", value)}
                      onBack={() => setStep(1)}
                      onSubmit={handleRegister}
                      isLoading={isLoading}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                Sign in here
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

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && registeredData && (
          <SuccessModal
            school={registeredData.school}
            user={registeredData.user}
            onClose={() => router.push("/dashboard")}
          />
        )}
      </AnimatePresence>
    </main>
  );
}