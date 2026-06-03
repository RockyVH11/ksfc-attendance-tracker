import Link from "next/link";
import { TeamShell } from "@/components/team-shell";
import { getSeasonGameStats } from "@/lib/games";
import { getTeamForPage } from "@/lib/team-page";

export default async function GameSeasonStatsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const stats = await getSeasonGameStats(teamId);

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="games"
    >
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="rounded-md border border-[var(--color-border)] p-2">
          <p className="text-[10px] text-[var(--color-text-muted)]">Games</p>
          <p className="text-lg font-bold text-[var(--color-primary)]">
            {stats.gamesPlayed}
          </p>
        </div>
        <div className="rounded-md border border-[var(--color-border)] p-2">
          <p className="text-[10px] text-[var(--color-text-muted)]">Goals</p>
          <p className="text-lg font-bold text-[var(--color-primary)]">
            {stats.totalGoals}
          </p>
        </div>
        <div className="rounded-md border border-[var(--color-border)] p-2">
          <p className="text-[10px] text-[var(--color-text-muted)]">Assists</p>
          <p className="text-lg font-bold text-[var(--color-primary)]">
            {stats.totalAssists}
          </p>
        </div>
      </div>

      <h2 className="text-sm font-semibold mb-2">Player season totals</h2>
      {stats.perPlayer.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">No game data yet.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {stats.perPlayer.map((p) => (
            <li
              key={p.playerId}
              className="flex gap-2 border-b border-[var(--color-border)] py-1.5"
            >
              <span className="flex-1 truncate font-medium">{p.name}</span>
              <span className="text-xs shrink-0 w-8 text-center">{p.gamesPlayed}gp</span>
              <span className="text-xs shrink-0 w-6 text-center">{p.goals}G</span>
              <span className="text-xs shrink-0 w-6 text-center">{p.assists}A</span>
              <span className="text-xs shrink-0 w-8 text-right">
                {p.avgRating != null ? `${p.avgRating}★` : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4">
        <Link href={`/teams/${teamId}/games`} className="text-sm text-[var(--color-primary)] underline">
          ← Games list
        </Link>
      </p>
    </TeamShell>
  );
}
