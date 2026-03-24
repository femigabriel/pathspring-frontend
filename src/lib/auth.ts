"use client";

export type UserRole = "PLATFORM_ADMIN" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT";

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  schoolId?: string;
  username?: string;
  fullName?: string;
  isActive?: boolean;
  school?: string | null;
  schoolCode?: string | null;
  gradeLevel?: string | null;
  classroom?: {
    id: string;
    name: string;
    gradeLevel?: string;
  } | null;
  lastLoginAt?: string | null;
}

export interface AuthSchool {
  id: string;
  name: string;
  schoolCode: string;
  logo?: string | null;
}

interface PersistAuthSessionOptions {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
  school?: AuthSchool | null;
}

const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const AUTH_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  user: "user",
  school: "school",
  sessionStartedAt: "auth:session_started_at",
  lastActivityAt: "auth:last_activity_at",
  event: "auth:event",
} as const;

const canUseStorage = () => typeof window !== "undefined";

const readSessionValue = (key: string) => {
  if (!canUseStorage()) return null;
  return window.sessionStorage.getItem(key);
};

const readLegacyValue = (key: string) => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(key);
};

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const setSessionValue = (key: string, value: string) => {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(key, value);
};

const removeEverywhere = (key: string) => {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(key);
  window.localStorage.removeItem(key);
};

const broadcastAuthEvent = (type: "logout" | "login") => {
  if (!canUseStorage()) return;

  window.localStorage.setItem(
    AUTH_KEYS.event,
    JSON.stringify({ type, timestamp: Date.now() }),
  );
};

export const getDefaultRouteForRole = (role?: string | null) => {
  switch (role) {
    case "PLATFORM_ADMIN":
      return "/premium-admin/dashboard";
    case "SCHOOL_ADMIN":
      return "/admin/dashboard";
    case "TEACHER":
      return "/admin/story-book";
    case "STUDENT":
      return "/student/dashboard";
    default:
      return "/login";
  }
};

export const persistAuthSession = ({
  accessToken,
  refreshToken,
  user,
  school,
}: PersistAuthSessionOptions) => {
  if (!canUseStorage()) return;

  const now = Date.now().toString();
  const sessionStartedAt = readSessionValue(AUTH_KEYS.sessionStartedAt) ?? now;

  window.localStorage.removeItem(AUTH_KEYS.accessToken);
  window.localStorage.removeItem(AUTH_KEYS.refreshToken);
  window.localStorage.removeItem(AUTH_KEYS.user);
  window.localStorage.removeItem(AUTH_KEYS.school);

  setSessionValue(AUTH_KEYS.accessToken, accessToken);
  if (refreshToken) {
    setSessionValue(AUTH_KEYS.refreshToken, refreshToken);
  } else {
    window.sessionStorage.removeItem(AUTH_KEYS.refreshToken);
  }
  setSessionValue(AUTH_KEYS.user, JSON.stringify(user));
  if (school) {
    setSessionValue(AUTH_KEYS.school, JSON.stringify(school));
  } else {
    window.sessionStorage.removeItem(AUTH_KEYS.school);
  }
  setSessionValue(AUTH_KEYS.sessionStartedAt, sessionStartedAt);
  setSessionValue(AUTH_KEYS.lastActivityAt, now);

  broadcastAuthEvent("login");
};

export const clearAuthSession = () => {
  Object.values(AUTH_KEYS).forEach(removeEverywhere);
  broadcastAuthEvent("logout");
};

export const getAccessToken = () =>
  readSessionValue(AUTH_KEYS.accessToken) ?? readLegacyValue(AUTH_KEYS.accessToken);

export const getRefreshToken = () =>
  readSessionValue(AUTH_KEYS.refreshToken) ?? readLegacyValue(AUTH_KEYS.refreshToken);

export const getStoredUser = () =>
  safeJsonParse<AuthUser>(
    readSessionValue(AUTH_KEYS.user) ?? readLegacyValue(AUTH_KEYS.user),
  );

export const getStoredSchool = () =>
  safeJsonParse<AuthSchool>(
    readSessionValue(AUTH_KEYS.school) ?? readLegacyValue(AUTH_KEYS.school),
  );

export const markSessionActivity = () => {
  if (!getAccessToken()) return;
  setSessionValue(AUTH_KEYS.lastActivityAt, Date.now().toString());
};

export const isSessionExpired = () => {
  const token = getAccessToken();
  if (!token) return true;

  const now = Date.now();
  const startedAt = Number(readSessionValue(AUTH_KEYS.sessionStartedAt) ?? now);
  const lastActivityAt = Number(readSessionValue(AUTH_KEYS.lastActivityAt) ?? now);

  return (
    now - startedAt > SESSION_MAX_AGE_MS ||
    now - lastActivityAt > SESSION_IDLE_TIMEOUT_MS
  );
};

export const hasValidSession = () => Boolean(getAccessToken()) && !isSessionExpired();

export const migrateLegacyAuthStorage = () => {
  if (!canUseStorage()) return;
  if (readSessionValue(AUTH_KEYS.accessToken)) return;

  const accessToken = readLegacyValue(AUTH_KEYS.accessToken);
  const refreshToken = readLegacyValue(AUTH_KEYS.refreshToken) ?? undefined;
  const user = safeJsonParse<AuthUser>(readLegacyValue(AUTH_KEYS.user));
  const school = safeJsonParse<AuthSchool>(readLegacyValue(AUTH_KEYS.school));

  if (!accessToken || !user) {
    return;
  }

  persistAuthSession({
    accessToken,
    refreshToken,
    user,
    school,
  });
};

export const isLogoutStorageEvent = (value: string | null) => {
  const event = safeJsonParse<{ type?: string }>(value);
  return event?.type === "logout";
};

export const AUTH_EVENT_KEY = AUTH_KEYS.event;
