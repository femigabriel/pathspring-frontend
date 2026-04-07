"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkCheck,
  BookOpen,
  CreditCard,
  LibraryBig,
  Loader2,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tags,
  XCircle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Star,
} from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import { getAdminSchoolDetails, type AdminSchoolDetails } from "@/src/lib/admin-api";
import { getSchoolPlanSnapshot } from "@/src/lib/school-plan";
import {
  getSchoolCatalogProducts,
  getSchoolSelectedProducts,
  type ProductPlanSummary,
  removeSchoolProductSelection,
  selectSchoolProduct,
  type SchoolCatalogProduct,
} from "@/src/lib/school-content-api";
import { useTheme } from "@/src/contexts/ThemeContext";

const prettyDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "Recently updated";

const getProductSummary = (product: SchoolCatalogProduct) =>
  product.summary ?? product.description ?? "A premium reading product available for your school.";

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, color, isDark }: any) => (
  <motion.div whileHover={{ y: -3 }} className="relative group">
    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${color} opacity-0 blur-md transition-opacity group-hover:opacity-60`} />
    <div className={`relative rounded-xl p-3.5 text-center transition-all group-hover:shadow-md ${isDark ? "bg-slate-800/60 border border-slate-700" : "bg-white/80 border border-white/60 shadow-sm"}`}>
      <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
        <Icon className="text-white" size={18} />
      </div>
      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{title}</p>
      <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
    </div>
  </motion.div>
);

const StatCard = ({ value, label, icon: Icon, isDark, color = "purple" }: any) => {
  const colorMap: Record<string, string> = {
    cyan: "from-cyan-500 to-blue-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    purple: "from-purple-500 to-pink-500",
  };
  return (
    <div className={`rounded-xl p-4 text-center transition-all hover:shadow-md ${isDark ? "bg-slate-800/60 border border-slate-700" : "bg-white/80 border border-white/60"}`}>
      <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-r ${colorMap[color]} flex items-center justify-center`}>
        <Icon className="text-white" size={20} />
      </div>
      <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{value}</p>
      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
    </div>
  );
};

