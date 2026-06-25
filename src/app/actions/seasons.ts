"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaffSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { requireTeamAccess } from "@/lib/rbac";
import { archiveSeasonAndStartNew } from "@/lib/seasons";

const archiveSchema = z.object({
  newSeasonLabel: z.string().min(2).max(80),
  confirm: z.literal("ARCHIVE"),
});

export async function archiveSeasonAction(teamId: string, formData: FormData) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const parsed = archiveSchema.safeParse({
    newSeasonLabel: formData.get("newSeasonLabel"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    redirect(`/teams/${teamId}/season?error=invalid`);
  }

  try {
    await archiveSeasonAndStartNew(teamId, parsed.data.newSeasonLabel);
  } catch (e) {
    if (e instanceof Error && e.message === "LABEL_REQUIRED") {
      redirect(`/teams/${teamId}/season?error=label`);
    }
    throw e;
  }

  const paths = [
    `/teams/${teamId}`,
    `/teams/${teamId}/planned`,
    `/teams/${teamId}/actual`,
    `/teams/${teamId}/games`,
    `/teams/${teamId}/reports/training/players`,
    `/teams/${teamId}/reports/games`,
    `/teams/${teamId}/season`,
  ];
  for (const p of paths) revalidatePath(p, "layout");
  redirect(`/teams/${teamId}/season?archived=1`);
}

export async function getSeasonArchiveSummary(teamId: string, seasonId: string) {
  const [sessions, games] = await Promise.all([
    prisma.trainingSession.count({ where: { teamId, seasonId } }),
    prisma.game.count({ where: { teamId, seasonId } }),
  ]);
  return { sessions, games };
}
