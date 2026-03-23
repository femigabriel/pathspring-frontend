// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: "SCHOOL_ADMIN" | "TEACHER" | "STUDENT";
  schoolId?: string;
}

interface School {
  id: string;
  name: string;
  schoolCode: string;
}

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
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(userData);
    if (schoolData) setSchool(schoolData);
    
    // Also store in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
    if (schoolData) localStorage.setItem("school", JSON.stringify(schoolData));
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("school");
    setUser(null);
    setSchool(null);
    router.push("/login");
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
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
        // If token is invalid, clear storage
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          localStorage.removeItem("school");
          setUser(null);
          setSchool(null);
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data = await response.json();
      
      // Set user data
      setUser(data.user);
      if (data.school) setSchool(data.school);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.school) localStorage.setItem("school", JSON.stringify(data.school));
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Don't logout on network errors, just keep existing data
    } finally {
      setIsLoading(false);
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedSchool = localStorage.getItem("school");
      const token = localStorage.getItem("accessToken");

      if (token && storedUser) {
        // Set initial user from localStorage
        setUser(JSON.parse(storedUser));
        if (storedSchool) setSchool(JSON.parse(storedSchool));
        
        // Fetch fresh user data in background
        await fetchUserData();
      } else {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    school,
    isLoading,
    isAuthenticated: !!user && !!localStorage.getItem("accessToken"),
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