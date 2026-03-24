"use client";

import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface AdminReviewSubmission {
  id: string;
  submittedAt?: string;
  submissionType?: string;
  totalQuestions?: number;
  answeredCount?: number;
  correctCount?: number;
  scorePercent?: number;
  timeSpentSeconds?: number;
  feedback?: string;
  student?: {
    id?: string;
    fullName?: string;
    username?: string;
  } | null;
  classroom?: {
    id?: string;
    name?: string;
    gradeLevel?: string;
  } | null;
  content?: {
    id?: string;
    title?: string;
    type?: string;
    theme?: string;
  } | null;
  answers?: Array<{
    questionId?: string;
    prompt?: string;
    answerText?: string;
    answerParts?: string[];
    correctAnswers?: string[];
    isCorrect?: boolean;
    pointsAwarded?: number;
    explanation?: string;
  }>;
}

export interface AdminReviewSummary {
  totalSubmissions: number;
  averageScore: number;
}

export interface ClassroomScoreboardRow {
  student: {
    id?: string;
    fullName?: string;
    username?: string;
    isActive?: boolean;
    lastLoginAt?: string;
  };
  stats: {
    contentsAttempted: number;
    completedContents: number;
    averageScore: number;
    totalSubmissions: number;
    totalTimeSpentSeconds: number;
  };
  latestSubmissionAt?: string | null;
}

export interface ClassroomScoreboardResponse {
  classroom: {
    id?: string;
    name?: string;
    gradeLevel?: string;
    teacher?: {
      id?: string;
      fullName?: string;
      email?: string;
    } | null;
  } | null;
  scoreboard: ClassroomScoreboardRow[];
}

const parseJsonSafely = (text: string) => {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractMessage = (payload: unknown, fallback: string) => {
  if (!isRecord(payload)) return fallback;
  const message = payload.message ?? payload.error ?? payload.detail ?? payload.title;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const adminReviewRequest = async <T = unknown>(path: string) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  const payload = parseJsonSafely(text);

  if (!response.ok) {
    throw new Error(extractMessage(payload, `Request failed with status ${response.status}`));
  }

  return payload as T;
};

const searchParams = (params: Record<string, string | undefined>) => {
  const next = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) next.set(key, value);
  });

  const query = next.toString();
  return query ? `?${query}` : "";
};

export const getSchoolSubmissions = async (filters?: {
  contentId?: string;
  classId?: string;
  studentId?: string;
}) => {
  const payload = await adminReviewRequest<unknown>(
    `/api/v1/school/submissions${searchParams(filters ?? {})}`,
  );

  const record = isRecord(payload) ? payload : {};
  const submissions = Array.isArray(record.submissions)
    ? (record.submissions as AdminReviewSubmission[])
    : [];
  const summary = isRecord(record.summary)
    ? {
        totalSubmissions:
          typeof record.summary.totalSubmissions === "number" ? record.summary.totalSubmissions : submissions.length,
        averageScore: typeof record.summary.averageScore === "number" ? record.summary.averageScore : 0,
      }
    : {
        totalSubmissions: submissions.length,
        averageScore: 0,
      };

  return {
    summary,
    submissions,
  } satisfies {
    summary: AdminReviewSummary;
    submissions: AdminReviewSubmission[];
  };
};

export const getClassScoreboard = async (classId: string) => {
  const payload = await adminReviewRequest<unknown>(`/api/v1/classes/${classId}/scoreboard`);
  const record = isRecord(payload) ? payload : {};

  return {
    classroom: isRecord(record.classroom)
      ? (record.classroom as ClassroomScoreboardResponse["classroom"])
      : null,
    scoreboard: Array.isArray(record.scoreboard)
      ? (record.scoreboard as ClassroomScoreboardRow[])
      : [],
  } satisfies ClassroomScoreboardResponse;
};

export const getClassSubmissions = async (classId: string, contentId?: string) => {
  const payload = await adminReviewRequest<unknown>(
    `/api/v1/classes/${classId}/submissions${searchParams({ contentId })}`,
  );
  const record = isRecord(payload) ? payload : {};

  return {
    classroom: isRecord(record.classroom) ? record.classroom : null,
    submissions: Array.isArray(record.submissions)
      ? (record.submissions as AdminReviewSubmission[])
      : [],
  };
};
