"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import AppActionButton from "@/src/components/shared/ui/AppActionButton";
import AppBadge from "@/src/components/shared/ui/AppBadge";
import { getAdminSchoolDetails, type AdminSchoolDetails } from "@/src/lib/admin-api";
import {
  createBillingCheckoutSession,
  createBillingPortalSession,
  getBillingPlans,
  type BillingPlanDefinition,
  type BillingPlanKey,
} from "@/src/lib/billing-api";
import { getSchoolPlanSnapshot } from "@/src/lib/school-plan";

const fallbackSchoolPlans: Array<{
  key: BillingPlanKey;
  title: string;
  priceLabel: string;
  subtitle: string;
  badge?: string;
  features: string[];
}> = [
  {
    key: "school_starter",
    title: "School Starter",
    priceLabel: "Starter Plan",
    subtitle: "A clean setup for smaller schools getting started with PathSpring.",
    features: ["School catalog access", "Teacher dashboard", "Assignments and notifications"],
  },
  {
    key: "school_growth",
    title: "School Growth",
    priceLabel: "Growth Plan",
    subtitle: "For schools ready to expand reading, tracking, and classroom flow.",
    badge: "Popular",
    features: ["Everything in Starter", "Richer reading operations", "Better scaling for active classes"],
  },
  {
    key: "school_premium",
    title: "School Premium",
    priceLabel: "Premium Plan",
    subtitle: "For larger schools that want the fullest PathSpring billing tier.",
    features: ["Everything in Growth", "Top-tier school experience", "Best fit for full adoption"],
  },
];

export default function SchoolBillingPage() {
  const [schoolDetails, setSchoolDetails] = useState<AdminSchoolDetails | null>(null);
  const [plans, setPlans] = useState<BillingPlanDefinition[]>([]);
  const [loadingPlan, setLoadingPlan] = useState<BillingPlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");
  const currentPlan = getSchoolPlanSnapshot(schoolDetails);

  useEffect(() => {
    void getAdminSchoolDetails()
      .then(setSchoolDetails)
      .catch(() => setSchoolDetails(null));
    void getBillingPlans()
      .then((items) => setPlans(items.filter((item) => item.key.startsWith("school_"))))
      .catch(() => setPlans([]));
  }, []);

  const schoolPlans = plans.length
    ? plans.map((plan) => ({
        key: plan.key as BillingPlanKey,
        title: plan.title,
        priceLabel: plan.title,
        subtitle:
          plan.subtitle ??
          plan.description ??
          (plan.isUnlimited
            ? "For larger schools that want the fullest PathSpring billing tier."
            : typeof plan.maxBooks === "number"
              ? `Includes up to ${plan.maxBooks} books for your school library.`
              : "A school plan for your reading rollout."),
        badge: plan.badge,
        features: plan.features,
      }))
    : fallbackSchoolPlans;

  const handleCheckout = async (planKey: BillingPlanKey) => {
    setError("");
    setLoadingPlan(planKey);

    try {
      const session = await createBillingCheckoutSession(planKey);
      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setError("");
    setPortalLoading(true);

    try {
      const session = await createBillingPortalSession();
      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2.4rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_24%),linear-gradient(180deg,#ecfeff_0%,#f8fafc_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.14),transparent_24%),linear-gradient(180deg,#111827_0%,#0b1120_100%)] md:p-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm dark:bg-white/10 dark:text-cyan-300">
            <Sparkles size={16} />
            School Billing
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 dark:text-white md:text-5xl">
            Choose a school plan that matches your reading rollout.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Start a Stripe checkout for your school plan, then return anytime to manage billing through the customer portal.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <AppBadge label="Stripe Checkout" tone="cyan" />
            <AppBadge label="School admin only" tone="emerald" />
            <AppBadge label={`Current plan: ${currentPlan.label}`} tone={currentPlan.tone} icon={ShieldCheck} />
            <AppBadge label={currentPlan.statusLabel} tone={currentPlan.statusTone} />
          </div>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center gap-2">
              <AppBadge label={currentPlan.label} tone={currentPlan.tone} icon={ShieldCheck} />
              <AppBadge label={currentPlan.statusLabel} tone={currentPlan.statusTone} />
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
              {currentPlan.isFree ? "Your school is currently on the free version." : `Your school is on ${currentPlan.label}.`}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {currentPlan.summary} {currentPlan.accessMessage}
            </p>
            {currentPlan.renewalLabel ? (
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {currentPlan.renewalLabel}
              </p>
            ) : null}
          </div>

          <AppActionButton tone="primary" size="lg" onClick={handlePortal} disabled={portalLoading}>
            <CreditCard size={16} />
            {portalLoading ? "Opening portal..." : "Manage Billing"}
          </AppActionButton>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-3">
        {schoolPlans.map((plan) => {
            const livePlan = plans.find((item) => item.key === plan.key);
            const limitLabel = livePlan?.isUnlimited
              ? "Unlimited books"
              : typeof livePlan?.maxBooks === "number"
                ? `${livePlan.maxBooks} books included`
                : "";

            return (
          <article
            key={plan.key}
            className={`rounded-[2rem] border p-6 shadow-xl backdrop-blur-xl ${currentPlan.key === plan.key ? "border-cyan-300 bg-cyan-50/80 dark:border-cyan-400/30 dark:bg-cyan-500/10" : "border-white/70 bg-white/90 dark:border-white/10 dark:bg-white/5"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                  {plan.priceLabel}
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{plan.title}</h2>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {currentPlan.key === plan.key ? <AppBadge label="Current plan" tone="emerald" /> : null}
                {plan.badge ? <AppBadge label={plan.badge} tone="amber" /> : null}
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{plan.subtitle}</p>
            {limitLabel ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {limitLabel}
              </p>
            ) : null}

            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 text-emerald-500" size={16} />
                  <p className="text-sm text-slate-700 dark:text-slate-300">{feature}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <AppActionButton
                tone={currentPlan.key === plan.key ? "secondary" : "primary"}
                size="lg"
                fullWidth
                onClick={() => void handleCheckout(plan.key)}
                disabled={loadingPlan === plan.key}
              >
                <Building2 size={16} />
                {loadingPlan === plan.key
                  ? "Starting checkout..."
                  : currentPlan.key === plan.key
                    ? "Switch or renew in Stripe"
                    : currentPlan.isFree
                      ? "Subscribe with Stripe"
                      : "Change plan in Stripe"}
                {currentPlan.key === plan.key ? null : <ArrowRight size={16} />}
              </AppActionButton>
            </div>
          </article>
            );
          })}
      </section>
    </div>
  );
}
