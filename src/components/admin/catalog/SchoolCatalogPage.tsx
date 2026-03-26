"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookmarkCheck,
  BookOpen,
  LibraryBig,
  Loader2,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
  Tags,
  XCircle,
} from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import AppStatCard from "@/src/components/shared/ui/AppStatCard";
import {
  getSchoolCatalogProducts,
  getSchoolSelectedProducts,
  removeSchoolProductSelection,
  selectSchoolProduct,
  type SchoolCatalogProduct,
} from "@/src/lib/school-content-api";

const prettyDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "Recently updated";

const getProductSummary = (product: SchoolCatalogProduct) =>
  product.summary ?? product.description ?? "A premium reading product available for your school.";

export default function SchoolCatalogPage() {
  const [catalogProducts, setCatalogProducts] = useState<SchoolCatalogProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SchoolCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"catalog" | "selected">("catalog");
  const [workingProductId, setWorkingProductId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    setError("");

    try {
      const [catalog, selected] = await Promise.all([
        getSchoolCatalogProducts(),
        getSchoolSelectedProducts(),
      ]);

      setCatalogProducts(catalog);
      setSelectedProducts(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the school catalog.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = async (contentId: string) => {
    setWorkingProductId(contentId);
    setError("");
    setNotice("");

    try {
      await selectSchoolProduct(contentId, {
        selectionType: "selected",
        notes: "Approved for this school library.",
      });

      setNotice("Product selected for your school successfully.");
      await loadCatalog();
      setActiveTab("selected");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select product.");
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
      setNotice("Product removed from your school library.");
      await loadCatalog();
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

  return (
    <ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}>
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-6 shadow-sm dark:border-cyan-500/20 dark:from-cyan-500/10 dark:via-slate-900 dark:to-emerald-500/10"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-400/20 dark:bg-white/5 dark:text-cyan-300">
                <ShoppingBag size={14} />
                <span>School Catalog</span>
              </div>
              <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
                Browse, approve, and manage the stories your school can use.
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                This is the school shop for premium reading products. Browse the platform catalog,
                select the stories your school wants, and keep your active school library tidy in one place.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[25rem]">
              <AppStatCard label="Catalog" value={catalogProducts.length} icon={ShoppingBag} tone="cyan" />
              <AppStatCard label="Selected" value={selectedCount} icon={PackageCheck} tone="emerald" />
              <AppStatCard label="Ready To Add" value={availableCount} icon={Sparkles} tone="amber" />
            </div>
          </div>
        </motion.section>

        {notice ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <section className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "catalog"
                    ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-300"
                    : "border-gray-200 bg-white text-slate-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
              >
                <BookmarkCheck size={16} />
                <span>Platform Catalog</span>
              </button>
              <button
                onClick={() => setActiveTab("selected")}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "selected"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-gray-200 bg-white text-slate-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
              >
                <PackageCheck size={16} />
                <span>Selected Products</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <Search size={18} className="text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={
                    activeTab === "catalog"
                      ? "Search catalog by title, theme, grade, SEL..."
                      : "Search selected products by title, theme, grade..."
                  }
                  className="w-full min-w-[16rem] bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>

              <Link
                href="/admin/story-book"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <BookOpen size={16} />
                <span>Open Story Book</span>
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
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
                className="col-span-full py-16"
              />
            ) : (
              filteredProducts.map((product) => {
                const isSelected = product.isSelectedForSchool ?? selectedProducts.some((item) => item._id === product._id);
                const isWorking = workingProductId === product._id;

                return (
                  <motion.article
                    key={product._id}
                    whileHover={{ y: -4 }}
                    className="flex h-full flex-col rounded-[1.75rem] border border-gray-200 bg-gray-50 p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <AppBadge
                          label={product.type === "CONTENT_PACK" ? "Bundle" : "Story"}
                          icon={product.type === "CONTENT_PACK" ? PackageCheck : BookOpen}
                          tone="slate"
                        />
                        <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">{product.title}</h2>
                      </div>

                      <AppBadge label={isSelected ? "Selected" : "Available"} tone={isSelected ? "emerald" : "cyan"} />
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {getProductSummary(product)}
                    </p>

                    <div className="mt-4 flex min-h-[3.25rem] flex-wrap content-start gap-2">
                      {product.gradeLevels?.slice(0, 3).map((grade) => (
                        <span
                          key={grade}
                          className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300"
                        >
                          {grade}
                        </span>
                      ))}
                      {product.selFocus?.slice(0, 2).map((focus) => (
                        <AppBadge key={focus} label={focus} icon={Tags} tone="cyan" className="normal-case tracking-normal" />
                      ))}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/40">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Subject</p>
                        <p className="mt-2 line-clamp-2 min-h-[2.75rem] font-semibold text-slate-900 dark:text-white">
                          {product.subject ?? product.theme ?? "Reading"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/40">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Updated</p>
                        <p className="mt-2 min-h-[2.75rem] font-semibold text-slate-900 dark:text-white">
                          {prettyDate(product.updatedAt ?? product.publishedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2">
                      {isSelected ? (
                        <>
                          <AppActionButton
                            onClick={() => void handleRemoveProduct(product._id)}
                            disabled={isWorking}
                            tone="danger"
                            size="lg"
                            fullWidth
                          >
                            {isWorking ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                            <span>{isWorking ? "Removing..." : "Remove From School"}</span>
                          </AppActionButton>

                          <Link
                            href="/admin/story-book"
                            className="inline-flex"
                          >
                            <AppActionButton tone="secondary" size="lg" fullWidth className="pointer-events-none w-full">
                              <BookOpen size={16} />
                              <span>Open In Story Book</span>
                            </AppActionButton>
                          </Link>
                        </>
                      ) : (
                        <AppActionButton
                          onClick={() => void handleSelectProduct(product._id)}
                          disabled={isWorking}
                          tone="primary"
                          size="lg"
                          fullWidth
                          className="sm:col-span-2"
                        >
                          {isWorking ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                          <span>{isWorking ? "Selecting..." : "Select For School"}</span>
                        </AppActionButton>
                      )}
                    </div>
                  </motion.article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
