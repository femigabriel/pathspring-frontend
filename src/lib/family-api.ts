"use client";

import { getAccessToken } from "@/src/lib/auth";
import type {
  ProductPlanSummary,
  SchoolActivity,
  SchoolCatalogProduct,
  SchoolStoryBundle,
  StudentSubmissionAnswerPayload,
} from "@/src/lib/school-content-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface FamilyProfile {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  childrenCount: number;
  selectedProductsCount: number;
}

export interface FamilyChild {
  id: string;
  fullName: string;
  gradeLevel?: string;
  age?: number;
  username?: string;
  createdAt?: string;
}

export interface FamilyChildOverview {
  child: FamilyChild | null;
  stats: {
    selectedBooks: number;
    completedThisWeek: number;
    averageScore: number;
    activeReadingCount: number;
    timeSpentSeconds: number;
  };
  recentSubmissions: Array<Record<string, unknown>>;
  recentProgress: Array<Record<string, unknown>>;
}

export interface FamilyProgressPayload {
  status: "not_started" | "in_progress" | "completed";
  timeSpentSeconds?: number;
  enjoymentRating?: number;
  strengths?: string[];
  struggleAreas?: string[];
}

export interface CreateFamilyChildPayload {
  fullName: string;
  gradeLevel: string;
  age?: number;
}

export interface FamilyCatalogResponse {
  products: SchoolCatalogProduct[];
  plan: ProductPlanSummary | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseJsonSafely = (text: string) => {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const extractMessage = (payload: unknown, fallback: string) => {
  if (!isRecord(payload)) return fallback;
  if (isRecord(payload.details)) {
    const details = payload.details;
    if (
      typeof (payload.error ?? payload.message) === "string" &&
      String(payload.error ?? payload.message).toLowerCase().includes("plan limit") &&
      typeof details.maxBooks === "number" &&
      typeof details.usedBooks === "number"
    ) {
      const normalizedPlan =
        typeof details.planKey === "string"
          ? details.planKey.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
          : "current plan";
      return `Plan limit reached. ${normalizedPlan} allows ${details.maxBooks} books and you have used ${details.usedBooks}. Upgrade to add more books.`;
    }
  }
  const message = payload.message ?? payload.error ?? payload.detail ?? payload.title;
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

const familyRequest = async <T = unknown>(path: string, init?: RequestInit) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
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
      throw new Error(extractMessage(payload, "Please check the request details and try again."));
    }

    throw new Error(extractMessage(payload, `Request failed with status ${response.status}`));
  }

  return payload as T;
};

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const toAssetProxyUrl = (value: unknown, version?: unknown) => {
  if (typeof value !== "string" || !value.trim()) return undefined;

  const versionSuffix =
    typeof version === "string" && version.trim()
      ? `${value.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`
      : "";

  const absoluteUrl = /^https?:\/\//i.test(value)
    ? `${value}${versionSuffix}`
    : value.startsWith("/")
      ? `${API_BASE_URL.replace(/\/$/, "")}${value}${versionSuffix}`
      : `${value}${versionSuffix}`;

  return `/api/media?src=${encodeURIComponent(absoluteUrl)}`;
};

const normalizeCatalogProduct = (value: unknown): SchoolCatalogProduct | null => {
  if (!isRecord(value)) return null;
  const id = typeof (value._id ?? value.id) === "string" ? String(value._id ?? value.id) : "";
  const title = typeof value.title === "string" ? value.title : "";

  if (!id || !title) return null;

  return {
    ...value,
    _id: id,
    id,
    title,
    summary: typeof value.summary === "string" ? value.summary : undefined,
    description: typeof value.description === "string" ? value.description : undefined,
    theme: typeof value.theme === "string" ? value.theme : undefined,
    subject: typeof value.subject === "string" ? value.subject : undefined,
    gradeLevels: toStringArray(value.gradeLevels),
    selFocus: toStringArray(value.selFocus),
    coverImageUrl: toAssetProxyUrl(value.coverImageUrl, value.updatedAt),
    status: typeof value.status === "string" ? value.status : undefined,
    publishedAt: typeof value.publishedAt === "string" ? value.publishedAt : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
    isSelectedForSchool:
      typeof value.isSelectedForFamily === "boolean"
        ? value.isSelectedForFamily
        : typeof value.isSelectedForSchool === "boolean"
          ? value.isSelectedForSchool
          : false,
  };
};

