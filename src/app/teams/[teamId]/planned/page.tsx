import Link from "next/link";
import {
  createPlannedSessionAction,
  deletePlannedSessionAction,
} from "@/app/actions/sessions";
import { AttendanceRow } from "@/components/attendance-row";
import { TeamShell } from "@/components/team-shell";
import { formatDateLabel, todayDateString } from "@/lib/dates";
import { getTeamForPage } from "@/lib/team-page";
import { getActivePlannedSession } from "@/lib/sessions";

export default async function PlannedPage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const planned = await getActivePlannedSession(teamId);
  const sp = await searchParams;

  return (
    <TeamShell teamId={teamId} teamName={team.name} seasonLabel={season.label} active="planned">
      {planned ? (
        <>
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold text-sm">Next practice (planned)</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                {formatDateLabel(planned.sessionDate)}
              </p>
            </div>
            <form action={deletePlannedSessionAction.bind(null, teamId, planned.id)}>
              <button
                type="submit"
                className="text-sm text-[var(--color-danger)] underline"
              >
                Delete
              </button>
            </form>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">
            Y / N / NC next to each name.
          </p>
          <ul className="space-y-1">
            {planned.records
              .filter((r) => r.player.isActive)
              .map((r) => (
                <AttendanceRow
                  key={r.id}
                  teamId={teamId}
                  sessionId={planned.id}
                  player={r.player}
                  status={r.status}
                />
              ))}
          </ul>
          <p className="mt-6 text-sm">
            <Link
              href={`/teams/${teamId}/actual/new`}
              className="text-[var(--color-primary)] font-medium underline"
            >
              Record actual attendance →
            </Link>
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="font-semibold mb-2">No active planned session</h2>
          {sp.error === "exists" ? (
            <p className="text-sm text-[var(--color-danger)] mb-2">
              A planned session is already active.
            </p>
          ) : null}
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Create one for the upcoming practice. Only one planned session is active at a time.
          </p>
          <form action={createPlannedSessionAction.bind(null, teamId)} className="space-y-3">
            <label className="block text-sm font-medium">
              Practice date
              <input
                type="date"
                name="sessionDate"
                defaultValue={todayDateString()}
                className="mt-1 w-full min-h-11 px-3 rounded-md border border-[var(--color-border)]"
              />
            </label>
            <button
              type="submit"
              className="w-full min-h-12 rounded-md bg-[var(--color-primary)] text-white font-semibold"
            >
              Create planned session
            </button>
          </form>
        </div>
      )}
    </TeamShell>
  );
}
