"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  GraduationCap,
  HeartHandshake,
  LibraryBig,
  Menu,
  School,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
  Target,
} from "lucide-react";
import ThemeToggle from "@/src/components/admin/layout/ThemeToggle";
import { getPublicBillingPlans, type BillingPlanDefinition } from "@/src/lib/billing-api";

const platformFeatures = [
  {
    icon: Building2,
    title: "School Product Catalog",
    description:
      "Schools browse and select approved content from the platform catalog. Control exactly what teachers and students can access.",
    gradient: "from-cyan-500 to-blue-500",
    badge: "School Admin",
    badgeColor: "cyan",
  },
  {
    icon: GraduationCap,
    title: "Teacher Command View",
    description:
      "Teachers manage their classes, assign reading, track progress, spot low scores, and get actionable alerts—all in one dashboard.",
    gradient: "from-emerald-500 to-teal-500",
    badge: "Teacher Tools",
    badgeColor: "emerald",
  },
  {
    icon: BookOpenCheck,
    title: "Class Reading Sessions",
    description:
      "Teachers can run teacher-led, group, or buddy reading sessions with checkpoints, breakout groups, and live class context.",
    gradient: "from-violet-500 to-fuchsia-500",
    badge: "Classroom Reading",
    badgeColor: "violet",
  },
  {
    icon: HeartHandshake,
    title: "Independent Family Mode",
    description:
      "Independent parents can register directly, create child profiles, build a family library, and track reading at home.",
    gradient: "from-amber-500 to-orange-500",
    badge: "Family Reading",
    badgeColor: "amber",
  },
];

const familyFeatures = [
  {
    icon: BookOpen,
    title: "Personal Reading Journey",
    description: "Create your own reading path with personalized story recommendations based on interests and reading level.",
  },
  {
    icon: HeartHandshake,
    title: "Family Dashboard",
    description: "Track reading progress across multiple children, set goals, and celebrate achievements together.",
  },
  {
    icon: Clock3,
    title: "Evening Reading Flow",
    description: "Pick books for home reading, continue where your child stopped, and keep a steady family reading rhythm.",
  },
  {
    icon: Trophy,
    title: "Reading Rewards",
    description: "Earn badges and achievements as you complete stories, quizzes, and activities.",
  },
];

const roleCards = [
  {
    title: "School Admin",
    icon: School,
    description: "Manage your school's content catalog, teacher accounts, and view school-wide reading metrics.",
    features: [
      "Content approval workflow",
      "Teacher management",
      "School analytics",
      "Subscription control",
    ],
    color: "cyan",
    cta: "School Admin",
    href: "/register?role=school",
  },
  {
    title: "Teacher",
    icon: Users,
    description: "Focus on what matters—your students. Assign, track, and support reading growth.",
    features: [
      "Class-specific metrics",
      "Assignment tracking",
      "Student progress alerts",
      "Reading library access",
    ],
    color: "emerald",
    cta: "Teacher Sign Up",
    href: "/register?role=teacher",
  },
  {
    title: "Family",
    icon: HeartHandshake,
    description: "Register as an independent family and manage home reading for your children directly.",
    features: [
      "Multiple child profiles",
      "Family library",
      "Progress tracking",
      "Home reading dashboard",
    ],
    color: "amber",
    cta: "Register as Family",
    href: "/family/register",
    isFamily: true,
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Choose",
    description: "Schools or families pick the reading products that fit their learners.",
    icon: LibraryBig,
    role: "School / Family",
  },
  {
    number: "02",
    title: "Assign",
    description: "Teachers assign reading to classes, or parents guide reading at home.",
    icon: Target,
    role: "Teacher / Parent",
  },
  {
    number: "03",
    title: "Read",
    description: "Students and family readers move through stories, quizzes, and activities.",
    icon: BookOpen,
    role: "Reader",
  },
  {
    number: "04",
    title: "Track",
    description: "Teachers and parents monitor progress, scores, and support needs.",
    icon: Trophy,
    role: "Support",
  },
];

const fallbackPlans: BillingPlanDefinition[] = [
  {
    key: "school_starter",
    title: "School Starter",
    subtitle: "For smaller schools getting started.",
    description: "A clean starting plan for schools that want reading, assignments, and teacher tools in one place.",
    maxBooks: 20,
    isUnlimited: false,
    features: ["School catalog access", "Teacher dashboard", "Assignments and notifications"],
  },
  {
    key: "school_growth",
    title: "School Growth",
    subtitle: "For growing school programs.",
    description: "Built for schools expanding classroom reading, tracking, and stronger learning routines.",
    maxBooks: 50,
    isUnlimited: false,
    features: ["Everything in Starter", "Better scaling for active classes", "Stronger reading operations"],
  },
  {
    key: "school_premium",
    title: "School Premium",
    subtitle: "For full school rollout.",
    description: "The fullest school plan for teams that want the strongest PathSpring experience across the school.",
    maxBooks: null,
    isUnlimited: true,
    features: ["Everything in Growth", "Best fit for large rollout", "Premium school experience"],
  },
  {
    key: "family_starter",
    title: "Family Starter",
    subtitle: "For independent families.",
    description: "Create child profiles, build a home library, and track reading progress together as a family.",
    maxBooks: 20,
    isUnlimited: false,
    features: ["Family library", "Child profiles", "At-home reading progress"],
  },
  {
    key: "family_premium",
    title: "Family Premium",
    subtitle: "For unlimited family access.",
    description: "Unlock the full home library with unlimited reading for every child.",
    maxBooks: null,
    isUnlimited: true,
    features: ["Unlimited family library", "Family reading access", "Monthly new content"],
  },
];

