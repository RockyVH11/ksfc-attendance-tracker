import Link from "next/link";
import { notFound } from "next/navigation";
import { completeGameAction, deleteGameAction } from "@/app/actions/games";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { TeamShell } from "@/components/team-shell";
import { formatGameScore, getGameStatSummary } from "@/lib/games";
import { getTeamForPage } from "@/lib/team-page";
import { GameStatus } from "@prisma/client";

export default async function GameSummaryPage({
  params,
}: {
  params: Promise<{ teamId: string; gameId: string }>;
}) {
  const { teamId, gameId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const summary = await getGameStatSummary(gameId, teamId);
  if (!summary) notFound();

  const { game, when, players, lineupCount } = summary;

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="games"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">vs {game.opponent}</h2>
          <p className="text-xs text-[var(--color-text-muted)]">{when}</p>
          <p className="text-2xl font-bold text-[var(--color-primary)] mt-2">
            {formatGameScore(game.scoreUs, game.scoreThem)}
          </p>
        </div>
        <ConfirmDeleteButton
          action={deleteGameAction.bind(null, teamId, gameId)}
          confirmMessage={`Delete game vs ${game.opponent}? Scores and player stats from this game will be removed from season reports.`}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <Link
          href={`/teams/${teamId}/games/${gameId}/track`}
          className="flex-1 min-h-10 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold text-center leading-10"
        >
          Track / edit
        </Link>
        <Link
          href={`/teams/${teamId}/games/${gameId}/roster`}
          className="min-h-10 px-3 rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-semibold leading-10"
        >
          Roster
        </Link>
      </div>

      <h3 className="text-xs font-semibold mb-2">
        Player stats ({players.length} with recorded stats · {lineupCount} in lineup)
      </h3>
      {players.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          No player stats recorded yet. Open Track to add goals, assists, cards.
        </p>
      ) : (
        <ul className="space-y-2">
          {players.map((p) => (
            <li
              key={p.playerId}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            >
              <Link
                href={`/teams/${teamId}/reports/players/${p.playerId}`}
                className="font-semibold text-[var(--color-primary)] underline underline-offset-2"
              >
                {p.name}
              </Link>
              <p className="text-xs text-[var(--color-text-muted)]">
                {[
                  p.goals > 0 ? `${p.goals} G` : null,
                  p.assists > 0 ? `${p.assists} A` : null,
                  p.yellowCards > 0 ? `${p.yellowCards} YC` : null,
                  p.redCards > 0 ? `${p.redCards} RC` : null,
                  p.rating != null ? `${p.rating}★` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {game.status !== GameStatus.COMPLETED ? (
        <form action={completeGameAction.bind(null, teamId, gameId)} className="mt-6">
          <button
            type="submit"
            className="w-full min-h-11 rounded-md border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm"
          >
            Mark game complete
          </button>
        </form>
      ) : (
        <p className="mt-4 text-xs text-[var(--color-success)] font-medium">Game final</p>
      )}

      <p className="mt-4">
        <Link href={`/teams/${teamId}/games`} className="text-sm text-[var(--color-primary)] underline">
          ← Games list
        </Link>
      </p>
    </TeamShell>
  );
}
