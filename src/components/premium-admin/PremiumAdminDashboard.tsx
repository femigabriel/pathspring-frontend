"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  LogOut,
  Menu,
  Plus,
  School,
  Send,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { clearAuthSession, getStoredUser } from "@/src/lib/auth";
import {
  createPlatformStoryActivity,
  generatePlatformContentPackage,
  generatePlatformStoryImages,
  getPlatformContentAnalytics,
  getPlatformContentBundle,
  getPlatformContentItems,
  getPlatformSchools,
  publishPlatformContentBundle,
  type PlatformActivity,
  type PlatformAnalyticsResponse,
  type PlatformBundle,
  type PlatformContentItem,
  type PlatformSchool,
} from "@/src/lib/platform-api";

type PremiumTab = "overview" | "content" | "generate" | "schools" | "analytics";

const tabs: Array<{ id: PremiumTab; label: string; icon: typeof BarChart3 }> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "content", label: "Content Library", icon: BookOpen },
  { id: "generate", label: "Generate Story", icon: Wand2 },
  { id: "schools", label: "Manage Schools", icon: Users },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
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
  value ? new Date(value).toLocaleDateString() : "Recently updated";

const EmptyPanel = ({ title, body }: { title: string; body: string }) => (
  <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/45 px-6 text-center">
    <Sparkles size={40} className="text-fuchsia-300" />
    <h3 className="mt-4 text-2xl font-bold">{title}</h3>
    <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{body}</p>
  </div>
);

