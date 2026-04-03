"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookHeart, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import FamilyShell from "@/src/components/family/layout/FamilyShell";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import {
  createBillingCheckoutSession,
  createBillingPortalSession,
  getBillingPlans,
  type BillingPlanDefinition,
} from "@/src/lib/billing-api";

const fallbackPlan: BillingPlanDefinition = {
  key: "family_starter",
  title: "Family Starter",
  subtitle: "A home reading plan for independent families using PathSpring.",
  description: "A home reading plan for independent families using PathSpring.",
  maxBooks: null,
  isUnlimited: false,
  features: [
    "Create and manage child profiles",
    "Add books to your family library",
    "Track progress and submissions at home",
  ],
};

export default function FamilyBillingPage() {
  const [plan, setPlan] = useState<BillingPlanDefinition | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getBillingPlans()
      .then((items) => {
        setPlan(items.find((item) => item.key === "family_starter") ?? null);
      })
      .catch(() => setPlan(null));
  }, []);

  const activePlan = plan ?? fallbackPlan;
  const limitLabel = plan?.isUnlimited
    ? "Unlimited books"
    : typeof plan?.maxBooks === "number"
      ? `${plan.maxBooks} books included`
      : "";

  const handleCheckout = async () => {
    setError("");
    setCheckoutLoading(true);

    try {
      const session = await createBillingCheckoutSession("family_starter");
      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start family checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setError("");
    setPortalLoading(true);

    try {
      const session = await createBillingPortalSession();
      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open family billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <FamilyShell>
      <div className="space-y-8">
        <section className="rounded-[2.4rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_24%),linear-gradient(180deg,#ecfeff_0%,#fffaf5_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_24%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-300">
              <Sparkles size={16} />
              Family Billing
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 dark:text-white md:text-5xl">
              Keep your family reading plan active with a simple Stripe checkout.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Family mode uses its own billing flow. Start the family starter plan, then manage updates anytime in the Stripe customer portal.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <AppBadge label="Family mode" tone="cyan" />
              <AppBadge label="Stripe billing" tone="amber" />
              {limitLabel ? <AppBadge label={limitLabel} tone="emerald" /> : null}
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
              {activePlan.title}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">One home reading plan for your family library</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {activePlan.subtitle ??
                activePlan.description ??
                "This plan is built for independent families who want PathSpring at home, with child profiles, a family library, and progress tracking in one place."}
            </p>
            {limitLabel ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {limitLabel}
              </p>
            ) : null}

            <div className="mt-6 space-y-3">
              {activePlan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 text-emerald-500" size={16} />
                  <p className="text-sm text-slate-700 dark:text-slate-300">{feature}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <AppActionButton tone="primary" size="lg" onClick={() => void handleCheckout()} disabled={checkoutLoading}>
                <BookHeart size={16} />
                {checkoutLoading ? "Starting checkout..." : "Subscribe to Family Starter"}
                <ArrowRight size={16} />
              </AppActionButton>
              <AppActionButton tone="secondary" size="lg" onClick={() => void handlePortal()} disabled={portalLoading}>
                <CreditCard size={16} />
                {portalLoading ? "Opening portal..." : "Manage Billing"}
              </AppActionButton>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">How it works</h3>
            <div className="mt-5 space-y-4">
              {[
                "Choose Family Starter",
                "Complete checkout in Stripe",
                "Come back here anytime to manage billing",
              ].map((step, index) => (
                <div key={step} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Step {index + 1}</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{step}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </FamilyShell>
  );
}
