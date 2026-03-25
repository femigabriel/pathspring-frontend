"use client";

import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface SchoolStoryContent {
  _id: string;
  id: string;
  type?: string;
  title: string;
  coverImageUrl?: string;
  summary?: string;
  description?: string;
  theme?: string;
  subject?: string;
  gradeLevels?: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  ageRangeMin?: number;
  ageRangeMax?: number;
  estimatedDurationMinutes?: number;
  [key: string]: unknown;
}

export interface SchoolStoryChapter {
  _id?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  order?: number;
}

export interface SchoolQuestion {
  _id?: string;
  prompt?: string;
  options?: string[];
  correctAnswers?: string[];
  explanation?: string;
  order?: number;
}

export interface SchoolActivity extends SchoolStoryContent {
  instructions?: string;
  configuration?: {
    activityType?: string;
    tasks?: string[];
    materialsNeeded?: string[];
    teacherNotes?: string;
    [key: string]: unknown;
  };
}

export interface SchoolBundleNode {
  content: SchoolStoryContent;
  chapters: SchoolStoryChapter[];
  questions: SchoolQuestion[];
}

export interface SchoolStoryBundle {
  requestedContent: SchoolStoryContent | null;
  contentPack: SchoolStoryContent | null;
  story: SchoolBundleNode | null;
  quiz: SchoolBundleNode | null;
  game: SchoolStoryContent | null;
  activities: SchoolActivity[];
}

export interface StudentSubmissionAnswerPayload {
  questionId: string;
  answer: string | string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseJsonSafely = (text: string) => {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    console.error("JSON parse error:", error);
    return text;
  }
};

const extractMessage = (payload: unknown, fallback: string) => {
  if (!isRecord(payload)) return fallback;
  const message = payload.message ?? payload.error ?? payload.detail ?? payload.title;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const schoolRequest = async <T = unknown>(path: string, init?: RequestInit) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });

    const text = await response.text();
    const payload = parseJsonSafely(text);

    if (!response.ok) {
      const errorMessage = extractMessage(
        payload,
        `Request failed with status ${response.status}`
      );
      console.error("API Error:", { status: response.status, message: errorMessage, path });
      throw new Error(errorMessage);
    }

    return payload as T;
  } catch (error) {
    console.error("School request failed:", { path, error });
    throw error;
  }
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

const dedupePublishedContents = (contents: SchoolStoryContent[]) => {
  const contentMap = new Map<string, SchoolStoryContent>();

  contents.forEach((content) => {
    const dedupeKey = [
      content.title.trim().toLowerCase(),
      [...(content.gradeLevels ?? [])].sort().join("|").toLowerCase(),
      (content.subject ?? "").trim().toLowerCase(),
    ].join("::");

    const existing = contentMap.get(dedupeKey);
    if (!existing) {
      contentMap.set(dedupeKey, content);
      return;
    }

    if (!existing.coverImageUrl && content.coverImageUrl) {
      contentMap.set(dedupeKey, {
        ...existing,
        coverImageUrl: content.coverImageUrl,
      });
      return;
    }

    if (existing.type !== "CONTENT_PACK" && content.type === "CONTENT_PACK") {
      contentMap.set(dedupeKey, {
        ...content,
        coverImageUrl: content.coverImageUrl ?? existing.coverImageUrl,
      });
    }
  });

  return [...contentMap.values()];
};

const normalizeContent = (value: unknown): SchoolStoryContent | null => {
  if (!isRecord(value)) {
    console.warn("normalizeContent: received non-record value", value);
    return null;
  }

  const rawId = value._id ?? value.id;
  const id = typeof rawId === "string" ? rawId : "";
  const title = typeof value.title === "string" ? value.title : "";

  if (!id || !title) {
    console.warn("normalizeContent: missing id or title", { id, title, value });
    return null;
  }

  const coverImageUrl = toAssetProxyUrl(value.coverImageUrl, value.updatedAt);
  if (!coverImageUrl && value.coverImageUrl) {
    console.warn(`Content "${title}" has coverImageUrl but couldn't resolve it:`, {
      raw: value.coverImageUrl,
      resolved: coverImageUrl,
    });
  }

  const normalized: SchoolStoryContent = {
    ...value,
    _id: id,
    id,
    title,
    coverImageUrl,
    summary: typeof value.summary === "string" ? value.summary : undefined,
    description: typeof value.description === "string" ? value.description : undefined,
    theme: typeof value.theme === "string" ? value.theme : undefined,
    subject: typeof value.subject === "string" ? value.subject : undefined,
    gradeLevels: toStringArray(value.gradeLevels),
    publishedAt: typeof value.publishedAt === "string" ? value.publishedAt : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
    status: typeof value.status === "string" ? value.status : undefined,
    ageRangeMin: typeof value.ageRangeMin === "number" ? value.ageRangeMin : undefined,
    ageRangeMax: typeof value.ageRangeMax === "number" ? value.ageRangeMax : undefined,
    estimatedDurationMinutes:
      typeof value.estimatedDurationMinutes === "number"
        ? value.estimatedDurationMinutes
        : undefined,
  };

  console.log("✅ Normalized content:", { title, id, hasImage: !!coverImageUrl });
  return normalized;
};

