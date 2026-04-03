import DashboardLayout from "@/src/components/admin/layout/layout";
import SchoolBillingPage from "@/src/components/admin/billing/SchoolBillingPage";

export default function AdminBillingRoute() {
  return (
    <DashboardLayout>
      <SchoolBillingPage />
    </DashboardLayout>
  );
}
