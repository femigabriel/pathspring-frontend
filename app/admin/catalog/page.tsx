import SchoolCatalogPage from "@/src/components/admin/catalog/SchoolCatalogPage";
import DashboardLayout from "@/src/components/admin/layout/layout";

export default function AdminCatalogRoute() {
  return (
    <DashboardLayout>
      <SchoolCatalogPage />
    </DashboardLayout>
  );
}
