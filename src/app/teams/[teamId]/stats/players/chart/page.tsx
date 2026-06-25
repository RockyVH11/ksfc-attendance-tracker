import Link from "next/link";
import { PlayerAttendanceChart } from "@/components/player-attendance-chart";
import { TeamShell } from "@/components/team-shell";
import { getPlayerStats } from "@/lib/stats";
import { getTeamForPage } from "@/lib/team-page";

export default async function StatsPlayersChartPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const players = await getPlayerStats(teamId);

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="stats"
      statsTab="players"
    >
      <Link
        href={`/teams/${teamId}/stats/players`}
        className="inline-block text-sm text-[var(--color-primary)] font-medium underline mb-3"
      >
        ← Back to list
      </Link>
      <h2 className="text-base font-semibold mb-1">Attendance graph</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        {season.label} · {players.length} players
      </p>
      <PlayerAttendanceChart players={players} variant="full" />
    </TeamShell>
  );
}
