import { redirect } from "next/navigation";

export default async function StatsIndexPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  redirect(`/teams/${teamId}/stats/players`);
}
