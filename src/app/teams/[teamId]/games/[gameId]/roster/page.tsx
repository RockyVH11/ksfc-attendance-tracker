import Link from "next/link";
import { notFound } from "next/navigation";
import { GameRosterPicker } from "@/components/game-roster-picker";
import { TeamShell } from "@/components/team-shell";
import { formatGameWhen, getGameWithRoster } from "@/lib/games";
import { getTeamForPage } from "@/lib/team-page";

export default async function GameRosterPage({
  params,
}: {
  params: Promise<{ teamId: string; gameId: string }>;
}) {
  const { teamId, gameId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const data = await getGameWithRoster(gameId, teamId);
  if (!data) notFound();

  const { game, rows } = data;

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="games"
    >
      <Link
        href={`/teams/${teamId}/games`}
        className="inline-block text-sm text-[var(--color-primary)] underline mb-2"
      >
        ← Games
      </Link>
      <h2 className="text-sm font-semibold">Game roster</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        vs {game.opponent} · {formatGameWhen(game.gameDate, game.gameTime)}
      </p>
      <GameRosterPicker
        teamId={teamId}
        gameId={gameId}
        rows={rows.map((r) => ({
          playerId: r.player.id,
          firstName: r.player.firstName,
          lastName: r.player.lastName,
          isPlaying: r.isPlaying,
        }))}
      />
      <p className="mt-3 text-center">
        <Link
          href={`/teams/${teamId}/games/${gameId}/track`}
          className="text-xs text-[var(--color-text-muted)] underline"
        >
          Skip to track (uses saved lineup)
        </Link>
      </p>
    </TeamShell>
  );
}
