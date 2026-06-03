import Link from "next/link";
import { archiveSeasonAction, getSeasonArchiveSummary } from "@/app/actions/seasons";
import { TeamShell } from "@/components/team-shell";
import { getTeamForPage } from "@/lib/team-page";
import { listSeasons } from "@/lib/seasons";
import { SeasonStatus } from "@prisma/client";

export default async function SeasonPage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ archived?: string; error?: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const sp = await searchParams;
  const allSeasons = await listSeasons(teamId);
  const archived = allSeasons.filter((s) => s.status === SeasonStatus.ARCHIVED);

  const archivedSummaries = await Promise.all(
    archived.map(async (s) => ({
      season: s,
      ...(await getSeasonArchiveSummary(teamId, s.id)),
    })),
  );

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="season"
    >
      {sp.archived === "1" ? (
        <p className="text-sm text-[var(--color-success)] mb-3">
          New season started. Attendance and games begin fresh; update your roster
          as players leave or join.
        </p>
      ) : null}

      <section className="mb-6 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <h2 className="text-sm font-semibold mb-1">Active season</h2>
        <p className="text-lg font-bold text-[var(--color-primary)]">{season.label}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          All planned/actual sessions and games are tracked in this season only.
        </p>
      </section>

      <section className="mb-6 rounded-md border-2 border-[var(--color-warning)] bg-[var(--color-surface)] p-3">
        <h2 className="text-sm font-semibold text-[var(--color-danger)] mb-2">
          Archive & start fresh
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          Use after nationals or when a new year starts (e.g. 12 players leaving).
          Current season data is kept as read-only history. Roster stays — archive or
          remove players on the Roster tab.
        </p>
        {sp.error ? (
          <p className="text-xs text-[var(--color-danger)] mb-2">
            Check the season name and type ARCHIVE to confirm.
          </p>
        ) : null}
        <form action={archiveSeasonAction.bind(null, teamId)} className="space-y-2">
          <label className="block text-xs font-medium">
            New season name
            <input
              name="newSeasonLabel"
              required
              placeholder="2026-27"
              className="mt-1 w-full min-h-10 px-2 rounded border border-[var(--color-border)] text-sm"
            />
          </label>
          <label className="block text-xs font-medium">
            Type ARCHIVE to confirm
            <input
              name="confirm"
              required
              placeholder="ARCHIVE"
              className="mt-1 w-full min-h-10 px-2 rounded border border-[var(--color-border)] text-sm"
            />
          </label>
          <button
            type="submit"
            className="w-full min-h-11 rounded-md bg-[var(--color-danger)] text-white font-semibold text-sm"
          >
            Archive season & start new
          </button>
        </form>
      </section>

      {archivedSummaries.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold mb-2">Archived seasons</h2>
          <ul className="space-y-2 text-sm">
            {archivedSummaries.map(({ season: archived, sessions, games }) => (
              <li
                key={archived.id}
                className="rounded-md border border-[var(--color-border)] px-3 py-2"
              >
                <p className="font-medium">{archived.label}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {sessions} training sessions · {games} games
                  {archived.archivedAt
                    ? ` · archived ${archived.archivedAt.toLocaleDateString()}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-4 text-xs">
        <Link href={`/teams/${teamId}/players`} className="text-[var(--color-primary)] underline">
          ← Back to roster
        </Link>
      </p>
    </TeamShell>
  );
}
