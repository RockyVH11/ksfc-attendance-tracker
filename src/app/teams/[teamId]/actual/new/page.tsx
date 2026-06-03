import { createActualSessionAction } from "@/app/actions/sessions";
import { TeamShell } from "@/components/team-shell";
import { todayDateString } from "@/lib/dates";
import { getTeamForPage } from "@/lib/team-page";
import { getActivePlannedSession } from "@/lib/sessions";

export default async function NewActualPage({
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
    <TeamShell teamId={teamId} teamName={team.name} seasonLabel={season.label} active="actual">
      <h2 className="font-semibold text-lg mb-4">New actual session</h2>
      {sp.error === "exists" ? (
        <p className="text-sm text-[var(--color-danger)] mb-4">
          An actual session already exists for that date.
        </p>
      ) : null}
      <form action={createActualSessionAction.bind(null, teamId)} className="space-y-4">
        <label className="block text-sm font-medium">
          Session date
          <input
            type="date"
            name="sessionDate"
            defaultValue={todayDateString()}
            required
            className="mt-1 w-full min-h-11 px-3 rounded-md border border-[var(--color-border)]"
          />
        </label>
        {planned ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="copyFromPlanned" defaultChecked />
            Start from planned session ({planned.sessionDate.toISOString().slice(0, 10)})
          </label>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            No active planned session — attendance will start blank.
          </p>
        )}
        <button
          type="submit"
          className="w-full min-h-12 rounded-md bg-[var(--color-primary)] text-white font-semibold"
        >
          Create & mark attendance
        </button>
      </form>
    </TeamShell>
  );
}
