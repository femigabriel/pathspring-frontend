// app/premium-admin/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Eye,
  Send,
  Layers,
  Activity,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  Globe,
  School,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ============ API CONFIGURATION ============
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ============ TYPES ============
interface Story {
  _id: string;
  title: string;
  description: string;
  content: string;
  theme: string;
  ageRange: { min: number; max: number };
  gradeLevels: string[];
  status: "draft" | "published" | "archived";
  createdAt: string;
  activities?: Activity[];
  publication?: {
    scope: string;
    publishedAt: string;
    status: string;
  };
}

interface Activity {
  _id?: string;
  title: string;
  summary: string;
  instructions: string;
  estimatedDurationMinutes: number;
  activityType: string;
  materialsNeeded: string[];
  tasks: string[];
  teacherNotes?: string;
}

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
    totalStories: 0,
    activeUsers: 50000,
    monthlyRevenue: "₦2.5M",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoriesCount();
  }, []);

  const fetchStoriesCount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/platform/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats((prev) => ({ ...prev, totalStories: data.length || 0 }));
      }
    } catch (error) {
      console.error("Failed to fetch stories count:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-black text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="?tab=generate" className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-all">
            <Wand2 className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-bold text-white">Generate Story</h3>
            <p className="text-sm text-slate-400 mt-1">Create new AI-powered content</p>
          </Link>
          <Link href="?tab=content" className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all">
            <Send className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-bold text-white">Publish Content</h3>
            <p className="text-sm text-slate-400 mt-1">Distribute to all schools</p>
          </Link>
          <div className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-all cursor-pointer">
            <Activity className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-bold text-white">Add Activities</h3>
            <p className="text-sm text-slate-400 mt-1">Create premium activities</p>
          </div>
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
  const [success, setSuccess] = useState("");

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
    setSuccess("");
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
      setSuccess("Story generated successfully! You can now publish it to schools.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedStory?._id) return;
    
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/platform/content/${generatedStory._id}/publish-bundle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            publicationScope: "all_schools",
            status: "active",
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to publish");
      }

      setSuccess("Story published to all schools successfully!");
      setGeneratedStory((prev: any) => ({
        ...prev,
        status: "published",
        publication: { scope: "all_schools", status: "active" },
      }));
    } catch (err: any) {
      setError(err.message);
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

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-400">{success}</p>
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
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
                    {generatedStory.theme || formData.theme}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                    Ages {generatedStory.ageRange?.min || formData.ageRangeMin}-{generatedStory.ageRange?.max || formData.ageRangeMax}
                  </span>
                  {generatedStory.status === "published" && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                      <Globe size={12} /> Published
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 max-h-60 overflow-y-auto">
                <p className="text-sm font-semibold text-slate-300 mb-2">Story Content:</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {generatedStory.content || "Story content will appear here..."}
                </p>
              </div>

              <div className="flex gap-2">
                {generatedStory.status !== "published" ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePublish}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Publish to Schools
                  </motion.button>
                ) : (
                  <div className="flex-1 bg-green-600/30 text-green-400 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-green-500/30">
                    <CheckCircle size={20} />
                    Published
                  </div>
                )}
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
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail" | "activities">("list");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    title: "",
    summary: "",
    instructions: "",
    estimatedDurationMinutes: 20,
    activityType: "role_play",
    materialsNeeded: [],
    tasks: [],
    teacherNotes: "",
  });
  const [materialInput, setMaterialInput] = useState("");
  const [taskInput, setTaskInput] = useState("");

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/platform/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to fetch stories");
      
      const data = await response.json();
      // Handle both direct array and wrapped object responses
      const storiesArray = Array.isArray(data) ? data : data.data || data.results || data.stories || [];
      setStories(storiesArray);
    } catch (err: any) {
      setError(err.message);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFullPackage = async (storyId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/platform/content/${storyId}/full`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!response.ok) throw new Error("Failed to fetch full package");
      
      const data = await response.json();
      setSelectedStory(data);
      setActivities(data.activities || []);
      setViewMode("detail");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePublish = async (storyId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/platform/content/${storyId}/publish-bundle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            publicationScope: "all_schools",
            status: "active",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to publish");

      setStories((prev) =>
        prev.map((s) =>
          s._id === storyId
            ? { ...s, status: "published", publication: { scope: "all_schools", publishedAt: new Date().toISOString(), status: "active" } }
            : s
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddActivity = async () => {
    if (!selectedStory?._id) return;
    
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/platform/content/${selectedStory._id}/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newActivity),
        }
      );

      if (!response.ok) throw new Error("Failed to add activity");

      const data = await response.json();
      setActivities((prev) => [...prev, data]);
      setNewActivity({
        title: "",
        summary: "",
        instructions: "",
        estimatedDurationMinutes: 20,
        activityType: "role_play",
        materialsNeeded: [],
        tasks: [],
        teacherNotes: "",
      });
      setMaterialInput("");
      setTaskInput("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (viewMode === "detail" && selectedStory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setViewMode("list")}
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all"
          >
            <ChevronDown className="w-5 h-5 text-slate-400 rotate-90" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">{selectedStory.title}</h1>
            <p className="text-slate-400">Full Content Package</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Story Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Story Content
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedStory.status === "published"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {selectedStory.status}
                </span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedStory.content}
                </p>
              </div>
            </motion.div>

            {/* Activities Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Premium Activities ({activities.length})
                </h2>
                <button
                  onClick={() => setViewMode("activities")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
                >
                  + Add Activity
                </button>
              </div>
              
              {activities.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No activities attached to this story yet.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">{activity.title}</h3>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {activity.activityType}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{activity.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {activity.estimatedDurationMinutes} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers size={12} />
                          {activity.materialsNeeded?.length || 0} materials
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800"
            >
              <h3 className="font-bold text-white mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500">Theme:</span>
                  <span className="text-slate-300 ml-2 capitalize">{selectedStory.theme}</span>
                </div>
                <div>
                  <span className="text-slate-500">Age Range:</span>
                  <span className="text-slate-300 ml-2">{selectedStory.ageRange?.min}-{selectedStory.ageRange?.max}</span>
                </div>
                <div>
                  <span className="text-slate-500">Grades:</span>
                  <span className="text-slate-300 ml-2">{selectedStory.gradeLevels?.join(", ")}</span>
                </div>
                <div>
                  <span className="text-slate-500">Created:</span>
                  <span className="text-slate-300 ml-2">
                    {new Date(selectedStory.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {selectedStory.status !== "published" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePublish(selectedStory._id)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Publish to All Schools
              </motion.button>
            )}

            {selectedStory.publication && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-green-400">Published</span>
                </div>
                <p className="text-sm text-slate-400">
                  Scope: {selectedStory.publication.scope}
                </p>
                <p className="text-sm text-slate-400">
                  Published: {new Date(selectedStory.publication.publishedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "activities" && selectedStory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setViewMode("detail")}
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all"
          >
            <ChevronDown className="w-5 h-5 text-slate-400 rotate-90" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">Add Premium Activity</h1>
            <p className="text-slate-400">For: {selectedStory.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 space-y-4"
          >
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Activity Title</label>
              <input
                type="text"
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                placeholder="e.g., Drum of Courage Role-Play"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Summary</label>
              <input
                type="text"
                value={newActivity.summary}
                onChange={(e) => setNewActivity({ ...newActivity, summary: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                placeholder="Brief description of the activity"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Activity Type</label>
              <select
                value={newActivity.activityType}
                onChange={(e) => setNewActivity({ ...newActivity, activityType: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
              >
                <option value="role_play">Role Play</option>
                <option value="discussion">Discussion</option>
                <option value="worksheet">Worksheet</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="game">Game</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={newActivity.estimatedDurationMinutes}
                onChange={(e) => setNewActivity({ ...newActivity, estimatedDurationMinutes: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Instructions</label>
              <textarea
                value={newActivity.instructions}
                onChange={(e) => setNewActivity({ ...newActivity, instructions: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                placeholder="Step-by-step instructions for teachers..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Materials Needed</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={materialInput}
                  onChange={(e) => setMaterialInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (materialInput.trim()) {
                        setNewActivity({
                          ...newActivity,
                          materialsNeeded: [...(newActivity.materialsNeeded || []), materialInput.trim()],
                        });
                        setMaterialInput("");
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                  placeholder="Add material and press Enter"
                />
                <button
                  onClick={() => {
                    if (materialInput.trim()) {
                      setNewActivity({
                        ...newActivity,
                        materialsNeeded: [...(newActivity.materialsNeeded || []), materialInput.trim()],
                      });
                      setMaterialInput("");
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newActivity.materialsNeeded?.map((mat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm flex items-center gap-2">
                    {mat}
                    <button
                      onClick={() => setNewActivity({
                        ...newActivity,
                        materialsNeeded: newActivity.materialsNeeded?.filter((_, i) => i !== idx),
                      })}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Tasks</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (taskInput.trim()) {
                        setNewActivity({
                          ...newActivity,
                          tasks: [...(newActivity.tasks || []), taskInput.trim()],
                        });
                        setTaskInput("");
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                  placeholder="Add task and press Enter"
                />
                <button
                  onClick={() => {
                    if (taskInput.trim()) {
                      setNewActivity({
                        ...newActivity,
                        tasks: [...(newActivity.tasks || []), taskInput.trim()],
                      });
                      setTaskInput("");
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {newActivity.tasks?.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg">
                    <span className="text-purple-400 font-bold">{idx + 1}.</span>
                    <span className="text-slate-300 flex-1">{task}</span>
                    <button
                      onClick={() => setNewActivity({
                        ...newActivity,
                        tasks: newActivity.tasks?.filter((_, i) => i !== idx),
                      })}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Teacher Notes</label>
              <textarea
                value={newActivity.teacherNotes}
                onChange={(e) => setNewActivity({ ...newActivity, teacherNotes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                placeholder="Additional notes for teachers..."
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddActivity}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Activity to Story
            </motion.button>
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Preview</h3>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h4 className="text-xl font-bold text-white mb-2">{newActivity.title || "Activity Title"}</h4>
              <p className="text-slate-400 mb-4">{newActivity.summary || "Activity summary will appear here..."}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock size={16} className="text-blue-400" />
                  {newActivity.estimatedDurationMinutes} minutes
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Activity size={16} className="text-purple-400" />
                  {newActivity.activityType}
                </div>
              </div>

              {newActivity.tasks && newActivity.tasks.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-bold text-slate-300 mb-2">Tasks:</h5>
                  <ul className="space-y-1">
                    {newActivity.tasks.map((task, idx) => (
                      <li key={idx} className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Content Library</h1>
          <p className="text-slate-400">Manage all generated stories and premium content</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = "?tab=generate"}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus size={20} />
          New Story
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

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
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-300">Theme</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-300">Age Range</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-300">Status</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Loading stories...
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No stories found. Generate your first story!
                  </td>
                </tr>
              ) : (
                stories.map((story) => (
                  <tr key={story._id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-semibold">{story.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 capitalize">{story.theme}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {story.ageRange?.min}-{story.ageRange?.max} years
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          story.status === "published"
                            ? "bg-green-500/20 text-green-400"
                            : story.status === "draft"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {story.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => fetchFullPackage(story._id)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                          title="View Full Package"
                        >
                          <Eye size={18} />
                        </button>
                        {story.status !== "published" && (
                          <button
                            onClick={() => handlePublish(story._id)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-all"
                            title="Publish to Schools"
                          >
                            <Send size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

    // Check URL params for tab
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["overview", "content", "generate", "schools", "analytics"].includes(tab)) {
      setActiveTab(tab);
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