import { SessionKind, SessionStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import {
  completeActualSessionAction,
  deleteActualSessionAction,
} from "@/app/actions/sessions";
import { AttendanceRow } from "@/components/attendance-row";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { TeamShell } from "@/components/team-shell";
import { formatDateLabel } from "@/lib/dates";
import { getTeamForPage } from "@/lib/team-page";
import { prisma } from "@/lib/prisma";

export default async function ActualSessionPage({
  params,
}: {
  params: Promise<{ teamId: string; sessionId: string }>;
}) {
  const { teamId, sessionId } = await params;
  const { team, season } = await getTeamForPage(teamId);

  const training = await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      teamId,
      kind: SessionKind.ACTUAL,
      status: { not: SessionStatus.DELETED },
    },
    include: {
      records: {
        include: { player: true },
        orderBy: { player: { lastName: "asc" } },
      },
    },
  });
  if (!training) notFound();

  return (
    <TeamShell teamId={teamId} teamName={team.name} seasonLabel={season.label} active="actual">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-sm">Actual attendance</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {formatDateLabel(training.sessionDate)}
          </p>
        </div>
        <ConfirmDeleteButton
          action={deleteActualSessionAction.bind(null, teamId, sessionId)}
          confirmMessage={`Delete training session on ${formatDateLabel(training.sessionDate)}? Attendance from this session will be removed from season reports.`}
        />
      </div>
      <ul className="space-y-1">
        {training.records
          .filter((r) => r.player.isActive)
          .map((r) => (
            <AttendanceRow
              key={r.id}
              teamId={teamId}
              sessionId={training.id}
              player={r.player}
              status={r.status}
            />
          ))}
      </ul>
      <form
        action={completeActualSessionAction.bind(null, teamId, sessionId)}
        className="mt-8"
      >
        <button
          type="submit"
          className="w-full min-h-12 rounded-md border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold"
        >
          Mark session complete
        </button>
      </form>
    </TeamShell>
  );
}
