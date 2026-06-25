import Link from "next/link";
import { TeamShell } from "@/components/team-shell";
import { getSessionStats } from "@/lib/stats";
import { getTeamForPage } from "@/lib/team-page";

export default async function ReportsTrainingSessionsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const sessions = await getSessionStats(teamId);

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="reports"
      reportsMode="training"
      trainingTab="sessions"
    >
      <h2 className="text-sm font-semibold mb-2">Players attended per session</h2>
      {sessions.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">No actual sessions yet.</p>
      ) : (
        <ul className="space-y-1">
          {sessions.map((s) => (
            <li key={s.sessionId}>
              <Link
                href={`/teams/${teamId}/reports/training/sessions/${s.sessionId}`}
                className="flex items-center justify-between gap-2 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] px-3 py-2"
              >
                <span className="font-medium">{s.dateLabel}</span>
                <span className="text-[var(--color-primary)] font-semibold">
                  {s.attended}
                  <span className="text-[var(--color-text-muted)] font-normal text-xs">
                    {" "}
                    / {s.rosterSize}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[10px] text-[var(--color-text-muted)]">
        Tap a session for player details. Filter by attended, not attended, or not
        communicated.
      </p>
    </TeamShell>
  );
}
