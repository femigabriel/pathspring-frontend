"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  BookOpen,
  Users,
  BarChart3,
  Clock,
  Infinity,
  Award,
  TrendingUp,
  Star,
  Rocket,
  Target,
  Zap,
  Crown
} from "lucide-react";
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
import { useTheme } from "@/src/contexts/ThemeContext";

// School plan features only
const schoolPlanFeatures: Record<string, string[]> = {
  school_starter: [
    "Up to 20 story products",
    "Student + teacher access",
    "Assignments to classes or students",
    "Basic progress tracking",
    "Monthly new content drops",
  ],
  school_growth: [
    "Everything in Starter",
    "Up to 50 story products",
    "Class reading sessions",
    "Richer reporting for teachers",
    "Stronger classroom flow + tracking",
  ],
  school_premium: [
    "Everything in Growth",
    "Full library access (unlimited)",
    "Advanced analytics",
    "Premium school experience",
    "Priority support",
  ],
};

const schoolPlanPrices: Record<string, { monthly: string; yearly: string; monthlyUsd?: string }> = {
  school_starter: { monthly: "₦10,000", yearly: "₦100,000", monthlyUsd: "$12" },
  school_growth: { monthly: "₦15,000", yearly: "₦150,000", monthlyUsd: "$18" },
  school_premium: { monthly: "₦20,000", yearly: "₦200,000", monthlyUsd: "$24" },
};

const schoolPlanBadges: Record<string, string> = {
  school_growth: "Most Popular",
  school_premium: "Best Value",
};

const schoolPlanIcons: Record<string, any> = {
  school_starter: Rocket,
  school_growth: TrendingUp,
  school_premium: Crown,
};

const schoolPlanColors: Record<string, string> = {
  school_starter: "from-cyan-500 to-blue-500",
  school_growth: "from-emerald-500 to-teal-500",
  school_premium: "from-purple-500 to-pink-500",
};

const schoolPlanGradients: Record<string, string> = {
  school_starter: "bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-cyan-500/10 dark:via-transparent dark:to-blue-500/10",
  school_growth: "bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-500/10 dark:via-transparent dark:to-teal-500/10",
  school_premium: "bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-500/10 dark:via-transparent dark:to-pink-500/10",
};

