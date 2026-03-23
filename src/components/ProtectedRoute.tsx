// src/components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"SCHOOL_ADMIN" | "TEACHER" | "STUDENT">;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, fetchUserData } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If not loading and not authenticated, redirect to login
      if (!isLoading && !isAuthenticated) {
        router.replace("/login");
        return;
      }

      // If authenticated and we have user data
      if (!isLoading && isAuthenticated && user) {
        // Check role permissions
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          // Redirect to appropriate dashboard based on role
          if (user.role === "SCHOOL_ADMIN") {
            router.replace("/dashboard");
          } else if (user.role === "TEACHER") {
            router.replace("/teacher/dashboard");
          } else {
            router.replace("/student/dashboard");
          }
          return;
        }
        // All good, allow access
        setIsChecking(false);
        return;
      }

      // If we have token but no user data yet, try to fetch it
      if (!isLoading && !user && localStorage.getItem("accessToken")) {
        try {
          await fetchUserData();
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          router.replace("/login");
          return;
        }
      }

      // Keep checking while loading
      setIsChecking(isLoading);
    };

    checkAuth();
  }, [isLoading, isAuthenticated, user, router, allowedRoles, fetchUserData]);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Only render children if authenticated and role checks pass
  return isAuthenticated && user && (!allowedRoles || allowedRoles.includes(user.role)) ? (
    <>{children}</>
  ) : null;
}