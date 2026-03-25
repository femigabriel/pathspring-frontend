"use client";

import { useState } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import ParentHeader from "./ParentHeader";
import ParentSidebar from "./ParentSidebar";

export default function ParentShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["PARENT"]}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_22%),linear-gradient(180deg,#fffaf7_0%,#fff7ed_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_22%),linear-gradient(180deg,#020617_0%,#111827_100%)]">
        <ParentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="lg:pl-72">
          <ParentHeader setSidebarOpen={setSidebarOpen} />
          <main className="px-3 py-5 sm:px-5 lg:px-7">
            <div className="mx-auto max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