export default function SchoolBillingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [schoolDetails, setSchoolDetails] = useState<AdminSchoolDetails | null>(null);
  const [plans, setPlans] = useState<BillingPlanDefinition[]>([]);
  const [loadingPlan, setLoadingPlan] = useState<BillingPlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const currentPlan = getSchoolPlanSnapshot(schoolDetails);

  useEffect(() => {
    void getAdminSchoolDetails()
      .then(setSchoolDetails)
      .catch(() => setSchoolDetails(null));
    void getBillingPlans()
      .then((items) => setPlans(items.filter(p => p.key.startsWith("school_"))))
      .catch(() => setPlans([]));
  }, []);

  const displayedPlans = ["school_starter", "school_growth", "school_premium"];

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

  const bgClass = isDark
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    : "bg-gradient-to-br from-sky-50 via-white to-emerald-50";

  return (
    <div className={`min-h-screen ${bgClass} px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 md:p-8 ${isDark ? "bg-slate-900/80 backdrop-blur-xl border border-white/10" : "bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl"}`}
        >
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1.5 rounded-full shadow-lg mb-4">
              <Sparkles size={14} />
              <span className="text-xs font-semibold">School Billing</span>
            </div>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
              Choose the perfect plan for your school
            </h1>
            <p className={`text-base leading-relaxed max-w-3xl ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Start a secure checkout for your school plan, then return anytime to manage billing through the customer portal.
              All plans include monthly new content drops and full platform access.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              <AppBadge label="Stripe Secure Checkout" tone="cyan" icon={CreditCard} />
              <AppBadge label="School Admin Only" tone="emerald" />
              <AppBadge label={`Current: ${currentPlan.label}`} tone={currentPlan.tone} icon={ShieldCheck} />
              <AppBadge label={currentPlan.statusLabel} tone={currentPlan.statusTone} />
            </div>
          </div>

          {/* Current Plan Card */}
          <div className={`mt-6 rounded-xl p-5 ${isDark ? "bg-slate-800/60 border border-slate-700" : "bg-white/80 border border-white/60"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-purple-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Your Current Plan</span>
                </div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                  {currentPlan.isFree ? "Free Tier" : currentPlan.label}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {currentPlan.summary} {currentPlan.accessMessage}
                </p>
                {currentPlan.renewalLabel && (
                  <p className={`text-sm mt-2 font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {currentPlan.renewalLabel}
                  </p>
                )}
              </div>
              <AppActionButton tone="primary" size="lg" onClick={handlePortal} disabled={portalLoading}>
                <CreditCard size={16} />
                {portalLoading ? "Opening portal..." : "Manage Billing"}
              </AppActionButton>
            </div>
          </div>
        </motion.section>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className={`inline-flex rounded-xl p-1 ${isDark ? "bg-slate-800/60 border border-slate-700" : "bg-white/80 border border-white/60"}`}>
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                billingInterval === "monthly"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Clock size={14} />
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                billingInterval === "yearly"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Zap size={14} />
              Yearly Billing 
              <span className="text-xs ml-1 text-emerald-500 dark:text-emerald-400">Save 15%</span>
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}
          >
            <p className={`text-sm ${isDark ? "text-red-300" : "text-red-600"}`}>{error}</p>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {displayedPlans.map((planKey, index) => {
            const Icon = schoolPlanIcons[planKey] || Building2;
            const features = schoolPlanFeatures[planKey] || [];
            const price = schoolPlanPrices[planKey]?.[billingInterval] || "Contact us";
            const usdPrice = schoolPlanPrices[planKey]?.monthlyUsd;
            const isCurrentPlan = currentPlan.key === planKey;
            const color = schoolPlanColors[planKey] || "from-cyan-500 to-blue-500";
            const gradientBg = schoolPlanGradients[planKey] || "";

            return (
              <motion.article
                key={planKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isCurrentPlan
                    ? "ring-2 ring-purple-500 shadow-2xl scale-[1.02]"
                    : isDark ? "hover:shadow-xl" : "hover:shadow-2xl"
                }`}
              >
                {/* Popular Badge */}
                {schoolPlanBadges[planKey] && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      planKey === "school_growth"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    }`}>
                      <Star size={12} fill="currentColor" />
                      {schoolPlanBadges[planKey]}
                    </div>
                  </div>
                )}

                <div className={`p-6 h-full flex flex-col ${gradientBg} ${isDark ? "border border-white/10" : "border border-white/60"}`}>
                  {/* Icon and Current Plan Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg`}>
                      <Icon className="text-white" size={26} />
                    </div>
                    {isCurrentPlan && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>
                        <CheckCircle2 size={12} />
                        Current Plan
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    {planKey === "school_starter" && "School Starter"}
                    {planKey === "school_growth" && "School Growth"}
                    {planKey === "school_premium" && "School Premium"}
                  </h3>

                  {/* Price */}
                  <div className="mt-3 mb-2">
                    <span className={`text-4xl font-black ${isDark ? "text-white" : "text-slate-800"}`}>{price}</span>
                    <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}> / {billingInterval === "monthly" ? "month" : "year"}</span>
                    {usdPrice && (
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        ≈ {usdPrice} USD / month
                      </p>
                    )}
                  </div>
                  {billingInterval === "yearly" && (
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center gap-1 mb-2">
                      <Zap size={12} />
                      Save 15% with annual billing
                    </p>
                  )}

                  {/* Divider */}
                  <div className={`h-px my-4 ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />

                  {/* Features */}
                  <div className="flex-1 space-y-3">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 group">
                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Additional perks */}
                  <div className={`mt-6 p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles size={12} className="text-cyan-500" />
                      <span className={isDark ? "text-slate-400" : "text-slate-500"}>+ Monthly new content drops</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1.5">
                      <ShieldCheck size={12} className="text-cyan-500" />
                      <span className={isDark ? "text-slate-400" : "text-slate-500"}>Secure & encrypted</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-6">
                    <AppActionButton
                      tone={isCurrentPlan ? "secondary" : "primary"}
                      size="lg"
                      fullWidth
                      onClick={() => void handleCheckout(planKey as BillingPlanKey)}
                      disabled={loadingPlan === planKey}
                      className="group"
                    >
                      <CreditCard size={16} />
                      {loadingPlan === planKey
                        ? "Processing..."
                        : isCurrentPlan
                          ? "Manage Subscription"
                          : `Subscribe - ${price}`}
                      {!isCurrentPlan && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </AppActionButton>
                  </div>

                  {/* Fine Print */}
                  <p className={`text-xs text-center mt-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Cancel anytime. No long-term contracts.
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Comparison Table Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 ${isDark ? "bg-slate-900/80 backdrop-blur-xl border border-white/10" : "bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl"}`}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full shadow-lg mb-4">
              <BarChart3 size={14} />
              <span className="text-xs font-semibold">Compare Plans</span>
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
              Side by Side Comparison
            </h2>
            <p className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              See exactly what each plan includes and choose the best fit for your school
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b-2 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  {displayedPlans.map((planKey) => (
                    <th key={planKey} className="text-center py-4 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${schoolPlanColors[planKey]} flex items-center justify-center`}>
                          {planKey === "school_starter" && <Rocket size={14} className="text-white" />}
                          {planKey === "school_growth" && <TrendingUp size={14} className="text-white" />}
                          {planKey === "school_premium" && <Crown size={14} className="text-white" />}
                        </div>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                          {planKey === "school_starter" && "Starter"}
                          {planKey === "school_growth" && "Growth"}
                          {planKey === "school_premium" && "Premium"}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Monthly Price", icon: CreditCard, getValue: (p: string) => schoolPlanPrices[p]?.monthly || "-" },
                  { label: "Yearly Price (Save 15%)", icon: Zap, getValue: (p: string) => schoolPlanPrices[p]?.yearly || "-" },
                  { label: "Story Products", icon: BookOpen, getValue: (p: string) => p === "school_premium" ? "♾️ Unlimited" : p === "school_growth" ? "Up to 50" : "Up to 20" },
                  { label: "Student + Teacher Access", icon: Users, getValue: () => "✓" },
                  { label: "Assignments", icon: Target, getValue: () => "✓" },
                  { label: "Class Reading Sessions", icon: Users, getValue: (p: string) => p !== "school_starter" ? "✓" : "—" },
                  { label: "Progress Tracking", icon: TrendingUp, getValue: (p: string) => p === "school_starter" ? "Basic" : "Advanced" },
                  { label: "Reporting for Teachers", icon: BarChart3, getValue: (p: string) => p !== "school_starter" ? "✓" : "—" },
                  { label: "Advanced Analytics", icon: Star, getValue: (p: string) => p === "school_premium" ? "✓" : "—" },
                  { label: "Monthly New Content", icon: Sparkles, getValue: () => "✓" },
                  { label: "Priority Support", icon: ShieldCheck, getValue: (p: string) => p === "school_premium" ? "✓" : "—" },
                ].map((row, idx) => (
                  <tr key={idx} className={`border-b ${isDark ? "border-slate-700/50" : "border-slate-100"} hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors`}>
                    <td className={`py-3 px-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      <div className="flex items-center gap-2">
                        <row.icon size={14} className="text-cyan-500" />
                        <span className="font-medium">{row.label}</span>
                      </div>
                    </td>
                    {displayedPlans.map((planKey) => (
                      <td key={planKey} className="text-center py-3 px-4">
                        <span className={
                          row.getValue(planKey) === "✓" ? "text-emerald-500 font-medium" :
                          row.getValue(planKey) === "—" ? "text-slate-400" :
                          row.getValue(planKey).includes("Unlimited") ? "text-purple-500 font-semibold" :
                          "text-slate-700 dark:text-slate-300"
                        }>
                          {row.getValue(planKey)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`mt-6 p-4 rounded-xl text-center ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              🎓 Need a custom plan for a larger institution?{" "}
              <a href="mailto:sales@pathspring.com" className="font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 inline-flex items-center gap-1">
                Contact our sales team <ArrowRight size={12} />
              </a>
            </p>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl p-6 ${isDark ? "bg-slate-900/80 backdrop-blur-xl border border-white/10" : "bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl"}`}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1.5 rounded-full shadow-lg mb-4">
              <ShieldCheck size={14} />
              <span className="text-xs font-semibold">FAQ</span>
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className={`p-4 rounded-xl ${isDark ? "bg-slate-800/40" : "bg-slate-50"}`}>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                <CreditCard size={16} className="text-cyan-500" />
                How does billing work?
              </h3>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                We use Stripe for secure payment processing. You can cancel or change your plan at any time from the billing portal.
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? "bg-slate-800/40" : "bg-slate-50"}`}>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                <Clock size={16} className="text-cyan-500" />
                Can I switch plans?
              </h3>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Yes! You can upgrade or downgrade anytime. Changes take effect on your next billing cycle.
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? "bg-slate-800/40" : "bg-slate-50"}`}>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                <Users size={16} className="text-cyan-500" />
                Are there contracts?
              </h3>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                No long-term contracts. You pay month-to-month or save with annual billing. Cancel anytime.
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? "bg-slate-800/40" : "bg-slate-50"}`}>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                <BarChart3 size={16} className="text-cyan-500" />
                What happens if I downgrade?
              </h3>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                You keep access to your content, but may lose access to premium features. Your library remains intact.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
