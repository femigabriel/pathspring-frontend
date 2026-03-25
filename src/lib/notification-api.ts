"use client";

import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt?: string;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: string;
  recipientRoles: string[];
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

const notificationRequest = async <T = unknown>(path: string, init?: RequestInit) => {
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

const normalizeNotification = (value: unknown): NotificationItem | null => {
  if (!isRecord(value)) return null;

  const rawId = value.id ?? value._id;
  const id = typeof rawId === "string" ? rawId : "";
  const title = typeof value.title === "string" ? value.title : "";
  const message = typeof value.message === "string" ? value.message : "";

  if (!id || !title || !message) return null;

  return {
    id,
    title,
    message,
    type: typeof value.type === "string" ? value.type : undefined,
    isRead:
      typeof value.isRead === "boolean"
        ? value.isRead
        : typeof value.read === "boolean"
          ? value.read
          : false,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
};

export const getNotifications = async () => {
  const payload = await notificationRequest<unknown>("/api/v1/notifications");
  const record = isRecord(payload) ? payload : {};
  const items = Array.isArray(record.notifications)
    ? record.notifications
    : Array.isArray(record.data)
      ? record.data
      : Array.isArray(payload)
        ? payload
        : [];

  return items
    .map((item) => normalizeNotification(item))
    .filter((item): item is NotificationItem => item !== null);
};

export const markNotificationRead = async (notificationId: string) =>
  notificationRequest(`/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
  });

export const createNotification = async (input: CreateNotificationInput) =>
  notificationRequest("/api/v1/notifications", {
    method: "POST",
    body: JSON.stringify(input),
  });
