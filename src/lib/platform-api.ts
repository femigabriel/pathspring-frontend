"use client";

import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface PlatformContentItem {
  _id: string;
  id: string;
  type?: string;
  title: string;
  coverImageUrl?: string;
  summary?: string;
  description?: string;
  theme?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  ageRangeMin?: number;
  ageRangeMax?: number;
  gradeLevels?: string[];
  subject?: string;
  skillFocus?: string[];
  selFocus?: string[];
  estimatedDurationMinutes?: number;
  publication?: {
    publicationScope?: string;
    schoolIds?: string[];
    status?: string;
    publishedAt?: string;
  } | null;
  [key: string]: unknown;
}

export interface PlatformStoryChapter {
  _id?: string;
  title?: string;
  body?: string;
  order?: number;
  imageUrl?: string;
}

export interface PlatformQuestion {
  _id?: string;
  prompt?: string;
  options?: string[];
  correctAnswers?: string[];
  explanation?: string;
  order?: number;
}

export interface PlatformActivity extends PlatformContentItem {
  instructions?: string;
  configuration?: {
    activityType?: string;
    materialsNeeded?: string[];
    tasks?: string[];
    teacherNotes?: string;
    [key: string]: unknown;
  };
}

export interface PlatformBundleNode {
  content: PlatformContentItem;
  chapters: PlatformStoryChapter[];
  questions: PlatformQuestion[];
}

export interface PlatformBundle {
  requestedContent: PlatformContentItem | null;
  contentPack: PlatformContentItem | null;
  story: PlatformBundleNode | null;
  quiz: PlatformBundleNode | null;
  game: PlatformContentItem | null;
  activities: PlatformActivity[];
  relatedContents: PlatformContentItem[];
  recommendedOrder: PlatformContentItem[];
  bundleContentIds: string[];
}

export interface PlatformAnalyticsOverview {
  totalContents: number;
  stories: number;
  quizzes: number;
  games: number;
  activities: number;
  contentPacks: number;
  publishedContents: number;
}

export interface PlatformAnalyticsResponse {
  overview: PlatformAnalyticsOverview;
  engagementSummary: Array<Record<string, unknown>>;
}

export interface PlatformSchool {
  id: string;
  name: string;
  schoolCode?: string;
  email?: string;
  phone?: string;
  location?: string;
  tier?: string;
  status?: string;
  maxStudents?: number;
  studentCount?: number;
  teacherCount?: number;
  classCount?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface GeneratePlatformContentInput {
  title: string;
  ageRangeMin: number;
  ageRangeMax: number;
  gradeLevels: string[];
  subject: string;
  skillFocus: string[];
  selFocus: string[];
  difficulty: string;
  estimatedStoryDurationMinutes?: number;
  language: string;
  theme: string;
  topic: string;
  moralLesson: string;
}

export interface CreatePlatformActivityInput {
  title: string;
  summary?: string;
  instructions: string;
  estimatedDurationMinutes: number;
  activityType: string;
  materialsNeeded: string[];
  tasks: string[];
  teacherNotes?: string;
}

export interface UpdatePlatformStoryInput {
  title?: string;
  summary?: string;
  description?: string;
  theme?: string;
  selFocus?: string[];
  status?: string;
}

export interface RegeneratePlatformStoryInput {
  theme?: string;
  selFocus?: string[];
  chapterCount?: number;
  tone?: string;
  customPromptNotes?: string;
  clearCoverImage?: boolean;
}

class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
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

  const message =
    payload.message ??
    payload.error ??
    payload.detail ??
    payload.title;

  return typeof message === "string" && message.trim() ? message : fallback;
};

const platformRequest = async <T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
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
    throw new ApiRequestError(
      extractMessage(payload, `Request failed with status ${response.status}`),
      response.status,
    );
  }

  return payload as T;
};

