// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_EVENT_KEY,
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
    clearAuthSession();
    setUser(null);
    setSchool(null);
    router.replace("/login");
  };

  const fetchUserData = async () => {
    const token = getAccessToken();

    if (!token || isSessionExpired()) {
      clearAuthSession();
      setUser(null);
      setSchool(null);
      setIsLoading(false);
      return;
    }

    try {
      // console.log("Fetching user data from:", `${API_BASE_URL}/api/v1/auth/me`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthSession();
          setUser(null);
          setSchool(null);
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data = await response.json();

      setUser(data.user);
      setSchool(data.school ?? null);

      persistAuthSession({
        accessToken: token,
        refreshToken: getRefreshToken() ?? undefined,
        user: data.user,
        school: data.school,
      });
      markSessionActivity();
    } catch (error) {
      console.error("Error fetching user data:", error);
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
        await fetchUserData();
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
