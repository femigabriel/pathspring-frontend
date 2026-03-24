// app/premium-admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Plus,
  Wand2,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ============ API CONFIGURATION ============
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ============ STAT CARD COMPONENT ============
const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg border border-white/10`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/10 rounded-lg">{Icon}</div>
        {trend && <span className="text-sm font-bold text-green-200">↑ {trend}</span>}
      </div>
      <p className="text-slate-200 text-sm font-medium">{label}</p>
      <p className="text-4xl font-black mt-2">{value}</p>
    </motion.div>
  );
};

// ============ NAVIGATION SIDEBAR ============
const Sidebar = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "content", label: "Content Library", icon: BookOpen },
    { id: "generate", label: "Generate Story", icon: Wand2 },
    { id: "schools", label: "Manage Schools", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-6 left-6 z-50 lg:hidden p-2 bg-purple-600 text-white rounded-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed inset-0 z-40 lg:relative lg:w-64 bg-slate-950 border-r border-slate-800 overflow-y-auto transition-all ${
          isMobileOpen ? "w-64" : "w-0 lg:w-64"
        }`}
      >
        <div className="p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12 mt-12 lg:mt-0">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-lg text-white">PathSpring</p>
              <p className="text-xs text-purple-400">Premium Admin</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2 mb-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Settings & Logout */}
          <div className="border-t border-slate-800 pt-6 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all">
              <Settings size={20} />
              <span className="font-semibold">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-white hover:bg-red-900/20 transition-all"
            >
              <LogOut size={20} />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

// ============ OVERVIEW TAB ============
const OverviewTab = () => {
  const [stats, setStats] = useState({
    totalSchools: 1200,
    totalStories: 450,
    activeUsers: 50000,
    monthlyRevenue: "₦2.5M",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back, Platform Admin! 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Active Schools"
          value={stats.totalSchools}
          trend="12%"
          color="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          label="Total Stories"
          value={stats.totalStories}
          trend="8%"
          color="from-purple-500 to-pink-500"
          delay={0.1}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Active Users"
          value={`${stats.activeUsers / 1000}K+`}
          trend="15%"
          color="from-green-500 to-emerald-500"
          delay={0.2}
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Monthly Revenue"
          value={stats.monthlyRevenue}
          trend="22%"
          color="from-orange-500 to-red-500"
          delay={0.3}
        />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800"
      >
        <h2 className="text-2xl font-black text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "New school registered", school: "Crown Academy Lagos", time: "2 hours ago" },
            { action: "Story published", school: "100+ stories now available", time: "1 day ago" },
            { action: "System update", school: "Performance improved by 20%", time: "3 days ago" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
              <Zap className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-white">{activity.action}</p>
                <p className="text-sm text-slate-400">{activity.school}</p>
              </div>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// ============ GENERATE STORY TAB ============
const GenerateStoryTab = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<any>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "Tolu and the Whispering Drum",
    ageRangeMin: 8,
    ageRangeMax: 12,
    gradeLevels: "Primary 4, Primary 5",
    theme: "courage",
    topic: "A child discovers that courage means speaking up when others are afraid",
    tone: "emotionally rich, adventurous, warm",
    setting: "A lively Nigerian primary school and neighborhood in Lagos",
    moralLesson: "Doing the right thing may be scary, but courage helps others too",
    difficulty: "intermediate",
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    setGeneratedStory(null);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/api/v1/platform/content/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            ageRangeMin: parseInt(formData.ageRangeMin.toString()),
            ageRangeMax: parseInt(formData.ageRangeMax.toString()),
            gradeLevels: formData.gradeLevels.split(",").map((g) => g.trim()),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate story");
      }

      setGeneratedStory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
          <Wand2 className="w-10 h-10" />
          AI Story Generator
        </h1>
        <p className="text-slate-400">Generate beautiful, culturally-rich stories powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 h-fit"
        >
          <h2 className="text-xl font-black text-white mb-6">Story Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Story Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Age Min
                </label>
                <input
                  type="number"
                  value={formData.ageRangeMin}
                  onChange={(e) =>
                    setFormData({ ...formData, ageRangeMin: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Age Max
                </label>
                <input
                  type="number"
                  value={formData.ageRangeMax}
                  onChange={(e) =>
                    setFormData({ ...formData, ageRangeMax: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Theme
              </label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Moral Lesson
              </label>
              <textarea
                value={formData.moralLesson}
                onChange={(e) =>
                  setFormData({ ...formData, moralLesson: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Generating Story...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Generate Story
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800"
        >
          <h2 className="text-xl font-black text-white mb-6">Generated Story Preview</h2>

          {generatedStory ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">
                  {generatedStory.title || "Story Title"}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {generatedStory.description || formData.topic}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm font-semibold text-slate-300 mb-2">Story Preview:</p>
                <p className="text-slate-300 line-clamp-6">
                  {generatedStory.content || "Story content will appear here..."}
                </p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Publish Story
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-bold hover:bg-slate-600 transition-all"
                >
                  Edit & Refine
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <Sparkles className="w-16 h-16 text-purple-400 mb-4 opacity-50" />
              <p className="text-slate-400">
                Generate a story to see the preview here
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ============ CONTENT LIBRARY TAB ============
const ContentLibraryTab = () => {
  const stories = [
    { id: 1, title: "Tolu's Courage", author: "AI Generated", date: "Jan 15, 2026", status: "published" },
    { id: 2, title: "The Kind Dragon", author: "AI Generated", date: "Jan 12, 2026", status: "published" },
    { id: 3, title: "Friendship Powers", author: "AI Generated", date: "Jan 10, 2026", status: "draft" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Content Library</h1>
          <p className="text-slate-400">Manage all published and draft stories</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus size={20} />
          New Story
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-300">Title</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-300">Author</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-300">Status</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-semibold">{story.title}</td>
                  <td className="px-6 py-4 text-slate-400">{story.author}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{story.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        story.status === "published"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {story.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-purple-400 hover:text-purple-300 font-semibold text-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

// ============ MAIN DASHBOARD ============
export default function PremiumAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== "PLATFORM_ADMIN") {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "generate" && <GenerateStoryTab />}
          {activeTab === "content" && <ContentLibraryTab />}
          {activeTab === "schools" && (
            <div className="text-white">
              <h1 className="text-4xl font-black mb-4">Manage Schools</h1>
              <p className="text-slate-400">Coming soon...</p>
            </div>
          )}
          {activeTab === "analytics" && (
            <div className="text-white">
              <h1 className="text-4xl font-black mb-4">Analytics</h1>
              <p className="text-slate-400">Coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}