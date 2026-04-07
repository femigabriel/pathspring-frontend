"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  BookmarkCheck,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Clock3,
  Eye,
  GraduationCap,
  LibraryBig,
  Loader2,
  PackageCheck,
  Search,
  Send,
  Sparkles,
  X,
  Star,
  ChevronRight,
  Plus,
  Trash2,
  User,
  Users,
  FileText,
  MessageSquare,
  Heart,
  Lightbulb,
  Target,
} from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import AppSkeletonCard from "@/src/components/shared/ui/AppSkeletonCard";
import {
  filterClassesForTeacher,
  getAdminSchoolDetails,
  filterStudentsForTeacher,
  getAdminClasses,
  getAdminStudents,
  type AdminClassroom,
  type AdminSchoolDetails,
  type AdminStudent,
} from "@/src/lib/admin-api";
import { getSchoolPlanSnapshot } from "@/src/lib/school-plan";
import {
  createContentAssignment,
  getContentAssignmentTracking,
  getContentAssignments,
  getPublishedSchoolContents,
  getSchoolCatalogProducts,
  getSchoolSelectedProducts,
  getPublishedSchoolStoryBundle,
  removeSchoolProductSelection,
  selectSchoolProduct,
  type SchoolContentAssignment,
  type SchoolActivity,
  type SchoolAssignmentTracking,
  type SchoolCatalogProduct,
  type ProductPlanSummary,
  type SchoolStoryBundle,
  type SchoolStoryContent,
} from "@/src/lib/school-content-api";

const prettyDate = (value?: string): string =>
  value ? new Date(value).toLocaleDateString() : "Recently published";

const getBundleTitle = (bundle: SchoolStoryBundle | null): string =>
  bundle?.story?.content.title ??
  bundle?.contentPack?.title ??
  bundle?.requestedContent?.title ??
  "Story Bundle";

interface AssignmentDraft {
  classroomId: string;
  dueAt: string;
  notes: string;
  studentUserIds: string[];
}

type TabType = "details" | "assignments" | "activities";

// Helper component for circular progress
const CircularProgress = ({ value, size = 80, strokeWidth = 6, color = "#6366f1" }: { value: number; size?: number; strokeWidth?: number; color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{Math.round(value)}%</span>
      </div>
    </div>
  );
};

