import DashboardLayout from "@/src/components/admin/layout/layout";
import TeachersPage from "@/src/components/admin/teachers/TeachersPage";

export default function Home() {
  return (
    <DashboardLayout>
      <TeachersPage />
    </DashboardLayout>
  );
}


