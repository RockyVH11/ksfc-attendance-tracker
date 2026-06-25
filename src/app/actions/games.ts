"use server";

import { GameStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaffSession } from "@/app/actions/auth";
import { parseDateString } from "@/lib/dates";
import { createGame } from "@/lib/games";
import { prisma } from "@/lib/prisma";
import { requireTeamAccess } from "@/lib/rbac";

function gamePaths(teamId: string, gameId?: string) {
  const paths = [
    `/teams/${teamId}/games`,
    `/teams/${teamId}/games/stats`,
  ];
  if (gameId) paths.push(`/teams/${teamId}/games/${gameId}`);
  return paths;
}

const newGameSchema = z.object({
  gameDate: z.string().min(1),
  gameTime: z.string().optional(),
  opponent: z.string().min(1).max(120),
  scoreUs: z.coerce.number().int().min(0).optional(),
  scoreThem: z.coerce.number().int().min(0).optional(),
});

export async function createGameAction(teamId: string, formData: FormData) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const parsed = newGameSchema.safeParse({
    gameDate: formData.get("gameDate"),
    gameTime: formData.get("gameTime"),
    opponent: formData.get("opponent"),
    scoreUs: formData.get("scoreUs"),
    scoreThem: formData.get("scoreThem"),
  });
  if (!parsed.success) redirect(`/teams/${teamId}/games/new?error=invalid`);

  const game = await createGame(teamId, {
    gameDate: parseDateString(parsed.data.gameDate),
    gameTime: parsed.data.gameTime,
    opponent: parsed.data.opponent,
    scoreUs: parsed.data.scoreUs ?? 0,
    scoreThem: parsed.data.scoreThem ?? 0,
  });

  redirect(`/teams/${teamId}/games/${game.id}`);
}

export async function updateGameScoreAction(
  teamId: string,
  gameId: string,
  formData: FormData,
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const scoreUs = Math.max(0, Number(formData.get("scoreUs")) || 0);
  const scoreThem = Math.max(0, Number(formData.get("scoreThem")) || 0);

  await prisma.game.updateMany({
    where: { id: gameId, teamId },
    data: { scoreUs, scoreThem },
  });

  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
}

export async function updateGameNotesAction(teamId: string, gameId: string, formData: FormData) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.game.updateMany({
    where: { id: gameId, teamId },
    data: {
      teamNotes: String(formData.get("teamNotes") ?? "").trim() || null,
      opponentNotes: String(formData.get("opponentNotes") ?? "").trim() || null,
    },
  });

  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
}

export async function togglePlayingAction(
  teamId: string,
  gameId: string,
  playerId: string,
  isPlaying: boolean,
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.gameAppearance.updateMany({
    where: { gameId, playerId, game: { teamId } },
    data: { isPlaying },
  });

  revalidatePath(`/teams/${teamId}/games/${gameId}`);
  revalidatePath(`/teams/${teamId}/games/stats`);
}

export async function updateAppearanceAction(
  teamId: string,
  gameId: string,
  playerId: string,
  formData: FormData,
) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  const goals = Math.max(0, Number(formData.get("goals")) || 0);
  const assists = Math.max(0, Number(formData.get("assists")) || 0);
  const yellowCards = Math.max(0, Number(formData.get("yellowCards")) || 0);
  const redCards = Math.max(0, Number(formData.get("redCards")) || 0);
  const ratingRaw = formData.get("rating");
  const rating =
    ratingRaw && String(ratingRaw).length > 0
      ? Math.min(5, Math.max(1, Number(ratingRaw)))
      : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.gameAppearance.updateMany({
    where: { gameId, playerId, game: { teamId } },
    data: { goals, assists, yellowCards, redCards, rating, notes },
  });

  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
}

export async function completeGameAction(teamId: string, gameId: string) {
  const session = await requireStaffSession();
  await requireTeamAccess(session, teamId);

  await prisma.game.updateMany({
    where: { id: gameId, teamId },
    data: { status: GameStatus.COMPLETED },
  });

  for (const p of gamePaths(teamId, gameId)) revalidatePath(p);
  redirect(`/teams/${teamId}/games`);
}
