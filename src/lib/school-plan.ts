"use client";

import type { BillingPlanKey } from "@/src/lib/billing-api";

export type SchoolPlanKey = BillingPlanKey | "free";
export type SchoolPlanTone = "slate" | "cyan" | "emerald" | "purple";

export interface SchoolPlanSnapshot {
  key: SchoolPlanKey;
  label: string;
  summary: string;
  accessMessage: string;
  tone: SchoolPlanTone;
  statusLabel: string;
  statusTone: "slate" | "cyan" | "emerald" | "amber" | "rose";
  isFree: boolean;
  isPaid: boolean;
  renewalLabel?: string;
}

interface SchoolPlanDetailsLike {
  tier?: string;
  billingPlanKey?: string;
  billingStatus?: string;
  stripeStatus?: string;
  stripeCurrentPeriodEnd?: string;
  stripeCancelAtPeriodEnd?: boolean;
  [key: string]: unknown;
}

const prettifyDate = (value?: string) => {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeToken = (value?: string) =>
  value
    ?.trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getPlanKey = (details?: SchoolPlanDetailsLike | null): SchoolPlanKey => {
  const candidates = [
    normalizeToken(details?.billingPlanKey),
    normalizeToken(details?.tier),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.includes("family") && candidate.includes("starter")) return "family_starter";
    if (candidate.includes("premium")) return "school_premium";
    if (candidate.includes("growth")) return "school_growth";
    if (candidate.includes("starter")) return "school_starter";
  }

  return "free";
};

const getStatusTone = (status: string): SchoolPlanSnapshot["statusTone"] => {
  const normalized = normalizeToken(status) ?? "";
  if (normalized === "active") return "emerald";
  if (normalized === "trialing") return "cyan";
  if (normalized === "past_due" || normalized === "incomplete") return "amber";
  if (normalized === "canceled" || normalized === "unpaid") return "rose";
  return "slate";
};

const getStatusLabel = (details?: SchoolPlanDetailsLike | null) => {
  const rawStatus =
    (typeof details?.billingStatus === "string" && details.billingStatus) ||
    (typeof details?.stripeStatus === "string" && details.stripeStatus) ||
    "free";

  const normalized = normalizeToken(rawStatus) ?? "free";

  switch (normalized) {
    case "active":
      return "Active";
    case "trialing":
      return "Trialing";
    case "past_due":
      return "Past Due";
    case "incomplete":
      return "Incomplete";
    case "canceled":
      return "Canceled";
    case "unpaid":
      return "Unpaid";
    default:
      return "Free";
  }
};

export const getSchoolPlanSnapshot = (
  details?: SchoolPlanDetailsLike | null,
): SchoolPlanSnapshot => {
  const key = getPlanKey(details);
  const statusLabel = getStatusLabel(details);
  const renewalDate = prettifyDate(details?.stripeCurrentPeriodEnd);
  const renewalLabel =
    details?.stripeCancelAtPeriodEnd && renewalDate
      ? `Ends ${renewalDate}`
      : renewalDate
        ? `Renews ${renewalDate}`
        : undefined;

  switch (key) {
    case "family_starter":
      return {
        key,
        label: "Family Starter",
        summary: "A focused home-reading plan for independent families.",
        accessMessage:
          "Your family can build a curated home library, open family bundles, and track child reading at home.",
        tone: "cyan",
        statusLabel,
        statusTone: getStatusTone(statusLabel),
        isFree: false,
        isPaid: true,
        renewalLabel,
      };
    case "school_starter":
      return {
        key,
        label: "School Starter",
        summary: "A focused starter plan for schools beginning their reading rollout.",
        accessMessage:
          "Your school can browse approved products, build a selected library, and run core classroom reading flows.",
        tone: "cyan",
        statusLabel,
        statusTone: getStatusTone(statusLabel),
        isFree: false,
        isPaid: true,
        renewalLabel,
      };
    case "school_growth":
      return {
        key,
        label: "School Growth",
        summary: "A scaling plan for schools running richer reading and assignment workflows.",
        accessMessage:
          "Your school can grow its library, support more active classes, and manage broader reading operations.",
        tone: "emerald",
        statusLabel,
        statusTone: getStatusTone(statusLabel),
        isFree: false,
        isPaid: true,
        renewalLabel,
      };
    case "school_premium":
      return {
        key,
        label: "School Premium",
        summary: "The fullest school experience for broad rollout and stronger reading operations.",
        accessMessage:
          "Your school is on the highest school tier, with the strongest PathSpring setup for adoption and expansion.",
        tone: "purple",
        statusLabel,
        statusTone: getStatusTone(statusLabel),
        isFree: false,
        isPaid: true,
        renewalLabel,
      };
    default:
      return {
        key: "free",
        label: "Free",
        summary: "You are currently on the free school setup.",
        accessMessage:
          "Your school can review PathSpring, then move to a paid plan when you want broader catalog access and rollout support.",
        tone: "slate",
        statusLabel: "Free",
        statusTone: "slate",
        isFree: true,
        isPaid: false,
      };
  }
};
