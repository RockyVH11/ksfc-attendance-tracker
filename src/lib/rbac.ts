import type { SessionPayload } from "@/lib/auth/types";
import { isStaffRole } from "@/lib/auth/types";
import { prisma } from "@/lib/prisma";

export async function getAccessibleTeamIds(
  session: SessionPayload,
): Promise<string[]> {
  if (session.role === "ADMIN") {
    const teams = await prisma.team.findMany({ select: { id: true } });
    return teams.map((t) => t.id);
  }
  if (!isStaffRole(session.role)) return [];
  const rows = await prisma.userTeamAccess.findMany({
    where: { userId: session.userId },
    select: { teamId: true },
  });
  return rows.map((r) => r.teamId);
}

export async function canAccessTeam(
  session: SessionPayload,
  teamId: string,
): Promise<boolean> {
  const ids = await getAccessibleTeamIds(session);
  return ids.includes(teamId);
}

export async function requireTeamAccess(
  session: SessionPayload,
  teamId: string,
): Promise<void> {
  if (!(await canAccessTeam(session, teamId))) {
    throw new Error("FORBIDDEN");
  }
}