const requestFromCandidates = async <T = unknown>(paths: string[]) => {
  let lastError: Error | null = null;

  for (const path of paths) {
    try {
      return await platformRequest<T>(path);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("Request failed");
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

const normalizeContentItem = (value: unknown): PlatformContentItem | null => {
  if (!isRecord(value)) return null;

  const rawId = value._id ?? value.id;
  const id = typeof rawId === "string" ? rawId : "";
  const title = typeof value.title === "string" ? value.title : "";

  if (!id || !title) return null;

  return {
    ...value,
    _id: id,
    id,
    title,
    coverImageUrl: toAssetProxyUrl(value.coverImageUrl, value.updatedAt),
    summary: typeof value.summary === "string" ? value.summary : undefined,
    description: typeof value.description === "string" ? value.description : undefined,
    theme: typeof value.theme === "string" ? value.theme : undefined,
    status: typeof value.status === "string" ? value.status : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
    publishedAt: typeof value.publishedAt === "string" ? value.publishedAt : undefined,
    ageRangeMin: typeof value.ageRangeMin === "number" ? value.ageRangeMin : undefined,
    ageRangeMax: typeof value.ageRangeMax === "number" ? value.ageRangeMax : undefined,
    gradeLevels: toStringArray(value.gradeLevels),
    subject: typeof value.subject === "string" ? value.subject : undefined,
    skillFocus: toStringArray(value.skillFocus),
    selFocus: toStringArray(value.selFocus),
    estimatedDurationMinutes:
      typeof value.estimatedDurationMinutes === "number" ? value.estimatedDurationMinutes : undefined,
    publication: isRecord(value.publication)
      ? {
          publicationScope:
            typeof value.publication.publicationScope === "string"
              ? value.publication.publicationScope
              : undefined,
          schoolIds: toStringArray(value.publication.schoolIds),
          status:
            typeof value.publication.status === "string" ? value.publication.status : undefined,
          publishedAt:
            typeof value.publication.publishedAt === "string"
              ? value.publication.publishedAt
              : undefined,
        }
      : null,
  };
};

const pickArray = <T,>(payload: unknown, keys: string[], mapper: (value: unknown) => T | null) => {
  const normalizeArray = (items: unknown[]) =>
    items
      .map((item) => mapper(item))
      .filter((item): item is T => item !== null);

  if (Array.isArray(payload)) {
    return normalizeArray(payload);
  }

  if (!isRecord(payload)) {
    return [];
  }

  for (const key of keys) {
    const candidate = payload[key];

    if (Array.isArray(candidate)) {
      return normalizeArray(candidate);
    }

    if (isRecord(candidate)) {
      for (const nestedKey of ["items", "results", "data", key]) {
        const nested = candidate[nestedKey];
        if (Array.isArray(nested)) {
          return normalizeArray(nested);
        }
      }
    }
  }

  if (isRecord(payload.data)) {
    return pickArray(payload.data, keys, mapper);
  }

  return [];
};

const normalizeBundleNode = (value: unknown): PlatformBundleNode | null => {
  if (!isRecord(value)) return null;

  const content = normalizeContentItem(value.content);
  if (!content) return null;

  return {
    content,
    chapters: pickArray<PlatformStoryChapter>(
      value.chapters,
      [],
      (chapter) =>
        isRecord(chapter)
          ? {
              ...(chapter as PlatformStoryChapter),
              imageUrl: toAssetProxyUrl(chapter.imageUrl, chapter.updatedAt),
            }
          : null,
    ),
    questions: pickArray<PlatformQuestion>(
      value.questions,
      [],
      (question) => (isRecord(question) ? (question as PlatformQuestion) : null),
    ),
  };
};

const normalizeActivity = (value: unknown): PlatformActivity | null => {
  const base = normalizeContentItem(value);
  if (!base) return null;

  const record = isRecord(value) ? value : {};

  return {
    ...base,
    instructions: typeof record.instructions === "string" ? record.instructions : undefined,
    configuration: isRecord(record.configuration)
      ? {
          ...record.configuration,
          activityType:
            typeof record.configuration.activityType === "string"
              ? record.configuration.activityType
              : undefined,
          materialsNeeded: toStringArray(record.configuration.materialsNeeded),
          tasks: toStringArray(record.configuration.tasks),
          teacherNotes:
            typeof record.configuration.teacherNotes === "string"
              ? record.configuration.teacherNotes
              : undefined,
        }
      : undefined,
  };
};

const normalizeBundle = (payload: unknown): PlatformBundle => {
  const record = isRecord(payload) ? payload : {};

  return {
    requestedContent: normalizeContentItem(record.requestedContent),
    contentPack: normalizeContentItem(record.contentPack),
    story: normalizeBundleNode(record.story),
    quiz: normalizeBundleNode(record.quiz),
    game: normalizeContentItem(record.game),
    activities: pickArray(record.activities, [], normalizeActivity),
    relatedContents: pickArray(record.relatedContents, [], normalizeContentItem),
    recommendedOrder: pickArray(record.recommendedOrder, [], normalizeContentItem),
    bundleContentIds: toStringArray(record.bundleContentIds),
  };
};

const normalizeAnalytics = (payload: unknown): PlatformAnalyticsResponse => {
  const record = isRecord(payload) ? payload : {};
  const overview = isRecord(record.overview) ? record.overview : {};

  return {
    overview: {
      totalContents: typeof overview.totalContents === "number" ? overview.totalContents : 0,
      stories: typeof overview.stories === "number" ? overview.stories : 0,
      quizzes: typeof overview.quizzes === "number" ? overview.quizzes : 0,
      games: typeof overview.games === "number" ? overview.games : 0,
      activities: typeof overview.activities === "number" ? overview.activities : 0,
      contentPacks: typeof overview.contentPacks === "number" ? overview.contentPacks : 0,
      publishedContents:
        typeof overview.publishedContents === "number" ? overview.publishedContents : 0,
    },
    engagementSummary: Array.isArray(record.engagementSummary)
      ? record.engagementSummary.filter((item): item is Record<string, unknown> => isRecord(item))
      : [],
  };
};

const normalizeSchool = (value: unknown): PlatformSchool | null => {
  if (!isRecord(value)) return null;

  const rawId = value._id ?? value.id;
  const id = typeof rawId === "string" ? rawId : "";
  const name = typeof value.name === "string" ? value.name : "";

  if (!id || !name) return null;

  return {
    ...value,
    id,
    name,
    schoolCode: typeof value.schoolCode === "string" ? value.schoolCode : undefined,
    email: typeof value.email === "string" ? value.email : undefined,
    phone: typeof value.phone === "string" ? value.phone : undefined,
    location: typeof value.location === "string" ? value.location : undefined,
    tier: typeof value.tier === "string" ? value.tier : undefined,
    status: typeof value.status === "string" ? value.status : undefined,
    maxStudents: typeof value.maxStudents === "number" ? value.maxStudents : undefined,
    studentCount: typeof value.studentCount === "number" ? value.studentCount : undefined,
    teacherCount: typeof value.teacherCount === "number" ? value.teacherCount : undefined,
    classCount: typeof value.classCount === "number" ? value.classCount : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
};

export const getPlatformContentItems = async (filters?: {
  type?: string;
  dedupe?: boolean;
  selFocus?: string[];
}) => {
  const searchParams = new URLSearchParams();

  if (filters?.type?.trim()) {
    searchParams.set("type", filters.type.trim());
  }

  if (typeof filters?.dedupe === "boolean") {
    searchParams.set("dedupe", String(filters.dedupe));
  }

  filters?.selFocus?.forEach((value) => {
    if (value.trim()) {
      searchParams.append("selFocus", value.trim());
    }
  });

  const query = searchParams.toString();
  const payload = await platformRequest<unknown>(
    `/api/v1/platform/content${query ? `?${query}` : ""}`,
  );
  return pickArray(payload, ["contents", "data", "results"], normalizeContentItem);
};

export const getPlatformContentBundle = async (contentId: string) => {
  const payload = await platformRequest<unknown>(`/api/v1/platform/content/${contentId}/full`);
  return normalizeBundle(payload);
};

export const getPlatformContentAnalytics = async () => {
  const payload = await platformRequest<unknown>("/api/v1/platform/content/analytics");
  return normalizeAnalytics(payload);
};

export const generatePlatformContentPackage = async (input: GeneratePlatformContentInput) => {
  const payload = await platformRequest<unknown>("/api/v1/platform/content/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return normalizeBundle(payload);
};

export const publishPlatformContentBundle = async (
  contentId: string,
  schoolIds?: string[],
) => {
  const body =
    schoolIds && schoolIds.length > 0
      ? { publicationScope: "selected_schools", schoolIds, status: "active" }
      : { publicationScope: "all_schools", status: "active" };

  const payload = await platformRequest<unknown>(
    `/api/v1/platform/content/${contentId}/publish-bundle`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  return normalizeBundle(isRecord(payload) ? payload.bundle : null);
};

export const createPlatformStoryActivity = async (
  contentId: string,
  input: CreatePlatformActivityInput,
) => {
  const payload = await platformRequest<unknown>(
    `/api/v1/platform/content/${contentId}/activities`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  const record = isRecord(payload) ? payload.activity ?? payload : payload;
  return normalizeActivity(record);
};

export const generatePlatformStoryImages = async (
  storyId: string,
  options?: {
    target?: "all" | "cover";
    size?: string;
    quality?: string;
    outputFormat?: string;
  },
) => {
  const payload = await platformRequest<unknown>(
    `/api/v1/platform/content/${storyId}/generate-images`,
    {
      method: "POST",
      body: JSON.stringify({
        target: options?.target ?? "all",
        size: options?.size ?? "1024x1536",
        quality: options?.quality ?? "medium",
        outputFormat: options?.outputFormat ?? "jpeg",
      }),
    },
  );

  return isRecord(payload) ? payload : {};
};

export const updatePlatformStory = async (
  storyId: string,
  input: UpdatePlatformStoryInput,
) => {
  const payload = await platformRequest<unknown>(`/api/v1/platform/stories/${storyId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return normalizeContentItem(isRecord(payload) ? payload.story ?? payload.content ?? payload : payload);
};

export const deletePlatformStory = async (storyId: string) => {
  const payload = await platformRequest<unknown>(`/api/v1/platform/stories/${storyId}`, {
    method: "DELETE",
  });

  return isRecord(payload) ? payload : {};
};

export const regeneratePlatformStory = async (
  storyId: string,
  input: RegeneratePlatformStoryInput,
) => {
  const payload = await platformRequest<unknown>(
    `/api/v1/platform/stories/${storyId}/regenerate`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return isRecord(payload) ? payload : {};
};

export const getPlatformSchools = async () => {
  try {
    const payload = await requestFromCandidates<unknown>([
      "/api/v1/platform/schools",
      "/api/v1/platform/schools/all",
      "/api/v1/schools",
      "/api/v1/platform/school",
      "/api/v1/auth/schools",
    ]);

    return pickArray(payload, ["schools", "data", "results", "items"], normalizeSchool);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      throw new Error("School listing endpoint is not available in the backend yet.");
    }

    throw error;
  }
};
