import Link from "next/link";
import { addPlayerAction, setPlayerActiveAction } from "@/app/actions/players";
import { TeamShell } from "@/components/team-shell";
import { playerDisplayName } from "@/lib/dates";
import { getTeamForPage } from "@/lib/team-page";
import { prisma } from "@/lib/prisma";

export default async function PlayersPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { team, season } = await getTeamForPage(teamId);
  const players = await prisma.player.findMany({
    where: { teamId },
    orderBy: [{ isActive: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <TeamShell teamId={teamId} teamName={team.name} seasonLabel={season.label} active="roster">
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        <Link href={`/teams/${teamId}/season`} className="underline text-[var(--color-primary)]">
          Season & archive
        </Link>
        {" — start fresh after nationals"}
      </p>
      <form
        action={addPlayerAction.bind(null, teamId)}
        className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3"
      >
        <h2 className="font-semibold">Add player</h2>
        <div className="flex gap-2">
          <input
            name="firstName"
            placeholder="First"
            required
            className="flex-1 min-h-11 px-3 rounded-md border border-[var(--color-border)]"
          />
          <input
            name="lastName"
            placeholder="Last"
            required
            className="flex-1 min-h-11 px-3 rounded-md border border-[var(--color-border)]"
          />
        </div>
        <button
          type="submit"
          className="w-full min-h-11 rounded-md bg-[var(--color-primary)] text-white font-medium"
        >
          Add to roster
        </button>
      </form>

      <ul className="space-y-2">
        {players.map((p) => (
          <li
            key={p.id}
            className={`rounded-lg border p-3 flex items-center justify-between gap-2 ${
              p.isActive
                ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                : "border-dashed opacity-60"
            }`}
          >
            <span>{playerDisplayName(p)}</span>
            <form
              action={setPlayerActiveAction.bind(null, teamId, p.id, !p.isActive)}
            >
              <button
                type="submit"
                className="text-sm text-[var(--color-primary)] underline"
              >
                {p.isActive ? "Archive" : "Restore"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </TeamShell>
  );
}