const normalizeNode = (value: unknown): SchoolBundleNode | null => {
  if (!isRecord(value)) return null;
  const content = normalizeContent(value.content);
  if (!content) return null;

  return {
    content,
    chapters: Array.isArray(value.chapters)
      ? (value.chapters as Array<Record<string, unknown>>).map((chapter) => ({
          ...chapter,
          imageUrl: toAssetProxyUrl(chapter.imageUrl, chapter.updatedAt),
        }))
      : [],
    questions: Array.isArray(value.questions)
      ? (value.questions as Array<Record<string, unknown>>).map((question) => ({
          ...question,
          options: toStringArray(question.options),
          correctAnswers: toStringArray(question.correctAnswers),
        }))
      : [],
  };
};

const normalizeActivity = (value: unknown): SchoolActivity | null => {
  const content = normalizeContent(value);
  if (!content) return null;
  const record = isRecord(value) ? value : {};

  return {
    ...content,
    instructions: typeof record.instructions === "string" ? record.instructions : undefined,
    configuration: isRecord(record.configuration)
      ? {
          ...record.configuration,
          activityType:
            typeof record.configuration.activityType === "string"
              ? record.configuration.activityType
              : undefined,
          tasks: toStringArray(record.configuration.tasks),
          materialsNeeded: toStringArray(record.configuration.materialsNeeded),
          teacherNotes:
            typeof record.configuration.teacherNotes === "string"
              ? record.configuration.teacherNotes
              : undefined,
        }
      : undefined,
  };
};

export const getPublishedSchoolContents = async () => {
  try {
    console.log("📚 Fetching published school contents...");
    const payload = await schoolRequest<unknown>("/api/v1/content");
    console.log("API Response received:", payload);

    const record = isRecord(payload) ? payload : {};
    const contents = Array.isArray(record.contents) ? record.contents : [];

    console.log(`Found ${contents.length} contents in API response`);

    const normalized = dedupePublishedContents(
      contents
        .map((item) => normalizeContent(item))
        .filter((item): item is SchoolStoryContent => item !== null)
        .filter((item) => {
          const isValid = item.type === "CONTENT_PACK" || item.type === "STORY";
          if (!isValid) {
            console.log(`Filtered out content with type: ${item.type}`);
          }
          return isValid;
        })
    );

    console.log(
      `✅ Successfully normalized ${normalized.length} contents:`,
      normalized.map((c) => ({ title: c.title, hasImage: !!c.coverImageUrl }))
    );

    return normalized;
  } catch (error) {
    console.error("❌ Failed to get published school contents:", error);
    return [];
  }
};

export const getPublishedSchoolStoryBundle = async (contentId: string) => {
  try {
    console.log(`📖 Fetching story bundle for content: ${contentId}`);
    const payload = await schoolRequest<unknown>(`/api/v1/content/${contentId}/full`);

    const record = isRecord(payload) ? payload : {};

    const bundle: SchoolStoryBundle = {
      requestedContent: normalizeContent(record.requestedContent),
      contentPack: normalizeContent(record.contentPack),
      story: normalizeNode(record.story),
      quiz: normalizeNode(record.quiz),
      game: normalizeContent(record.game),
      activities: Array.isArray(record.activities)
        ? record.activities
            .map((item) => normalizeActivity(item))
            .filter((item): item is SchoolActivity => item !== null)
        : [],
    };

    console.log("✅ Story bundle loaded:", {
      hasStory: !!bundle.story,
      hasQuiz: !!bundle.quiz,
      hasGame: !!bundle.game,
      activityCount: bundle.activities.length,
    });

    return bundle;
  } catch (error) {
    console.error("❌ Failed to get story bundle:", error);
    throw error;
  }
};

export const recordStudentContentProgress = async (
  contentId: string,
  payload: {
    status: "not_started" | "in_progress" | "completed";
    score?: number;
    timeSpentSeconds?: number;
    enjoymentRating?: number;
    struggleAreas?: string[];
    strengths?: string[];
    completedAt?: string;
  }
) => {
  try {
    console.log(`📊 Recording progress for content: ${contentId}`, payload);
    const result = await schoolRequest(`/api/v1/content/${contentId}/progress`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log("✅ Progress recorded successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to record progress:", error);
    throw error;
  }
};

export const submitStudentContentAnswers = async (
  contentId: string,
  payload: {
    answers: StudentSubmissionAnswerPayload[];
    timeSpentSeconds?: number;
    startedAt?: string;
    feedback?: string;
  }
) => {
  try {
    console.log(`✍️ Submitting answers for content: ${contentId}`);
    const result = await schoolRequest(`/api/v1/content/${contentId}/submissions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log("✅ Answers submitted successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to submit answers:", error);
    throw error;
  }
};
