import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamShell } from "@/components/team-shell";
import { attendanceRateRowClass } from "@/lib/attendance-display";
import { getPlayerFullReport } from "@/lib/stats";
import { getTeamForPage } from "@/lib/team-page";

export default async function PlayerReportPage({
  params,
}: {
  params: Promise<{ teamId: string; playerId: string }>;
}) {
  const { teamId, playerId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const report = await getPlayerFullReport(teamId, playerId);
  if (!report) notFound();

  const { attendance, games } = report;
  const rateClass = attendanceRateRowClass(attendance.ratePct);

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="reports"
      reportsMode="games"
    >
      <Link
        href={`/teams/${teamId}/reports/games`}
        className="inline-block text-sm text-[var(--color-primary)] font-medium underline mb-3"
      >
        ← Season stats
      </Link>

      <h2 className="text-lg font-bold mb-1">{report.name}</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">{season.label}</p>

      <section className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
          Games
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <MetricCard label="GP" value={games.gamesPlayed} />
          <MetricCard label="Goals" value={games.goals} />
          <MetricCard label="Assists" value={games.assists} />
          <MetricCard label="Yellow" value={games.yellowCards} />
          <MetricCard label="Red" value={games.redCards} />
          <MetricCard
            label="Avg rating"
            value={games.avgRating != null ? String(games.avgRating) : "—"}
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
          Training attendance
        </h3>
        <div
          className={`rounded-lg border border-[var(--color-border)] p-4 ${rateClass}`}
        >
          <p className="text-3xl font-bold">{attendance.ratePct}%</p>
          <p className="text-xs mt-1 opacity-90">
            {attendance.yes} yes · {attendance.no} no ·{" "}
            {attendance.notCommunicated} not communicated
          </p>
          <p className="text-[10px] mt-2 opacity-80">
            Across {attendance.sessionsHeld} actual session
            {attendance.sessionsHeld === 1 ? "" : "s"}
          </p>
        </div>
      </section>
    </TeamShell>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-center">
      <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
      <p className="text-xl font-bold text-[var(--color-primary)]">{value}</p>
    </div>
  );
}
