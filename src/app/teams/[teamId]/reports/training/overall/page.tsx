import { TeamShell } from "@/components/team-shell";
import { getOverallStats } from "@/lib/stats";
import { getTeamForPage } from "@/lib/team-page";

export default async function ReportsTrainingOverallPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const stats = await getOverallStats(teamId);

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="reports"
      reportsMode="training"
      trainingTab="overall"
    >
      <dl className="space-y-3 text-sm">
        <StatRow label="Total actual sessions" value={String(stats.sessionCount)} />
        <StatRow
          label="Average players attended per session"
          value={stats.sessionCount > 0 ? String(stats.avgAttendedPerSession) : "—"}
        />
        <StatRow
          label="Overall attendance rate"
          value={stats.sessionCount > 0 ? `${stats.overallRatePct}%` : "—"}
          hint="Yes ÷ all player slots across sessions"
        />
        <StatRow label="Total Yes" value={String(stats.totalYes)} />
        <StatRow label="Total No" value={String(stats.totalNo)} />
        <StatRow
          label="Total Not communicated"
          value={String(stats.totalNotCommunicated)}
        />
      </dl>
    </TeamShell>
  );
}

function StatRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
      <dt className="text-xs text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-lg font-bold text-[var(--color-primary)]">{value}</dd>
      {hint ? (
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{hint}</p>
      ) : null}
    </div>
  );
}
