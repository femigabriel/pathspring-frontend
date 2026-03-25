import ParentChildOverviewPage from "@/src/components/parent/children/ParentChildOverviewPage";

export default async function ParentChildOverviewRoute({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;

  return <ParentChildOverviewPage childId={childId} />;
}
