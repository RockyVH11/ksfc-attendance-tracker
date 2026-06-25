import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { completeGameAction } from "@/app/actions/games";
import { GameTrackPanel } from "@/components/game-track-panel";
import { TeamShell } from "@/components/team-shell";
import {
  formatGameWhen,
  getGameForTrack,
  getGameLineupCount,
} from "@/lib/games";
import { getTeamForPage } from "@/lib/team-page";
import { GameStatus } from "@prisma/client";

export default async function GameTrackPage({
  params,
}: {
  params: Promise<{ teamId: string; gameId: string }>;
}) {
  const { teamId, gameId } = await params;
  const { team, season } = await getTeamForPage(teamId);

  const lineupCount = await getGameLineupCount(gameId, teamId);
  if (lineupCount === 0) {
    redirect(`/teams/${teamId}/games/${gameId}/roster`);
  }

  const data = await getGameForTrack(gameId, teamId);
  if (!data) notFound();

  const { game, players } = data;

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="games"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-semibold">vs {game.opponent}</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {formatGameWhen(game.gameDate, game.gameTime)}
          </p>
        </div>
        <Link
          href={`/teams/${teamId}/games/${gameId}/roster`}
          className="shrink-0 text-xs text-[var(--color-primary)] underline font-medium"
        >
          Edit roster
        </Link>
      </div>

      <GameTrackPanel
        teamId={teamId}
        gameId={gameId}
        scoreUs={game.scoreUs}
        scoreThem={game.scoreThem}
        players={players}
      />

      <div className="mt-6 space-y-2">
        {game.status !== GameStatus.COMPLETED ? (
          <form action={completeGameAction.bind(null, teamId, gameId)}>
            <button
              type="submit"
              className="w-full min-h-11 rounded-md border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm"
            >
              Mark game complete
            </button>
          </form>
        ) : null}
        <Link
          href={`/teams/${teamId}/games/${gameId}`}
          className="block text-center text-sm text-[var(--color-primary)] underline"
        >
          View game summary
        </Link>
      </div>
    </TeamShell>
  );
}
