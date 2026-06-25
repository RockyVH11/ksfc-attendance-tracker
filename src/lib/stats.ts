import { AttendanceStatus, SessionKind, SessionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDateLabel, playerDisplayName } from "@/lib/dates";
import { requireActiveSeason } from "@/lib/seasons";
import type { PlayerSeasonGameStats } from "@/lib/games";

export type SessionStatRow = {
  sessionId: string;
  dateLabel: string;
  sessionDate: string;
  attended: number;
  yes: number;
  no: number;
  notCommunicated: number;
  rosterSize: number;
};

export type PlayerStatRow = {
  playerId: string;
  name: string;
  shortName: string;
  sessionsHeld: number;
  yes: number;
  no: number;
  notCommunicated: number;
  ratePct: number;
};

export type OverallStats = {
  sessionCount: number;
  avgAttendedPerSession: number;
  totalYes: number;
  totalNo: number;
  totalNotCommunicated: number;
  overallRatePct: number;
};

export type SessionPlayerRow = {
  playerId: string;
  name: string;
  status: AttendanceStatus | null;
};

export type SessionDetail = {
  sessionId: string;
  dateLabel: string;
  rosterSize: number;
  players: SessionPlayerRow[];
};

export type SessionFilter = "YES" | "NO" | "NOT_COMMUNICATED";

export type PlayerFullReport = {
  playerId: string;
  name: string;
  attendance: {
    sessionsHeld: number;
    yes: number;
    no: number;
    notCommunicated: number;
    ratePct: number;
  };
  games: PlayerSeasonGameStats;
};

function shortPlayerName(firstName: string, lastName: string) {
  const initial = lastName.charAt(0) ? `${lastName.charAt(0)}.` : "";
  return `${firstName} ${initial}`.trim();
}

async function getActualSessions(teamId: string, seasonId: string) {
  return prisma.trainingSession.findMany({
    where: {
      teamId,
      seasonId,
      kind: SessionKind.ACTUAL,
      status: { in: [SessionStatus.ACTIVE, SessionStatus.COMPLETED] },
    },
    include: { records: true },
    orderBy: { sessionDate: "asc" },
  });
}

export async function getSessionStats(teamId: string): Promise<SessionStatRow[]> {
  const season = await requireActiveSeason(teamId);
  const sessions = await getActualSessions(teamId, season.id);
  return sessions.map((s) => {
    let yes = 0;
    let no = 0;
    let notCommunicated = 0;
    for (const r of s.records) {
      if (r.status === AttendanceStatus.YES) yes++;
      else if (r.status === AttendanceStatus.NO) no++;
      else if (r.status === AttendanceStatus.NOT_COMMUNICATED) notCommunicated++;
    }
    return {
      sessionId: s.id,
      dateLabel: formatDateLabel(s.sessionDate),
      sessionDate: s.sessionDate.toISOString().slice(0, 10),
      attended: yes,
      yes,
      no,
      notCommunicated,
      rosterSize: s.records.length,
    };
  });
}

export async function getSessionDetail(
  teamId: string,
  sessionId: string,
): Promise<SessionDetail | null> {
  const season = await requireActiveSeason(teamId);
  const session = await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      teamId,
      seasonId: season.id,
      kind: SessionKind.ACTUAL,
      status: { in: [SessionStatus.ACTIVE, SessionStatus.COMPLETED] },
    },
    include: {
      records: {
        include: { player: true },
        orderBy: { player: { lastName: "asc" } },
      },
    },
  });
  if (!session) return null;

  return {
    sessionId: session.id,
    dateLabel: formatDateLabel(session.sessionDate),
    rosterSize: session.records.length,
    players: session.records
      .filter((r) => r.player.isActive)
      .map((r) => ({
        playerId: r.playerId,
        name: playerDisplayName(r.player),
        status: r.status,
      })),
  };
}

export function filterSessionPlayers(
  players: SessionPlayerRow[],
  filter: SessionFilter,
): SessionPlayerRow[] {
  return players.filter((p) => {
    if (filter === AttendanceStatus.YES) return p.status === AttendanceStatus.YES;
    if (filter === AttendanceStatus.NO) return p.status === AttendanceStatus.NO;
    return p.status === AttendanceStatus.NOT_COMMUNICATED;
  });
}

export async function getPlayerStats(teamId: string): Promise<PlayerStatRow[]> {
  const season = await requireActiveSeason(teamId);
  const sessions = await getActualSessions(teamId, season.id);
  const sessionCount = sessions.length;

  const players = await prisma.player.findMany({
    where: { teamId, isActive: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const rows: PlayerStatRow[] = players.map((p) => {
    let yes = 0;
    let no = 0;
    let notCommunicated = 0;

    for (const session of sessions) {
      const rec = session.records.find((r) => r.playerId === p.id);
      if (rec?.status === AttendanceStatus.YES) yes++;
      else if (rec?.status === AttendanceStatus.NO) no++;
      else if (rec?.status === AttendanceStatus.NOT_COMMUNICATED) notCommunicated++;
    }

    const ratePct =
      sessionCount > 0 ? Math.round((yes / sessionCount) * 100) : 0;

    return {
      playerId: p.id,
      name: playerDisplayName(p),
      shortName: shortPlayerName(p.firstName, p.lastName),
      sessionsHeld: sessionCount,
      yes,
      no,
      notCommunicated,
      ratePct,
    };
  });

  return rows.sort((a, b) => {
    if (b.ratePct !== a.ratePct) return b.ratePct - a.ratePct;
    return a.name.localeCompare(b.name);
  });
}

export async function getPlayerStatRow(
  teamId: string,
  playerId: string,
): Promise<PlayerStatRow | null> {
  const rows = await getPlayerStats(teamId);
  return rows.find((r) => r.playerId === playerId) ?? null;
}

export async function getOverallStats(teamId: string): Promise<OverallStats> {
  const sessionRows = await getSessionStats(teamId);
  const sessionCount = sessionRows.length;

  if (sessionCount === 0) {
    return {
      sessionCount: 0,
      avgAttendedPerSession: 0,
      totalYes: 0,
      totalNo: 0,
      totalNotCommunicated: 0,
      overallRatePct: 0,
    };
  }

  const totalYes = sessionRows.reduce((s, r) => s + r.yes, 0);
  const totalNo = sessionRows.reduce((s, r) => s + r.no, 0);
  const totalNotCommunicated = sessionRows.reduce(
    (s, r) => s + r.notCommunicated,
    0,
  );
  const totalSlots = sessionRows.reduce((s, r) => s + r.rosterSize, 0);
  const avgAttendedPerSession = Math.round((totalYes / sessionCount) * 10) / 10;
  const overallRatePct =
    totalSlots > 0 ? Math.round((totalYes / totalSlots) * 100) : 0;

  return {
    sessionCount,
    avgAttendedPerSession,
    totalYes,
    totalNo,
    totalNotCommunicated,
    overallRatePct,
  };
}

export async function getPlayerFullReport(
  teamId: string,
  playerId: string,
): Promise<PlayerFullReport | null> {
  const player = await prisma.player.findFirst({
    where: { id: playerId, teamId },
  });
  if (!player) return null;

  const attendance = await getPlayerStatRow(teamId, playerId);
  const { getPlayerGameStats } = await import("@/lib/games");
  const games = await getPlayerGameStats(teamId, playerId);

  return {
    playerId,
    name: playerDisplayName(player),
    attendance: attendance ?? {
      sessionsHeld: 0,
      yes: 0,
      no: 0,
      notCommunicated: 0,
      ratePct: 0,
    },
    games,
  };
}
