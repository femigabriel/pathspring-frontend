"use client";

import type { AuthSchool, AuthUser } from "@/src/lib/auth";
import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface StudentProfileResponse {
  student?: {
    id?: string;
    username?: string;
    fullName?: string;
    isActive?: boolean;
    lastLoginAt?: string;
    school?: {
      id?: string;
      name?: string;
      schoolCode?: string;
      logo?: string | null;
    };
    profile?: {
      gradeLevel?: string;
      classroom?: {
        id?: string;
        name?: string;
        gradeLevel?: string;
      } | null;
    };
  };
}

export interface StudentProgressSummary {
  [key: string]: unknown;
}

export interface StudentReadingHistoryEntry {
  [key: string]: unknown;
}

export interface StudentVocabularyPayload {
  words?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface StudentGamePayload {
  [key: string]: unknown;
}

export interface StudentGameSubmissionAnswer {
  questionId: string;
  prompt?: string;
  answer: string | string[];
  isCorrect?: boolean;
}

export interface SubmitStudentGameSessionInput {
  gameContentId: string;
  scorePercent: number;
  timeSpentSeconds?: number;
  rewardsEarned?: string[];
  answers?: StudentGameSubmissionAnswer[];
}

const parseResponse = async (response: Response) => {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const extractMessage = (payload: Record<string, unknown> | null, fallback: string) => {
  const message = payload?.message ?? payload?.error ?? payload?.detail;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const studentRequest = async <T = unknown>(path: string, init?: RequestInit) => {
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

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new Error(extractMessage(payload, `Request failed with status ${response.status}`));
  }

  return payload as T;
};

export const getStudentProfile = async (accessToken: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/students/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = (await parseResponse(response)) as StudentProfileResponse | null;

  if (!response.ok) {
    throw new Error(extractMessage(payload as Record<string, unknown> | null, "Failed to fetch student profile."));
  }

  const student = payload?.student;
  if (!student) {
    throw new Error("Student profile was not returned.");
  }

  const user: AuthUser = {
    id: student.id ?? "",
    role: "STUDENT",
    username: student.username,
    fullName: student.fullName,
    isActive: student.isActive,
    school: student.school?.name ?? null,
    schoolCode: student.school?.schoolCode ?? null,
    gradeLevel: student.profile?.gradeLevel ?? null,
    classroom: student.profile?.classroom
      ? {
          id: student.profile.classroom.id ?? "",
          name: student.profile.classroom.name ?? "",
          gradeLevel: student.profile.classroom.gradeLevel,
        }
      : null,
    lastLoginAt: student.lastLoginAt ?? null,
  };

  const school: AuthSchool | null = student.school
    ? {
        id: student.school.id ?? "",
        name: student.school.name ?? "PathSpring School",
        schoolCode: student.school.schoolCode ?? "",
        logo: student.school.logo ?? null,
      }
    : null;

  return { user, school };
};

export const getStudentProgressSummary = async () => {
  const payload = await studentRequest<Record<string, unknown>>("/api/v1/content/progress/summary");
  return (payload.summary ?? payload) as StudentProgressSummary;
};

export const getStudentReadingHistory = async (options?: { limit?: number; skip?: number }) => {
  const search = new URLSearchParams();
  if (typeof options?.limit === "number") search.set("limit", String(options.limit));
  if (typeof options?.skip === "number") search.set("skip", String(options.skip));
  const query = search.toString();

  const payload = await studentRequest<Record<string, unknown>>(
    `/api/v1/content/progress/history${query ? `?${query}` : ""}`,
  );

  const items = Array.isArray(payload.history)
    ? payload.history
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.data)
        ? payload.data
        : [];

  return items as StudentReadingHistoryEntry[];
};

export const getStudentContentVocabulary = async (contentId: string) => {
  const payload = await studentRequest<Record<string, unknown>>(`/api/v1/content/${contentId}/vocabulary`);
  return (payload.vocabulary ?? payload) as StudentVocabularyPayload;
};

export const updateStudentVocabularyProgress = async (
  contentId: string,
  input: { masteredWords?: string[]; practisedWords?: string[] },
) =>
  studentRequest(`/api/v1/content/${contentId}/vocabulary/progress`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getStudentContentGame = async (contentId: string) => {
  const payload = await studentRequest<Record<string, unknown>>(`/api/v1/content/${contentId}/game`);
  return (payload.game ?? payload) as StudentGamePayload;
};

export const submitStudentGameSession = async (
  contentId: string,
  input: SubmitStudentGameSessionInput,
) =>
  studentRequest(`/api/v1/content/${contentId}/game/submit`, {
    method: "POST",
    body: JSON.stringify(input),
  });
