import { createGameAction } from "@/app/actions/games";
import { TeamShell } from "@/components/team-shell";
import { todayDateString } from "@/lib/dates";
import { getTeamForPage } from "@/lib/team-page";

export default async function NewGamePage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const sp = await searchParams;

  return (
    <TeamShell
      teamId={teamId}
      teamName={team.name}
      seasonLabel={season.label}
      active="games"
    >
      <h2 className="text-sm font-semibold mb-3">New game</h2>
      {sp.error ? (
        <p className="text-xs text-[var(--color-danger)] mb-2">Fill in date and opponent.</p>
      ) : null}
      <form action={createGameAction.bind(null, teamId)} className="space-y-3">
        <label className="block text-xs font-medium">
          Date
          <input
            type="date"
            name="gameDate"
            defaultValue={todayDateString()}
            required
            className="mt-1 w-full min-h-10 px-2 rounded border border-[var(--color-border)]"
          />
        </label>
        <label className="block text-xs font-medium">
          Kickoff time (optional)
          <input
            type="text"
            name="gameTime"
            placeholder="6:30 PM"
            className="mt-1 w-full min-h-10 px-2 rounded border border-[var(--color-border)]"
          />
        </label>
        <label className="block text-xs font-medium">
          Opponent
          <input
            name="opponent"
            required
            placeholder="Club name"
            className="mt-1 w-full min-h-10 px-2 rounded border border-[var(--color-border)]"
          />
        </label>
        <button
          type="submit"
          className="w-full min-h-11 rounded-md bg-[var(--color-primary)] text-white font-semibold"
        >
          Create game
        </button>
      </form>
    </TeamShell>
  );
}
