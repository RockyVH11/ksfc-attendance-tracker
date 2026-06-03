import Link from "next/link";
import { logoutAction, requireStaffSession } from "@/app/actions/auth";
import { APP_NAME } from "@/lib/constants";
import { getAccessibleTeamIds } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export default async function TeamsPage() {
  const session = await requireStaffSession();
  const teamIds = await getAccessibleTeamIds(session);
  const teams = await prisma.team.findMany({
    where: { id: { in: teamIds } },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { players: { where: { isActive: true } } } },
    },
  });

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-[var(--color-primary)] text-white px-4 py-4">
        <p className="text-xs opacity-80">{APP_NAME}</p>
        <h1 className="text-xl font-semibold">Your teams</h1>
        <p className="text-sm opacity-90 mt-1">Signed in as {session.name}</p>
      </header>
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-3">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.id}/planned`}
            className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm hover:border-[var(--color-primary)]"
          >
            <p className="font-semibold text-[var(--color-primary)]">{team.name}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {team._count.players} active players
            </p>
          </Link>
        ))}
      </main>
      <footer className="p-4 text-center">
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-[var(--color-text-muted)] underline">
            Sign out
          </button>
        </form>
      </footer>
    </div>
  );
}
