import { redirect } from "next/navigation";

export default async function StatsPlayersChartRedirect({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  redirect(`/teams/${teamId}/reports/training/players/chart`);
}