type PlanBadgeColor = "violet" | "cyan" | "emerald" | "amber";

const planDisplayMeta: Record<string, { audience: string; badge: string; badgeColor: PlanBadgeColor; gradient: string; cta: string; href: string }> = {
  school_starter: {
    audience: "For smaller schools",
    badge: "School Plan",
    badgeColor: "cyan",
    gradient: "from-cyan-500 to-blue-500",
    cta: "Register Your School",
    href: "/register?role=school",
  },
  school_growth: {
    audience: "For growing school programs",
    badge: "Most Popular",
    badgeColor: "violet",
    gradient: "from-violet-500 to-fuchsia-500",
    cta: "Start School Setup",
    href: "/register?role=school",
  },
  school_premium: {
    audience: "For full school rollout",
    badge: "Top Tier",
    badgeColor: "emerald",
    gradient: "from-emerald-500 to-teal-500",
    cta: "Launch Premium School",
    href: "/register?role=school",
  },
  family_starter: {
    audience: "For independent families",
    badge: "Family Plan",
    badgeColor: "amber",
    gradient: "from-amber-500 to-orange-500",
    cta: "Register as Family",
    href: "/family/register",
  },
  family_premium: {
    audience: "For families who want it all",
    badge: "Family Premium",
    badgeColor: "amber",
    gradient: "from-amber-500 to-orange-500",
    cta: "Register as Family",
    href: "/family/register",
  },
};

