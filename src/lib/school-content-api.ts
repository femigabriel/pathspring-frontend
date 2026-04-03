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
  selFocus?: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  ageRangeMin?: number;
  ageRangeMax?: number;
  estimatedDurationMinutes?: number;
  [key: string]: unknown;
}

export interface SchoolCatalogProduct extends SchoolStoryContent {
  isSelectedForSchool?: boolean;
  schoolSelection?: Record<string, unknown> | null;
  catalogPublication?: Record<string, unknown> | null;
}

export interface ProductPlanSummary {
  planKey: string;
  maxBooks: number | null;
  usedBooks: number;
  remainingBooks: number | null;
  isUnlimited: boolean;
}

export interface SchoolCatalogResponse {
  products: SchoolCatalogProduct[];
  plan: ProductPlanSummary | null;
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

export interface SchoolContentAssignment {
  id: string;
  contentId?: string;
  classroomId?: string;
  title?: string;
  classroomName?: string;
  studentUserIds: string[];
  dueAt?: string;
  notes?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface SchoolAssignmentTrackingRow {
  id: string;
  studentId?: string;
  studentName?: string;
  username?: string;
  classroomName?: string;
  status?: string;
  progress?: number;
  score?: number;
  submittedAt?: string;
  [key: string]: unknown;
}

export interface SchoolAssignmentTracking {
  assignment: SchoolContentAssignment | null;
  summary: {
    assigned: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    overdue: number;
  };
  rows: SchoolAssignmentTrackingRow[];
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

const schoolRequest = async <T = unknown>(path: string, init?: RequestInit) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

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
    if (response.status === 429) {
      throw new Error(formatRetryAfterMessage(response.headers.get("Retry-After")));
    }

    if (response.status === 400) {
      throw new Error(
        extractMessage(payload, "Please check the request details and try again."),
      );
    }

