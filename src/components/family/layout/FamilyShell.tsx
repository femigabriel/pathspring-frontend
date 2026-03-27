"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/contexts/AuthContext";
import FamilyHeader from "./FamilyHeader";
import FamilySidebar from "./FamilySidebar";

export default function FamilyShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "PARENT" && user.accountMode && user.accountMode !== "family") {
      router.replace("/parent/dashboard");
    }
  }, [router, user]);

  return (
    <ProtectedRoute allowedRoles={["PARENT"]}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_22%),linear-gradient(180deg,#f0f9ff_0%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_22%),linear-gradient(180deg,#020617_0%,#111827_100%)]">
        <FamilySidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="lg:pl-72">
          <FamilyHeader setSidebarOpen={setSidebarOpen} />
          <main className="px-3 py-5 sm:px-5 lg:px-7">
            <div className="mx-auto max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
