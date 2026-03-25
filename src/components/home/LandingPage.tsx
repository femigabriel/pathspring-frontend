"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "@/src/components/admin/layout/ThemeToggle";
import {
  ArrowRight,
  Bell,
  BookOpen,
  BookOpenCheck,
  Brain,
  Building2,
  CheckCircle2,
  Crown,
  GraduationCap,
  HeartHandshake,
  LibraryBig,
  Menu,
  School,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const productPillars = [
  {
    icon: Crown,
    title: "Premium Story Studio",
    body:
      "Generate premium story bundles with chapters, quiz, game, activities, SEL focus, and AI images from one admin workspace.",
    accent:
      "from-fuchsia-500 to-rose-500",
  },
  {
    icon: Building2,
    title: "School Product Catalog",
    body:
      "Platform content works like products. Schools browse the catalog, select approved titles, and unlock only what they want teachers and students to use.",
    accent:
      "from-cyan-500 to-sky-500",
  },
  {
    icon: GraduationCap,
    title: "Teacher Command View",
    body:
      "Teachers manage only their own class, assign reading, follow assignment tracking, see low-score alerts, and monitor live completions.",
    accent:
      "from-emerald-500 to-teal-500",
  },
  {
    icon: HeartHandshake,
    title: "Family Follow-Through",
    body:
      "Parents get linked accounts, child overviews, notifications, and a clean portal to follow reading progress without using the child login.",
    accent:
      "from-amber-500 to-orange-500",
  },
];

const featureColumns = [
  {
    title: "For Schools",
    icon: School,
    items: [
      "School admin dashboard with live data",
      "School product catalog and selected library",
      "Story assignment workflow for classes or selected students",
      "Notifications for admins, teachers, parents, and students",
      "Submission review and scoreboard views",
    ],
  },
  {
    title: "For Teachers",
    icon: Users,
    items: [
      "Teacher-only dashboard with class-scoped metrics",
      "My students and my class visibility only",
      "Assignment tracking with per-student progress",
      "Reading library and story book access",
      "Student account creation and parent linking",
    ],
  },
  {
    title: "For Students",
    icon: BookOpenCheck,
    items: [
      "Child-friendly dashboard and bookshelf",
      "Story reader with voice support and improved mobile layout",
      "Separate quiz and activity pages per book",
      "SEL Corner for emotional learning themes",
      "Grade-level filtering so readers only see the right books",
    ],
  },
  {
    title: "For Parents",
    icon: HeartHandshake,
    items: [
      "Read-only portal with child overview",
      "Linked child credentials hidden by default",
      "Notifications inbox for school updates",
      "Progress snapshots and reading summaries",
      "Safe visibility into what the child is learning",
    ],
  },
];

const workflows = [
  {
    step: "01",
    title: "Create",
    body:
      "Premium admins generate story products with quiz, activities, SEL, and image-ready chapters.",
  },
  {
    step: "02",
    title: "Select",
    body:
      "School admins browse the platform catalog and choose which products belong in their school library.",
  },
  {
    step: "03",
    title: "Assign",
    body:
      "Teachers and admins assign stories to a class or selected students with due dates and notes.",
  },
  {
    step: "04",
    title: "Learn",
    body:
      "Students read, answer quizzes, complete activities, and build reading confidence inside a guided story flow.",
  },
  {
    step: "05",
    title: "Track",
    body:
      "Teachers and parents get notifications, completions, low-score alerts, and progress tracking that actually supports action.",
  },
];

const trustPoints = [
  "Role-based access for platform admin, school admin, teacher, student, and parent",
  "School-selected content model to control what each school can access",
  "Theme-ready dashboards across admin, teacher, student, and parent experiences",
  "Responsive experience across desktop, tablet, and mobile",
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = useMemo(
    () => [
      { href: "#features", label: "Features" },
      { href: "#workflows", label: "Workflow" },
      { href: "#roles", label: "Roles" },
      { href: "#security", label: "Trust" },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_24%),linear-gradient(180deg,#fffdf6_0%,#f7fbff_52%,#eef7ff_100%)] text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,#020617_0%,#071122_52%,#0f172a_100%)] dark:text-white">
      <nav
        className={`sticky top-0 z-50 border-b transition-all ${
          isScrolled
            ? "border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-orange-400 p-3 shadow-lg shadow-cyan-500/20">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-black">PathSpring</p>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
                Reading Intelligence for Schools
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-transform hover:scale-[1.02]"
            >
              Start Now
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-slate-950 lg:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/login"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-orange-400 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Start Now
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-300"
            >
              <Sparkles size={16} />
              <span>Built for premium reading, school control, and child engagement</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl"
            >
              The reading platform that{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-orange-400 bg-clip-text text-transparent">
                schools trust
              </span>{" "}
              and kids actually want to use.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300"
            >
              PathSpring combines premium story generation, school product selection,
              teacher assignment tracking, student reading journeys, SEL learning,
              and parent visibility in one modern literacy system.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-orange-400 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-cyan-500/25 transition-transform hover:scale-[1.02]"
              >
                Launch Your School Workspace
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Explore Existing Portals
              </Link>
            </motion.div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Premium story bundles", icon: Crown },
                { label: "School product catalog", icon: Building2 },
                { label: "Teacher tracking", icon: Trophy },
                { label: "Parent portal", icon: HeartHandshake },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-100 p-2 dark:bg-white/10">
                        <Icon size={18} className="text-slate-700 dark:text-slate-200" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-orange-400/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-sky-950 to-cyan-950 p-5 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                    <Crown size={12} />
                    <span>Premium</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-black">Create richer story products faster.</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Generate chapters, quizzes, games, activities, SEL themes, and AI images in one product flow.
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <BookOpenCheck size={12} />
                    <span>Student Journey</span>
                  </div>
                  <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">Readers move from book to quiz to activity smoothly.</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Child-friendly dashboards, grade-level filtering, reading tools, SEL Corner, and mobile-ready flows keep the experience clear.
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    <Users size={12} />
                    <span>Teacher Ops</span>
                  </div>
                  <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">Assign, track, and intervene with confidence.</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Teachers see only their class, follow assignment progress, spot low scores, and get action-ready alerts.
                  </p>
                </div>

                <div className="rounded-[1.75rem] bg-gradient-to-br from-orange-400 to-rose-500 p-5 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    <Bell size={12} />
                    <span>Family Visibility</span>
                  </div>
                  <h3 className="mt-4 text-xl font-black">Parents stay informed without sharing child logins.</h3>
                  <p className="mt-3 text-sm leading-6 text-white/90">
                    Linked parent accounts, notifications, progress snapshots, and child credentials hidden by default.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
              Real Features
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Everything your literacy program needs, already connected.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
              This is not just a story shelf. It is a product and delivery system for premium content,
              school adoption, classroom execution, student reading, and parent follow-through.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {productPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  whileHover={{ y: -6 }}
                  className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none"
                >
                  <div className={`inline-flex rounded-2xl bg-gradient-to-r ${pillar.accent} p-3 text-white shadow-lg`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{pillar.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{pillar.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="roles" className="border-y border-slate-200/70 bg-white/60 px-4 py-20 backdrop-blur dark:border-white/10 dark:bg-slate-950/35 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
              Designed By Role
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">
              One platform, five experiences, zero confusion.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {featureColumns.map((column) => {
              const Icon = column.icon;
              return (
                <div
                  key={column.title}
                  className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-100 p-3 dark:bg-white/10">
                      <Icon size={20} className="text-slate-700 dark:text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{column.title}</h3>
                  </div>
                  <div className="mt-5 space-y-3">
                    {column.items.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflows" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
              Product Workflow
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">
              A better flow from content creation to classroom impact.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-5">
            {workflows.map((item) => (
              <div
                key={item.step}
                className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
                  {item.step}
                </p>
                <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-white/70 bg-white/85 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                <Shield size={16} />
                <span>Built for trust</span>
              </div>
              <h2 className="mt-5 text-4xl font-black tracking-tight">
                Stronger control for schools. Safer visibility for families.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                PathSpring is structured around role-based access, school-selected content, private child credentials,
                and clear admin oversight so the platform feels professional to adults and safe for kids.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/40"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-500" />
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{point}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.8rem] bg-gradient-to-r from-cyan-500 via-sky-500 to-orange-400 p-10 text-white shadow-2xl shadow-cyan-500/25 sm:p-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">
              Ready to show your school what modern reading can feel like?
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Sell the reading vision before the first story even opens.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/90">
              From premium content teams to classrooms to parents at home, PathSpring helps every role see value quickly and use the product with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-sky-700 transition-transform hover:scale-[1.02]"
              >
                Create Your Workspace
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
