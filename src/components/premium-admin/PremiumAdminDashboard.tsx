"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  Globe,
  Layers,
  LogOut,
  Menu,
  Plus,
  Send,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { clearAuthSession, getAccessToken, getStoredUser } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type PremiumTab = "overview" | "content" | "generate" | "schools" | "analytics";

interface StoryActivity {
  _id?: string;
  title: string;
  summary: string;
}

interface StoryRecord {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  theme?: string;
  ageRange?: { min: number; max: number };
  gradeLevels?: string[];
  status?: "draft" | "published" | "archived";
  createdAt: string;
  publication?: { scope: string; publishedAt: string; status: string };
  activities?: StoryActivity[];
}

const tabs: Array<{ id: PremiumTab; label: string; icon: typeof BarChart3 }> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "content", label: "Content Library", icon: BookOpen },
  { id: "generate", label: "Generate Story", icon: Wand2 },
  { id: "schools", label: "Manage Schools", icon: Users },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];

const isPremiumTab = (value: string | null): value is PremiumTab =>
  tabs.some((tab) => tab.id === value);

const getStoriesArray = (payload: unknown) => {
  if (Array.isArray(payload)) return payload as StoryRecord[];
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data as StoryRecord[];
    if (Array.isArray(data.stories)) return data.stories as StoryRecord[];
    if (Array.isArray(data.results)) return data.results as StoryRecord[];
  }
  return [];
};

