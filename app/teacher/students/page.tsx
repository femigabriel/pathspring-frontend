import DashboardLayout from "@/src/components/admin/layout/layout";
import StudentsPage from "@/src/components/admin/students/StudentsPage";

export default function TeacherStudentsPage() {
  return (
    <DashboardLayout>
      <StudentsPage />
    </DashboardLayout>
  );
}
