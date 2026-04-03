"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  PencilLine,
  Filter,
  Image as ImageIcon,
  Layers,
  LogOut,
  Menu,
  Plus,
  School,
  Send,
  Settings,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Wand2,
  RotateCcw,
  Crown,
  X,
  ChevronRight,
  Zap,
  Eye,
  FolderOpen,
  ChevronLeft,
  Clock,
  Target,
  Bookmark,
  MessageSquare,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { clearAuthSession, getStoredUser } from "@/src/lib/auth";
import {
  deletePlatformStory,
  createPlatformStoryActivity,
  generatePlatformContentPackage,
  generatePlatformStoryImages,
  getPlatformContentAnalytics,
  getPlatformContentBundle,
  getPlatformContentItems,
  getPlatformSchools,
  publishPlatformContentBundle,
  regeneratePlatformStory,
  updatePlatformStory,
  type PlatformActivity,
  type PlatformAnalyticsResponse,
  type PlatformBundle,
  type PlatformContentItem,
  type PlatformSchool,
} from "@/src/lib/platform-api";
import { prettifySelFocus, selFocusDescriptions, selFocusOptions } from "@/src/lib/sel-focus";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";

type PremiumTab = "overview" | "content" | "generate" | "schools" | "analytics";

const tabs: Array<{ id: PremiumTab; label: string; icon: typeof BarChart3; description: string }> = [
  { id: "overview", label: "Overview", icon: BarChart3, description: "Platform insights at a glance" },
  { id: "content", label: "Content Library", icon: BookOpen, description: "Manage your premium stories" },
  { id: "generate", label: "Generate Story", icon: Wand2, description: "Create new premium bundles" },
  { id: "schools", label: "Manage Schools", icon: Users, description: "School partnerships" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, description: "Performance metrics" },
];

const isPremiumTab = (value: string | null): value is PremiumTab =>
  tabs.some((tab) => tab.id === value);

const getBundleId = (bundle: PlatformBundle | null) =>
  bundle?.contentPack?._id ?? bundle?.requestedContent?._id ?? bundle?.story?.content._id ?? "";

const getBundleTitle = (bundle: PlatformBundle | null) =>
  bundle?.contentPack?.title ?? bundle?.story?.content.title ?? bundle?.requestedContent?.title ?? "Untitled Bundle";

const getStoryId = (bundle: PlatformBundle | null) =>
  bundle?.story?.content._id ??
  (bundle?.requestedContent?.type === "STORY" ? bundle.requestedContent._id : "") ??
  "";

const prettyDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently updated";

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function PremiumAdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [contentItems, setContentItems] = useState<PlatformContentItem[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<PlatformBundle | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [analytics, setAnalytics] = useState<PlatformAnalyticsResponse>({
    overview: {
      totalContents: 0,
      stories: 0,
      quizzes: 0,
      games: 0,
      activities: 0,
      contentPacks: 0,
      publishedContents: 0,
    },
    engagementSummary: [],
  });
  const [schools, setSchools] = useState<PlatformSchool[]>([]);
  const [loading, setLoading] = useState({ content: true, analytics: true, schools: true });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [schoolsNotice, setSchoolsNotice] = useState("");
  const [generating, setGenerating] = useState(false);
  const [publishingId, setPublishingId] = useState("");
  const [openingId, setOpeningId] = useState("");
  const [generatingImagesId, setGeneratingImagesId] = useState("");
  const [addingActivity, setAddingActivity] = useState(false);
  const [editingStory, setEditingStory] = useState(false);
  const [savingStory, setSavingStory] = useState(false);
  const [regeneratingStory, setRegeneratingStory] = useState(false);
  const [deletingStory, setDeletingStory] = useState(false);
  const [selFocusFilter, setSelFocusFilter] = useState<string[]>([]);
  const [draft, setDraft] = useState({
    title: "Tolu and the Whispering Drum",
    ageRangeMin: 8,
    ageRangeMax: 12,
    gradeLevels: "Primary 4, Primary 5",
    subject: "Language Arts",
    skillFocus: "Comprehension, Critical Thinking, Empathy",
    selFocus: "self-awareness, relationship-skills, responsible-decision-making",
    difficulty: "intermediate",
    language: "en",
    theme: "courage",
    topic: "A child discovers that courage means speaking up when others are afraid.",
    moralLesson: "Doing the right thing may be scary, but courage helps others too.",
  });
  const [activityDraft, setActivityDraft] = useState({
    title: "",
    summary: "",
    instructions: "",
    activityType: "story_extension",
    estimatedDurationMinutes: 20,
    materialsNeeded: "Story printout, pencils, paper",
    tasks:
      "Pick one scene from the story.\nAct it out in a small group.\nPause and discuss the brave choice.\nWrite one better choice and explain why.",
    teacherNotes: "",
  });
  const [storyEditDraft, setStoryEditDraft] = useState({
    title: "",
    summary: "",
    description: "",
    theme: "",
    selFocus: "",
    status: "draft",
  });
  const [regenerateDraft, setRegenerateDraft] = useState({
    theme: "",
    selFocus: "",
    chapterCount: 6,
    tone: "emotionally rich, child-friendly, page-turning, deeply engaging",
    customPromptNotes:
      "Write a much stronger, fuller story with meaningful dialogue, better scene flow, richer emotional development, and substantial chapters for a premium children reading experience.",
    clearCoverImage: false,
  });

  const activeTab = isPremiumTab(searchParams.get("tab")) ? searchParams.get("tab") : "overview";
  const currentUser = getStoredUser();
  const premiumEmail = currentUser?.email ?? "premium@pathspring.ai";
  const premiumName = currentUser?.fullName ?? "Platform Admin";
  const premiumInitial = premiumEmail.charAt(0).toUpperCase();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const libraryItems = useMemo(() => {
    const stories = contentItems.filter((item) => item.type === "STORY");
    return stories.length > 0 ? stories : contentItems;
  }, [contentItems]);

  const publishedBundles = useMemo(
    () => libraryItems.filter((item) => item.status === "published").length,
    [libraryItems],
  );

  const activeSchools = useMemo(
    () => schools.filter((school) => (school.status ?? "active").toLowerCase() !== "inactive").length,
    [schools],
  );

  const navigateTo = (tab: PremiumTab) => {
    setSidebarOpen(false);
    router.push(`/premium-admin/dashboard?tab=${tab}`, { scroll: false });
  };

  const refreshData = async () => {
    setError("");
    setLoading({ content: true, analytics: true, schools: true });

    const [contentResult, analyticsResult, schoolsResult] = await Promise.allSettled([
      getPlatformContentItems({
        type: "STORY",
        selFocus: selFocusFilter,
      }),
      getPlatformContentAnalytics(),
      getPlatformSchools(),
    ]);

    if (contentResult.status === "fulfilled") {
      setContentItems(contentResult.value);
    } else {
      setContentItems([]);
      setError(contentResult.reason instanceof Error ? contentResult.reason.message : "Failed to load content.");
    }

    if (analyticsResult.status === "fulfilled") {
      setAnalytics(analyticsResult.value);
    }

    if (schoolsResult.status === "fulfilled") {
      setSchools(schoolsResult.value);
      setSchoolsNotice(schoolsResult.value.length === 0 ? "No schools were returned yet." : "");
    } else {
      setSchools([]);
      setSchoolsNotice(
        schoolsResult.reason instanceof Error
          ? schoolsResult.reason.message
          : "School data is not available right now.",
      );
    }

    setLoading({ content: false, analytics: false, schools: false });
  };

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== "PLATFORM_ADMIN") {
      router.replace("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    void refreshData();
  }, [authorized, selFocusFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current) return;
      if (!accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const story = selectedBundle?.story?.content;
    if (!story) return;

    setStoryEditDraft({
      title: story.title ?? "",
      summary: story.summary ?? "",
      description: story.description ?? "",
      theme: story.theme ?? "",
      selFocus: (story.selFocus ?? []).join(", "),
      status: story.status ?? "draft",
    });

    setRegenerateDraft((current) => ({
      ...current,
      theme: story.theme ?? current.theme,
      selFocus: (story.selFocus ?? []).join(", "),
    }));
  }, [selectedBundle]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setNotice("");

    try {
      const bundle = await generatePlatformContentPackage({
        title: draft.title,
        ageRangeMin: draft.ageRangeMin,
        ageRangeMax: draft.ageRangeMax,
        gradeLevels: draft.gradeLevels.split(",").map((item) => item.trim()).filter(Boolean),
        subject: draft.subject,
        skillFocus: draft.skillFocus.split(",").map((item) => item.trim()).filter(Boolean),
        selFocus: splitCsv(draft.selFocus),
        difficulty: draft.difficulty,
        estimatedStoryDurationMinutes: 20,
        language: draft.language,
        theme: draft.theme,
        topic: draft.topic,
        moralLesson: draft.moralLesson,
      });
      setSelectedBundle(bundle);
      setDrawerOpen(true);
      setNotice("Premium bundle generated successfully.");
      await refreshData();
      navigateTo("content");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate bundle.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (contentId: string) => {
    setPublishingId(contentId);
    setError("");
    setNotice("");
    try {
      const bundle = await publishPlatformContentBundle(contentId);
      if (getBundleId(bundle)) setSelectedBundle(bundle);
      setNotice("Bundle published successfully.");
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish bundle.");
    } finally {
      setPublishingId("");
    }
  };

  const handleOpenBundle = async (contentId: string) => {
    setOpeningId(contentId);
    setError("");
    try {
      const bundle = await getPlatformContentBundle(contentId);
      setSelectedBundle(bundle);
      setDrawerOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open bundle.");
    } finally {
      setOpeningId("");
    }
  };

  const handleAddActivity = async () => {
    const contentId = getBundleId(selectedBundle);
    if (!contentId) return;

    setAddingActivity(true);
    setError("");
    setNotice("");

    try {
      const activity = await createPlatformStoryActivity(contentId, {
        title: activityDraft.title,
        summary: activityDraft.summary,
        instructions: activityDraft.instructions || activityDraft.summary,
        estimatedDurationMinutes: activityDraft.estimatedDurationMinutes,
        activityType: activityDraft.activityType,
        materialsNeeded: activityDraft.materialsNeeded.split(",").map((item) => item.trim()).filter(Boolean),
        tasks: activityDraft.tasks.split("\n").map((item) => item.trim()).filter(Boolean),
        teacherNotes: activityDraft.teacherNotes,
      });

      if (activity) {
        setSelectedBundle((prev) =>
          prev
            ? {
                ...prev,
                activities: [...prev.activities, activity],
              }
            : prev,
        );
      }

      setActivityDraft({
        title: "",
        summary: "",
        instructions: "",
        activityType: "story_extension",
        estimatedDurationMinutes: 20,
        materialsNeeded: "Story printout, pencils, paper",
        tasks:
          "Pick one scene from the story.\nAct it out in a small group.\nPause and discuss the brave choice.\nWrite one better choice and explain why.",
        teacherNotes: "",
      });
      setNotice("Activity added successfully.");
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add activity.");
    } finally {
      setAddingActivity(false);
    }
  };

  const handleGenerateImages = async () => {
    const storyId = getStoryId(selectedBundle);
    const bundleId = getBundleId(selectedBundle);
    if (!storyId || !bundleId) return;

    setGeneratingImagesId(storyId);
    setError("");
    setNotice("");

    try {
      await generatePlatformStoryImages(storyId);
      const refreshedBundle = await getPlatformContentBundle(bundleId);
      setSelectedBundle(refreshedBundle);
      await refreshData();
      setNotice("Story images generated and attached successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate story images.");
    } finally {
      setGeneratingImagesId("");
    }
  };

  const handleSaveStory = async () => {
    if (!selectedStoryId) return;

    setSavingStory(true);
    setError("");
    setNotice("");

    try {
      await updatePlatformStory(selectedStoryId, {
        title: storyEditDraft.title.trim(),
        summary: storyEditDraft.summary.trim(),
        description: storyEditDraft.description.trim(),
        theme: storyEditDraft.theme.trim(),
        selFocus: splitCsv(storyEditDraft.selFocus),
        status: storyEditDraft.status.trim() || undefined,
      });

      const refreshedBundle = await getPlatformContentBundle(selectedStoryId);
      setSelectedBundle(refreshedBundle);
      await refreshData();
      setEditingStory(false);
      setNotice("Story updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update story.");
    } finally {
      setSavingStory(false);
    }
  };

  const handleRegenerateStory = async () => {
    if (!selectedStoryId) return;

    setRegeneratingStory(true);
    setError("");
    setNotice("");

    try {
      await regeneratePlatformStory(selectedStoryId, {
        theme: regenerateDraft.theme.trim() || undefined,
        selFocus: splitCsv(regenerateDraft.selFocus),
        chapterCount: regenerateDraft.chapterCount,
        tone: regenerateDraft.tone.trim() || undefined,
        customPromptNotes: regenerateDraft.customPromptNotes.trim() || undefined,
        clearCoverImage: regenerateDraft.clearCoverImage,
      });

      const refreshedBundle = await getPlatformContentBundle(selectedStoryId);
      setSelectedBundle(refreshedBundle);
      await refreshData();
      setNotice("Story regenerated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate story.");
    } finally {
      setRegeneratingStory(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!selectedStoryId) return;

    const shouldDelete =
      typeof window === "undefined"
        ? false
        : window.confirm("Delete this story? This action cannot be undone.");

    if (!shouldDelete) return;

    setDeletingStory(true);
    setError("");
    setNotice("");

    try {
      await deletePlatformStory(selectedStoryId);
      setSelectedBundle(null);
      setDrawerOpen(false);
      await refreshData();
      setNotice("Story deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete story.");
    } finally {
      setDeletingStory(false);
    }
  };

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-fuchsia-500/30 border-t-fuchsia-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-fuchsia-500/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const selectedStoryChapters = selectedBundle?.story?.chapters ?? [];
  const selectedStoryQuestions = selectedBundle?.story?.questions ?? [];
  const selectedQuizQuestions = selectedBundle?.quiz?.questions ?? [];
  const selectedActivities = selectedBundle?.activities ?? [];
  const selectedBundleId = getBundleId(selectedBundle);
  const selectedStoryId = getStoryId(selectedBundle);
  const selectedCoverImage = selectedBundle?.story?.content.coverImageUrl;
  const selectedSelFocus =
    selectedBundle?.story?.content.selFocus ??
    selectedBundle?.contentPack?.selFocus ??
    selectedBundle?.requestedContent?.selFocus ??
    [];

  const StatCard = ({ icon: Icon, label, value, loading: isLoading, gradient = false }: any) => (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10 ${gradient ? "bg-gradient-to-br from-fuchsia-500/10 via-transparent to-cyan-500/10" : ""}`}>
      <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-fuchsia-500/5 blur-2xl group-hover:bg-fuchsia-500/10 transition-all" />
      <Icon className="mb-4 h-5 w-5 text-fuchsia-400" />
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-white">
        {isLoading ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-white/10" /> : value}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-80 flex-col border-r border-white/5 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 p-2 shadow-lg transition-all group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">PathSpring</p>
              <p className="text-[10px] uppercase tracking-wider text-fuchsia-400">Premium Control</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg border border-white/10 p-2 transition-colors hover:bg-white/10 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {/* Navigation */}
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-fuchsia-400" : ""}`} />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{tab.label}</span>
                    <p className="text-xs text-slate-500">{tab.description}</p>
                  </div>
                  {active && <ChevronRight className="h-4 w-4 text-fuchsia-400" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/5 p-4">
          <button
            onClick={() => {
              clearAuthSession();
              router.replace("/login");
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 transition-colors hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="rounded-lg border border-white/10 p-2 transition-colors hover:bg-white/10 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-400">
                  Premium Workspace
                </p>
                <h1 className="text-xl font-bold tracking-tight">
                  {tabs.find((tab) => tab.id === activeTab)?.label ?? "Overview"}
                </h1>
                <p className="text-xs text-slate-500">
                  {tabs.find((tab) => tab.id === activeTab)?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshData()}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm transition-colors hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((current) => !current)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-sm font-bold text-white">
                    {premiumInitial}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="max-w-[11rem] truncate text-sm font-semibold text-white">{premiumName}</p>
                    <p className="max-w-[11rem] truncate text-xs text-slate-400">{premiumEmail}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {accountMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-72 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-base font-bold text-white">
                        {premiumInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{premiumName}</p>
                        <p className="truncate text-xs text-slate-400">{premiumEmail}</p>
                      </div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/10 px-2.5 py-1">
                      <Crown className="h-3 w-3 text-fuchsia-400" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-fuchsia-400">Platform Admin</span>
                    </div>
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          clearAuthSession();
                          router.replace("/login");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Notifications */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {notice && (
            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-sm text-emerald-400">{notice}</p>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-slate-900/50 to-cyan-500/10 p-8">
                <div className="flex items-center gap-2 text-fuchsia-400">
                  <Zap className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Platform Command Center</span>
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">
                  Premium Publishing Dashboard
                </h2>
                <p className="mt-3 max-w-2xl text-slate-400">
                  Generate full story bundles, inspect chapters and activities, and track rollout with live data.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Layers} label="Content Packs" value={loading.analytics ? "..." : analytics.overview.contentPacks} loading={loading.analytics} />
                <StatCard icon={Send} label="Published Contents" value={loading.analytics ? "..." : analytics.overview.publishedContents} loading={loading.analytics} />
                <StatCard icon={School} label="Connected Schools" value={loading.schools ? "..." : schools.length} loading={loading.schools} />
                <StatCard icon={Activity} label="Activities" value={loading.analytics ? "..." : analytics.overview.activities} loading={loading.analytics} gradient />
              </div>
            </div>
          )}

          {/* Generate Tab */}
          {activeTab === "generate" && (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Form Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-fuchsia-400" />
                  <h2 className="text-xl font-bold">Story Creation Studio</h2>
                </div>
                <p className="mb-6 text-sm text-slate-400">
                  Fill in the details below to generate a complete premium story bundle with SEL focus areas.
                </p>
                
                <div className="space-y-4">
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm outline-none transition-all focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500"
                    placeholder="Bundle title"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="number"
                      value={draft.ageRangeMin}
                      onChange={(e) => setDraft({ ...draft, ageRangeMin: Number(e.target.value) })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm outline-none focus:border-fuchsia-500"
                      placeholder="Min age"
                    />
                    <input
                      type="number"
                      value={draft.ageRangeMax}
                      onChange={(e) => setDraft({ ...draft, ageRangeMax: Number(e.target.value) })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm outline-none focus:border-fuchsia-500"
                      placeholder="Max age"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      value={draft.subject}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm outline-none focus:border-fuchsia-500"
                      placeholder="Subject"
                    />
                    <input
                      value={draft.theme}
                      onChange={(e) => setDraft({ ...draft, theme: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm outline-none focus:border-fuchsia-500"
                      placeholder="Theme"
                    />
                  </div>
                  
                  {/* SEL Focus Section */}
                  <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fuchsia-400">SEL Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {selFocusOptions.map((option) => {
                        const selected = splitCsv(draft.selFocus).includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => {
                                const nextValues = splitCsv(prev.selFocus);
                                return {
                                  ...prev,
                                  selFocus: nextValues.includes(option)
                                    ? nextValues.filter((v) => v !== option).join(", ")
                                    : [...nextValues, option].join(", "),
                                };
                              })
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                              selected
                                ? "bg-fuchsia-500 text-white"
                                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {prettifySelFocus(option)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <textarea
                    rows={3}
                    value={draft.topic}
                    onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm outline-none focus:border-fuchsia-500"
                    placeholder="Topic"
                  />
                  <textarea
                    rows={3}
                    value={draft.moralLesson}
                    onChange={(e) => setDraft({ ...draft, moralLesson: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm outline-none focus:border-fuchsia-500"
                    placeholder="Moral lesson"
                  />
                  
                  <button
                    onClick={() => void handleGenerate()}
                    disabled={generating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-6 py-3 font-semibold transition-all hover:shadow-lg hover:shadow-fuchsia-500/20 disabled:opacity-50"
                  >
                    <Wand2 className="h-5 w-5" />
                    {generating ? "Generating..." : "Generate Premium Bundle"}
                  </button>
                </div>
              </div>

              {/* Preview Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                {selectedBundle ? (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
                      <h3 className="text-2xl font-bold">{getBundleTitle(selectedBundle)}</h3>
                      <p className="mt-3 text-sm text-slate-400">
                        {selectedBundle.story?.content.summary ?? selectedBundle.story?.content.description ?? draft.topic}
                      </p>
                      {selectedSelFocus.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedSelFocus.map((item) => (
                            <span key={item} className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-medium text-fuchsia-300">
                              {prettifySelFocus(item)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Chapters</p>
                        <p className="mt-2 text-3xl font-bold">{selectedStoryChapters.length}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Activities</p>
                        <p className="mt-2 text-3xl font-bold">{selectedActivities.length}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => void handlePublish(selectedBundleId)}
                      disabled={!selectedBundleId || publishingId === selectedBundleId}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold transition-all hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                      {publishingId === selectedBundleId ? "Publishing..." : "Publish Bundle"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Sparkles className="mb-4 h-12 w-12 text-slate-600" />
                    <h3 className="text-lg font-semibold text-white">No Bundle Generated Yet</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Fill out the form and click generate to create your first premium bundle.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="space-y-8">
              {/* Library Header */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-fuchsia-400">
                      <FolderOpen className="h-5 w-5" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Content Library</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold">Premium Stories</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Browse and manage all your premium story bundles
                    </p>
                  </div>
                  <AppActionButton onClick={() => navigateTo("generate")} tone="primary">
                    <Plus className="h-4 w-4" />
                    <span>New Story</span>
                  </AppActionButton>
                </div>
                
                {/* Stats Grid */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="text-sm text-slate-400">Total Stories</p>
                    <p className="mt-1 text-2xl font-bold">{loading.content ? "..." : libraryItems.length}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="text-sm text-slate-400">Published</p>
                    <p className="mt-1 text-2xl font-bold">{loading.content ? "..." : publishedBundles}</p>
                  </div>
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <p className="text-sm text-slate-400">Active Filter</p>
                    <p className="mt-1 text-2xl font-bold">{selFocusFilter.length > 0 ? selFocusFilter.length : "All"}</p>
                  </div>
                </div>
                
                {/* Filter */}
                <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/30 p-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">Filter by SEL Focus</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selFocusOptions.map((option) => {
                      const selected = selFocusFilter.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setSelFocusFilter((current) =>
                              current.includes(option)
                                ? current.filter((v) => v !== option)
                                : [...current, option]
                            )
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            selected
                              ? "bg-cyan-500 text-white"
                              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {prettifySelFocus(option)}
                        </button>
                      );
                    })}
                    {selFocusFilter.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelFocusFilter([])}
                        className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Story Grid */}
              {loading.content ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/5" />
                  ))}
                </div>
              ) : libraryItems.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                  <h3 className="text-lg font-semibold text-white">No stories found</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {selFocusFilter.length > 0
                      ? "No stories match the selected SEL filters. Try clearing some filters."
                      : "Generate your first premium story to get started."}
                  </p>
                  {selFocusFilter.length > 0 && (
                    <button
                      onClick={() => setSelFocusFilter([])}
                      className="mt-4 rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {libraryItems.map((item) => {
                    const isActive = selectedBundleId === item._id || selectedStoryId === item._id;
                    return (
                      <article
                        key={item._id}
                        className={`group cursor-pointer rounded-xl border p-5 transition-all hover:border-white/20 hover:bg-white/5 ${
                          isActive && drawerOpen ? "border-fuchsia-500/50 bg-fuchsia-500/5" : "border-white/10 bg-white/5"
                        }`}
                        onClick={() => void handleOpenBundle(item._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white line-clamp-1">{item.title}</h3>
                            <p className="mt-1 text-xs text-slate-500">{prettyDate(item.updatedAt ?? item.createdAt)}</p>
                          </div>
                          <AppBadge label={item.status ?? "draft"} tone="slate" className="border-white/10 bg-white/10 text-xs" />
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                          <span>{item.subject ?? item.theme ?? "General"}</span>
                          <span>•</span>
                          <span>{item.type === "STORY" ? "Story" : "Bundle"}</span>
                        </div>
                        
                        {item.selFocus && item.selFocus.length > 0 && (
  <div className="mt-3 flex flex-wrap gap-1.5">
    {item.selFocus.slice(0, 2).map((focus) => (
                              <span key={focus} className="rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-medium text-fuchsia-400">
                                {prettifySelFocus(focus)}
                              </span>
                            ))}
                            {item.selFocus.length > 2 && (
                              <span className="text-[10px] text-slate-500">+{item.selFocus.length - 2}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Eye className="h-3 w-3" />
                            <span>View details</span>
                          </div>
                          {item.status !== "published" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void handlePublish(item._id);
                              }}
                              disabled={publishingId === item._id}
                              className="rounded-lg bg-emerald-600/20 px-3 py-1 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-600/30"
                            >
                              {publishingId === item._id ? "..." : "Publish"}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Schools Tab */}
          {activeTab === "schools" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="flex items-center gap-2 text-fuchsia-400">
                  <Users className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">School Management</span>
                </div>
                <h2 className="mt-3 text-3xl font-bold">Manage Partner Schools</h2>
                <p className="mt-2 max-w-2xl text-slate-400">
                  View and manage all schools connected to your premium content.
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard icon={School} label="Total Schools" value={loading.schools ? "..." : schools.length} loading={loading.schools} />
                <StatCard icon={CheckCircle2} label="Active Schools" value={loading.schools ? "..." : activeSchools} loading={loading.schools} />
                <StatCard icon={TrendingUp} label="Rollout Status" value={loading.schools ? "..." : schools.length > 0 ? "Active" : "Pending"} loading={loading.schools} gradient />
              </div>
              
              {schoolsNotice && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-sm text-amber-400">{schoolsNotice}</p>
                </div>
              )}
              
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <div className="grid grid-cols-4 gap-4 border-b border-white/10 bg-slate-900/50 px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  <span>School</span>
                  <span>Code</span>
                  <span>Status</span>
                  <span>Location</span>
                </div>
                <div className="divide-y divide-white/5">
                  {loading.schools ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">Loading schools...</div>
                  ) : schools.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">No schools found</div>
                  ) : (
                    schools.map((school) => (
                      <div key={school.id} className="grid grid-cols-4 gap-4 px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-white">{school.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{prettyDate(school.createdAt)}</p>
                        </div>
                        <div className="text-slate-400">{school.schoolCode ?? "N/A"}</div>
                        <div>
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            (school.status ?? "active") === "active" 
                              ? "bg-emerald-500/20 text-emerald-400" 
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {school.status ?? "active"}
                          </span>
                        </div>
                        <div className="text-slate-400">{school.location ?? "Not specified"}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="flex items-center gap-2 text-fuchsia-400">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Performance Metrics</span>
                </div>
                <h2 className="mt-3 text-3xl font-bold">Content Analytics</h2>
                <p className="mt-2 max-w-2xl text-slate-400">
                  Track engagement and performance across all your premium content.
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={BookOpen} label="Stories" value={loading.analytics ? "..." : analytics.overview.stories} loading={loading.analytics} />
                <StatCard icon={Activity} label="Quizzes" value={loading.analytics ? "..." : analytics.overview.quizzes} loading={loading.analytics} />
                <StatCard icon={Sparkles} label="Games" value={loading.analytics ? "..." : analytics.overview.games} loading={loading.analytics} />
                <StatCard icon={Layers} label="Total Content" value={loading.analytics ? "..." : analytics.overview.totalContents} loading={loading.analytics} gradient />
              </div>
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Engagement Summary</h3>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-400">
                    {analytics.engagementSummary.length} items
                  </span>
                </div>
                
                {loading.analytics ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
                    ))}
                  </div>
                ) : analytics.engagementSummary.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">No engagement data available yet</div>
                ) : (
                  <div className="space-y-3">
                    {analytics.engagementSummary.slice(0, 6).map((entry, idx) => (
                      <div key={idx} className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium text-white">{String(entry.title ?? "Untitled")}</p>
                            <p className="text-sm text-slate-500">{String(entry.type ?? "Content")}</p>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-xs text-slate-500">Attempts</p>
                              <p className="font-semibold text-white">{String(entry.totalAttempts ?? 0)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-slate-500">Best Score</p>
                              <p className="font-semibold text-white">{String(entry.averageBestScore ?? 0)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-slate-500">Completed</p>
                              <p className="font-semibold text-white">{String(entry.completedCount ?? 0)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Drawer Component */}
      {drawerOpen && selectedBundle && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl transition-transform duration-300 ease-out animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-500 p-2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{getBundleTitle(selectedBundle)}</h2>
                    <p className="text-xs text-slate-400">Bundle Details</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
{selectedBundle.story?.content.status !== "published" && (           
           <button
                      onClick={() => void handlePublish(selectedBundleId)}
                      disabled={publishingId === selectedBundleId}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {publishingId === selectedBundleId ? "Publishing..." : "Publish"}
                    </button>
                  )}
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-lg border border-white/10 p-2 transition-colors hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="space-y-6 p-6">
              {/* Story Overview */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Story Overview</h3>
                  <button
                    onClick={() => setEditingStory(!editingStory)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/10"
                  >
                    <PencilLine className="inline h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
                
                {editingStory ? (
                  <div className="space-y-4">
                    <input
                      value={storyEditDraft.title}
                      onChange={(e) => setStoryEditDraft({ ...storyEditDraft, title: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm outline-none focus:border-fuchsia-500"
                      placeholder="Title"
                    />
                    <textarea
                      rows={2}
                      value={storyEditDraft.summary}
                      onChange={(e) => setStoryEditDraft({ ...storyEditDraft, summary: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm outline-none focus:border-fuchsia-500"
                      placeholder="Summary"
                    />
                    <textarea
                      rows={3}
                      value={storyEditDraft.description}
                      onChange={(e) => setStoryEditDraft({ ...storyEditDraft, description: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm outline-none focus:border-fuchsia-500"
                      placeholder="Description"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => void handleSaveStory()}
                        disabled={savingStory}
                        className="flex-1 rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-fuchsia-500 disabled:opacity-50"
                      >
                        {savingStory ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => setEditingStory(false)}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-xl font-bold text-white mb-2">{selectedBundle.story?.content.title}</h4>
                    <p className="text-sm text-slate-400 mb-4">{selectedBundle.story?.content.summary}</p>
                    {selectedSelFocus.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSelFocus.map((item) => (
                          <span key={item} className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-medium text-fuchsia-300">
                            {prettifySelFocus(item)}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Cover Image */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Cover Image</h3>
                  <button
                    onClick={() => void handleGenerateImages()}
                    disabled={!selectedStoryId || !!generatingImagesId}
                    className="rounded-lg bg-gradient-to-r from-amber-500 to-fuchsia-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:shadow-lg disabled:opacity-50"
                  >
                    <ImageIcon className="inline h-4 w-4 mr-1" />
                    {generatingImagesId === selectedStoryId ? "Generating..." : "Generate"}
                  </button>
                </div>
                {selectedCoverImage ? (
                  <img src={selectedCoverImage} alt="Cover" className="w-full rounded-lg object-cover max-h-64" />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg bg-slate-900/50 text-sm text-slate-500">
                    No cover image yet
                  </div>
                )}
              </div>

              {/* Chapters */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Chapters</h3>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400">{selectedStoryChapters.length}</span>
                </div>
                {selectedStoryChapters.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No chapters available</p>
                ) : (
                  <div className="space-y-3">
                    {selectedStoryChapters.map((chapter, idx) => (
                      <details key={idx} className="group rounded-lg border border-white/10 bg-slate-900/30">
                        <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-white">
                          <span>Chapter {chapter.order ?? idx + 1}: {chapter.title}</span>
                          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="border-t border-white/10 p-4">
                          <p className="text-sm text-slate-400 whitespace-pre-wrap">{chapter.body}</p>
                          {chapter.imageUrl && (
                            <img src={chapter.imageUrl} alt={chapter.title} className="mt-3 rounded-lg max-h-48 w-full object-cover" />
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>

              {/* Activities */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Activities</h3>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400">{selectedActivities.length}</span>
                </div>
                {selectedActivities.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No activities added yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedActivities.map((activity, idx) => (
                      <div key={idx} className="rounded-lg border border-white/10 bg-slate-900/30 p-4">
                        <h4 className="font-medium text-white">{activity.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{activity.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Activity Form */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
                <div className="space-y-3">
                  <input
                    value={activityDraft.title}
                    onChange={(e) => setActivityDraft({ ...activityDraft, title: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm outline-none focus:border-fuchsia-500"
                    placeholder="Activity title"
                  />
                  <input
                    value={activityDraft.summary}
                    onChange={(e) => setActivityDraft({ ...activityDraft, summary: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm outline-none focus:border-fuchsia-500"
                    placeholder="Brief summary"
                  />
                  <button
                    onClick={() => void handleAddActivity()}
                    disabled={!selectedBundleId || addingActivity || !activityDraft.title.trim()}
                    className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:shadow-lg disabled:opacity-50"
                  >
                    {addingActivity ? "Adding..." : "Add Activity"}
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-400 mb-4">Once you delete a story, there is no going back.</p>
                <button
                  onClick={() => void handleDeleteStory()}
                  disabled={deletingStory}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                >
                  {deletingStory ? "Deleting..." : "Delete Story"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
