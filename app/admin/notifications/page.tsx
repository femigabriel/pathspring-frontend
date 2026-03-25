import DashboardLayout from "@/src/components/admin/layout/layout";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import NotificationsPage from "@/src/components/shared/notifications/NotificationsPage";

export default function AdminNotificationsRoute() {
  return (
    <DashboardLayout>
      <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "TEACHER"]}>
        <NotificationsPage />
      </ProtectedRoute>
    </DashboardLayout>
  );
}
