import StoryBookPage from "@/src/components/admin/story-book/StoryBookPage";
import DashboardLayout from "@/src/components/admin/layout/layout";

export default function AdminStoryBookRoute() {
  return (
    <DashboardLayout>
      <StoryBookPage />
    </DashboardLayout>
  );
}
