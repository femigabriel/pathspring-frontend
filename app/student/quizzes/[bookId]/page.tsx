import StudentQuizPage from "@/src/components/student/quizzes/StudentQuizPage";

export default async function StudentQuizRoute({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  return <StudentQuizPage bookId={bookId} />;
}
