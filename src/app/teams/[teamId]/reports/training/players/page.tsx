import Link from "next/link";
import { TeamShell } from "@/components/team-shell";
import { PlayerStatsTwoColumn } from "@/components/player-stats-two-column";
import { getPlayerStats } from "@/lib/stats";
import { getTeamForPage } from "@/lib/team-page";

export default async function ReportsTrainingPlayersPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const players = await getPlayerStats(teamId);
  const splitAt = Math.ceil(players.length / 2);

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="reports"
      reportsMode="training"
      trainingTab="players"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold">Attendance by player</h2>
        {players.length > 0 ? (
          <Link
            href={`/teams/${teamId}/reports/training/players/chart`}
            className="shrink-0 min-h-9 px-3 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold leading-9"
          >
            Graph
          </Link>
        ) : null}
      </div>

      <p className="text-[10px] text-[var(--color-text-muted)] mb-2">
        <span className="text-[var(--color-success)] font-medium">&gt;80%</span>
        {" · "}
        <span className="text-[var(--color-warning)] font-medium">50–79%</span>
        {" · "}
        <span className="text-[var(--color-danger)] font-medium">&lt;50%</span>
        {players.length > 0 ? (
          <>
            {" · "}
            Col 1: top {splitAt} · Col 2: rest
          </>
        ) : null}
      </p>

      <PlayerStatsTwoColumn players={players} />

      <p className="mt-3 text-[10px] text-[var(--color-text-muted)]">
        Sorted highest to lowest. Tap <strong>Graph</strong> for a full-page chart.
      </p>
    </TeamShell>
  );
}
