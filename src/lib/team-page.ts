import { notFound } from "next/navigation";
import { requireStaffSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { requireTeamAccess } from "@/lib/rbac";
import { ensureActiveSeason } from "@/lib/seasons";

export async function getTeamForPage(teamId: string) {
  const session = await requireStaffSession();
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  try {
    await requireTeamAccess(session, teamId);
  } catch {
    notFound();
  }
  const season = await ensureActiveSeason(teamId);
  return { session, team, season };
}