    throw new Error(
      extractMessage(payload, `Request failed with status ${response.status}`),
    );
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

const getRelatedContentIds = (content: SchoolStoryContent) => {
  const value = content.relatedContentIds;
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

const dedupeCatalogProducts = (products: SchoolCatalogProduct[]) => {
  const contentPacks = products.filter((item) => item.type === "CONTENT_PACK");
  if (contentPacks.length === 0) return products;

  const relatedIds = new Set(
    contentPacks.flatMap((item) => getRelatedContentIds(item)),
  );

  return products.filter((item) => {
    if (item.type === "CONTENT_PACK") return true;
    if (item.type === "STORY" && relatedIds.has(item._id)) return false;
    return item.type === "STORY";
  });
};

const normalizeContent = (value: unknown): SchoolStoryContent | null => {
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
    subject: typeof value.subject === "string" ? value.subject : undefined,
    gradeLevels: toStringArray(value.gradeLevels),
    selFocus: toStringArray(value.selFocus),
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
};

const normalizeCatalogProduct = (value: unknown): SchoolCatalogProduct | null => {
  const content = normalizeContent(value);
  if (!content || !isRecord(value)) return content;

  return {
    ...content,
    isSelectedForSchool:
      typeof value.isSelectedForSchool === "boolean" ? value.isSelectedForSchool : false,
    schoolSelection: isRecord(value.schoolSelection) ? value.schoolSelection : null,
    catalogPublication: isRecord(value.catalogPublication) ? value.catalogPublication : null,
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

const normalizeAssignment = (value: unknown): SchoolContentAssignment | null => {
  if (!isRecord(value)) return null;

  const rawId = value.id ?? value._id;
  const id = typeof rawId === "string" ? rawId : "";

  if (!id) return null;

  return {
    ...value,
    id,
    contentId: typeof value.contentId === "string" ? value.contentId : undefined,
    classroomId: typeof value.classroomId === "string" ? value.classroomId : undefined,
    title:
      typeof value.title === "string"
        ? value.title
        : typeof value.contentTitle === "string"
          ? value.contentTitle
          : undefined,
    classroomName:
      typeof value.classroomName === "string"
        ? value.classroomName
        : typeof value.className === "string"
          ? value.className
          : undefined,
    studentUserIds: toStringArray(value.studentUserIds),
    dueAt: typeof value.dueAt === "string" ? value.dueAt : undefined,
    notes: typeof value.notes === "string" ? value.notes : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
};

const normalizeAssignmentTrackingRow = (value: unknown): SchoolAssignmentTrackingRow | null => {
  if (!isRecord(value)) return null;

  const rawId = value.id ?? value._id ?? value.studentId;
  const id = typeof rawId === "string" ? rawId : "";
  if (!id) return null;

  return {
    ...value,
    id,
    studentId: typeof value.studentId === "string" ? value.studentId : undefined,
    studentName:
      typeof value.studentName === "string"
        ? value.studentName
        : typeof value.fullName === "string"
          ? value.fullName
          : undefined,
    username: typeof value.username === "string" ? value.username : undefined,
    classroomName:
      typeof value.classroomName === "string"
        ? value.classroomName
        : typeof value.className === "string"
          ? value.className
          : undefined,
    status: typeof value.status === "string" ? value.status : undefined,
    progress: typeof value.progress === "number" ? value.progress : undefined,
    score: typeof value.score === "number" ? value.score : undefined,
    submittedAt:
      typeof value.submittedAt === "string"
        ? value.submittedAt
        : typeof value.completedAt === "string"
          ? value.completedAt
          : undefined,
  };
};

export const getPublishedSchoolContents = async () => {
  try {
    const payload = await schoolRequest<unknown>("/api/v1/content?type=STORY");
    const record = isRecord(payload) ? payload : {};
    const contents = Array.isArray(record.contents) ? record.contents : [];

    return dedupePublishedContents(
      contents
        .map((item) => normalizeContent(item))
        .filter((item): item is SchoolStoryContent => item !== null)
        .filter((item) => item.type === "STORY"),
    );
  } catch {
    return [];
  }
};

export const getSchoolCatalogProducts = async (): Promise<SchoolCatalogResponse> => {
  const payload = await schoolRequest<unknown>("/api/v1/school/catalog");
  const record = isRecord(payload) ? payload : {};
  const products = Array.isArray(record.products)
    ? record.products
    : Array.isArray(record.contents)
      ? record.contents
      : Array.isArray(payload)
        ? payload
        : [];

  return {
    products: dedupeCatalogProducts(
      products
        .map((item) => normalizeCatalogProduct(item))
        .filter((item): item is SchoolCatalogProduct => item !== null)
        .filter((item) => item.type === "STORY" || item.type === "CONTENT_PACK"),
    ),
    plan: normalizeProductPlan(record.plan),
  };
};

export const getSchoolSelectedProducts = async (): Promise<SchoolCatalogResponse> => {
  const payload = await schoolRequest<unknown>("/api/v1/school/products");
  const record = isRecord(payload) ? payload : {};
  const products = Array.isArray(record.products)
    ? record.products
    : Array.isArray(record.contents)
      ? record.contents
      : Array.isArray(payload)
        ? payload
        : [];

  return {
    products: dedupeCatalogProducts(
      products
        .map((item) => normalizeCatalogProduct(item))
        .filter((item): item is SchoolCatalogProduct => item !== null)
        .filter((item) => item.type === "STORY" || item.type === "CONTENT_PACK"),
    ),
    plan: normalizeProductPlan(record.plan),
  };
};

export const selectSchoolProduct = async (
  contentId: string,
  payload?: { selectionType?: string; notes?: string },
) =>
  schoolRequest(`/api/v1/school/products/${contentId}/select`, {
    method: "POST",
    body: JSON.stringify(payload ?? { selectionType: "selected" }),
  });

export const removeSchoolProductSelection = async (contentId: string) =>
  schoolRequest(`/api/v1/school/products/${contentId}/select`, {
    method: "DELETE",
  });

export const getPublishedSchoolStoryBundle = async (contentId: string) => {
  const payload = await schoolRequest<unknown>(`/api/v1/content/${contentId}/full`);
  const record = isRecord(payload) ? payload : {};

  return {
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
  } satisfies SchoolStoryBundle;
};

export const createContentAssignment = async (payload: {
  contentId: string;
  classroomId?: string;
  studentUserIds?: string[];
  dueAt?: string;
  notes?: string;
}) =>
  schoolRequest("/api/v1/content/assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getContentAssignments = async () => {
  const payload = await schoolRequest<unknown>("/api/v1/content/assignments");
  const record = isRecord(payload) ? payload : {};
  const assignments = Array.isArray(record.assignments)
    ? record.assignments
    : Array.isArray(record.data)
      ? record.data
      : Array.isArray(payload)
        ? payload
        : [];

  return assignments
    .map((item) => normalizeAssignment(item))
    .filter((item): item is SchoolContentAssignment => item !== null);
};

export const getContentAssignmentTracking = async (
  assignmentId: string,
): Promise<SchoolAssignmentTracking> => {
  const payload = await schoolRequest<unknown>(`/api/v1/content/assignments/${assignmentId}/tracking`);
  const record = isRecord(payload) ? payload : {};
  const summary = isRecord(record.summary) ? record.summary : {};
  const rows = Array.isArray(record.rows)
    ? record.rows
    : Array.isArray(record.students)
      ? record.students
      : Array.isArray(record.tracking)
        ? record.tracking
        : [];

  return {
    assignment: normalizeAssignment(record.assignment),
    summary: {
      assigned: typeof summary.assigned === "number" ? summary.assigned : 0,
      completed: typeof summary.completed === "number" ? summary.completed : 0,
      inProgress: typeof summary.inProgress === "number" ? summary.inProgress : 0,
      notStarted: typeof summary.notStarted === "number" ? summary.notStarted : 0,
      overdue: typeof summary.overdue === "number" ? summary.overdue : 0,
    },
    rows: rows
      .map((item) => normalizeAssignmentTrackingRow(item))
      .filter((item): item is SchoolAssignmentTrackingRow => item !== null),
  };
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
  },
) =>
  schoolRequest(`/api/v1/content/${contentId}/progress`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const submitStudentContentAnswers = async (
  contentId: string,
  payload: {
    answers: StudentSubmissionAnswerPayload[];
    timeSpentSeconds?: number;
    startedAt?: string;
    feedback?: string;
  },
) =>
  schoolRequest(`/api/v1/content/${contentId}/submissions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