const normalizeBundleNode = (value: unknown) => {
  if (!isRecord(value) || !isRecord(value.content)) return null;

  const content = normalizeCatalogProduct(value.content);
  if (!content) return null;

  return {
    content,
    chapters: Array.isArray(value.chapters)
      ? value.chapters.map((chapter) => {
          const record = isRecord(chapter) ? chapter : {};
          return {
            ...record,
            imageUrl: toAssetProxyUrl(record.imageUrl, record.updatedAt),
          };
        })
      : [],
    questions: Array.isArray(value.questions)
      ? value.questions.map((question) => {
          const record = isRecord(question) ? question : {};
          return {
            ...record,
            options: toStringArray(record.options),
            correctAnswers: toStringArray(record.correctAnswers),
          };
        })
      : [],
  };
};

const normalizeBundle = (value: unknown): SchoolStoryBundle | null => {
  if (!isRecord(value)) return null;

  return {
    requestedContent: normalizeCatalogProduct(value.requestedContent),
    contentPack: normalizeCatalogProduct(value.contentPack),
    story: normalizeBundleNode(value.story),
    quiz: normalizeBundleNode(value.quiz),
    game: normalizeCatalogProduct(value.game),
    activities: Array.isArray(value.activities)
      ? value.activities.filter((item): item is SchoolActivity => normalizeCatalogProduct(item) !== null).map((item) => item as SchoolActivity)
      : [],
  };
};

