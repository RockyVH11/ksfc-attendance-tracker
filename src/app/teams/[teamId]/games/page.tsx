import Link from "next/link";
import { TeamShell } from "@/components/team-shell";
import { formatGameWhen, listSeasonGames } from "@/lib/games";
import { getTeamForPage } from "@/lib/team-page";
import { GameStatus } from "@prisma/client";

export default async function GamesPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const games = await listSeasonGames(teamId);

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="games"
    >
      <div className="flex gap-2 mb-3">
        <Link
          href={`/teams/${teamId}/games/new`}
          className="flex-1 min-h-10 rounded-md bg-[var(--color-primary)] text-white text-sm font-semibold text-center leading-10"
        >
          + New game
        </Link>
        <Link
          href={`/teams/${teamId}/games/stats`}
          className="min-h-10 px-3 rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-semibold leading-10"
        >
          Season stats
        </Link>
      </div>

      {games.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">No games this season yet.</p>
      ) : (
        <ul className="space-y-1">
          {games.map((g) => (
            <li key={g.id}>
              <Link
                href={`/teams/${teamId}/games/${g.id}`}
                className="block rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              >
                <p className="text-sm font-medium">vs {g.opponent}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatGameWhen(g.gameDate, g.gameTime)} · {g._count.appearances}{" "}
                  playing
                  {g.status === GameStatus.COMPLETED ? " · Final" : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </TeamShell>
  );
}
