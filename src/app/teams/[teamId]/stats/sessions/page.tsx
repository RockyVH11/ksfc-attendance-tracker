import { redirect } from "next/navigation";

export default async function StatsSessionsRedirect({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  redirect(`/teams/${teamId}/reports/training/sessions`);
}
