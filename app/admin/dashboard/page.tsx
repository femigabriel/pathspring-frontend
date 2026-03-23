import AdminDashboard from "@/src/components/admin/dashboard/Dashboard";
import DashboardLayout from "@/src/components/admin/layout/layout";

export default function Home() {
  return (
    <DashboardLayout>
      <AdminDashboard />
    </DashboardLayout>
  );
}


