"use client";

import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type BillingPlanKey =
  | "school_starter"
  | "school_growth"
  | "school_premium"
  | "family_starter";

export interface BillingPlanDefinition {
  key: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  maxBooks: number | null;
  isUnlimited: boolean;
  features: string[];
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface BillingPortalResponse {
  url: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const normalizeBillingPlan = (value: unknown): BillingPlanDefinition | null => {
  if (!isRecord(value)) return null;

  const key =
    typeof value.key === "string"
      ? value.key
      : typeof value.planKey === "string"
        ? value.planKey
        : "";

  const title =
    typeof value.title === "string"
      ? value.title
      : typeof value.name === "string"
        ? value.name
        : "";

  if (!key || !title) return null;

  const maxBooks =
    typeof value.maxBooks === "number"
      ? value.maxBooks
      : typeof value.bookLimit === "number"
        ? value.bookLimit
        : typeof value.limit === "number"
          ? value.limit
          : null;

  const features = toStringArray(value.features).length
    ? toStringArray(value.features)
    : toStringArray(value.highlights);

  return {
    key,
    title,
    subtitle: typeof value.subtitle === "string" ? value.subtitle : undefined,
    description: typeof value.description === "string" ? value.description : undefined,
    badge: typeof value.badge === "string" ? value.badge : undefined,
    maxBooks,
    isUnlimited:
      typeof value.isUnlimited === "boolean"
        ? value.isUnlimited
        : maxBooks === null || maxBooks === Number.POSITIVE_INFINITY,
    features,
  };
};

const parseJsonSafely = (text: string) => {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const extractMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== "object") return fallback;

  const record = payload as Record<string, unknown>;
  const message = record.message ?? record.error ?? record.detail ?? record.title;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const formatRetryAfterMessage = (retryAfter: string | null) => {
  if (!retryAfter) {
    return "Too many requests right now. Please wait a little and try again.";
  }

  const retryAfterSeconds = Number(retryAfter);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return `Too many requests right now. Please try again in ${retryAfterSeconds} seconds.`;
  }

  return `Too many requests right now. Please try again after ${retryAfter}.`;
};

const billingRequest = async <T>(path: string, init?: RequestInit) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = parseJsonSafely(text);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(formatRetryAfterMessage(response.headers.get("Retry-After")));
    }

    if (response.status === 400) {
      throw new Error(extractMessage(payload, "Please check the information you entered and try again."));
    }

    throw new Error(extractMessage(payload, `Request failed with status ${response.status}`));
  }

  return payload as T;
};

export const createBillingCheckoutSession = async (planKey: BillingPlanKey) =>
  billingRequest<CheckoutSessionResponse>("/api/v1/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ planKey }),
  });

export const createBillingPortalSession = async () =>
  billingRequest<BillingPortalResponse>("/api/v1/billing/portal", {
    method: "POST",
  });

export const getBillingPlans = async () => {
  const payload = await billingRequest<unknown>("/api/v1/billing/plans");
  const record = isRecord(payload) ? payload : {};
  const plans = Array.isArray(record.plans)
    ? record.plans
    : Array.isArray(record.data)
      ? record.data
      : Array.isArray(payload)
        ? payload
        : [];

  return plans
    .map((plan) => normalizeBillingPlan(plan))
    .filter((plan): plan is BillingPlanDefinition => plan !== null);
};
