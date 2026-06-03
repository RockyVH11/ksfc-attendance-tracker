import { SeasonStatus, SessionKind, SessionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getActiveSeason(teamId: string) {
  return prisma.season.findFirst({
    where: { teamId, status: SeasonStatus.ACTIVE },
    orderBy: { startedAt: "desc" },
  });
}

export async function requireActiveSeason(teamId: string) {
  const season = await getActiveSeason(teamId);
  if (!season) {
    throw new Error("NO_ACTIVE_SEASON");
  }
  return season;
}

/** Ensure each team has exactly one active season (post-migrate / seed). */
export async function ensureActiveSeason(teamId: string, label = "Current season") {
  const existing = await getActiveSeason(teamId);
  if (existing) return existing;
  return prisma.season.create({
    data: { teamId, label, status: SeasonStatus.ACTIVE },
  });
}

export async function archiveSeasonAndStartNew(
  teamId: string,
  newSeasonLabel: string,
) {
  const active = await requireActiveSeason(teamId);
  const label = newSeasonLabel.trim();
  if (!label) throw new Error("LABEL_REQUIRED");

  return prisma.$transaction(async (tx) => {
    await tx.season.update({
      where: { id: active.id },
      data: { status: SeasonStatus.ARCHIVED, archivedAt: new Date() },
    });

    const planned = await tx.trainingSession.findFirst({
      where: {
        teamId,
        seasonId: active.id,
        kind: SessionKind.PLANNED,
        status: SessionStatus.ACTIVE,
      },
    });
    if (planned) {
      await tx.trainingSession.update({
        where: { id: planned.id },
        data: { status: SessionStatus.DELETED },
      });
    }

    return tx.season.create({
      data: {
        teamId,
        label,
        status: SeasonStatus.ACTIVE,
      },
    });
  });
}

export async function listSeasons(teamId: string) {
  return prisma.season.findMany({
    where: { teamId },
    orderBy: { startedAt: "desc" },
  });
}
