"use client";

import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ParentProfile {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  relationship?: string;
  childrenCount?: number;
}

export interface ParentChild {
  id: string;
  fullName: string;
  username?: string;
  gradeLevel?: string;
  classroomName?: string;
  schoolName?: string;
  relationship?: string;
  isPrimaryContact?: boolean;
}

export interface ParentChildOverview {
  child: ParentChild | null;
  stats: {
    storiesRead: number;
    quizzesCompleted: number;
    averageScore: number;
    totalSubmissions: number;
    timeSpentSeconds: number;
  };
  recentSubmissions: Array<Record<string, unknown>>;
  recentProgress: Array<Record<string, unknown>>;
}

export interface CreateParentLinkInput {
  fullName: string;
  email: string;
  password: string;
  studentId: string;
  relationship: string;
  phone?: string;
  isPrimaryContact?: boolean;
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
  const message = payload.message ?? payload.error ?? payload.detail ?? payload.title;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const parentRequest = async <T = unknown>(path: string, init?: RequestInit) => {
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
    throw new Error(extractMessage(payload, `Request failed with status ${response.status}`));
  }

  return payload as T;
};

const toParentChild = (value: unknown): ParentChild | null => {
  if (!isRecord(value)) return null;

  const rawStudent = isRecord(value.student) ? value.student : value;
  const id = typeof rawStudent.id === "string" ? rawStudent.id : typeof rawStudent._id === "string" ? rawStudent._id : "";
  const fullName = typeof rawStudent.fullName === "string" ? rawStudent.fullName : "";

  if (!id || !fullName) return null;

  const classroom =
    isRecord(rawStudent.classroom)
      ? rawStudent.classroom
      : isRecord(rawStudent.profile) && isRecord(rawStudent.profile.classroom)
        ? rawStudent.profile.classroom
        : null;

  const school =
    isRecord(rawStudent.school)
      ? rawStudent.school
      : isRecord(rawStudent.profile) && isRecord(rawStudent.profile.school)
        ? rawStudent.profile.school
        : null;

  return {
    id,
    fullName,
    username: typeof rawStudent.username === "string" ? rawStudent.username : undefined,
    gradeLevel:
      typeof rawStudent.gradeLevel === "string"
        ? rawStudent.gradeLevel
        : isRecord(rawStudent.profile) && typeof rawStudent.profile.gradeLevel === "string"
          ? rawStudent.profile.gradeLevel
          : undefined,
    classroomName: classroom && typeof classroom.name === "string" ? classroom.name : undefined,
    schoolName: school && typeof school.name === "string" ? school.name : undefined,
    relationship: typeof value.relationship === "string" ? value.relationship : undefined,
    isPrimaryContact: typeof value.isPrimaryContact === "boolean" ? value.isPrimaryContact : undefined,
  };
};

export const getParentProfile = async () => {
  const payload = await parentRequest<unknown>("/api/v1/parents/me");
  const record = isRecord(payload) ? payload : {};
  const parent = isRecord(record.parent) ? record.parent : record;
  const children = Array.isArray(record.children)
    ? record.children
    : Array.isArray(parent.students)
      ? parent.students
      : [];

  return {
    id:
      typeof parent.id === "string"
        ? parent.id
        : typeof parent._id === "string"
          ? parent._id
          : "",
    fullName: typeof parent.fullName === "string" ? parent.fullName : "Parent",
    email: typeof parent.email === "string" ? parent.email : undefined,
    phone: typeof parent.phone === "string" ? parent.phone : undefined,
    relationship: typeof parent.relationship === "string" ? parent.relationship : undefined,
    childrenCount: children.length,
  } satisfies ParentProfile;
};

export const getParentChildren = async () => {
  const payload = await parentRequest<unknown>("/api/v1/parents/children");
  const record = isRecord(payload) ? payload : {};
  const children = Array.isArray(record.children)
    ? record.children
    : Array.isArray(record.data)
      ? record.data
      : [];

  return children
    .map((child) => toParentChild(child))
    .filter((child): child is ParentChild => child !== null);
};

export const getParentChildOverview = async (childId: string) => {
  const payload = await parentRequest<unknown>(`/api/v1/parents/children/${childId}/overview`);
  const record = isRecord(payload) ? payload : {};
  const overview = isRecord(record.overview) ? record.overview : record;

  const child =
    toParentChild(overview.child) ??
    toParentChild(overview.student) ??
    toParentChild(record.child) ??
    null;

  const stats = isRecord(overview.stats) ? overview.stats : overview;

  return {
    child,
    stats: {
      storiesRead: typeof stats.storiesRead === "number" ? stats.storiesRead : 0,
      quizzesCompleted: typeof stats.quizzesCompleted === "number" ? stats.quizzesCompleted : 0,
      averageScore: typeof stats.averageScore === "number" ? stats.averageScore : 0,
      totalSubmissions: typeof stats.totalSubmissions === "number" ? stats.totalSubmissions : 0,
      timeSpentSeconds: typeof stats.timeSpentSeconds === "number" ? stats.timeSpentSeconds : 0,
    },
    recentSubmissions: Array.isArray(overview.recentSubmissions) ? overview.recentSubmissions.filter(isRecord) : [],
    recentProgress: Array.isArray(overview.recentProgress) ? overview.recentProgress.filter(isRecord) : [],
  } satisfies ParentChildOverview;
};

export const createParentLink = async (input: CreateParentLinkInput) =>
  parentRequest("/api/v1/parents", {
    method: "POST",
    body: JSON.stringify(input),
  });
