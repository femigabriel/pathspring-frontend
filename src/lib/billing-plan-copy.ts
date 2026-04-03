"use client";

export interface BillingPlanMarketingCopy {
  title?: string;
  priceLabel?: string;
  subtitle: string;
  badge?: string;
  features: string[];
}

export const BILLING_PLAN_COPY: Record<string, BillingPlanMarketingCopy> = {
  school_starter: {
    title: "School Starter",
    priceLabel: "N10,000 / month",
    subtitle: "For small schools starting reading and SEL.",
    features: [
      "Up to 20 story products",
      "Student and teacher access",
      "Assignments to classes or students",
      "Basic progress tracking",
      "Monthly new content drops",
    ],
  },
  school_growth: {
    title: "School Growth",
    priceLabel: "N15,000 / month",
    subtitle: "For growing schools with active classrooms.",
    badge: "Popular",
    features: [
      "Everything in Starter",
      "Up to 50 story products",
      "Class reading sessions",
      "Richer reporting for teachers",
      "Stronger classroom flow and tracking",
    ],
  },
  school_premium: {
    title: "School Premium",
    priceLabel: "N20,000 / month",
    subtitle: "For full adoption and maximum access.",
    features: [
      "Everything in Growth",
      "Full library access (unlimited)",
      "Advanced analytics",
      "Premium school experience",
    ],
  },
  family_starter: {
    title: "Family Starter",
    priceLabel: "N5,000 / month",
    subtitle: "For independent families building a steady home reading habit.",
    features: [
      "Up to 20 story products",
      "Family reading access",
      "Monthly new content",
    ],
  },
  family_premium: {
    title: "Family Premium",
    priceLabel: "Premium Family Plan",
    subtitle: "For families who want full library access at home.",
    features: [
      "Full library access (unlimited)",
      "Family reading access",
      "Monthly new content",
    ],
  },
};

export const getBillingPlanCopy = (key: string) => BILLING_PLAN_COPY[key];
