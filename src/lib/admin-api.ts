"use client";

import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface AdminStudent {
  id: string;
  fullName: string;
  gradeLevel?: string;
  classroom?: string;
  age?: number;
  parentEmail?: string;
  parentPhone?: string;
  isActive?: boolean;
  storiesRead?: number;
  rating?: number;
  username?: string;
  progress?: number;
  completionRate?: number;
  [key: string]: unknown;
}

export interface AdminTeacher {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  specialization?: string;
  studentsCount?: number;
  rating?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AdminClassroom {
  id: string;
  name: string;
  gradeLevel?: string;
  teacher?: AdminTeacher | null;
  studentCount?: number;
  isActive?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AdminSchoolDetails {
  id?: string;
  name?: string;
  schoolCode?: string;
  location?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface DashboardSnapshot {
  students: AdminStudent[];
  teachers: AdminTeacher[];
  classes: AdminClassroom[];
  school: AdminSchoolDetails | null;
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalStories: number;
    avgProgress: number;
  };
}

interface RequestResult<T> {
  data: T;
  path: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const extractMessage = (payload: unknown, fallback: string) => {
  if (!isRecord(payload)) return fallback;

  const message =
    payload.message ??
    payload.error ??
    payload.detail ??
    payload.title;

  return typeof message === "string" && message.trim() ? message : fallback;
};

const parseJsonSafely = (text: string) => {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const requestJson = async <T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<RequestResult<T>> => {
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
  const payload = parseJsonSafely(text) as T;

  if (!response.ok) {
    throw new Error(extractMessage(payload, `Request failed with status ${response.status}`));
  }

  return { data: payload, path };
};

const requestJsonFromCandidates = async <T = unknown>(
  paths: string[],
  init?: RequestInit,
): Promise<RequestResult<T>> => {
  let lastError: Error | null = null;

  for (const path of paths) {
    try {
      return await requestJson<T>(path, init);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Request failed");
    }
  }

  throw lastError ?? new Error("Request failed");
};

const pickArray = <T>(
  payload: unknown,
  keys: string[],
): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  for (const key of keys) {
    const directValue = payload[key];
    if (Array.isArray(directValue)) {
      return directValue as T[];
    }

    if (isRecord(directValue)) {
      for (const nestedKey of ["items", "results", "data", key]) {
        const nestedValue = directValue[nestedKey];
        if (Array.isArray(nestedValue)) {
          return nestedValue as T[];
        }
      }
    }
  }

  if (isRecord(payload.data)) {
    return pickArray<T>(payload.data, keys);
  }

  return [];
};

const pickSchool = (payload: unknown): AdminSchoolDetails | null => {
  if (!payload) return null;

  if (isRecord(payload)) {
    if (isRecord(payload.school)) {
      return payload.school as AdminSchoolDetails;
    }

    if (isRecord(payload.data) && isRecord(payload.data.school)) {
      return payload.data.school as AdminSchoolDetails;
    }

    if (typeof payload.name === "string" || typeof payload.schoolCode === "string") {
      return payload as AdminSchoolDetails;
    }
  }

  return null;
};

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

export const getAdminStudents = async () => {
  const { data } = await requestJsonFromCandidates<unknown>([
    "/api/v1/school/students",
    "/api/v1/auth/students",
  ]);

  return pickArray<AdminStudent>(data, ["students", "data", "results"]);
};

export const getAdminTeachers = async () => {
  const { data } = await requestJsonFromCandidates<unknown>([
    "/api/v1/school/teachers",
    "/api/v1/auth/teachers",
  ]);

  return pickArray<AdminTeacher>(data, ["teachers", "data", "results"]);
};

export const getAdminClasses = async () => {
  const { data } = await requestJsonFromCandidates<unknown>([
    "/api/v1/classes",
    "/api/v1/auth/classes",
  ]);

  return pickArray<AdminClassroom>(data, ["classrooms", "classes", "data", "results"]);
};

export const getAdminSchoolDetails = async () => {
  const { data } = await requestJsonFromCandidates<unknown>([
    "/api/v1/school/details",
    "/api/v1/auth/me",
  ]);

  return pickSchool(data);
};

export const getAdminDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  const [students, teachers, classes, school] = await Promise.all([
    getAdminStudents(),
    getAdminTeachers(),
    getAdminClasses(),
    getAdminSchoolDetails().catch(() => null),
  ]);

  const totalStories = students.reduce((sum, student) => {
    const storiesRead =
      typeof student.storiesRead === "number"
        ? student.storiesRead
        : typeof student.storiesRead === "string"
          ? Number(student.storiesRead)
          : 0;

    return sum + (Number.isFinite(storiesRead) ? storiesRead : 0);
  }, 0);

  const avgProgress = average(
    students
      .map((student) => {
        if (typeof student.progress === "number") return student.progress;
        if (typeof student.completionRate === "number") return student.completionRate;
        return null;
      })
      .filter((value): value is number => value !== null),
  );

  return {
    students,
    teachers,
    classes,
    school,
    stats: {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalStories,
      avgProgress,
    },
  };
};
