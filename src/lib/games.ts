import { prisma } from "@/lib/prisma";
import { formatDateLabel, playerDisplayName } from "@/lib/dates";
import { getActivePlayers } from "@/lib/sessions";
import { requireActiveSeason } from "@/lib/seasons";

export async function listSeasonGames(teamId: string) {
  const season = await requireActiveSeason(teamId);
  return prisma.game.findMany({
    where: { teamId, seasonId: season.id },
    orderBy: [{ gameDate: "desc" }, { gameTime: "desc" }],
    include: {
      _count: { select: { appearances: { where: { isPlaying: true } } } },
    },
  });
}

export async function getGameWithRoster(gameId: string, teamId: string) {
  const game = await prisma.game.findFirst({
    where: { id: gameId, teamId },
    include: {
      appearances: { include: { player: true } },
      season: true,
    },
  });
  if (!game) return null;

  const players = await getActivePlayers(teamId);
  const rows = players.map((p) => {
    const app = game.appearances.find((a) => a.playerId === p.id);
    return {
      player: p,
      appearanceId: app?.id ?? null,
      isPlaying: app?.isPlaying ?? false,
      goals: app?.goals ?? 0,
      assists: app?.assists ?? 0,
      rating: app?.rating ?? null,
      notes: app?.notes ?? "",
    };
  });

  return { game, rows };
}

export async function createGame(
  teamId: string,
  data: {
    gameDate: Date;
    gameTime?: string;
    opponent: string;
  },
) {
  const season = await requireActiveSeason(teamId);
  const game = await prisma.game.create({
    data: {
      teamId,
      seasonId: season.id,
      gameDate: data.gameDate,
      gameTime: data.gameTime?.trim() || null,
      opponent: data.opponent.trim(),
    },
  });

  const players = await getActivePlayers(teamId);
  for (const p of players) {
    await prisma.gameAppearance.create({
      data: { gameId: game.id, playerId: p.id },
    });
  }

  return game;
}

export type PlayerSeasonGameStats = {
  playerId: string;
  name: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  avgRating: number | null;
};

export type SeasonGameStats = {
  gamesPlayed: number;
  totalGoals: number;
  totalAssists: number;
  perPlayer: PlayerSeasonGameStats[];
};

export async function getSeasonGameStats(teamId: string): Promise<SeasonGameStats> {
  const season = await requireActiveSeason(teamId);
  const games = await prisma.game.findMany({
    where: { teamId, seasonId: season.id },
    include: { appearances: { include: { player: true } } },
  });

  const players = await prisma.player.findMany({
    where: { teamId, isActive: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const perPlayer: PlayerSeasonGameStats[] = players.map((p) => {
    let gamesPlayed = 0;
    let goals = 0;
    let assists = 0;
    const ratings: number[] = [];

    for (const g of games) {
      const app = g.appearances.find((a) => a.playerId === p.id);
      if (!app?.isPlaying) continue;
      gamesPlayed++;
      goals += app.goals;
      assists += app.assists;
      if (app.rating != null) ratings.push(app.rating);
    }

    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

    return {
      playerId: p.id,
      name: playerDisplayName(p),
      gamesPlayed,
      goals,
      assists,
      avgRating,
    };
  });

  perPlayer.sort((a, b) => b.goals - a.goals || b.assists - a.assists);

  const totalGoals = perPlayer.reduce((s, p) => s + p.goals, 0);
  const totalAssists = perPlayer.reduce((s, p) => s + p.assists, 0);

  return {
    gamesPlayed: games.length,
    totalGoals,
    totalAssists,
    perPlayer,
  };
}

export function formatGameWhen(gameDate: Date, gameTime: string | null) {
  const date = formatDateLabel(gameDate);
  return gameTime ? `${date} · ${gameTime}` : date;
}

export async function getGameSummary(gameId: string, teamId: string) {
  const game = await prisma.game.findFirst({
    where: { id: gameId, teamId },
    include: {
      appearances: { where: { isPlaying: true }, include: { player: true } },
    },
  });
  if (!game) return null;

  const goals = game.appearances.reduce((s, a) => s + a.goals, 0);
  const assists = game.appearances.reduce((s, a) => s + a.assists, 0);

  return {
    game,
    when: formatGameWhen(game.gameDate, game.gameTime),
    lineupCount: game.appearances.length,
    goals,
    assists,
  };
}
