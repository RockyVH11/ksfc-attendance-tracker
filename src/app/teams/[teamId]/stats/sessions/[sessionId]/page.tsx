import Link from "next/link";
import { notFound } from "next/navigation";
import { SessionDetailView } from "@/components/session-detail-view";
import { TeamShell } from "@/components/team-shell";
import { getSessionDetail } from "@/lib/stats";
import { getTeamForPage } from "@/lib/team-page";

export default async function StatsSessionDetailPage({
  params,
}: {
  params: Promise<{ teamId: string; sessionId: string }>;
}) {
  const { teamId, sessionId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const detail = await getSessionDetail(teamId, sessionId);
  if (!detail) notFound();

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="stats"
      statsTab="sessions"
    >
      <Link
        href={`/teams/${teamId}/stats/sessions`}
        className="inline-block text-sm text-[var(--color-primary)] font-medium underline mb-3"
      >
        ← Back to sessions
      </Link>
      <h2 className="text-sm font-semibold mb-1">{detail.dateLabel}</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Roster size: {detail.rosterSize}
      </p>
      <SessionDetailView detail={detail} />
    </TeamShell>
  );
}
