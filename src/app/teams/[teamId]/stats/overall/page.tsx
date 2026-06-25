import { redirect } from "next/navigation";

export default async function StatsOverallRedirect({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  redirect(`/teams/${teamId}/reports/training/overall`);
}
