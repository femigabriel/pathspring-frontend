// app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Users,
  Star,
  Calendar,
  Trophy,
  Heart,
  Gamepad2,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Clock,
  Gift,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Award,
  Library,
  Rocket,
  Play,
  Cloud,
  Rainbow,
  Flower2,
  Moon,
  Sun,
  Star as StarIcon,
} from "lucide-react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Amazing Stories",
      description:
        "Discover hundreds of engaging stories that spark imagination and teach valuable life lessons.",
      color: "from-purple-500 to-indigo-500",
      stats: "1000+ Stories Available",
    },
    {
      icon: Gamepad2,
      title: "Fun Games",
      description:
        "Learn while playing with interactive games that reinforce reading comprehension and critical thinking.",
      color: "from-pink-500 to-rose-500",
      stats: "50+ Educational Games",
    },
    {
      icon: Heart,
      title: "Feel Good Stories",
      description:
        "Stories that teach kindness, courage, empathy, and important values for growing minds.",
      color: "from-emerald-500 to-teal-500",
      stats: "Kids Love Them!",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description:
        "Watch your child's reading skills grow with detailed progress reports and achievement tracking.",
      color: "from-orange-500 to-red-500",
      stats: "Real-time Analytics",
    },
  ];

  const stats = [
    { value: "50K+", label: "Happy Kids", icon: Users },
    { value: "1K+", label: "Schools", icon: Library },
    { value: "1000+", label: "Stories", icon: BookOpen },
    { value: "98%", label: "Parent Satisfaction", icon: Star },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "COPPA compliant with no ads or dark patterns",
    },
    {
      icon: Zap,
      title: "Easy to Use",
      description: "Simple interface designed for young readers",
    },
    {
      icon: Globe,
      title: "Global Content",
      description: "Stories from diverse cultures and perspectives",
    },
    {
      icon: Smartphone,
      title: "Any Device",
      description: "Works perfectly on tablets, phones, and computers",
    },
    {
      icon: Clock,
      title: "Progress Tracking",
      description: "See reading growth over time",
    },
    {
      icon: Gift,
      title: "Fun Badges",
      description: "Earn rewards for reading achievements",
    },
  ];

  const testimonials = [
    {
      name: "Mrs. Adeola",
      role: "Teacher",
      image: "https://images.unsplash.com/photo-1494790108777-2869c5b9b9f9?w=150&h=150&fit=crop",
      content:
        "My students jump out of bed excited for school now! PathSpring has transformed reading time.",
      rating: 5,
    },
    {
      name: "Amina",
      role: "Age 9",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
      content:
        "PathSpring is SO COOL! I love the stories and earning badges. Best app ever!",
      rating: 5,
    },
    {
      name: "Tunde",
      role: "Age 8",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      content:
        "The games are super fun and I'm learning at the same time. I've read 50 books already!",
      rating: 5,
    },
  ];

  const steps = [
    { number: "01", title: "Sign Up", emoji: "🏫", description: "Create your school account" },
    { number: "02", title: "Add Kids", emoji: "👶", description: "Add your students or children" },
    { number: "03", title: "Pick Stories", emoji: "📚", description: "Choose from amazing stories" },
    { number: "04", title: "Start Reading!", emoji: "✨", description: "Have fun & earn badges!" },
  ];

  // Floating elements for hero section
  const floatingElements = [
    { icon: BookOpen, color: "text-purple-400", delay: 0, top: "10%", left: "5%", size: 32 },
    { icon: StarIcon, color: "text-yellow-400", delay: 1, top: "15%", right: "8%", size: 28 },
    { icon: Cloud, color: "text-blue-400", delay: 2, top: "60%", left: "2%", size: 48 },
    { icon: Rocket, color: "text-pink-400", delay: 1.5, bottom: "20%", right: "3%", size: 36 },
    { icon: Moon, color: "text-indigo-400", delay: 2.5, top: "70%", right: "15%", size: 30 },
    { icon: Sun, color: "text-orange-400", delay: 0.5, bottom: "30%", left: "10%", size: 34 },
    { icon: Flower2, color: "text-green-400", delay: 3, top: "40%", right: "20%", size: 26 },
    { icon: Rainbow, color: "text-pink-400", delay: 1.8, bottom: "45%", left: "15%", size: 40 },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/10 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl transform group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Path
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Spring
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-slate-300 hover:text-white transition-colors duration-200 relative group"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
              <Link
                href="#how-it-works"
                className="text-slate-300 hover:text-white transition-colors duration-200 relative group"
              >
                How it Works
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
              <Link
                href="#pricing"
                className="text-slate-300 hover:text-white transition-colors duration-200 relative group"
              >
                Pricing
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="px-5 py-2 text-slate-300 hover:text-white transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/30"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-xl border-b border-white/10 py-4 animate-in slide-in-from-top">
            <div className="flex flex-col space-y-4 px-4">
              <Link
                href="#features"
                className="text-slate-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-slate-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link
                href="#pricing"
                className="text-slate-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                <Link
                  href="/login"
                  className="px-5 py-2 text-center text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Kid-Friendly Decorations */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-10 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse animation-delay-4000" />
        </div>

        {/* Wavy Lines Pattern - Top */}
        <svg
          className="absolute top-0 left-0 w-full h-32 opacity-20"
          preserveAspectRatio="none"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 64L48 58.7C96 53.3 192 42.7 288 48C384 53.3 480 74.7 576 80C672 85.3 768 74.7 864 64C960 53.3 1056 42.7 1152 42.7C1248 42.7 1344 53.3 1392 58.7L1440 64V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V64Z"
            fill="url(#paint0_linear)"
          />
          <defs>
            <linearGradient id="paint0_linear" x1="720" y1="0" x2="720" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="1" stopColor="#EC4899" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Zigzag Pattern - Left Side */}
        <svg
          className="absolute left-0 top-1/3 h-64 w-auto opacity-20"
          viewBox="0 0 100 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 0 L40 40 L60 80 L40 120 L60 160 L40 200 L60 240 L40 280 L60 320 L40 360 L60 400"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="100" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Zigzag Pattern - Right Side */}
        <svg
          className="absolute right-0 top-1/2 h-80 w-auto opacity-20"
          viewBox="0 0 100 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 0 L60 40 L40 80 L60 120 L40 160 L60 200 L40 240 L60 280 L40 320 L60 360 L40 400"
            stroke="url(#gradient2)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient2" x1="100" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EC4899" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Dotted Pattern Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(139, 92, 246, 0.3) 2px, transparent 2px)`,
            backgroundSize: "30px 30px",
          }}
        />

        {/* Floating Elements */}
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
              <Icon className={`w-${element.size/4} h-${element.size/4} ${element.color} opacity-30`} size={element.size} />
            </motion.div>
          );
        })}

        {/* Stars Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                delay: Math.random() * 5,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8"
              >
                <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                <span className="text-sm text-slate-300">
                  Stories That Change Hearts
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                Discover the Joy of{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Reading
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                PathSpring makes reading fun with amazing stories, interactive
                games, and rewards that keep kids engaged and excited to learn.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
              >
                <Link
                  href="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-purple-500/30 flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  See How It Works
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto lg:mx-0"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column - Feature Showcase */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                {/* Animated feature cards */}
                <div className="space-y-6">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    const isActive = activeFeature === index;

                    return (
                      <div
                        key={index}
                        className={`
                          relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer
                          ${
                            isActive
                              ? "bg-gradient-to-r " +
                                feature.color +
                                " scale-105 shadow-xl"
                              : "bg-white/5 hover:bg-white/10"
                          }
                        `}
                        onMouseEnter={() => setActiveFeature(index)}
                      >
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            <div
                              className={`
                              p-3 rounded-xl transition-all duration-300
                              ${isActive ? "bg-white/20" : "bg-white/5"}
                            `}
                            >
                              <Icon
                                className={`w-6 h-6 ${isActive ? "text-white" : "text-purple-400"}`}
                              />
                            </div>
                            <div className="flex-1">
                              <h3
                                className={`font-semibold mb-1 ${isActive ? "text-white" : "text-white"}`}
                              >
                                {feature.title}
                              </h3>
                              <p
                                className={`text-sm ${isActive ? "text-white/90" : "text-slate-400"}`}
                              >
                                {feature.description}
                              </p>
                              {isActive && (
                                <div className="mt-3 flex items-center text-xs text-white/80">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {feature.stats}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar for active feature */}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div className="h-full bg-white/40 animate-progress" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-pink-500/20 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wavy Line */}
        <svg
          className="absolute bottom-0 left-0 w-full h-32 opacity-20"
          preserveAspectRatio="none"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 56L48 61.3C96 66.7 192 77.3 288 72C384 66.7 480 45.3 576 40C672 34.7 768 45.3 864 56C960 66.7 1056 77.3 1152 77.3C1248 77.3 1344 66.7 1392 61.3L1440 56V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V56Z"
            fill="url(#paint1_linear)"
          />
          <defs>
            <linearGradient id="paint1_linear" x1="720" y1="120" x2="720" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EC4899" stopOpacity="0.3" />
              <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </section>

      {/* Rest of your sections remain the same... */}
      {/* Benefits Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Inspire Young Minds
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Powerful features designed to make reading fun and engaging
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get Started in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                4 Simple Steps
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Join thousands of schools and families already using PathSpring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center group hover:scale-105 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{step.emoji}</div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-purple-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Kids & Parents
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Join thousands of happy families who discovered the joy of reading
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-300 mb-6">{testimonial.content}</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Choose the perfect plan for your school or family
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">₦5,000</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-300 mb-6">Up to 500 kids</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  100+ stories
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Track progress
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Fun badges
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full text-center px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Popular Plan */}
            <div className="relative p-8 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl border-2 border-purple-500 scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold text-white mb-2">Popular</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">₦10,000</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-300 mb-6">Up to 1,500 kids</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  200+ stories
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Cool reports
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Teacher tools
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Priority help
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">👑</div>
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">₦20,000</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-300 mb-6">Unlimited kids</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Everything!
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Custom stories
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Your school logo
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Extra support
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full text-center px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
          <p className="text-center text-slate-400 mt-8">
            30 days free • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl" />
          <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 text-center overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start the Adventure?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of kids discovering the joy of reading with
                PathSpring!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transform hover:scale-105 transition-all duration-200 shadow-2xl flex items-center justify-center group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transform hover:scale-105 transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
              <p className="text-sm text-white/70 mt-6">
                ✓ 30 days free • ✓ No credit card • ✓ Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-slate-400 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-slate-400 hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white">
                    Stories
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white">
                    Parent Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white">
                    Teacher Resources
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="text-sm text-slate-400 hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-sm text-slate-400 hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="text-sm text-slate-400 hover:text-white">
                    Safety
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-400">
                © 2024 PathSpring. Making learning magical for kids everywhere. 💚
              </span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

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
        @keyframes progress {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 5s linear infinite;
        }
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slideInFromTop 0.3s ease-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}