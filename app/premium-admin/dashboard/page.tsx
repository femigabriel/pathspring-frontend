import { Suspense } from "react";
import PremiumAdminDashboard from "@/src/components/premium-admin/PremiumAdminDashboard";

export default function PremiumAdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <PremiumAdminDashboard />
    </Suspense>
  );
}
