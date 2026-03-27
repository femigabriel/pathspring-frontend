import FamilyChildOverviewPage from "@/src/components/family/children/FamilyChildOverviewPage";

export default async function FamilyChildOverviewRoute({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  return <FamilyChildOverviewPage childId={childId} />;
}
