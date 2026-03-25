// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_EVENT_KEY,
  getDefaultRouteForRole,
  type AuthSchool as School,
  type AuthUser as User,
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredSchool,
  getStoredUser,
  hasValidSession,
  isLogoutStorageEvent,
  isSessionExpired,
  markSessionActivity,
  migrateLegacyAuthStorage,
  persistAuthSession,
} from "@/src/lib/auth";

interface AuthContextType {
  user: User | null;
  school: School | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User, school?: School) => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = (accessToken: string, refreshToken: string, userData: User, schoolData?: School) => {
    persistAuthSession({
      accessToken,
      refreshToken,
      user: userData,
      school: schoolData,
    });
    setUser(userData);
    setSchool(schoolData ?? null);
  };

  const logout = () => {
    const nextRoute = getDefaultRouteForRole(user?.role) === "/student/dashboard" ? "/student/login" : "/login";
    clearAuthSession();
    setUser(null);
    setSchool(null);
    router.replace(nextRoute);
  };

  const fetchUserData = async () => {
    const token = getAccessToken();
    const storedUser = getStoredUser();
    const storedSchool = getStoredSchool();

    if (!token || isSessionExpired()) {
      clearAuthSession();
      setUser(null);
      setSchool(null);
      setIsLoading(false);
      return;
    }

    try {
      const userRole = storedUser?.role;
      const endpoint =
        userRole === "STUDENT"
          ? "/api/v1/auth/students/me"
          : userRole === "PARENT"
            ? "/api/v1/parents/me"
            : "/api/v1/auth/me";

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthSession();
          setUser(null);
          setSchool(null);
          return;
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data = await response.json();

      const nextUser =
        userRole === "STUDENT" && data.student
          ? {
              ...(storedUser ?? {}),
              id: data.student.id ?? storedUser?.id ?? "",
              role: "STUDENT" as const,
              username: data.student.username ?? storedUser?.username,
              fullName: data.student.fullName ?? storedUser?.fullName,
              isActive:
                typeof data.student.isActive === "boolean"
                  ? data.student.isActive
                  : storedUser?.isActive,
              school: data.student.school?.name ?? storedUser?.school ?? null,
              schoolCode: data.student.school?.schoolCode ?? storedUser?.schoolCode ?? null,
              gradeLevel: data.student.profile?.gradeLevel ?? storedUser?.gradeLevel ?? null,
              classroom: data.student.profile?.classroom ?? storedUser?.classroom ?? null,
              lastLoginAt: data.student.lastLoginAt ?? storedUser?.lastLoginAt ?? null,
            }
          : userRole === "PARENT" && data.parent
            ? {
                ...(storedUser ?? {}),
                id: data.parent.id ?? storedUser?.id ?? "",
                role: "PARENT" as const,
                email: data.parent.email ?? storedUser?.email,
                fullName: data.parent.fullName ?? storedUser?.fullName,
                phone: data.parent.phone ?? storedUser?.phone ?? null,
                isActive:
                  typeof data.parent.isActive === "boolean"
                    ? data.parent.isActive
                    : storedUser?.isActive,
                lastLoginAt: data.parent.lastLoginAt ?? storedUser?.lastLoginAt ?? null,
              }
          : {
              ...(storedUser ?? {}),
              ...(data.user ?? {}),
            };

      const nextSchool =
        userRole === "STUDENT" && data.student?.school
          ? {
              id: data.student.school.id ?? storedSchool?.id ?? "",
              name: data.student.school.name ?? storedSchool?.name ?? "PathSpring School",
              schoolCode: data.student.school.schoolCode ?? storedSchool?.schoolCode ?? "",
              logo: data.student.school.logo ?? storedSchool?.logo ?? null,
            }
          : userRole === "PARENT" && data.parent?.students?.[0]?.school
            ? {
                id: data.parent.students[0].school.id ?? storedSchool?.id ?? "",
                name: data.parent.students[0].school.name ?? storedSchool?.name ?? "PathSpring School",
                schoolCode: data.parent.students[0].school.schoolCode ?? storedSchool?.schoolCode ?? "",
                logo: data.parent.students[0].school.logo ?? storedSchool?.logo ?? null,
              }
          : data.school ?? storedSchool ?? null;

      setUser(nextUser);
      setSchool(nextSchool);

      persistAuthSession({
        accessToken: token,
        refreshToken: getRefreshToken() ?? undefined,
        user: nextUser,
        school: nextSchool,
      });
      markSessionActivity();
    } catch (error) {
      if (storedUser) {
        setUser(storedUser);
        setSchool(storedSchool);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      migrateLegacyAuthStorage();

      if (isSessionExpired()) {
        clearAuthSession();
        setIsLoading(false);
        return;
      }

      const storedUser = getStoredUser();
      const storedSchool = getStoredSchool();
      const token = getAccessToken();

      if (token && storedUser) {
        setUser(storedUser);
        setSchool(storedSchool);
        markSessionActivity();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      if (getAccessToken()) {
        markSessionActivity();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_EVENT_KEY && isLogoutStorageEvent(event.newValue)) {
        setUser(null);
        setSchool(null);
        setIsLoading(false);
        router.replace("/login");
      }
    };

    const sessionMonitor = window.setInterval(() => {
      if (getAccessToken() && isSessionExpired()) {
        clearAuthSession();
        setUser(null);
        setSchool(null);
        router.replace("/login");
      }
    }, 60_000);

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("mousedown", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(sessionMonitor);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("storage", handleStorage);
    };
  }, [router]);

  const value = {
    user,
    school,
    isLoading,
    isAuthenticated: !!user && hasValidSession(),
    login,
    logout,
    fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