export default function StoryBookPage() {
  const { user } = useAuth();
  const [schoolDetails, setSchoolDetails] = useState<AdminSchoolDetails | null>(null);
  const [stories, setStories] = useState<SchoolStoryContent[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<SchoolCatalogProduct[]>([]);
  const [catalogPlan, setCatalogPlan] = useState<ProductPlanSummary | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<SchoolStoryBundle | null>(null);
  const [classes, setClasses] = useState<AdminClassroom[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [assignments, setAssignments] = useState<SchoolContentAssignment[]>([]);
  const [assignmentTracking, setAssignmentTracking] = useState<SchoolAssignmentTracking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openingId, setOpeningId] = useState<string>("");
  const [assigning, setAssigning] = useState<boolean>(false);
  const [selectingProductId, setSelectingProductId] = useState<string>("");
  const [libraryMode, setLibraryMode] = useState<"selected" | "catalog">("selected");
  const [trackingId, setTrackingId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const [showUpgradeCta, setShowUpgradeCta] = useState<boolean>(false);
  const [assignmentDraft, setAssignmentDraft] = useState<AssignmentDraft>({
    classroomId: "",
    dueAt: "",
    notes: "",
    studentUserIds: [],
  });
  const [activeTab, setActiveTab] = useState<TabType>("details");

  // Refs for independent scrolling
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const canAssign: boolean = user?.role === "SCHOOL_ADMIN" || user?.role === "TEACHER";
  const isTeacher: boolean = user?.role === "TEACHER";
  const isSchoolAdmin: boolean = user?.role === "SCHOOL_ADMIN";

  useEffect(() => {
    void loadStories();
    if (isSchoolAdmin) {
      void getAdminSchoolDetails()
        .then(setSchoolDetails)
        .catch(() => setSchoolDetails(null));
    }
  }, [isSchoolAdmin]);

  useEffect(() => {
    if (!canAssign) return;
    void loadAssignmentOptions();
  }, [canAssign, user?.id, user?.email]);

  const loadStories = async (): Promise<void> => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      if (isSchoolAdmin) {
        const [selectedProducts, catalog] = await Promise.all([
          getSchoolSelectedProducts(),
          getSchoolCatalogProducts(),
        ]);

        setStories(selectedProducts.products);
        setCatalogProducts(catalog.products);
        setCatalogPlan(selectedProducts.plan ?? catalog.plan);

        if (selectedProducts.products.length > 0) {
          await openBundle(selectedProducts.products[0]._id);
        } else {
          setSelectedBundle(null);
        }
      } else {
        const published = await getPublishedSchoolContents();
        setStories(published);
        setCatalogProducts([]);

        if (published.length > 0) {
          await openBundle(published[0]._id);
        } else {
          setSelectedBundle(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the story book.");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignmentOptions = async (): Promise<void> => {
    try {
      const [classList, studentList, assignmentList] = await Promise.all([
        getAdminClasses(),
        getAdminStudents(),
        getContentAssignments().catch(() => []),
      ]);

      const scopedClasses = isTeacher ? filterClassesForTeacher(classList, user) : classList;
      const scopedStudents = isTeacher ? filterStudentsForTeacher(studentList, classList, user) : studentList;

      setClasses(scopedClasses);
      setStudents(scopedStudents);
      setAssignments(assignmentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignment options.");
    }
  };

  const openBundle = async (contentId: string): Promise<void> => {
    setOpeningId(contentId);
    setError("");
    try {
      const bundle = await getPublishedSchoolStoryBundle(contentId);
      setSelectedBundle(bundle);
      setActiveTab("details");
      // Scroll right panel to top when new bundle opens
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTop = 0;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open the selected story.");
    } finally {
      setOpeningId("");
    }
  };

  const toggleStudentSelection = (studentId: string): void => {
    setAssignmentDraft((current) => ({
      ...current,
      studentUserIds: current.studentUserIds.includes(studentId)
        ? current.studentUserIds.filter((item) => item !== studentId)
        : [...current.studentUserIds, studentId],
      classroomId: "",
    }));
  };

  const handleAssignStory = async (): Promise<void> => {
    const selectedStoryId: string =
      selectedBundle?.story?.content._id ?? selectedBundle?.requestedContent?._id ?? "";

    if (!selectedStoryId) {
      setError("Select a story before creating an assignment.");
      return;
    }

    if (!assignmentDraft.classroomId && assignmentDraft.studentUserIds.length === 0) {
      setError("Choose a class or select at least one student for the assignment.");
      return;
    }

    setAssigning(true);
    setError("");
    setNotice("");

    try {
      await createContentAssignment({
        contentId: selectedStoryId,
        classroomId: assignmentDraft.classroomId || undefined,
        studentUserIds: assignmentDraft.classroomId.length > 0 ? undefined : assignmentDraft.studentUserIds,
        dueAt: assignmentDraft.dueAt ? new Date(assignmentDraft.dueAt).toISOString() : undefined,
        notes: assignmentDraft.notes.trim() || undefined,
      });

      setNotice("Assignment created successfully. Notifications have been triggered.");
      setAssignmentDraft({
        classroomId: "",
        dueAt: "",
        notes: "",
        studentUserIds: [],
      });
      setAssignments(await getContentAssignments().catch(() => assignments));
      setActiveTab("assignments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign story.");
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenAssignmentTracking = async (assignmentId: string): Promise<void> => {
    setTrackingId(assignmentId);
    setError("");

    try {
      const tracking = await getContentAssignmentTracking(assignmentId);
      setAssignmentTracking(tracking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignment tracking.");
    } finally {
      setTrackingId("");
    }
  };

  const handleSelectProduct = async (contentId: string): Promise<void> => {
    setSelectingProductId(contentId);
    setError("");
    setNotice("");
    setShowUpgradeCta(false);

    try {
      await selectSchoolProduct(contentId, {
        selectionType: "selected",
        notes: "Approved for school library.",
      });
      setNotice("Product selected for this school successfully.");
      await loadStories();
      setLibraryMode("selected");
      await openBundle(contentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to select product.";
      setError(message);
      setShowUpgradeCta(message.toLowerCase().includes("upgrade to add more books"));
    } finally {
      setSelectingProductId("");
    }
  };

  const handleRemoveProduct = async (contentId: string): Promise<void> => {
    setSelectingProductId(contentId);
    setError("");
    setNotice("");

    try {
      await removeSchoolProductSelection(contentId);
      setNotice("Product removed from this school.");
      await loadStories();
      const selectedStoryId = selectedBundle?.story?.content._id ?? selectedBundle?.requestedContent?._id ?? "";
      if (selectedStoryId === contentId) {
        setSelectedBundle(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove product.");
    } finally {
      setSelectingProductId("");
    }
  };

  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const source = isSchoolAdmin && libraryMode === "catalog" ? catalogProducts : stories;
    if (!query) return source;

    return source.filter((story) =>
      [story.title, story.subject, story.theme, ...(story.gradeLevels ?? [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [catalogProducts, isSchoolAdmin, libraryMode, stories, searchQuery]);

  const storyChapters = selectedBundle?.story?.chapters ?? [];
  const storyQuestions = selectedBundle?.story?.questions ?? [];
  const activities = selectedBundle?.activities ?? [];
  const selectedStoryId = selectedBundle?.story?.content._id ?? selectedBundle?.requestedContent?._id ?? "";
  const storyAssignments = assignments.filter((assignment) => assignment.contentId === selectedStoryId);
  const assignmentCount = storyAssignments.length;
  const hasOpenPreview = Boolean(selectedStoryId);
  const selectedSchoolProductIds = new Set(isSchoolAdmin ? stories.map((story) => story._id) : []);
  const currentPlan = getSchoolPlanSnapshot(schoolDetails);
  const planLibraryLabel = catalogPlan?.isUnlimited
    ? "Unlimited library"
    : catalogPlan?.maxBooks !== null && catalogPlan?.maxBooks !== undefined
      ? `${catalogPlan.usedBooks}/${catalogPlan.maxBooks} selected`
      : `${stories.length} selected`;
  const planAccessLabel = catalogPlan?.isUnlimited
    ? "Your current plan does not cap selected products."
    : typeof catalogPlan?.remainingBooks === "number"
      ? `${catalogPlan.remainingBooks} more books can still be added on this plan.`
      : "Plan limits will appear here when available.";

  // SEL Reflection prompts
  const selPrompts = [
    { icon: Heart, prompt: "How did this story make you feel?", color: "text-rose-500" },
    { icon: Lightbulb, prompt: "What did you learn from the characters?", color: "text-amber-500" },
    { icon: Target, prompt: "How can you apply this lesson to your own life?", color: "text-emerald-500" },
    { icon: MessageSquare, prompt: "What would you ask the author?", color: "text-sky-500" },
  ];

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="mx-auto max-w-400 space-y-8 p-6 lg:p-8">
          {/* Hero Section - Modern & Bold */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 shadow-2xl lg:p-10"
          >
            <div className="absolute inset-0 opacity-20">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                  backgroundRepeat: "repeat",
                }}
              />
            </div>
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                    Interactive Story Library
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
                  {isSchoolAdmin ? "Curate Your School's Literary Universe" : "Discover Magical Stories"}
                </h1>
                <p className="mt-4 text-lg text-white/80 lg:text-xl">
                  {isSchoolAdmin
                    ? "Select premium content, manage your library, and empower educators with rich storytelling resources."
                    : "Explore our collection of engaging stories designed to inspire young minds and foster a love for reading."}
                </p>
              </div>

              {isSchoolAdmin && (
                <div className="flex flex-wrap gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{stories.length}</p>
                    <p className="text-xs text-white/70">Selected</p>
                  </div>
                  <div className="w-px bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{catalogProducts.length}</p>
                    <p className="text-xs text-white/70">Available</p>
                  </div>
                  <div className="w-px bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{currentPlan.label}</p>
                    <p className="text-xs text-white/70">Current Plan</p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* Notifications */}
          <AnimatePresence>
            {(notice || error) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`rounded-2xl p-4 ${
                  notice
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notice ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                    <span>{notice || error}</span>
                  </div>
                  {showUpgradeCta && (
                    <AppActionButton tone="secondary" size="sm" onClick={() => (window.location.href = "/admin/billing")}>
                      <CreditCard size={14} />
                      <span>Upgrade Plan</span>
                    </AppActionButton>
                  )}
                  <button onClick={() => (setNotice(""), setError(""))} className="rounded-full p-1 hover:bg-white/20">
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Grid - Independent Scrolling Sections */}
          <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
            {/* Left Sidebar - Story List (Independent Scroll) */}
            <div ref={leftPanelRef} className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 200px)" }}>
              {/* Library Mode Toggle (Admin) */}
              {isSchoolAdmin && (
                <div className="flex gap-2 rounded-2xl bg-white p-1 shadow-sm dark:bg-slate-800/50">
                  <button
                    onClick={() => setLibraryMode("selected")}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      libraryMode === "selected"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <PackageCheck size={16} />
                      School Library
                    </div>
                  </button>
                  <button
                    onClick={() => setLibraryMode("catalog")}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      libraryMode === "catalog"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BookmarkCheck size={16} />
                      Platform Catalog
                    </div>
                  </button>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isSchoolAdmin && libraryMode === "catalog"
                      ? "Search catalog by title, subject, theme..."
                      : "Search your library by title, subject, theme..."
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:ring-indigo-500/20"
                />
              </div>

              {/* Story List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isSchoolAdmin && libraryMode === "catalog" ? "Available Titles" : "Your Library"}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {filteredStories.length}
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <AppSkeletonCard />
                    <AppSkeletonCard />
                    <AppSkeletonCard />
                  </div>
                ) : filteredStories.length === 0 ? (
                  <AppEmptyState
                    icon={LibraryBig}
                    title={hasOpenPreview ? "No items match this view" : searchQuery.trim() ? "No matching stories found" : "No stories available"}
                    body={
                      hasOpenPreview
                        ? "A story is still open on the right. Clear your search or switch tabs to see more titles."
                        : searchQuery.trim()
                          ? "Try a different title, subject, or theme in your search."
                          : "Check back later for new content."
                    }
                    className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 dark:border-slate-700 dark:bg-slate-800/30"
                  />
                ) : (
                  <div className="space-y-2">
                    {filteredStories.map((story) => {
                      const isActive = selectedBundle?.story?.content._id === story._id;
                      const isCatalogMode = isSchoolAdmin && libraryMode === "catalog";
                      const isSelected = selectedSchoolProductIds.has(story._id);

                      return (
                        <motion.div
                          key={story._id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => void openBundle(story._id)}
                          className={`group relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                            isActive
                              ? "border-indigo-500 bg-linear-to-br from-indigo-50 to-white shadow-md dark:from-indigo-500/10 dark:to-slate-800"
                              : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-500/30"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex flex-wrap gap-1.5">
                                <AppBadge label={story.type === "CONTENT_PACK" ? "Bundle" : "Story"} tone="slate" />
                                {isSelected && isCatalogMode && (
                                  <AppBadge label="In Library" tone="emerald" icon={CheckCircle2} />
                                )}
                                {isActive && <AppBadge label="Viewing" className="text-[indigo]" />}
                              </div>
                              <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{story.title}</h3>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {story.subject ?? story.theme ?? "General"} • {prettyDate(story.publishedAt ?? story.updatedAt)}
                              </p>
                            </div>
                            <ChevronRight
                              className={`h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 ${
                                isActive ? "translate-x-1 text-indigo-500" : ""
                              }`}
                            />
                          </div>

                          {/* Quick Action for Admin Catalog Mode */}
                          {isCatalogMode && (
                            <div className="absolute bottom-3 right-3" onClick={(e) => e.stopPropagation()}>
                              {isSelected ? (
                                <button
                                  onClick={() => void handleRemoveProduct(story._id)}
                                  className="rounded-full bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => void handleSelectProduct(story._id)}
                                  className="rounded-full bg-indigo-100 p-1.5 text-indigo-600 transition-colors hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400"
                                >
                                  <Plus size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Story Viewer (Independent Scroll) */}
            <div ref={rightPanelRef} className="overflow-y-auto rounded-3xl" style={{ maxHeight: "calc(100vh - 200px)" }}>
              {selectedBundle && !loading ? (
                <div className="flex h-full flex-col bg-white shadow-xl dark:bg-slate-800/50 rounded-3xl">
                  {/* Story Header - Sticky */}
                  <div className="sticky top-0 z-10 relative overflow-hidden rounded-t-3xl bg-linear-to-br from-indigo-500 to-purple-600 p-6 text-white">
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-white/10" />
                    <div className="relative z-10">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                          {selectedBundle.story?.content.theme ?? "Interactive Story"}
                        </span>
                        {selectedBundle.story?.content.estimatedDurationMinutes && (
                          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                            {selectedBundle.story.content.estimatedDurationMinutes} min read
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl font-bold">{getBundleTitle(selectedBundle)}</h2>
                      <p className="mt-3 text-white/80 line-clamp-2">
                        {selectedBundle.story?.content.summary ??
                          selectedBundle.story?.content.description ??
                          "An engaging story ready for your classroom."}
                      </p>
                    </div>
                  </div>

                  {/* Tabs Navigation - Sticky */}
                  <div className="sticky top-[152px] z-10 border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="flex gap-6">
                      <button
                        onClick={() => setActiveTab("details")}
                        className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                          activeTab === "details"
                            ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                      >
                        Story Details
                      </button>
                      {canAssign && (
                        <button
                          onClick={() => setActiveTab("assignments")}
                          className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                            activeTab === "assignments"
                              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                          }`}
                        >
                          Assignments
                        </button>
                      )}
                      <button
                        onClick={() => setActiveTab("activities")}
                        className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                          activeTab === "activities"
                            ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                      >
                        Creative & SEL
                      </button>
                    </div>
                  </div>

                  {/* Tab Content - Scrollable */}
                  <div className="flex-1 p-6">
                    <AnimatePresence mode="wait">
                      {activeTab === "details" && (
                        <motion.div
                          key="details"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          {/* Chapters */}
                          <div>
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Chapters</h3>
                              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                {storyChapters.length}
                              </span>
                            </div>
                            <div className="space-y-4">
                              {storyChapters.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">No chapters available.</p>
                              ) : (
                                storyChapters.map((chapter, idx) => (
                                  <details
                                    key={chapter._id ?? idx}
                                    className="group rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/30"
                                  >
                                    <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-slate-800 dark:text-white">
                                      <span>
                                        Chapter {chapter.order ?? idx + 1}: {chapter.title}
                                      </span>
                                      <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                                    </summary>
                                    <div className="border-t border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                      {chapter.body ?? "Content coming soon..."}
                                    </div>
                                  </details>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Discussion Questions */}
                          <div>
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Discussion Questions</h3>
                              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                {storyQuestions.length}
                              </span>
                            </div>
                            <div className="space-y-3">
                              {storyQuestions.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">No questions yet.</p>
                              ) : (
                                storyQuestions.map((q, idx) => (
                                  <div
                                    key={q._id ?? idx}
                                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
                                  >
                                    <p className="font-medium text-slate-800 dark:text-white">
                                      {q.prompt ?? `Question ${idx + 1}`}
                                    </p>
                                    {q.explanation && (
                                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{q.explanation}</p>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "assignments" && canAssign && (
                        <motion.div
                          key="assignments"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          {/* Assignment Form */}
                          <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50/50 to-white p-5 dark:border-slate-700 dark:from-indigo-500/5 dark:to-slate-800/50">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create New Assignment</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              Assign this story to a class or individual students.
                            </p>

                            <div className="mt-5 space-y-4">
                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Assign to Class
                                </label>
                                <select
                                  value={assignmentDraft.classroomId}
                                  onChange={(e) =>
                                    setAssignmentDraft({
                                      ...assignmentDraft,
                                      classroomId: e.target.value,
                                      studentUserIds: [],
                                    })
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                  <option value="">Select a class</option>
                                  {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name} {c.gradeLevel ? `(${c.gradeLevel})` : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Or Select Students
                                </label>
                                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                                  {students.length === 0 ? (
                                    <p className="p-3 text-center text-sm text-slate-500">No students available.</p>
                                  ) : (
                                    students.map((s) => (
                                      <label
                                        key={s.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={assignmentDraft.studentUserIds.includes(s.id)}
                                          onChange={() => toggleStudentSelection(s.id)}
                                          disabled={!!assignmentDraft.classroomId}
                                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{s.fullName}</span>
                                      </label>
                                    ))
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Due Date (Optional)
                                </label>
                                <input
                                  type="datetime-local"
                                  value={assignmentDraft.dueAt}
                                  onChange={(e) =>
                                    setAssignmentDraft({
                                      ...assignmentDraft,
                                      dueAt: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Notes (Optional)
                                </label>
                                <textarea
                                  rows={2}
                                  value={assignmentDraft.notes}
                                  onChange={(e) =>
                                    setAssignmentDraft({
                                      ...assignmentDraft,
                                      notes: e.target.value,
                                    })
                                  }
                                  placeholder="Add instructions or reminders for students..."
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                              </div>

                              <AppActionButton onClick={handleAssignStory} disabled={assigning} tone="primary" size="lg" className="w-full">
                                {assigning ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {assigning ? "Creating..." : "Create Assignment"}
                              </AppActionButton>
                            </div>
                          </div>

                          {/* Existing Assignments */}
                          <div>
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Existing Assignments</h3>
                              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                {assignmentCount}
                              </span>
                            </div>
                            <div className="space-y-3">
                              {storyAssignments.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">No assignments yet.</p>
                              ) : (
                                storyAssignments.map((a) => (
                                  <div
                                    key={a.id}
                                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
                                  >
                                    <div>
                                      <p className="font-medium text-slate-800 dark:text-white">{a.title ?? "Assignment"}</p>
                                      <p className="mt-1 text-xs text-slate-500">
                                        {a.classroomName ?? "Individual Students"} • Due {prettyDate(a.dueAt)}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleOpenAssignmentTracking(a.id)}
                                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400"
                                    >
                                      View Progress
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Tracking View */}
                          {assignmentTracking && (
                            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 dark:border-indigo-500/30 dark:bg-indigo-500/5">
                              <div className="mb-4 flex items-center justify-between">
                                <h4 className="font-bold text-indigo-800 dark:text-indigo-300">Progress Tracking</h4>
                                <button onClick={() => setAssignmentTracking(null)} className="rounded-full p-1 hover:bg-white/50">
                                  <X size={14} />
                                </button>
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                                <div className="rounded-lg bg-white p-2 dark:bg-slate-800">
                                  <p className="font-bold text-slate-800 dark:text-white">{assignmentTracking.summary.assigned}</p>
                                  <p className="text-slate-500">Assigned</p>
                                </div>
                                <div className="rounded-lg bg-white p-2 dark:bg-slate-800">
                                  <p className="font-bold text-green-600">{assignmentTracking.summary.completed}</p>
                                  <p className="text-slate-500">Completed</p>
                                </div>
                                <div className="rounded-lg bg-white p-2 dark:bg-slate-800">
                                  <p className="font-bold text-blue-600">{assignmentTracking.summary.inProgress}</p>
                                  <p className="text-slate-500">In Progress</p>
                                </div>
                                <div className="rounded-lg bg-white p-2 dark:bg-slate-800">
                                  <p className="font-bold text-slate-600">{assignmentTracking.summary.notStarted}</p>
                                  <p className="text-slate-500">Not Started</p>
                                </div>
                                <div className="rounded-lg bg-white p-2 dark:bg-slate-800">
                                  <p className="font-bold text-red-600">{assignmentTracking.summary.overdue}</p>
                                  <p className="text-slate-500">Overdue</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === "activities" && (
                        <motion.div
                          key="activities"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-8"
                        >
                          {/* Classroom Activities Section */}
                          <div>
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Classroom Activities</h3>
                              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                {activities.length}
                              </span>
                            </div>
                            <div className="space-y-4">
                              {activities.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">No activities available.</p>
                              ) : (
                                activities.map((activity, idx) => (
                                  <div
                                    key={activity._id ?? idx}
                                    className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50"
                                  >
                                    <div className="mb-3 flex items-start justify-between">
                                      <h4 className="font-bold text-slate-800 dark:text-white">{activity.title}</h4>
                                      <AppBadge label={activity.configuration?.activityType ?? "Activity"} className="text-[indigo]" />
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                      {activity.summary ?? activity.description}
                                    </p>
                                    {activity.configuration?.materialsNeeded && activity.configuration.materialsNeeded.length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {activity.configuration.materialsNeeded.map((material) => (
                                          <span
                                            key={material}
                                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                          >
                                            {material}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* SEL Reflection Section */}
                          <div className="rounded-2xl bg-linear-to-br from-emerald-50/50 to-teal-50/50 p-6 dark:from-emerald-500/5 dark:to-teal-500/5">
                            <div className="mb-4 flex items-center gap-2">
                              <Heart className="h-5 w-5 text-rose-500" />
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white">SEL Reflection</h3>
                            </div>
                            <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
                              Help students connect emotionally and socially with the story through these reflection prompts.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {selPrompts.map((prompt, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50"
                                >
                                  <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-700">
                                    <prompt.icon className={`h-4 w-4 ${prompt.color}`} />
                                  </div>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{prompt.prompt}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Creative Comprehension Section */}
                          <div className="rounded-2xl bg-linear-to-br from-amber-50/50 to-orange-50/50 p-6 dark:from-amber-500/5 dark:to-orange-500/5">
                            <div className="mb-4 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-amber-500" />
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Creative Comprehension</h3>
                            </div>
                            <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
                              Encourage deeper understanding through creative expression.
                            </p>
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="rounded-xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50">
                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Write an alternate ending</p>
                              </div>
                              <div className="rounded-xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50">
                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Role-play a key scene</p>
                              </div>
                              <div className="rounded-xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50">
                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
                                  <Star className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Create character fan art</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : loading ? (
                <div className="p-6">
                  <AppSkeletonCard />
                  <AppSkeletonCard />
                  <AppSkeletonCard />
                </div>
              ) : (
                <div className="flex min-h-125 flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800/50 rounded-3xl">
                  <div className="mb-4 rounded-full bg-indigo-100 p-4 dark:bg-indigo-500/20">
                    <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Select a Story</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Choose a story from the library to view its contents and activities.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}