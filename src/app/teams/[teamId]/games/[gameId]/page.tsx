import { notFound } from "next/navigation";
import {
  completeGameAction,
  updateGameNotesAction,
  updateGameScoreAction,
} from "@/app/actions/games";
import { GamePlayerRow } from "@/components/game-player-row";
import { TeamShell } from "@/components/team-shell";
import { formatGameScore, formatGameWhen, getGameWithRoster } from "@/lib/games";
import { getTeamForPage } from "@/lib/team-page";

export default async function GameDetailPage({
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
      <div className="mb-3">
        <h2 className="text-sm font-semibold">vs {game.opponent}</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          {formatGameWhen(game.gameDate, game.gameTime)}
        </p>
      </div>

      <form
        action={updateGameScoreAction.bind(null, teamId, gameId)}
        className="mb-4 rounded-md border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-3"
      >
        <p className="text-xs font-semibold mb-2">Final score (team totals)</p>
        <div className="flex items-end gap-3">
          <label className="text-[10px] font-medium flex-1">
            US
            <input
              name="scoreUs"
              type="number"
              min={0}
              defaultValue={game.scoreUs}
              className="mt-1 w-full min-h-10 px-2 rounded border border-[var(--color-border)] text-lg font-bold text-center"
            />
          </label>
          <span className="pb-2 text-lg font-bold text-[var(--color-text-muted)]">–</span>
          <label className="text-[10px] font-medium flex-1">
            Them
            <input
              name="scoreThem"
              type="number"
              min={0}
              defaultValue={game.scoreThem}
              className="mt-1 w-full min-h-10 px-2 rounded border border-[var(--color-border)] text-lg font-bold text-center"
            />
          </label>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
          Season GF/GA use this score — not the sum of player goals.
        </p>
        <button
          type="submit"
          className="mt-2 w-full min-h-9 rounded bg-[var(--color-primary)] text-white text-xs font-semibold"
        >
          Save score
        </button>
        <p className="mt-2 text-center text-sm font-bold text-[var(--color-primary)]">
          {formatGameScore(game.scoreUs, game.scoreThem)}
        </p>
      </form>

      <form
        action={updateGameNotesAction.bind(null, teamId, gameId)}
        className="mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 space-y-2"
      >
        <label className="block text-[10px] font-medium">
          Team notes
          <textarea
            name="teamNotes"
            rows={2}
            defaultValue={game.teamNotes ?? ""}
            className="mt-0.5 w-full px-2 py-1 rounded border border-[var(--color-border)] text-xs"
          />
        </label>
        <label className="block text-[10px] font-medium">
          Opponent notes
          <textarea
            name="opponentNotes"
            rows={2}
            defaultValue={game.opponentNotes ?? ""}
            className="mt-0.5 w-full px-2 py-1 rounded border border-[var(--color-border)] text-xs"
          />
        </label>
        <button
          type="submit"
          className="w-full min-h-9 rounded bg-[var(--color-primary-muted)] text-white text-xs font-semibold"
        >
          Save notes
        </button>
      </form>

      <p className="text-xs text-[var(--color-text-muted)] mb-2">
        Player G/A/YC/RC are for individual tracking (own goals, guests, etc.).
      </p>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <GamePlayerRow
            key={r.player.id}
            teamId={teamId}
            gameId={gameId}
            player={r.player}
            isPlaying={r.isPlaying}
            goals={r.goals}
            assists={r.assists}
            yellowCards={r.yellowCards}
            redCards={r.redCards}
            rating={r.rating}
            notes={r.notes}
          />
        ))}
      </ul>

      <form action={completeGameAction.bind(null, teamId, gameId)} className="mt-6">
        <button
          type="submit"
          className="w-full min-h-11 rounded-md border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm"
        >
          Mark game complete
        </button>
      </form>
    </TeamShell>
  );
}
