"use server";

import { GameStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaffSession } from "@/app/actions/auth";
import { parseDateString } from "@/lib/dates";
import { createGame, activeGameWhere } from "@/lib/games";
import { prisma } from "@/lib/prisma";
import { requireTeamAccess } from "@/lib/rbac";

function gamePaths(teamId: string, gameId?: string) {
  const paths = [`/teams/${teamId}/games`, `/teams/${teamId}/reports/games`];
  if (gameId) {
    paths.push(
      `/teams/${teamId}/games/${gameId}`,
      `/teams/${teamId}/games/${gameId}/roster`,
      `/teams/${teamId}/games/${gameId}/track`,
    );
  }
  return paths;
}

const newGameSchema = z.object({
  gameDate: z.string().min(1),
  gameTime: z.string().optional(),
  opponent: z.string().min(1).max(120),
});

export async function createGameAction(teamId: string, formData: FormData) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const parsed = newGameSchema.safeParse({
    gameDate: formData.get("gameDate"),
    gameTime: formData.get("gameTime"),
    opponent: formData.get("opponent"),
  });
  if (!parsed.success) redirect(`/teams/${teamId}/games/new?error=invalid`);

  const game = await createGame(teamId, {
    gameDate: parseDateString(parsed.data.gameDate),
    gameTime: parsed.data.gameTime,
    opponent: parsed.data.opponent,
  });

  redirect(`/teams/${teamId}/games/${game.id}/roster`);
}

export async function saveGameRosterAction(teamId: string, gameId: string, formData: FormData) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const playingIds = formData.getAll("playing").map(String);
  const appearances = await prisma.gameAppearance.findMany({
    where: { gameId, game: { teamId, ...activeGameWhere } },
    select: { id: true, playerId: true },
  });

  for (const app of appearances) {
    await prisma.gameAppearance.update({
      where: { id: app.id },
      data: { isPlaying: playingIds.includes(app.playerId) },
    });
  }

  const next = formData.get("next");
  if (next === "track") {
    redirect(`/teams/${teamId}/games/${gameId}/track`);
  }
  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
}

export async function incrementScoreAction(
  teamId: string,
  gameId: string,
  side: "us" | "them",
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.game.updateMany({
    where: { id: gameId, teamId, ...activeGameWhere },
    data:
      side === "us"
        ? { scoreUs: { increment: 1 } }
        : { scoreThem: { increment: 1 } },
  });

  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
}

export async function decrementScoreAction(
  teamId: string,
  gameId: string,
  side: "us" | "them",
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const game = await prisma.game.findFirst({
    where: { id: gameId, teamId, ...activeGameWhere },
  });
  if (!game) return;

  const field = side === "us" ? "scoreUs" : "scoreThem";
  const current = side === "us" ? game.scoreUs : game.scoreThem;
  if (current <= 0) return;

  await prisma.game.updateMany({
    where: { id: gameId, teamId, ...activeGameWhere },
    data: { [field]: { decrement: 1 } },
  });

  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
}

type PlayerStat = "goals" | "assists" | "yellowCards" | "redCards";

export async function incrementPlayerStatAction(
  teamId: string,
  gameId: string,
  playerId: string,
  stat: PlayerStat,
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.gameAppearance.updateMany({
    where: { gameId, playerId, game: { teamId, ...activeGameWhere }, isPlaying: true },
    data: { [stat]: { increment: 1 } },
  });

  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
  revalidatePath(`/teams/${teamId}/reports/players/${playerId}`);
}

export async function completeGameAction(teamId: string, gameId: string) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.game.updateMany({
    where: { id: gameId, teamId, ...activeGameWhere },
    data: { status: GameStatus.COMPLETED },
  });

  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
  redirect(`/teams/${teamId}/games/${gameId}`);
}

export async function deleteGameAction(teamId: string, gameId: string) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const result = await prisma.game.updateMany({
    where: { id: gameId, teamId, ...activeGameWhere },
    data: { status: GameStatus.DELETED },
  });
  if (result.count === 0) redirect(`/teams/${teamId}/games`);

  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
  revalidatePath(`/teams/${teamId}/reports`, "layout");
  redirect(`/teams/${teamId}/games`);
}
