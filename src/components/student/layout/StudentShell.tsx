"use client";

import { useState } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import StudentHeader from "./StudentHeader";
import StudentSidebar from "./StudentSidebar";

export default function StudentShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]} unauthenticatedRedirect="/student/login">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_22%),linear-gradient(180deg,#f8fffb_0%,#eefbf7_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_22%),linear-gradient(180deg,#020617_0%,#0b1120_100%)]">
        <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="lg:pl-72">
          <StudentHeader setSidebarOpen={setSidebarOpen} />
          <main className="px-3 py-5 sm:px-5 lg:px-7">
            <div className="mx-auto max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
