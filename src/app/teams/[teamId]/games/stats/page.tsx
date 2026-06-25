import { redirect } from "next/navigation";

export default async function GameSeasonStatsRedirect({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  redirect(`/teams/${teamId}/reports/games`);
}
