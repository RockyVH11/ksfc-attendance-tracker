import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteActualSessionAction } from "@/app/actions/sessions";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { SessionDetailView } from "@/components/session-detail-view";
import { TeamShell } from "@/components/team-shell";
import { getSessionDetail } from "@/lib/stats";
import { getTeamForPage } from "@/lib/team-page";

export default async function ReportsTrainingSessionDetailPage({
  params,
}: {
  params: Promise<{ teamId: string; sessionId: string }>;
}) {
  const { teamId, sessionId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const detail = await getSessionDetail(teamId, sessionId);
  if (!detail) notFound();

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="reports"
      reportsMode="training"
      trainingTab="sessions"
    >
      <Link
        href={`/teams/${teamId}/reports/training/sessions`}
        className="inline-block text-sm text-[var(--color-primary)] font-medium underline mb-3"
      >
        ← Back to sessions
      </Link>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h2 className="text-sm font-semibold">{detail.dateLabel}</h2>
        <ConfirmDeleteButton
          action={deleteActualSessionAction.bind(null, teamId, sessionId)}
          confirmMessage={`Delete training session on ${detail.dateLabel}? Attendance from this session will be removed from season reports.`}
        />
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Roster size: {detail.rosterSize}
      </p>
      <SessionDetailView detail={detail} />
    </TeamShell>
  );
}
