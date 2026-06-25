import Link from "next/link";
import { TeamShell } from "@/components/team-shell";
import {
  attendanceRateRowClass,
  attendanceRateTextClass,
} from "@/lib/attendance-display";
import { getPlayerStats } from "@/lib/stats";
import { getTeamForPage } from "@/lib/team-page";

export default async function StatsPlayersPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const players = await getPlayerStats(teamId);

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="stats"
      statsTab="players"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold">Attendance by player</h2>
        {players.length > 0 ? (
          <Link
            href={`/teams/${teamId}/stats/players/chart`}
            className="shrink-0 min-h-9 px-3 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold leading-9"
          >
            Graph
          </Link>
        ) : null}
      </div>

      <p className="text-[10px] text-[var(--color-text-muted)] mb-2">
        <span className="text-[var(--color-success)] font-medium">&gt;80%</span>
        {" · "}
        <span className="text-[var(--color-warning)] font-medium">50–79%</span>
        {" · "}
        <span className="text-[var(--color-danger)] font-medium">&lt;50%</span>
      </p>

      <ul className="space-y-1">
        {players.length === 0 ? (
          <li className="text-xs text-[var(--color-text-muted)]">
            No actual sessions yet.
          </li>
        ) : (
          players.map((p) => (
            <li
              key={p.playerId}
              className={`flex items-center gap-2 text-sm border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md pl-2 pr-2 py-1.5 ${attendanceRateRowClass(p.ratePct)}`}
            >
              <span className="flex-1 min-w-0 truncate font-medium">{p.name}</span>
              <span className="text-xs text-[var(--color-text-muted)] shrink-0">
                {p.yes}/{p.sessionsHeld}
              </span>
              <span
                className={`w-11 text-right font-bold shrink-0 ${attendanceRateTextClass(p.ratePct)}`}
              >
                {p.ratePct}%
              </span>
            </li>
          ))
        )}
      </ul>
      <p className="mt-3 text-[10px] text-[var(--color-text-muted)]">
        Sorted highest to lowest. Tap <strong>Graph</strong> for a full-page chart.
      </p>
    </TeamShell>
  );
}