const stats = [
  { value: "10K+", label: "Active Stories", icon: BookOpen },
  { value: "500+", label: "Partner Schools", icon: School },
  { value: "98%", label: "Teacher Satisfaction", icon: Star },
  { value: "50K+", label: "Active Families", icon: HeartHandshake },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [billingPlans, setBillingPlans] = useState<BillingPlanDefinition[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    void getPublicBillingPlans()
      .then((items) => setBillingPlans(items))
      .catch(() => setBillingPlans([]));
  }, []);

  const navLinks = useMemo(
    () => [
      { href: "#features", label: "Features" },
      { href: "#plans", label: "Plans" },
      { href: "#for-families", label: "For Families" },
      { href: "#workflow", label: "How It Works" },
      { href: "#roles", label: "Get Started" },
    ],
    [],
  );

  const badgeColorMap = {
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  } as const;

  const planOrder = ["school_starter", "school_growth", "school_premium", "family_starter", "family_premium"];
  const visiblePlans = (billingPlans.length ? billingPlans : fallbackPlans)
    .filter((plan) => Boolean(planDisplayMeta[plan.key]))
    .sort((a, b) => planOrder.indexOf(a.key) - planOrder.indexOf(b.key));

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-violet-200/30 to-fuchsia-200/30 blur-3xl dark:from-violet-500/20 dark:to-fuchsia-500/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-cyan-200/30 to-blue-200/30 blur-3xl dark:from-cyan-500/20 dark:to-blue-500/20" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-200/20 to-orange-200/20 blur-3xl dark:from-amber-500/10 dark:to-orange-500/10" />
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-slate-200/20 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50 blur-lg group-hover:opacity-75" />
              <div className="relative rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 p-2.5 shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">PathSpring</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Reading Intelligence
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/family/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02]"
            >
              <HeartHandshake className="h-4 w-4" />
              Register as Family
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-b border-slate-200 bg-white px-4 py-6 dark:border-white/10 dark:bg-slate-950 lg:hidden"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              <div className="grid grid-cols-[auto_1fr_1fr] gap-3 pt-4">
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 p-1 dark:border-white/10 dark:bg-white/5">
                  <ThemeToggle />
                </div>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/family/register"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Register Family
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 dark:border-violet-500/20 dark:bg-violet-500/10"
              >
                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  For Schools & Families
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
              >
                The reading platform
                <span className="mt-2 block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
                  for every reader
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300"
              >
                Whether you're a school looking to transform reading instruction or a family wanting to nurture a love of reading, PathSpring has you covered.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/family/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02]"
                >
                  <HeartHandshake className="h-5 w-5" />
                  Register as Independent Family
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/register?role=school"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02]"
                >
                  <School className="h-5 w-5" />
                  Launch Your School
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
              >
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white/50 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                      <Icon className="mb-2 h-5 w-5 text-violet-600 dark:text-violet-400" />
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-amber-500/20 blur-3xl" />
              <div className="relative rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <School className="h-5 w-5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">School Admin</span>
                      </div>
                      <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-semibold">School Library</span>
                    </div>
                    <p className="mt-3 text-xl font-bold">Choose the right books for your school</p>
                    <p className="mt-2 text-sm text-white/80">Browse the catalog, approve products, and make the right stories available to teachers and students.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                      <Users className="mb-3 h-6 w-6 text-cyan-500" />
                      <p className="font-semibold">Teacher Reading Sessions</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Teacher-led, group, and buddy reading for class time</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                      <HeartHandshake className="mb-3 h-6 w-6 text-amber-500" />
                      <p className="font-semibold">Independent Family Mode</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Create child profiles and build a home reading library</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Platform Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Platform Capabilities
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Built for every role in the
              <span className="block text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text">
                reading ecosystem
              </span>
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              From content creators to families, PathSpring provides tailored experiences for everyone.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {platformFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-shadow hover:shadow-xl dark:border-white/10 dark:bg-white/5"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-5`} />
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex rounded-xl bg-gradient-to-r ${feature.gradient} p-3 shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeColorMap[feature.badgeColor as keyof typeof badgeColorMap]}`}>
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold">{feature.title}</h3>
                  <p className="mt-3 text-slate-600 dark:text-slate-300">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="plans" className="bg-gradient-to-b from-white to-slate-50 px-4 py-24 dark:from-slate-950 dark:to-slate-900/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Plans
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Flexible plans for schools
              <span className="block bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
                and independent families
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
              Start with the plan that matches your reading journey. Schools can scale from starter to premium, and families can begin with a focused home-reading plan.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {visiblePlans.map((plan, idx) => {
              const meta = planDisplayMeta[plan.key];
              const planDescription =
                plan.description ??
                plan.subtitle ??
                "A reading plan tailored for this audience.";

              return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-2xl dark:border-white/10 dark:bg-white/5"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${meta.gradient}`} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      {meta.audience}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold">{plan.title}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeColorMap[meta.badgeColor]}`}>
                    {meta.badge}
                  </span>
                </div>

                <p className="mt-4 min-h-[4.5rem] text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {planDescription}
                </p>

                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {plan.isUnlimited
                    ? "Unlimited books"
                    : typeof plan.maxBooks === "number"
                      ? `Up to ${plan.maxBooks} books`
                      : "Book limit varies"}
                </p>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={meta.href}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${meta.gradient} px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all group-hover:scale-[1.01]`}
                >
                  {meta.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* For Families Section */}
      <section id="for-families" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 dark:bg-amber-500/10">
              <HeartHandshake className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">For Families</span>
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Nurture a love of reading
              <span className="block text-transparent bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text">
                together as a family
              </span>
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Create a family account to manage reading for your children, track progress, and celebrate achievements.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {familyFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all hover:shadow-xl hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="inline-flex rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              href="/family/register"
              className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02]"
            >
              <HeartHandshake className="h-5 w-5" />
              Register as Independent Family
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Family login uses the normal sign-in page. <Link href="/login" className="text-amber-600 hover:underline dark:text-amber-400">Sign in here</Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              How It Works
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              From creation to reading success
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-4 md:grid-cols-5">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-white/10 dark:bg-white/5"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-bold text-white shadow-lg">
                      {step.number}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/10">
                      <Icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                  <span className="mt-3 inline-block rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-400">
                    {step.role}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="roles" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Choose Your Path
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to start your reading journey?
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Select the role that fits you best and join the PathSpring community.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {roleCards.map((role, idx) => {
              const Icon = role.icon;
              const colorMap = {
                violet: "from-violet-500 to-fuchsia-500",
                cyan: "from-cyan-500 to-blue-500",
                emerald: "from-emerald-500 to-teal-500",
                amber: "from-amber-500 to-orange-500",
              };
              return (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className={`rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-xl dark:border-white/10 dark:bg-white/5 ${role.isFamily ? "ring-2 ring-amber-500/20" : ""}`}
                >
                  <div className={`inline-flex rounded-xl bg-gradient-to-r ${colorMap[role.color as keyof typeof colorMap]} p-3 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{role.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{role.description}</p>
                  <div className="mt-5 space-y-2">
                    {role.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={role.href}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      role.isFamily
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                    }`}
                  >
                    {role.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-600 p-12 text-center shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Start Your Reading Journey
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Join PathSpring today
              </h2>
              <p className="mt-4 mx-auto max-w-2xl text-lg text-white/90">
                Whether you're a school, teacher, or family, we're here to help you create better readers.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/family/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-amber-600 transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  <HeartHandshake className="h-5 w-5" />
                  Register as Family
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/register?role=school"
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  <School className="h-5 w-5" />
                  Join as School
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <p className="mt-6 text-sm text-white/70">
                Already have an account? <Link href="/login" className="font-semibold underline hover:text-white">Sign in</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
