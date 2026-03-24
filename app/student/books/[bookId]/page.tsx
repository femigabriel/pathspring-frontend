import StudentBookReaderPage from "@/src/components/student/books/StudentBookReaderPage";

export default async function StudentBookReaderRoute({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  return <StudentBookReaderPage bookId={bookId} />;
}
