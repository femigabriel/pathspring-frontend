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
  type BillingPlanKey,
} from "@/src/lib/billing-api";

const fallbackPlans: BillingPlanDefinition[] = [
  {
    key: "family_starter",
    title: "Family Starter",
    subtitle: "A home reading plan for independent families using PathSpring.",
    description: "A home reading plan for independent families using PathSpring.",
    maxBooks: 20,
    isUnlimited: false,
    features: [
      "Create and manage child profiles",
      "Add books to your family library",
      "Track progress and submissions at home",
    ],
  },
  {
    key: "family_premium",
    title: "Family Premium",
    subtitle: "For families who want full library access at home.",
    description: "Full family access with unlimited reading and the richest home experience.",
    maxBooks: null,
    isUnlimited: true,
    features: [
      "Full library access (unlimited)",
      "Family reading access",
      "Monthly new content",
    ],
  },
];

const familyPlanStyles: Record<string, { gradient: string; badge?: string }> = {
  family_starter: {
    gradient: "from-sky-500 to-cyan-500",
    badge: "Starter",
  },
  family_premium: {
    gradient: "from-amber-500 to-orange-500",
    badge: "Premium",
  },
};

export default function FamilyBillingPage() {
  const [plans, setPlans] = useState<BillingPlanDefinition[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getBillingPlans()
      .then((items) => setPlans(items.filter((item) => item.key.startsWith("family_"))))
      .catch(() => setPlans([]));
  }, []);

  const activePlans = plans.length ? plans : fallbackPlans;

  const handleCheckout = async (planKey: string) => {
    setError("");
    setCheckoutLoading(planKey);

    try {
      const session = await createBillingCheckoutSession(planKey as BillingPlanKey);
      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start family checkout.");
    } finally {
      setCheckoutLoading(null);
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
            <div className="space-y-6">
              {activePlans.map((plan) => {
                const style = familyPlanStyles[plan.key] ?? { gradient: "from-slate-500 to-slate-600" };
                const limitLabel = plan.isUnlimited
                  ? "Unlimited books"
                  : typeof plan.maxBooks === "number"
                    ? `${plan.maxBooks} books included`
                    : "";

                return (
                  <div key={plan.key} className="rounded-[1.6rem] border border-slate-200/60 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`text-sm font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300`}>
                          {plan.title}
                        </p>
                        <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">{plan.subtitle ?? plan.description ?? "Family reading plan"}</p>
                      </div>
                      {style.badge ? (
                        <span className={`rounded-full bg-gradient-to-r ${style.gradient} px-3 py-1 text-xs font-semibold text-white`}>
                          {style.badge}
                        </span>
                      ) : null}
                    </div>
                    {limitLabel ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {limitLabel}
                      </p>
                    ) : null}

                    <div className="mt-4 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 text-emerald-500" size={16} />
                          <p className="text-sm text-slate-700 dark:text-slate-300">{feature}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <AppActionButton
                        tone="primary"
                        size="lg"
                        onClick={() => void handleCheckout(plan.key)}
                        disabled={checkoutLoading === plan.key}
                      >
                        <BookHeart size={16} />
                        {checkoutLoading === plan.key ? "Starting checkout..." : `Subscribe to ${plan.title}`}
                        <ArrowRight size={16} />
                      </AppActionButton>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-3">
                <AppActionButton tone="secondary" size="lg" onClick={() => void handlePortal()} disabled={portalLoading}>
                  <CreditCard size={16} />
                  {portalLoading ? "Opening portal..." : "Manage Billing"}
                </AppActionButton>
              </div>
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
