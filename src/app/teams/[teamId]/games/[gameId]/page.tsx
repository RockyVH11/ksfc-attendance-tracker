import { notFound } from "next/navigation";
import {
  completeGameAction,
  updateGameNotesAction,
} from "@/app/actions/games";
import { GamePlayerRow } from "@/components/game-player-row";
import { TeamShell } from "@/components/team-shell";
import { formatGameWhen, getGameWithRoster } from "@/lib/games";
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
        Check Playing, then goals, assists, rating, notes.
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
