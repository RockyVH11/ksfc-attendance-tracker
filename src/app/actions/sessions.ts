"use server";

import { AttendanceStatus, SessionKind, SessionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffSession } from "@/app/actions/auth";
import { parseDateString, todayDateString } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireTeamAccess } from "@/lib/rbac";
import { requireActiveSeason } from "@/lib/seasons";
import {
  createActualSession,
  createPlannedSession,
  getActivePlannedSession,
} from "@/lib/sessions";

function teamPaths(teamId: string) {
  const base = `/teams/${teamId}`;
  return [
    `${base}/planned`,
    `${base}/actual`,
    `${base}/reports/training/players`,
    `${base}/reports/training/sessions`,
    `${base}/reports/training/overall`,
    `${base}/reports/games`,
    `${base}/games`,
    `${base}/season`,
  ];
}

export async function createPlannedSessionAction(
  teamId: string,
  formData: FormData,
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const raw = formData.get("sessionDate");
  const sessionDate = parseDateString(
    raw && String(raw).length > 0 ? String(raw) : todayDateString(),
  );
  try {
    await createPlannedSession(teamId, sessionDate);
  } catch (e) {
    if (e instanceof Error && e.message === "ACTIVE_PLANNED_EXISTS") {
      redirect(`/teams/${teamId}/planned?error=exists`);
    }
    throw e;
  }

  for (const p of teamPaths(teamId)) revalidatePath(p);
  redirect(`/teams/${teamId}/planned`);
}

export async function deletePlannedSessionAction(teamId: string, sessionId: string) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.trainingSession.updateMany({
    where: {
      id: sessionId,
      teamId,
      kind: SessionKind.PLANNED,
    },
    data: { status: SessionStatus.DELETED },
  });

  for (const p of teamPaths(teamId)) revalidatePath(p);
  redirect(`/teams/${teamId}/planned`);
}

export async function updateAttendanceAction(
  teamId: string,
  sessionId: string,
  playerId: string,
  status: AttendanceStatus,
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.attendanceRecord.updateMany({
    where: {
      sessionId,
      playerId,
      session: { teamId },
    },
    data: { status },
  });

  const training = await prisma.trainingSession.findFirst({
    where: { id: sessionId },
    select: { kind: true },
  });
  if (training?.kind === SessionKind.PLANNED) {
    revalidatePath(`/teams/${teamId}/planned`);
  } else {
    revalidatePath(`/teams/${teamId}/actual/${sessionId}`);
    revalidatePath(`/teams/${teamId}/reports/training/players`);
    revalidatePath(`/teams/${teamId}/reports/training/sessions`);
    revalidatePath(`/teams/${teamId}/reports/training/overall`);
  }
}

export async function createActualSessionAction(
  teamId: string,
  formData: FormData,
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const dateStr = String(formData.get("sessionDate") || todayDateString());
  const copyFromPlanned = formData.get("copyFromPlanned") === "on";
  const sessionDate = parseDateString(dateStr);

  let plannedSessionId: string | null = null;
  if (copyFromPlanned) {
    const planned = await getActivePlannedSession(teamId);
    if (planned && planned.sessionDate.getTime() === sessionDate.getTime()) {
      plannedSessionId = planned.id;
    } else {
      const season = await requireActiveSeason(teamId);
      const match = await prisma.trainingSession.findFirst({
        where: {
          teamId,
          seasonId: season.id,
          kind: SessionKind.PLANNED,
          sessionDate,
          status: { not: SessionStatus.DELETED },
        },
      });
      plannedSessionId = match?.id ?? null;
    }
  }

  try {
    const created = await createActualSession(
      teamId,
      sessionDate,
      plannedSessionId,
    );
    revalidatePath(`/teams/${teamId}/actual`);
    revalidatePath(`/teams/${teamId}/reports/training/players`);
    revalidatePath(`/teams/${teamId}/reports/training/sessions`);
    revalidatePath(`/teams/${teamId}/reports/training/overall`);
    redirect(`/teams/${teamId}/actual/${created.id}`);
  } catch (e) {
    if (e instanceof Error && e.message === "ACTUAL_EXISTS") {
      redirect(`/teams/${teamId}/actual/new?error=exists`);
    }
    throw e;
  }
}

export async function deleteActualSessionAction(teamId: string, sessionId: string) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.trainingSession.updateMany({
    where: {
      id: sessionId,
      teamId,
      kind: SessionKind.ACTUAL,
      status: { not: SessionStatus.DELETED },
    },
    data: { status: SessionStatus.DELETED },
  });

  for (const p of teamPaths(teamId)) revalidatePath(p);
  revalidatePath(`/teams/${teamId}/reports`, "layout");
  redirect(`/teams/${teamId}/actual`);
}

export async function completeActualSessionAction(teamId: string, sessionId: string) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.trainingSession.updateMany({
    where: { id: sessionId, teamId, kind: SessionKind.ACTUAL },
    data: { status: SessionStatus.COMPLETED },
  });

  revalidatePath(`/teams/${teamId}/actual`);
  revalidatePath(`/teams/${teamId}/reports/training/players`);
  revalidatePath(`/teams/${teamId}/reports/training/sessions`);
  revalidatePath(`/teams/${teamId}/reports/training/overall`);
  redirect(`/teams/${teamId}/actual`);
}