const platformRequest = async <T,>(path: string, init?: RequestInit) => {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please log in again.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Request failed with status ${response.status}`);
  }
  return payload as T;
};

export default function PremiumAdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [selectedStory, setSelectedStory] = useState<StoryRecord | null>(null);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState({
    title: "Tolu and the Whispering Drum",
    ageRangeMin: 8,
    ageRangeMax: 12,
    gradeLevels: "Primary 4, Primary 5",
    theme: "courage",
    topic: "A child discovers that courage means speaking up when others are afraid.",
    moralLesson: "Doing the right thing may be scary, but courage helps others too.",
  });
  const [activityDraft, setActivityDraft] = useState({ title: "", summary: "" });

  const activeTab = isPremiumTab(searchParams.get("tab")) ? searchParams.get("tab") : "overview";
  const publishedCount = useMemo(() => stories.filter((story) => story.status === "published").length, [stories]);

  const navigateTo = (tab: PremiumTab) => {
    setSidebarOpen(false);
    router.replace(`/premium-admin/dashboard?tab=${tab}`);
  };

  const loadStories = async () => {
    setStoriesLoading(true);
    const payload = await platformRequest<unknown>("/api/v1/platform/content");
    setStories(getStoriesArray(payload));
    setStoriesLoading(false);
  };

  useEffect(() => {
    const token = getAccessToken();
    const user = getStoredUser();
    if (!token || !user || user.role !== "PLATFORM_ADMIN") {
      router.replace("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    loadStories().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load content.");
      setStoriesLoading(false);
    });
  }, [authorized]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const story = await platformRequest<StoryRecord>("/api/v1/platform/content/generate", {
        method: "POST",
        body: JSON.stringify({ ...draft, gradeLevels: draft.gradeLevels.split(",").map((item) => item.trim()) }),
      });
      setSelectedStory(story);
      setNotice("Story generated successfully.");
      await loadStories();
      navigateTo("content");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate story.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (storyId: string) => {
    try {
      await platformRequest(`/api/v1/platform/content/${storyId}/publish-bundle`, {
        method: "POST",
        body: JSON.stringify({ publicationScope: "all_schools", status: "active" }),
      });
      setNotice("Story published successfully to all schools.");
      await loadStories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish story.");
    }
  };

  const handleOpenStory = async (storyId: string) => {
    try {
      const story = await platformRequest<StoryRecord>(`/api/v1/platform/content/${storyId}/full`);
      setSelectedStory(story);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load story.");
    }
  };

  const handleAddActivity = async () => {
    if (!selectedStory?._id) return;
    try {
      const activity = await platformRequest<StoryActivity>(`/api/v1/platform/content/${selectedStory._id}/activities`, {
        method: "POST",
        body: JSON.stringify({ ...activityDraft, activityType: "discussion", estimatedDurationMinutes: 20 }),
      });
      setSelectedStory((prev) => (prev ? { ...prev, activities: [...(prev.activities ?? []), activity] } : prev));
      setActivityDraft({ title: "", summary: "" });
      setNotice("Activity added successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add activity.");
    }
  };

  if (!authorized) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950"><div className="h-12 w-12 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_22%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-white">
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-white/10 bg-slate-950/95 px-5 py-6 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between"><Link href="/" className="flex items-center gap-3"><div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 p-3"><BookOpen size={22} /></div><div><p className="text-lg font-black">PathSpring</p><p className="text-xs uppercase tracking-[0.18em] text-fuchsia-300">Premium Control</p></div></Link><button onClick={() => setSidebarOpen(false)} className="rounded-xl border border-white/10 p-2 lg:hidden"><X size={18} /></button></div>
        <div className="mb-8 rounded-[1.75rem] border border-white/10 bg-white/6 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Studio</p><p className="mt-2 text-lg font-bold">Generate, review, enrich, and publish content from one polished workspace.</p></div>
        <nav className="space-y-2">{tabs.map((tab) => { const Icon = tab.icon; const active = tab.id === activeTab; return <button key={tab.id} onClick={() => navigateTo(tab.id)} className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all ${active ? "border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/25 to-cyan-500/20" : "border-transparent bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10"}`}><div className={`rounded-xl p-2 ${active ? "bg-white/15" : "bg-black/20"}`}><Icon size={18} /></div><span className="font-semibold">{tab.label}</span></button>; })}</nav>
        <div className="mt-8 space-y-2 border-t border-white/10 pt-6"><button className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300"><Settings size={18} /><span className="font-semibold">Workspace Settings</span></button><button onClick={() => { clearAuthSession(); router.replace("/login"); }} className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300"><LogOut size={18} /><span className="font-semibold">Log Out</span></button></div>
      </aside>
      {sidebarOpen ? <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}
      <div className="lg:pl-80">
        <header className="sticky top-0 z-20 mb-8 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-2xl sm:px-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:hidden"><Menu size={18} /></button><div><p className="text-xs uppercase tracking-[0.22em] text-slate-400">Premium Admin</p><h1 className="text-2xl font-black">{tabs.find((tab) => tab.id === activeTab)?.label ?? "Overview"}</h1><p className="text-sm text-slate-400">Modern adult-facing UI for premium content operations.</p></div></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Live Stories</p><p className="mt-1 text-sm font-semibold">{storiesLoading ? "Refreshing..." : stories.length}</p></div><div className="rounded-2xl border border-white/10 bg-gradient-to-r from-fuchsia-500/18 to-cyan-500/15 px-4 py-3"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Published</p><p className="mt-1 text-sm font-semibold">{storiesLoading ? "Refreshing..." : publishedCount}</p></div></div></div></header>
        <main className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          {error ? <div className="mb-5 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}
          {notice ? <div className="mb-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-300">{notice}</div> : null}
          {activeTab === "overview" ? <div className="space-y-8"><section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/20 via-slate-900 to-cyan-500/20 p-6 sm:p-8"><p className="text-xs uppercase tracking-[0.24em] text-fuchsia-200">Platform Command Center</p><h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight">Beautiful publishing tools for the adults shaping kids&apos; learning journeys.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Keep the control room rich, responsive, and calm for premium operators while the downstream reading experience remains magical for schools and children.</p></section><section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"><div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><BookOpen size={20} className="mb-4" /><p className="text-sm text-slate-400">Generated Stories</p><p className="mt-2 text-4xl font-black">{storiesLoading ? "..." : stories.length}</p></div><div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><Send size={20} className="mb-4" /><p className="text-sm text-slate-400">Published Bundles</p><p className="mt-2 text-4xl font-black">{storiesLoading ? "..." : publishedCount}</p></div><div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><Users size={20} className="mb-4" /><p className="text-sm text-slate-400">Target Schools</p><p className="mt-2 text-4xl font-black">1.2K</p></div><div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5"><TrendingUp size={20} className="mb-4" /><p className="text-sm text-slate-400">Momentum</p><p className="mt-2 text-4xl font-black">High</p></div></section><section className="grid gap-6 lg:grid-cols-3"><button onClick={() => navigateTo("generate")} className="rounded-[1.75rem] border border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500/15 to-fuchsia-900/5 p-6 text-left"><Wand2 className="mb-4 text-fuchsia-300" size={30} /><h3 className="text-xl font-bold">Generate New Story</h3><p className="mt-2 text-sm leading-6 text-slate-400">Spin up a new story draft with culturally grounded prompts and school-ready metadata.</p></button><button onClick={() => navigateTo("content")} className="rounded-[1.75rem] border border-cyan-400/25 bg-gradient-to-br from-cyan-500/15 to-cyan-900/5 p-6 text-left"><Layers className="mb-4 text-cyan-300" size={30} /><h3 className="text-xl font-bold">Review Content Library</h3><p className="mt-2 text-sm leading-6 text-slate-400">Open full bundles, inspect activities, and publish only when the package feels complete.</p></button><div className="rounded-[1.75rem] border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 to-emerald-900/5 p-6"><Globe className="mb-4 text-emerald-300" size={30} /><h3 className="text-xl font-bold">School Rollout Ready</h3><p className="mt-2 text-sm leading-6 text-slate-400">Publishing, review, and premium operations now live in one cleaner workspace.</p></div></section></div> : null}
          {activeTab === "generate" ? <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"><section className="rounded-[2rem] border border-white/10 bg-white/6 p-6"><h2 className="text-2xl font-black">Story Creation Studio</h2><p className="mt-2 text-sm leading-6 text-slate-400">Design premium stories with rich moral framing and school-ready metadata.</p><div className="mt-6 space-y-4"><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" /><div className="grid gap-4 sm:grid-cols-2"><input type="number" value={draft.ageRangeMin} onChange={(event) => setDraft({ ...draft, ageRangeMin: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" /><input type="number" value={draft.ageRangeMax} onChange={(event) => setDraft({ ...draft, ageRangeMax: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" /></div><input value={draft.gradeLevels} onChange={(event) => setDraft({ ...draft, gradeLevels: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" /><input value={draft.theme} onChange={(event) => setDraft({ ...draft, theme: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" /><textarea rows={3} value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" /><textarea rows={3} value={draft.moralLesson} onChange={(event) => setDraft({ ...draft, moralLesson: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-fuchsia-400" /><button onClick={() => void handleGenerate()} disabled={generating} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 px-5 py-3 font-bold disabled:opacity-60"><Wand2 size={18} />{generating ? "Generating Story..." : "Generate Story"}</button></div></section><section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">{selectedStory ? <div className="space-y-5"><div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">{selectedStory.theme ?? draft.theme}</span><span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Ages {selectedStory.ageRange?.min ?? draft.ageRangeMin}-{selectedStory.ageRange?.max ?? draft.ageRangeMax}</span></div><h3 className="mt-4 text-3xl font-black">{selectedStory.title}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{selectedStory.description ?? draft.topic}</p></div><div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Generated Content</p><div className="max-h-[24rem] overflow-y-auto pr-2 text-sm leading-7 text-slate-300">{selectedStory.content}</div></div><button onClick={() => void handlePublish(selectedStory._id)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-slate-950"><Send size={18} />Publish to Schools</button></div> : <div className="flex min-h-[26rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/45 px-6 text-center"><Sparkles size={40} className="text-fuchsia-300" /><h3 className="mt-4 text-2xl font-bold">Your generated story will appear here.</h3><p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Generate a story to review the draft and publish the bundle to schools.</p></div>}</section></div> : null}
          {activeTab === "content" ? <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"><section className="rounded-[2rem] border border-white/10 bg-white/6 p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-black">Content Library</h2><p className="mt-2 text-sm text-slate-400">Open full bundles, inspect activities, and publish with confidence.</p></div><button onClick={() => navigateTo("generate")} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 px-5 py-3 font-bold"><Plus size={18} />New Story</button></div><div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10"><div className="grid grid-cols-[1.35fr_0.8fr_0.65fr_0.7fr] gap-3 border-b border-white/10 bg-slate-950/55 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><span>Story</span><span>Theme</span><span>Status</span><span className="text-right">Action</span></div><div className="divide-y divide-white/5">{storiesLoading ? <div className="px-5 py-10 text-center text-sm text-slate-400">Loading stories...</div> : stories.length === 0 ? <div className="px-5 py-10 text-center text-sm text-slate-400">No premium stories yet.</div> : stories.map((story) => <div key={story._id} className="grid grid-cols-[1.35fr_0.8fr_0.65fr_0.7fr] gap-3 px-5 py-4 text-sm text-slate-300"><div><p className="font-semibold">{story.title}</p><p className="mt-1 text-xs text-slate-500">{new Date(story.createdAt).toLocaleDateString()}</p></div><div className="capitalize text-slate-400">{story.theme ?? "General"}</div><div><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">{story.status ?? "draft"}</span></div><div className="flex justify-end gap-2"><button onClick={() => void handleOpenStory(story._id)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">View</button>{story.status !== "published" ? <button onClick={() => void handlePublish(story._id)} className="rounded-xl bg-emerald-500 px-3 py-2 font-semibold text-slate-950">Publish</button> : null}</div></div>)}</div></div></section><section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">{selectedStory ? <div className="space-y-6"><div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><h3 className="text-3xl font-black">{selectedStory.title}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{selectedStory.description ?? "No short description provided yet."}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{selectedStory.publication?.scope ?? "draft"}</span>{selectedStory.gradeLevels?.length ? <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{selectedStory.gradeLevels.join(", ")}</span> : null}</div></div><div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Story Content</p><div className="max-h-56 overflow-y-auto pr-2 text-sm leading-7 text-slate-300">{selectedStory.content ?? "No content body returned yet."}</div></div><div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><div className="flex items-center justify-between"><h4 className="text-lg font-bold">Activities</h4><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">{selectedStory.activities?.length ?? 0}</span></div><div className="mt-4 space-y-3">{(selectedStory.activities ?? []).length === 0 ? <p className="text-sm text-slate-400">No activities attached yet.</p> : (selectedStory.activities ?? []).map((activity, index) => <div key={`${activity.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between gap-3"><h5 className="font-semibold">{activity.title}</h5><span className="rounded-full bg-blue-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-blue-300">discussion</span></div><p className="mt-2 text-sm text-slate-400">{activity.summary}</p></div>)}</div></div><div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"><h4 className="text-lg font-bold">Add Activity</h4><div className="mt-4 space-y-4"><input value={activityDraft.title} onChange={(event) => setActivityDraft({ ...activityDraft, title: event.target.value })} placeholder="Activity title" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /><input value={activityDraft.summary} onChange={(event) => setActivityDraft({ ...activityDraft, summary: event.target.value })} placeholder="Short summary" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /><button onClick={() => void handleAddActivity()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-bold text-slate-950"><Activity size={18} />Save Activity</button></div></div></div> : <div className="flex min-h-[32rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/45 px-6 text-center"><BookOpen size={40} className="text-cyan-300" /><h3 className="mt-4 text-2xl font-bold">Select a story to inspect the full premium bundle.</h3><p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Open a story from the library to review the content, activities, and publication status.</p></div>}</section></div> : null}
          {activeTab === "schools" ? <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8"><h2 className="text-4xl font-black">Manage Schools</h2><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">This panel is ready for the next pass where we connect school tenant management and rollout targeting to the backend.</p></div> : null}
          {activeTab === "analytics" ? <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8"><h2 className="text-4xl font-black">Analytics</h2><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">This panel is ready for the next pass where we connect platform analytics, content performance, and school adoption signals.</p></div> : null}
        </main>
      </div>
    </div>
  );
}