export default function SchoolCatalogPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [schoolDetails, setSchoolDetails] = useState<AdminSchoolDetails | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<SchoolCatalogProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SchoolCatalogProduct[]>([]);
  const [catalogPlan, setCatalogPlan] = useState<ProductPlanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"catalog" | "selected">("catalog");
  const [workingProductId, setWorkingProductId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showUpgradeCta, setShowUpgradeCta] = useState(false);

  useEffect(() => {
    void loadCatalog({ showLoading: true });
    void getAdminSchoolDetails()
      .then(setSchoolDetails)
      .catch(() => setSchoolDetails(null));
  }, []);

  const currentPlan = getSchoolPlanSnapshot(schoolDetails);

  const updatePlanUsage = (delta: number) => {
    setCatalogPlan((current) => {
      if (!current) return current;

      const usedBooks = Math.max(current.usedBooks + delta, 0);
      const remainingBooks =
        current.remainingBooks === null
          ? null
          : Math.max(current.remainingBooks - delta, 0);

      return {
        ...current,
        usedBooks,
        remainingBooks,
      };
    });
  };

  const loadCatalog = async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");

    try {
      const [catalog, selected] = await Promise.all([
        getSchoolCatalogProducts(),
        getSchoolSelectedProducts(),
      ]);

      setCatalogProducts(catalog.products);
      setSelectedProducts(selected.products);
      setCatalogPlan(selected.plan ?? catalog.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the school catalog.");
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const handleSelectProduct = async (contentId: string) => {
    setWorkingProductId(contentId);
    setError("");
    setNotice("");
    setShowUpgradeCta(false);

    try {
      await selectSchoolProduct(contentId, {
        selectionType: "selected",
        notes: "Approved for this school library.",
      });

      const selectedItem = catalogProducts.find((product) => product._id === contentId);
      if (selectedItem) {
        setCatalogProducts((current) =>
          current.map((product) =>
            product._id === contentId
              ? { ...product, isSelectedForSchool: true }
              : product,
          ),
        );
        setSelectedProducts((current) =>
          current.some((product) => product._id === contentId)
            ? current
            : [{ ...selectedItem, isSelectedForSchool: true }, ...current],
        );
        updatePlanUsage(1);
      }

      setNotice("Product selected for your school successfully.");
      setActiveTab("selected");
      void loadCatalog();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to select product.";
      setError(message);
      setShowUpgradeCta(message.toLowerCase().includes("upgrade to add more books"));
    } finally {
      setWorkingProductId("");
    }
  };

  const handleRemoveProduct = async (contentId: string) => {
    setWorkingProductId(contentId);
    setError("");
    setNotice("");

    try {
      await removeSchoolProductSelection(contentId);
      setCatalogProducts((current) =>
        current.map((product) =>
          product._id === contentId
            ? { ...product, isSelectedForSchool: false }
            : product,
        ),
      );
      setSelectedProducts((current) =>
        current.filter((product) => product._id !== contentId),
      );
      updatePlanUsage(-1);
      setNotice("Product removed from your school library.");
      void loadCatalog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove product.");
    } finally {
      setWorkingProductId("");
    }
  };

  const filteredProducts = useMemo(() => {
    const source = activeTab === "catalog" ? catalogProducts : selectedProducts;
    const query = searchQuery.trim().toLowerCase();

    if (!query) return source;

    return source.filter((product) =>
      [
        product.title,
        product.subject,
        product.theme,
        ...(product.gradeLevels ?? []),
        ...(product.selFocus ?? []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [activeTab, catalogProducts, searchQuery, selectedProducts]);

  const selectedCount = selectedProducts.length;
  const availableCount = catalogProducts.filter((product) => !product.isSelectedForSchool).length;
  const planUsageLabel = catalogPlan?.isUnlimited
    ? "Unlimited books"
    : catalogPlan?.maxBooks !== null && catalogPlan?.maxBooks !== undefined
      ? `${catalogPlan.usedBooks}/${catalogPlan.maxBooks} used`
      : `${selectedCount} selected`;
  const planRemainingLabel = catalogPlan?.isUnlimited
    ? "No cap on your library"
    : typeof catalogPlan?.remainingBooks === "number"
      ? `${catalogPlan.remainingBooks} slots left`
      : "Plan details unavailable";

  const bgClass = isDark
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    : "bg-gradient-to-br from-sky-50 via-white to-emerald-50";

  const features = [
    { icon: ShoppingBag, title: "Browse Catalog", description: "Explore premium products", color: "from-cyan-500 to-blue-500" },
    { icon: PackageCheck, title: "Select Products", description: "Approve for school", color: "from-emerald-500 to-teal-500" },
    { icon: BookOpen, title: "Manage Library", description: "Keep it tidy", color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, title: "Track Usage", description: "Monitor adoption", color: "from-orange-500 to-red-500" },
  ];

  const stats = [
    { value: catalogProducts.length.toString(), label: "Available Products", icon: ShoppingBag, color: "cyan" },
    { value: selectedCount.toString(), label: "Selected for School", icon: PackageCheck, color: "emerald" },
    { value: availableCount.toString(), label: "Ready to Add", icon: Sparkles, color: "amber" },
  ];

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}>
      <div className={`min-h-screen ${bgClass} px-4 py-6 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 ${isDark ? "bg-slate-900/80 backdrop-blur-xl border border-white/10" : "bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl"}`}
          >
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1.5 rounded-full shadow-lg mb-4">
                  <ShoppingBag size={14} />
                  <span className="text-xs font-semibold">School Catalog Manager</span>
                </div>
                <h1 className={`text-3xl md:text-4xl font-black mb-3 ${isDark ? "text-white" : "text-slate-800"}`}>
                  School Library Manager
                </h1>
                <p className={`text-sm md:text-base max-w-2xl ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Browse, approve, and manage the stories your school can use. Select premium products
                  from the platform catalog and keep your active school library organized.
                </p>
              </div>

              {/* Plan Card */}
              <div className={`rounded-xl p-4 min-w-[200px] ${isDark ? "bg-slate-800/60 border border-slate-700" : "bg-white/80 border border-white/60"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-purple-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Current Plan</span>
                </div>
                <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{currentPlan.label}</p>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{planUsageLabel}</p>
                <p className={`text-xs mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{planRemainingLabel}</p>
                <button
                  onClick={() => { window.location.href = "/admin/billing"; }}
                  className="mt-3 text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <CreditCard size={12} />
                  Manage Plan <ArrowRight size={10} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} isDark={isDark} />
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {features.map((feature, idx) => (
                <FeatureCard key={idx} {...feature} isDark={isDark} />
              ))}
            </div>
          </motion.section>

          {/* Notifications */}
          <AnimatePresence>
            {notice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-4 flex items-center gap-3 ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}
              >
                <CheckCircle size={18} className="text-emerald-500" />
                <p className={`text-sm flex-1 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>{notice}</p>
                <button onClick={() => setNotice("")} className="text-emerald-500 hover:text-emerald-600">×</button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-4 ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-sm flex-1">{error}</span>
                  </div>
                  {showUpgradeCta && (
                    <button
                      onClick={() => { window.location.href = "/admin/billing"; }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isDark ? "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30" : "bg-cyan-500 text-white hover:bg-cyan-600"}`}
                    >
                      <CreditCard size={14} className="inline mr-2" />
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl ${isDark ? "bg-slate-900/80 backdrop-blur-xl border border-white/10" : "bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl"} overflow-hidden`}
          >
            {/* Tabs Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 pt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("catalog")}
                  className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === "catalog"
                      ? isDark ? "bg-slate-800 text-cyan-400 border-t border-x border-slate-700" : "bg-white text-cyan-600 border-t border-x border-slate-200"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  <BookmarkCheck size={16} />
                  Platform Catalog
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                    {catalogProducts.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("selected")}
                  className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === "selected"
                      ? isDark ? "bg-slate-800 text-emerald-400 border-t border-x border-slate-700" : "bg-white text-emerald-600 border-t border-x border-slate-200"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  <PackageCheck size={16} />
                  Selected Products
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                    {selectedCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === "catalog"
                      ? "Search by title, theme, grade level..."
                      : "Search selected products..."
                  }
                  className={`w-full rounded-xl border-2 pl-11 pr-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                    isDark
                      ? "bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                      : "bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                  }`}
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="p-6">
              {refreshing ? (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                  <Loader2 size={12} className="animate-spin" />
                  Syncing school library...
                </div>
              ) : null}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-cyan-500" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <AppEmptyState
                  icon={LibraryBig}
                  title={activeTab === "catalog" ? "No catalog products found" : "No selected products yet"}
                  body={
                    activeTab === "catalog"
                      ? "Try another search or check back when more premium products are published."
                      : "Select products from the platform catalog to make them available to your teachers and students."
                  }
                  className="py-16"
                />
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const isSelected = product.isSelectedForSchool ?? selectedProducts.some((item) => item._id === product._id);
                    const isWorking = workingProductId === product._id;

                    return (
                      <motion.article
                        key={product._id}
                        whileHover={{ y: -4 }}
                        className={`rounded-xl p-5 transition-all ${
                          isDark
                            ? "bg-slate-800/60 border border-slate-700 hover:border-cyan-500/30"
                            : "bg-white/80 border border-white/60 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                              isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                            }`}>
                              {product.type === "CONTENT_PACK" ? <PackageCheck size={12} /> : <BookOpen size={12} />}
                              {product.type === "CONTENT_PACK" ? "Bundle" : "Story"}
                            </span>
                            <h3 className={`text-lg font-bold mt-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                              {product.title}
                            </h3>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isSelected
                              ? isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                              : isDark ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                          }`}>
                            {isSelected ? "Selected" : "Available"}
                          </span>
                        </div>

                        {/* Description */}
                        <p className={`text-sm leading-relaxed line-clamp-3 mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          {getProductSummary(product)}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.gradeLevels?.slice(0, 3).map((grade) => (
                            <span key={grade} className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                            }`}>
                              {grade}
                            </span>
                          ))}
                          {product.selFocus?.slice(0, 2).map((focus) => (
                            <span key={focus} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                              isDark ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                            }`}>
                              <Tags size={10} />
                              {focus}
                            </span>
                          ))}
                        </div>

                        {/* Meta Info */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className={`rounded-lg p-2 ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500">Subject</p>
                            <p className={`text-sm font-medium mt-1 ${isDark ? "text-white" : "text-slate-700"}`}>
                              {product.subject ?? product.theme ?? "Reading"}
                            </p>
                          </div>
                          <div className={`rounded-lg p-2 ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500">Updated</p>
                            <p className={`text-sm font-medium mt-1 ${isDark ? "text-white" : "text-slate-700"}`}>
                              {prettyDate(product.updatedAt ?? product.publishedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {isSelected ? (
                            <>
                              <button
                                onClick={() => void handleRemoveProduct(product._id)}
                                disabled={isWorking}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                                  isDark
                                    ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                    : "bg-red-50 text-red-600 hover:bg-red-100"
                                } disabled:opacity-50`}
                              >
                                {isWorking ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                {isWorking ? "Removing..." : "Remove"}
                              </button>
                              <Link
                                href="/admin/story-book"
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                                  isDark
                                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                <BookOpen size={14} />
                                View
                              </Link>
                            </>
                          ) : (
                            <button
                              onClick={() => void handleSelectProduct(product._id)}
                              disabled={isWorking}
                              className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                            >
                              {isWorking ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                              {isWorking ? "Selecting..." : "Select for School"}
                            </button>
                          )}
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
