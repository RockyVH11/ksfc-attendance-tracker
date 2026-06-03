import { PlayerAttendanceChart } from "@/components/player-attendance-chart";
import { TeamShell } from "@/components/team-shell";
import { getPlayerStats } from "@/lib/stats";
import { getTeamForPage } from "@/lib/team-page";

export default async function StatsPlayersPage({
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
      <PlayerAttendanceChart players={players} />

      <ul className="mt-4 space-y-1">
        {players.length === 0 ? (
          <li className="text-xs text-[var(--color-text-muted)]">
            No actual sessions yet.
          </li>
        ) : (
          players.map((p) => (
            <li
              key={p.playerId}
              className="flex items-center gap-2 text-sm border-b border-[var(--color-border)] py-1.5"
            >
              <span className="flex-1 min-w-0 truncate font-medium">{p.name}</span>
              <span className="text-xs text-[var(--color-text-muted)] shrink-0">
                {p.yes}/{p.sessionsHeld}
              </span>
              <span className="w-10 text-right font-semibold text-[var(--color-primary)] shrink-0">
                {p.ratePct}%
              </span>
            </li>
          ))
        )}
      </ul>
      <p className="mt-3 text-[10px] text-[var(--color-text-muted)]">
        Sorted by attendance %. Yes / sessions held. Ratings & notes per session
        coming later on each player record.
      </p>
    </TeamShell>
  );
}
