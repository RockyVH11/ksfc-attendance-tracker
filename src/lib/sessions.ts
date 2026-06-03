import {
  AttendanceStatus,
  SessionKind,
  SessionStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireActiveSeason } from "@/lib/seasons";

export async function getActivePlayers(teamId: string) {
  return prisma.player.findMany({
    where: { teamId, isActive: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export async function getActivePlannedSession(teamId: string) {
  const season = await requireActiveSeason(teamId);
  return prisma.trainingSession.findFirst({
    where: {
      teamId,
      seasonId: season.id,
      kind: SessionKind.PLANNED,
      status: SessionStatus.ACTIVE,
    },
    include: {
      records: {
        include: { player: true },
        orderBy: { player: { lastName: "asc" } },
      },
    },
    orderBy: { sessionDate: "desc" },
  });
}

export async function ensureAttendanceRows(
  sessionId: string,
  teamId: string,
  tx?: Prisma.TransactionClient,
) {
  const db = tx ?? prisma;
  const players = await db.player.findMany({
    where: { teamId, isActive: true },
    select: { id: true },
  });
  for (const p of players) {
    await db.attendanceRecord.upsert({
      where: { sessionId_playerId: { sessionId, playerId: p.id } },
      create: { sessionId, playerId: p.id },
      update: {},
    });
  }
}

export async function createPlannedSession(teamId: string, sessionDate: Date) {
  const season = await requireActiveSeason(teamId);
  const existing = await getActivePlannedSession(teamId);
  if (existing) {
    throw new Error("ACTIVE_PLANNED_EXISTS");
  }
  const session = await prisma.trainingSession.create({
    data: {
      teamId,
      seasonId: season.id,
      sessionDate,
      kind: SessionKind.PLANNED,
      status: SessionStatus.ACTIVE,
    },
  });
  await ensureAttendanceRows(session.id, teamId);
  return session;
}

export async function createActualSession(
  teamId: string,
  sessionDate: Date,
  plannedSessionId?: string | null,
) {
  const season = await requireActiveSeason(teamId);
  const duplicate = await prisma.trainingSession.findFirst({
    where: {
      teamId,
      seasonId: season.id,
      kind: SessionKind.ACTUAL,
      sessionDate,
      status: { not: SessionStatus.DELETED },
    },
  });
  if (duplicate) throw new Error("ACTUAL_EXISTS");

  let copyFrom: { playerId: string; status: AttendanceStatus | null }[] = [];
  if (plannedSessionId) {
    const planned = await prisma.trainingSession.findFirst({
      where: {
        id: plannedSessionId,
        teamId,
        seasonId: season.id,
        kind: SessionKind.PLANNED,
      },
      include: { records: true },
    });
    if (planned) {
      copyFrom = planned.records.map((r) => ({
        playerId: r.playerId,
        status: r.status,
      }));
    }
  }

  const session = await prisma.trainingSession.create({
    data: {
      teamId,
      seasonId: season.id,
      sessionDate,
      kind: SessionKind.ACTUAL,
      status: SessionStatus.ACTIVE,
      plannedSessionId: plannedSessionId ?? null,
    },
  });

  const players = await getActivePlayers(teamId);
  for (const p of players) {
    const copied = copyFrom.find((c) => c.playerId === p.id);
    await prisma.attendanceRecord.create({
      data: {
        sessionId: session.id,
        playerId: p.id,
        status: copied?.status ?? null,
      },
    });
  }

  return session;
}

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  YES: "Yes",
  NO: "No",
  NOT_COMMUNICATED: "Not communicated",
};
