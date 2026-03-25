import StudentActivityPage from "@/src/components/student/activities/StudentActivityPage";

export default async function StudentActivityRoute({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  return <StudentActivityPage bookId={bookId} />;
}
