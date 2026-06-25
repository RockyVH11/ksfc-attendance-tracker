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
      yellowCards: app?.yellowCards ?? 0,
      redCards: app?.redCards ?? 0,
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
    scoreUs?: number;
    scoreThem?: number;
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
      scoreUs: data.scoreUs ?? 0,
      scoreThem: data.scoreThem ?? 0,
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
  yellowCards: number;
  redCards: number;
  avgRating: number | null;
};

export type SeasonGameStats = {
  gamesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  totalAssists: number;
  totalYellowCards: number;
  totalRedCards: number;
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

  const goalsFor = games.reduce((s, g) => s + g.scoreUs, 0);
  const goalsAgainst = games.reduce((s, g) => s + g.scoreThem, 0);

  let totalAssists = 0;
  let totalYellowCards = 0;
  let totalRedCards = 0;

  const perPlayer: PlayerSeasonGameStats[] = players.map((p) => {
    let gamesPlayed = 0;
    let goals = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;
    const ratings: number[] = [];

    for (const g of games) {
      const app = g.appearances.find((a) => a.playerId === p.id);
      if (!app?.isPlaying) continue;
      gamesPlayed++;
      goals += app.goals;
      assists += app.assists;
      yellowCards += app.yellowCards;
      redCards += app.redCards;
      if (app.rating != null) ratings.push(app.rating);
    }

    totalAssists += assists;
    totalYellowCards += yellowCards;
    totalRedCards += redCards;

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
      yellowCards,
      redCards,
      avgRating,
    };
  });

  perPlayer.sort((a, b) => b.gamesPlayed - a.gamesPlayed || b.goals - a.goals);

  return {
    gamesPlayed: games.length,
    goalsFor,
    goalsAgainst,
    totalAssists,
    totalYellowCards,
    totalRedCards,
    perPlayer,
  };
}

export function formatGameWhen(gameDate: Date, gameTime: string | null) {
  const date = formatDateLabel(gameDate);
  return gameTime ? `${date} · ${gameTime}` : date;
}

export function formatGameScore(scoreUs: number, scoreThem: number) {
  return `${scoreUs}–${scoreThem}`;
}
