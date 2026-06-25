import { redirect } from "next/navigation";

export default async function StatsSessionDetailRedirect({
  params,
}: {
  params: Promise<{ teamId: string; sessionId: string }>;
}) {
  const { teamId, sessionId } = await params;
  redirect(`/teams/${teamId}/reports/training/sessions/${sessionId}`);
}
