"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaffSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { requireTeamAccess } from "@/lib/rbac";
import { ensureAttendanceRows, getActivePlannedSession } from "@/lib/sessions";

const playerSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
});

export async function addPlayerAction(teamId: string, formData: FormData) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const parsed = playerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });
  if (!parsed.success) return;

  await prisma.player.create({
    data: {
      teamId,
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
    },
  });

  const planned = await getActivePlannedSession(teamId);
  if (planned) await ensureAttendanceRows(planned.id, teamId);

  revalidatePath(`/teams/${teamId}/players`);
  revalidatePath(`/teams/${teamId}/planned`);
}

export async function setPlayerActiveAction(
  teamId: string,
  playerId: string,
  isActive: boolean,
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.player.updateMany({
    where: { id: playerId, teamId },
    data: { isActive },
  });

  revalidatePath(`/teams/${teamId}/players`);
  revalidatePath(`/teams/${teamId}/planned`);
  revalidatePath(`/teams/${teamId}/stats`);
}