export default function PremiumAdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentItems, setContentItems] = useState<PlatformContentItem[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<PlatformBundle | null>(null);
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
  const [draft, setDraft] = useState({
    title: "Tolu and the Whispering Drum",
    ageRangeMin: 8,
    ageRangeMax: 12,
    gradeLevels: "Primary 4, Primary 5",
    subject: "Language Arts",
    skillFocus: "Comprehension, Critical Thinking, Empathy",
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

  const activeTab = isPremiumTab(searchParams.get("tab")) ? searchParams.get("tab") : "overview";

  const libraryItems = useMemo(() => {
    const bundles = contentItems.filter((item) => item.type === "CONTENT_PACK");
    return bundles.length > 0 ? bundles : contentItems.filter((item) => item.type === "STORY");
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
    router.replace(`/premium-admin/dashboard?tab=${tab}`, { scroll: false });
  };

  const refreshData = async () => {
    setError("");
    setLoading({ content: true, analytics: true, schools: true });

    const [contentResult, analyticsResult, schoolsResult] = await Promise.allSettled([
      getPlatformContentItems(),
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
  }, [authorized]);

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
        difficulty: draft.difficulty,
        estimatedStoryDurationMinutes: 20,
        language: draft.language,
        theme: draft.theme,
        topic: draft.topic,
        moralLesson: draft.moralLesson,
      });
      setSelectedBundle(bundle);
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
      setSelectedBundle(await getPlatformContentBundle(contentId));
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

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-white">
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-white/10 bg-slate-950/95 px-5 py-6 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 via-rose-500 to-cyan-400 p-3">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-lg font-black">PathSpring</p>
              <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-300">Premium Control</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="rounded-xl border border-white/10 p-2 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="mb-8 rounded-[1.75rem] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Studio</p>
          <p className="mt-2 text-lg font-bold">Live premium bundle operations in one calmer workspace.</p>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id)}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all ${active ? "border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/25 to-cyan-500/20" : "border-transparent bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10"}`}
              >
                <div className={`rounded-xl p-2 ${active ? "bg-white/15" : "bg-black/20"}`}>
                  <Icon size={18} />
                </div>
                <span className="font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 space-y-2 border-t border-white/10 pt-6">
          <button className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
            <Settings size={18} />
            <span className="font-semibold">Workspace Settings</span>
          </button>
          <button
            onClick={() => {
              clearAuthSession();
              router.replace("/login");
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300"
          >
            <LogOut size={18} />
            <span className="font-semibold">Log Out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen ? <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="lg:pl-80">
        <header className="sticky top-0 z-20 mb-8 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-2xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:hidden">
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Premium Admin</p>
                <h1 className="text-2xl font-black">{tabs.find((tab) => tab.id === activeTab)?.label ?? "Overview"}</h1>
                <p className="text-sm text-slate-400">Live bundle, analytics, and school data.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Bundle Packs</p>
                <p className="mt-1 text-sm font-semibold">{loading.content ? "Refreshing..." : libraryItems.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Published</p>
                <p className="mt-1 text-sm font-semibold">{loading.content ? "Refreshing..." : publishedBundles}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-fuchsia-500/18 to-cyan-500/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Schools</p>
                <p className="mt-1 text-sm font-semibold">{loading.schools ? "Refreshing..." : schools.length}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          {error ? <div className="mb-5 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}
          {notice ? <div className="mb-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-300">{notice}</div> : null}
          {activeTab === "overview" ? (
            <div className="space-y-8">
              <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/20 via-slate-900 to-cyan-500/20 p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-200">Platform Command Center</p>
                <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight">Premium publishing now runs on live backend data.</h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">Generate full story bundles, inspect chapters and activities, and track rollout with live counts instead of placeholders.</p>
              </section>

              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><Layers size={20} className="mb-4" /><p className="text-sm text-slate-400">Content Packs</p><p className="mt-2 text-4xl font-black">{loading.analytics ? "..." : analytics.overview.contentPacks}</p></div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><Send size={20} className="mb-4" /><p className="text-sm text-slate-400">Published Contents</p><p className="mt-2 text-4xl font-black">{loading.analytics ? "..." : analytics.overview.publishedContents}</p></div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><School size={20} className="mb-4" /><p className="text-sm text-slate-400">Connected Schools</p><p className="mt-2 text-4xl font-black">{loading.schools ? "..." : schools.length}</p></div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><Activity size={20} className="mb-4" /><p className="text-sm text-slate-400">Activities</p><p className="mt-2 text-4xl font-black">{loading.analytics ? "..." : analytics.overview.activities}</p></div>
              </section>
            </div>
          ) : null}

          {activeTab === "generate" ? (
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                <h2 className="text-2xl font-black">Story Creation Studio</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">This form now sends the full generation brief expected by the backend.</p>
                <div className="mt-6 space-y-4">
                  <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Bundle title" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input type="number" value={draft.ageRangeMin} onChange={(event) => setDraft({ ...draft, ageRangeMin: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Min age" />
                    <input type="number" value={draft.ageRangeMax} onChange={(event) => setDraft({ ...draft, ageRangeMax: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Max age" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Subject" />
                    <input value={draft.theme} onChange={(event) => setDraft({ ...draft, theme: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Theme" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Difficulty" />
                    <input value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Language code" />
                  </div>
                  <input value={draft.gradeLevels} onChange={(event) => setDraft({ ...draft, gradeLevels: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Grade levels separated by commas" />
                  <input value={draft.skillFocus} onChange={(event) => setDraft({ ...draft, skillFocus: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Skill focus separated by commas" />
                  <textarea rows={3} value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Topic" />
                  <textarea rows={3} value={draft.moralLesson} onChange={(event) => setDraft({ ...draft, moralLesson: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" placeholder="Moral lesson" />
                  <button onClick={() => void handleGenerate()} disabled={generating} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-rose-600 to-cyan-500 px-5 py-3 font-bold disabled:opacity-60"><Wand2 size={18} />{generating ? "Generating Bundle..." : "Generate Premium Bundle"}</button>
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                {selectedBundle ? (
                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                      <h3 className="text-3xl font-black">{getBundleTitle(selectedBundle)}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{selectedBundle.story?.content.summary ?? selectedBundle.story?.content.description ?? draft.topic}</p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/55">
                        {selectedCoverImage ? (
                          <img src={selectedCoverImage} alt={getBundleTitle(selectedBundle)} className="h-72 w-full object-cover" />
                        ) : (
                          <div className="flex h-72 items-center justify-center bg-gradient-to-br from-fuchsia-500/20 via-slate-900 to-cyan-500/20 text-center text-sm text-slate-400">
                            Cover art will appear here after image generation.
                          </div>
                        )}
                      </div>
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Story Art</p>
                            <h4 className="mt-2 text-xl font-bold">Generate cover and chapter images</h4>
                          </div>
                          <ImageIcon size={20} className="text-fuchsia-300" />
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                          Use the saved story prompts to create the book cover and chapter illustrations, then refresh the bundle preview instantly.
                        </p>
                        <button
                          onClick={() => void handleGenerateImages()}
                          disabled={!selectedStoryId || !!generatingImagesId}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 px-5 py-3 font-bold text-slate-950 disabled:opacity-60"
                        >
                          <ImageIcon size={18} />
                          {generatingImagesId === selectedStoryId ? "Generating Images..." : "Generate Story Images"}
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Chapters</p><p className="mt-2 text-3xl font-black">{selectedStoryChapters.length}</p></div>
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Activities</p><p className="mt-2 text-3xl font-black">{selectedActivities.length}</p></div>
                    </div>
                    <button onClick={() => void handlePublish(selectedBundleId)} disabled={!selectedBundleId || publishingId === selectedBundleId} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-60"><Send size={18} />{publishingId === selectedBundleId ? "Publishing..." : "Publish Bundle to Schools"}</button>
                  </div>
                ) : (
                  <EmptyPanel title="Your generated bundle will appear here." body="Generate a premium package to inspect it and publish it to schools." />
                )}
              </section>
            </div>
          ) : null}
          {activeTab === "content" ? (
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Content Library</h2>
                    <p className="mt-2 text-sm text-slate-400">This now reads the real bundle format returned by the backend.</p>
                  </div>
                  <button onClick={() => navigateTo("generate")} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-rose-600 to-cyan-500 px-5 py-3 font-bold"><Plus size={18} />New Bundle</button>
                </div>
                <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10">
                  <div className="grid grid-cols-[1.2fr_0.85fr_0.7fr_0.8fr] gap-3 border-b border-white/10 bg-slate-950/55 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><span>Bundle</span><span>Subject</span><span>Status</span><span className="text-right">Action</span></div>
                  <div className="divide-y divide-white/5">
                    {loading.content ? <div className="px-5 py-10 text-center text-sm text-slate-400">Loading premium bundles...</div> : libraryItems.length === 0 ? <div className="px-5 py-10 text-center text-sm text-slate-400">No premium bundles were returned by the backend yet.</div> : libraryItems.map((item) => <div key={item._id} className="grid grid-cols-[1.2fr_0.85fr_0.7fr_0.8fr] gap-3 px-5 py-4 text-sm text-slate-300"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{prettyDate(item.updatedAt ?? item.createdAt)}</p></div><div className="text-slate-400">{item.subject ?? item.theme ?? "General"}</div><div><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">{item.status ?? "draft"}</span></div><div className="flex justify-end gap-2"><button onClick={() => void handleOpenBundle(item._id)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">{openingId === item._id ? "Opening..." : "View"}</button>{item.status !== "published" ? <button onClick={() => void handlePublish(item._id)} disabled={publishingId === item._id} className="rounded-xl bg-emerald-500 px-3 py-2 font-semibold text-slate-950 disabled:opacity-60">{publishingId === item._id ? "Publishing..." : "Publish"}</button> : null}</div></div>)}
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                {selectedBundle ? (
                  <div className="space-y-6">
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                      <h3 className="text-3xl font-black">{getBundleTitle(selectedBundle)}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{selectedBundle.story?.content.summary ?? selectedBundle.story?.content.description ?? "No short description provided yet."}</p>
                      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-900/70">
                          {selectedCoverImage ? (
                            <img src={selectedCoverImage} alt={getBundleTitle(selectedBundle)} className="h-64 w-full object-cover" />
                          ) : (
                            <div className="flex h-64 items-center justify-center bg-gradient-to-br from-fuchsia-500/20 via-slate-900 to-cyan-500/20 text-center text-sm text-slate-400">
                              No cover image yet. Generate story images to populate this preview.
                            </div>
                          )}
                        </div>
                        <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Image Workflow</p>
                          <p className="mt-3 text-sm leading-7 text-slate-400">
                            After a story package is generated, click the button below to create the cover art and chapter illustrations from the saved prompts.
                          </p>
                          <button
                            onClick={() => void handleGenerateImages()}
                            disabled={!selectedStoryId || !!generatingImagesId}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 px-5 py-3 font-bold text-slate-950 disabled:opacity-60"
                          >
                            <ImageIcon size={18} />
                            {generatingImagesId === selectedStoryId ? "Generating Images..." : "Generate Story Images"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                      <div className="mb-4 flex items-center justify-between"><h4 className="text-lg font-bold">Story Chapters</h4><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">{selectedStoryChapters.length}</span></div>
                      <div className="space-y-3">
                        {selectedStoryChapters.length === 0 ? <p className="text-sm text-slate-400">No chapters returned yet.</p> : selectedStoryChapters.map((chapter, index) => <div key={chapter._id ?? `${chapter.title}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">{chapter.imageUrl ? <img src={chapter.imageUrl} alt={chapter.title ?? `Chapter ${index + 1}`} className="mb-4 h-44 w-full rounded-2xl object-cover" /> : <div className="mb-4 flex h-44 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/45 text-center text-xs uppercase tracking-[0.18em] text-slate-500">No chapter image yet</div>}<p className="text-xs uppercase tracking-[0.16em] text-slate-500">Chapter {chapter.order ?? index + 1}</p><h5 className="mt-1 font-semibold">{chapter.title ?? `Chapter ${index + 1}`}</h5><p className="mt-2 line-clamp-6 text-sm leading-6 text-slate-400">{chapter.body ?? "No chapter body returned."}</p></div>)}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><div className="mb-3 flex items-center justify-between"><h4 className="text-lg font-bold">Story Questions</h4><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">{selectedStoryQuestions.length}</span></div><div className="space-y-2">{selectedStoryQuestions.length === 0 ? <p className="text-sm text-slate-400">No story questions returned.</p> : selectedStoryQuestions.slice(0, 3).map((question, index) => <div key={question._id ?? `${question.prompt}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{question.prompt ?? `Question ${index + 1}`}</div>)}</div></div>
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><div className="mb-3 flex items-center justify-between"><h4 className="text-lg font-bold">Quiz Questions</h4><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">{selectedQuizQuestions.length}</span></div><div className="space-y-2">{selectedQuizQuestions.length === 0 ? <p className="text-sm text-slate-400">No quiz questions returned.</p> : selectedQuizQuestions.slice(0, 3).map((question, index) => <div key={question._id ?? `${question.prompt}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{question.prompt ?? `Quiz Question ${index + 1}`}</div>)}</div></div>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                      <div className="flex items-center justify-between"><h4 className="text-lg font-bold">Premium Activities</h4><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">{selectedActivities.length}</span></div>
                      <div className="mt-4 space-y-3">
                        {selectedActivities.length === 0 ? <p className="text-sm text-slate-400">No activities attached yet.</p> : selectedActivities.map((activity: PlatformActivity, index) => <div key={activity._id ?? `${activity.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between gap-3"><h5 className="font-semibold">{activity.title}</h5><span className="rounded-full bg-blue-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-blue-300">{activity.configuration?.activityType ?? "activity"}</span></div><p className="mt-2 text-sm text-slate-400">{activity.summary ?? activity.description ?? "No summary yet."}</p></div>)}
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                      <h4 className="text-lg font-bold">Add Activity</h4>
                      <div className="mt-4 space-y-4">
                        <input value={activityDraft.title} onChange={(event) => setActivityDraft({ ...activityDraft, title: event.target.value })} placeholder="Activity title" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                        <input value={activityDraft.summary} onChange={(event) => setActivityDraft({ ...activityDraft, summary: event.target.value })} placeholder="Short summary" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                        <textarea rows={3} value={activityDraft.instructions} onChange={(event) => setActivityDraft({ ...activityDraft, instructions: event.target.value })} placeholder="Teacher instructions" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <input value={activityDraft.activityType} onChange={(event) => setActivityDraft({ ...activityDraft, activityType: event.target.value })} placeholder="Activity type" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                          <input type="number" value={activityDraft.estimatedDurationMinutes} onChange={(event) => setActivityDraft({ ...activityDraft, estimatedDurationMinutes: Number(event.target.value) })} placeholder="Duration" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                        </div>
                        <input value={activityDraft.materialsNeeded} onChange={(event) => setActivityDraft({ ...activityDraft, materialsNeeded: event.target.value })} placeholder="Materials separated by commas" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                        <textarea rows={4} value={activityDraft.tasks} onChange={(event) => setActivityDraft({ ...activityDraft, tasks: event.target.value })} placeholder="One task per line" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                        <textarea rows={3} value={activityDraft.teacherNotes} onChange={(event) => setActivityDraft({ ...activityDraft, teacherNotes: event.target.value })} placeholder="Teacher notes" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                        <button onClick={() => void handleAddActivity()} disabled={!selectedBundleId || addingActivity || !activityDraft.title.trim()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-60"><Activity size={18} />{addingActivity ? "Saving Activity..." : "Save Activity"}</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyPanel title="Select a bundle to inspect the full premium package." body="Open a bundle from the library to review chapters, questions, activities, and publication status." />
                )}
              </section>
            </div>
          ) : null}

          {activeTab === "schools" ? (
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-white/10 bg-white/6 p-8">
                <h2 className="text-4xl font-black">Manage Schools</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">This panel now uses live data when a school-list endpoint exists and falls back cleanly when it does not.</p>
                {schoolsNotice ? <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">{schoolsNotice}</div> : null}
              </section>
              <section className="grid gap-5 md:grid-cols-3">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><Users size={20} className="mb-4" /><p className="text-sm text-slate-400">Total Schools</p><p className="mt-2 text-4xl font-black">{loading.schools ? "..." : schools.length}</p></div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><CheckCircle2 size={20} className="mb-4" /><p className="text-sm text-slate-400">Active Schools</p><p className="mt-2 text-4xl font-black">{loading.schools ? "..." : activeSchools}</p></div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><TrendingUp size={20} className="mb-4" /><p className="text-sm text-slate-400">Rollout Scope</p><p className="mt-2 text-4xl font-black">{loading.schools ? "..." : schools.length > 0 ? "Live" : "--"}</p></div>
              </section>
              <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                  <div className="grid grid-cols-[1.1fr_0.7fr_0.8fr_0.8fr] gap-3 border-b border-white/10 bg-slate-950/55 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><span>School</span><span>Code</span><span>Status</span><span>Location</span></div>
                  <div className="divide-y divide-white/5">
                    {loading.schools ? <div className="px-5 py-10 text-center text-sm text-slate-400">Loading schools...</div> : schools.length === 0 ? <div className="px-5 py-10 text-center text-sm text-slate-400">No schools could be loaded from the backend.</div> : schools.map((school) => <div key={school.id} className="grid grid-cols-[1.1fr_0.7fr_0.8fr_0.8fr] gap-3 px-5 py-4 text-sm text-slate-300"><div><p className="font-semibold">{school.name}</p><p className="mt-1 text-xs text-slate-500">{prettyDate(school.createdAt)}</p></div><div className="text-slate-400">{school.schoolCode ?? "N/A"}</div><div><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">{school.status ?? "active"}</span></div><div className="text-slate-400">{school.location ?? "Not provided"}</div></div>)}
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "analytics" ? (
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-white/10 bg-white/6 p-8">
                <h2 className="text-4xl font-black">Analytics</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Overview cards are now powered by the backend analytics endpoint instead of placeholders.</p>
              </section>
              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><BookOpen size={20} className="mb-4" /><p className="text-sm text-slate-400">Stories</p><p className="mt-2 text-4xl font-black">{loading.analytics ? "..." : analytics.overview.stories}</p></div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><Activity size={20} className="mb-4" /><p className="text-sm text-slate-400">Quizzes</p><p className="mt-2 text-4xl font-black">{loading.analytics ? "..." : analytics.overview.quizzes}</p></div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><Sparkles size={20} className="mb-4" /><p className="text-sm text-slate-400">Games</p><p className="mt-2 text-4xl font-black">{loading.analytics ? "..." : analytics.overview.games}</p></div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><Layers size={20} className="mb-4" /><p className="text-sm text-slate-400">Total Content</p><p className="mt-2 text-4xl font-black">{loading.analytics ? "..." : analytics.overview.totalContents}</p></div>
              </section>
              <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                <div className="flex items-center justify-between"><h3 className="text-2xl font-black">Engagement Summary</h3><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">{analytics.engagementSummary.length}</span></div>
                <div className="mt-5 space-y-3">
                  {loading.analytics ? <div className="text-sm text-slate-400">Loading analytics...</div> : analytics.engagementSummary.length === 0 ? <div className="text-sm text-slate-400">No engagement analytics have been returned yet.</div> : analytics.engagementSummary.slice(0, 6).map((entry, index) => <div key={`${entry.contentId ?? index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{String(entry.title ?? "Untitled Content")}</p><p className="mt-1 text-sm text-slate-400">{String(entry.type ?? "CONTENT")}</p></div><div className="grid grid-cols-3 gap-3 text-sm"><div className="rounded-xl bg-slate-950/60 px-3 py-2"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Attempts</p><p className="mt-1 font-semibold">{String(entry.totalAttempts ?? 0)}</p></div><div className="rounded-xl bg-slate-950/60 px-3 py-2"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Best Score</p><p className="mt-1 font-semibold">{String(entry.averageBestScore ?? 0)}</p></div><div className="rounded-xl bg-slate-950/60 px-3 py-2"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Completed</p><p className="mt-1 font-semibold">{String(entry.completedCount ?? 0)}</p></div></div></div></div>)}
                </div>
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
