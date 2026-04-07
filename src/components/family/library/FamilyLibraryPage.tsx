"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import FamilyShell from "@/src/components/family/layout/FamilyShell";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import AppEmptyState from "@/src/components/shared/ui/AppEmptyState";
import {
  getFamilyCatalogProducts,
  getFamilyProductBundle,
  getFamilySelectedProducts,
  selectFamilyProduct,
  type FamilyCatalogResponse,
} from "@/src/lib/family-api";
import { getSchoolPlanSnapshot } from "@/src/lib/school-plan";

export default function FamilyLibraryPage() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<any>(null);
  const [plan, setPlan] = useState<FamilyCatalogResponse["plan"]>(null);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState("");
  const [selectingId, setSelectingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showUpgradeCta, setShowUpgradeCta] = useState(false);

  const loadLibrary = async () => {
    setLoading(true);
    setError("");

    try {
      const [catalogData, selectedData] = await Promise.all([
        getFamilyCatalogProducts(),
        getFamilySelectedProducts(),
      ]);

      setCatalog(catalogData.products);
      setSelectedProducts(selectedData.products);
      setPlan(selectedData.plan ?? catalogData.plan);

      if (selectedData.products[0]?._id) {
        setSelectedBundle(await getFamilyProductBundle(selectedData.products[0]._id));
      } else {
        setSelectedBundle(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load family library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLibrary();
  }, []);

  const openBundle = async (contentId: string) => {
    setOpeningId(contentId);
    setError("");

    try {
      setSelectedBundle(await getFamilyProductBundle(contentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open family product.");
    } finally {
      setOpeningId("");
    }
  };

  const handleSelect = async (contentId: string) => {
    setSelectingId(contentId);
    setError("");
    setNotice("");
    setShowUpgradeCta(false);

    try {
      await selectFamilyProduct(contentId, "Selected for family reading");
      setNotice("Book added to your family library.");
      await loadLibrary();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add this book.";
      setError(message);
      setShowUpgradeCta(message.toLowerCase().includes("upgrade to add more books"));
    } finally {
      setSelectingId("");
    }
  };

  const selectedIds = useMemo(() => new Set(selectedProducts.map((item) => item._id)), [selectedProducts]);
  const bundleTitle = selectedBundle?.story?.content?.title ?? selectedBundle?.contentPack?.title ?? "Family bundle";
  const currentPlan = getSchoolPlanSnapshot({ tier: plan?.key });
  const planUsageLabel = plan?.isUnlimited
    ? "Unlimited books"
    : plan?.maxBooks !== null && plan?.maxBooks !== undefined
      ? `${plan.usedBooks}/${plan.maxBooks} used`
      : `${selectedProducts.length} selected`;
  const planRemainingLabel = plan?.isUnlimited
    ? "No cap on your family library"
    : typeof plan?.remainingBooks === "number"
      ? `${plan.remainingBooks} book slots left`
      : "Plan details unavailable";

  return (
    <FamilyShell>
      <div className="space-y-8">
        <section className="rounded-[2.2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_22%),linear-gradient(180deg,#ecfeff_0%,#f8fafc_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_22%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-300">
            <BookOpen size={16} />
            Family Library
          </div>
          <h1 className="mt-6 text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
            Shop stories for your home reading library
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Browse available products, add the ones that fit your child, and open the family bundle for home reading.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <AppBadge label={`${selectedProducts.length} selected`} tone="emerald" />
            <AppBadge label={`${catalog.length} in catalog`} tone="cyan" />
            <AppBadge label={`Plan: ${currentPlan.label}`} tone={currentPlan.tone} icon={CreditCard} />
            <AppBadge label={planUsageLabel} tone="amber" />
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <AppBadge label={currentPlan.label} tone={currentPlan.tone} icon={CreditCard} />
                <AppBadge label={plan?.isUnlimited ? "Unlimited" : "Book limit"} tone="slate" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
                Family plan access
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                {currentPlan.summary} Family libraries grow based on the active family plan, and the plan limit controls how many books can be added.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {planRemainingLabel}
              </p>
            </div>
          </div>
        </section>

        {notice ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <span>{error}</span>
              {showUpgradeCta ? (
                <AppActionButton
                  tone="secondary"
                  size="sm"
                  onClick={() => {
                    window.location.href = "/family/billing";
                  }}
                >
                  <CreditCard size={14} />
                  <span>Upgrade plan</span>
                </AppActionButton>
              ) : null}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Catalog</h2>
              {catalog.length === 0 ? (
                <AppEmptyState
                  title="No family products available yet"
                  body="When products are available, they will appear here."
                  icon={Sparkles}
                  className="mt-5 min-h-[14rem] border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:text-slate-500 dark:[&_p]:text-slate-400"
                />
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {catalog.map((item) => (
                    <article key={item._id} className="flex h-full flex-col rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.summary ?? "No summary yet."}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(item.gradeLevels ?? []).slice(0, 2).map((grade: string) => (
                          <AppBadge key={grade} label={grade} tone="amber" />
                        ))}
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        <AppActionButton onClick={() => void openBundle(item._id)} tone="ghost" size="sm">
                          {openingId === item._id ? "Opening..." : "Preview"}
                        </AppActionButton>
                        {item.isSelectedForFamily || selectedIds.has(item._id) ? (
                          <AppActionButton disabled tone="success" size="sm">
                            <CheckCircle2 size={16} />
                            <span>Added</span>
                          </AppActionButton>
                        ) : (
                          <AppActionButton onClick={() => void handleSelect(item._id)} disabled={selectingId === item._id} tone="primary" size="sm">
                            {selectingId === item._id ? "Adding..." : "Add to Library"}
                          </AppActionButton>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{bundleTitle}</h2>
              {selectedBundle ? (
                <div className="mt-5 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                    {selectedBundle.story?.content?.coverImageUrl ? (
                      <img src={selectedBundle.story.content.coverImageUrl} alt={bundleTitle} className="h-80 w-full object-cover" />
                    ) : (
                      <div className="flex h-80 items-center justify-center bg-gradient-to-br from-sky-500/20 to-emerald-500/20 px-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        No cover image yet for this family preview.
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {selectedBundle.story?.content?.summary ?? selectedBundle.story?.content?.description ?? "No story summary available yet."}
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Chapters</p>
                        <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{selectedBundle.story?.chapters?.length ?? 0}</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Questions</p>
                        <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{selectedBundle.story?.questions?.length ?? 0}</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Activities</p>
                        <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{selectedBundle.activities?.length ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <AppEmptyState
                  title="Open a family book preview"
                  body="Select or preview a book from the catalog to inspect the family bundle here."
                  icon={BookOpen}
                  className="mt-5 min-h-[14rem] border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:text-slate-500 dark:[&_p]:text-slate-400"
                />
              )}
            </section>
          </div>
        )}
      </div>
    </FamilyShell>
  );
}
