import Link from "next/link";
import { TeamShell } from "@/components/team-shell";
import { GameSeasonStatsTable } from "@/components/game-season-stats-table";
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
      <h2 className="text-sm font-semibold mb-1">Season game stats</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">{season.label}</p>
      <GameSeasonStatsTable stats={stats} />
      <p className="mt-4">
        <Link
          href={`/teams/${teamId}/games`}
          className="text-sm text-[var(--color-primary)] underline"
        >
          ← Games list
        </Link>
      </p>
    </TeamShell>
  );
}
