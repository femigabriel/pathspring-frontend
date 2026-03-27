"use client";

import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ClassReadingMode = "teacher_led" | "group_reading" | "buddy_reading";
export type ClassReadingStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface ClassReadingGroup {
  name: string;
  studentUserIds: string[];
  prompt?: string;
}

export interface ClassReadingSession {
  id: string;
  classroomId?: string;
  contentId?: string;
  title: string;
  mode: ClassReadingMode;
  status: ClassReadingStatus;
  scheduledFor?: string;
  objectives: string[];
  checkpointPrompts: string[];
  groups: ClassReadingGroup[];
  notes?: string;
  createdAt?: string;
}

export interface ClassReadingRosterRow {
  studentId?: string;
  studentName?: string;
  username?: string;
  groupName?: string;
  progressStatus?: string;
  progress?: number;
  score?: number;
}

export interface ClassReadingSessionDetail {
  session: ClassReadingSession | null;
  roster: ClassReadingRosterRow[];
}

export interface CreateClassReadingSessionInput {
  contentId: string;
  title: string;
  mode: ClassReadingMode;
  status: ClassReadingStatus;
  scheduledFor?: string;
  objectives?: string[];
  checkpointPrompts?: string[];
  groups?: ClassReadingGroup[];
  notes?: string;
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

const readingRequest = async <T = unknown>(path: string, init?: RequestInit) => {
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
    throw new Error(extractMessage(payload, `Request failed with status ${response.status}`));
  }

  return payload as T;
};

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const normalizeGroup = (value: unknown): ClassReadingGroup => {
  const record = isRecord(value) ? value : {};

  return {
    name: typeof record.name === "string" ? record.name : "Group",
    studentUserIds: toStringArray(record.studentUserIds),
    prompt: typeof record.prompt === "string" ? record.prompt : undefined,
  };
};

const normalizeSession = (value: unknown): ClassReadingSession | null => {
  if (!isRecord(value)) return null;
  const id = typeof (value.id ?? value._id) === "string" ? String(value.id ?? value._id) : "";
  const title = typeof value.title === "string" ? value.title : "";
  if (!id || !title) return null;

  return {
    id,
    classroomId: typeof value.classroomId === "string" ? value.classroomId : undefined,
    contentId: typeof value.contentId === "string" ? value.contentId : undefined,
    title,
    mode:
      value.mode === "teacher_led" || value.mode === "group_reading" || value.mode === "buddy_reading"
        ? value.mode
        : "teacher_led",
    status:
      value.status === "scheduled" ||
      value.status === "live" ||
      value.status === "completed" ||
      value.status === "cancelled"
        ? value.status
        : "scheduled",
    scheduledFor: typeof value.scheduledFor === "string" ? value.scheduledFor : undefined,
    objectives: toStringArray(value.objectives),
    checkpointPrompts: toStringArray(value.checkpointPrompts),
    groups: Array.isArray(value.groups) ? value.groups.map((group) => normalizeGroup(group)) : [],
    notes: typeof value.notes === "string" ? value.notes : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
};

export const getClassReadingSessions = async (classId: string) => {
  const payload = await readingRequest<unknown>(`/api/v1/classes/${classId}/reading-sessions`);
  const record = isRecord(payload) ? payload : {};
  const sessions = Array.isArray(record.sessions)
    ? record.sessions
    : Array.isArray(record.data)
      ? record.data
      : [];

  return sessions
    .map((session) => normalizeSession(session))
    .filter((session): session is ClassReadingSession => session !== null);
};

export const createClassReadingSession = async (
  classId: string,
  input: CreateClassReadingSessionInput,
) => {
  const payload = await readingRequest<unknown>(`/api/v1/classes/${classId}/reading-sessions`, {
    method: "POST",
    body: JSON.stringify(input),
  });

  return normalizeSession(isRecord(payload) ? payload.session ?? payload.data ?? payload : payload);
};

export const getClassReadingSessionDetail = async (sessionId: string) => {
  const payload = await readingRequest<unknown>(`/api/v1/classes/reading-sessions/${sessionId}`);
  const record = isRecord(payload) ? payload : {};
  const session = normalizeSession(record.session ?? record.data ?? record);
  const roster = Array.isArray(record.roster)
    ? record.roster
        .filter(isRecord)
        .map((row) => ({
          studentId: typeof row.studentId === "string" ? row.studentId : undefined,
          studentName: typeof row.studentName === "string" ? row.studentName : undefined,
          username: typeof row.username === "string" ? row.username : undefined,
          groupName: typeof row.groupName === "string" ? row.groupName : undefined,
          progressStatus: typeof row.progressStatus === "string" ? row.progressStatus : undefined,
          progress: typeof row.progress === "number" ? row.progress : undefined,
          score: typeof row.score === "number" ? row.score : undefined,
        }))
    : [];

  return {
    session,
    roster,
  } satisfies ClassReadingSessionDetail;
};

export const updateClassReadingSession = async (
  sessionId: string,
  input: Partial<CreateClassReadingSessionInput>,
) => {
  const payload = await readingRequest<unknown>(`/api/v1/classes/reading-sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return normalizeSession(isRecord(payload) ? payload.session ?? payload.data ?? payload : payload);
};
