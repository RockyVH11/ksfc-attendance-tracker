import Link from "next/link";
import { SessionKind, SessionStatus } from "@prisma/client";
import { TeamShell } from "@/components/team-shell";
import { formatDateLabel } from "@/lib/dates";
import { getTeamForPage } from "@/lib/team-page";
import { prisma } from "@/lib/prisma";
import { requireActiveSeason } from "@/lib/seasons";

export default async function ActualListPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const activeSeason = await requireActiveSeason(teamId);

  const sessions = await prisma.trainingSession.findMany({
    where: {
      teamId,
      seasonId: activeSeason.id,
      kind: SessionKind.ACTUAL,
      status: { in: [SessionStatus.ACTIVE, SessionStatus.COMPLETED] },
    },
    orderBy: { sessionDate: "desc" },
  });

  return (
    <TeamShell teamId={teamId} teamName={team.name} seasonLabel={season.label} active="actual">
      <Link
        href={`/teams/${teamId}/actual/new`}
        className="block mb-4 min-h-12 rounded-md bg-[var(--color-primary)] text-white font-semibold text-center leading-[3rem]"
      >
        + New actual session
      </Link>

      {sessions.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No actual sessions yet.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/teams/${teamId}/actual/${s.id}`}
                className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <span className="font-medium">{formatDateLabel(s.sessionDate)}</span>
                <span className="ml-2 text-xs uppercase text-[var(--color-text-muted)]">
                  {s.status === SessionStatus.COMPLETED ? "Done" : "In progress"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </TeamShell>
  );
}