const normalizeChild = (value: unknown): FamilyChild | null => {
  if (!isRecord(value)) return null;
  const id = typeof (value.id ?? value._id) === "string" ? String(value.id ?? value._id) : "";
  const fullName = typeof value.fullName === "string" ? value.fullName : "";
  if (!id || !fullName) return null;

  return {
    id,
    fullName,
    gradeLevel: typeof value.gradeLevel === "string" ? value.gradeLevel : undefined,
    age: typeof value.age === "number" ? value.age : undefined,
    username: typeof value.username === "string" ? value.username : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
};

const normalizeProductPlan = (value: unknown): ProductPlanSummary | null => {
  if (!isRecord(value)) return null;

  const maxBooks =
    typeof value.maxBooks === "number"
      ? value.maxBooks
      : typeof value.bookLimit === "number"
        ? value.bookLimit
        : typeof value.limit === "number"
          ? value.limit
          : null;

  const usedBooks =
    typeof value.usedBooks === "number"
      ? value.usedBooks
      : typeof value.selectedBooks === "number"
        ? value.selectedBooks
        : typeof value.count === "number"
          ? value.count
          : 0;

  const remainingBooks =
    typeof value.remainingBooks === "number"
      ? value.remainingBooks
      : maxBooks === null
        ? null
        : Math.max(maxBooks - usedBooks, 0);

  const rawPlanKey =
    typeof value.planKey === "string"
      ? value.planKey
      : typeof value.tier === "string"
        ? value.tier
        : typeof value.key === "string"
          ? value.key
          : "free";

  return {
    planKey: rawPlanKey,
    maxBooks,
    usedBooks,
    remainingBooks,
    isUnlimited:
      typeof value.isUnlimited === "boolean"
        ? value.isUnlimited
        : maxBooks === null || maxBooks === Number.POSITIVE_INFINITY,
  };
};

export const getFamilyProfile = async () => {
  const payload = await familyRequest<unknown>("/api/v1/family/me");
  const record = isRecord(payload) ? payload : {};
  const parent = isRecord(record.parent) ? record.parent : record;

  return {
    id: typeof (parent.id ?? parent._id) === "string" ? String(parent.id ?? parent._id) : "",
    fullName: typeof parent.fullName === "string" ? parent.fullName : "Family Parent",
    email: typeof parent.email === "string" ? parent.email : undefined,
    phone: typeof parent.phone === "string" ? parent.phone : undefined,
    childrenCount:
      typeof record.childrenCount === "number"
        ? record.childrenCount
        : Array.isArray(record.children)
          ? record.children.length
          : 0,
    selectedProductsCount:
      typeof record.selectedProductsCount === "number"
        ? record.selectedProductsCount
        : Array.isArray(record.selectedProducts)
          ? record.selectedProducts.length
          : 0,
  } satisfies FamilyProfile;
};

export const getFamilyChildren = async () => {
  const payload = await familyRequest<unknown>("/api/v1/family/children");
  const record = isRecord(payload) ? payload : {};
  const children = Array.isArray(record.children)
    ? record.children
    : Array.isArray(record.data)
      ? record.data
      : [];

  return children.map((child) => normalizeChild(child)).filter((child): child is FamilyChild => child !== null);
};

export const createFamilyChild = async (input: CreateFamilyChildPayload) => {
  const payload = await familyRequest<unknown>("/api/v1/family/children", {
    method: "POST",
    body: JSON.stringify(input),
  });

  const record = isRecord(payload) ? payload : {};
  return normalizeChild(record.child ?? record.data ?? record);
};

export const getFamilyCatalogProducts = async (): Promise<FamilyCatalogResponse> => {
  const payload = await familyRequest<unknown>("/api/v1/family/catalog");
  const record = isRecord(payload) ? payload : {};
  const products = Array.isArray(record.products)
    ? record.products
    : Array.isArray(record.catalog)
      ? record.catalog
      : Array.isArray(record.data)
        ? record.data
        : [];

  return {
    products: products
      .map((product) => normalizeCatalogProduct(product))
      .filter((product): product is SchoolCatalogProduct => product !== null),
    plan: normalizeProductPlan(record.plan),
  };
};

export const getFamilySelectedProducts = async (): Promise<FamilyCatalogResponse> => {
  const payload = await familyRequest<unknown>("/api/v1/family/products");
  const record = isRecord(payload) ? payload : {};
  const products = Array.isArray(record.products)
    ? record.products
    : Array.isArray(record.selectedProducts)
      ? record.selectedProducts
      : Array.isArray(record.data)
        ? record.data
        : [];

  return {
    products: products
      .map((product) => normalizeCatalogProduct(product))
      .filter((product): product is SchoolCatalogProduct => product !== null),
    plan: normalizeProductPlan(record.plan),
  };
};

export const selectFamilyProduct = async (contentId: string, notes?: string) =>
  familyRequest(`/api/v1/family/products/${contentId}/select`, {
    method: "POST",
    body: JSON.stringify(notes ? { notes } : {}),
  });

export const getFamilyProductBundle = async (contentId: string) => {
  const payload = await familyRequest<unknown>(`/api/v1/family/products/${contentId}/full`);
  return normalizeBundle(payload) ?? {
    requestedContent: null,
    contentPack: null,
    story: null,
    quiz: null,
    game: null,
    activities: [],
  };
};

export const updateFamilyChildProgress = async (
  childId: string,
  contentId: string,
  input: FamilyProgressPayload,
) =>
  familyRequest(`/api/v1/family/children/${childId}/content/${contentId}/progress`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const submitFamilyChildContent = async (
  childId: string,
  contentId: string,
  input: { timeSpentSeconds?: number; answers: StudentSubmissionAnswerPayload[] },
) =>
  familyRequest(`/api/v1/family/children/${childId}/content/${contentId}/submissions`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getFamilyChildOverview = async (childId: string) => {
  const payload = await familyRequest<unknown>(`/api/v1/family/children/${childId}/overview`);
  const record = isRecord(payload) ? payload : {};
  const overview = isRecord(record.overview) ? record.overview : record;

  return {
    child: normalizeChild(overview.child ?? overview.student ?? record.child),
    stats: {
      selectedBooks: typeof overview.selectedBooks === "number" ? overview.selectedBooks : 0,
      completedThisWeek:
        typeof overview.completedThisWeek === "number" ? overview.completedThisWeek : 0,
      averageScore: typeof overview.averageScore === "number" ? overview.averageScore : 0,
      activeReadingCount:
        typeof overview.activeReadingCount === "number" ? overview.activeReadingCount : 0,
      timeSpentSeconds: typeof overview.timeSpentSeconds === "number" ? overview.timeSpentSeconds : 0,
    },
    recentSubmissions: Array.isArray(overview.recentSubmissions)
      ? overview.recentSubmissions.filter(isRecord)
      : [],
    recentProgress: Array.isArray(overview.recentProgress)
      ? overview.recentProgress.filter(isRecord)
      : [],
  } satisfies FamilyChildOverview;
};
