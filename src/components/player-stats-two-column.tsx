"use client";

import type { PlayerStatRow } from "@/lib/stats";
import {
  attendanceRateRowClass,
  attendanceRateTextClass,
} from "@/lib/attendance-display";

export function PlayerStatsTwoColumn({ players }: { players: PlayerStatRow[] }) {
  if (players.length === 0) {
    return (
      <p className="text-xs text-[var(--color-text-muted)]">No actual sessions yet.</p>
    );
  }

  const splitAt = Math.ceil(players.length / 2);
  const left = players.slice(0, splitAt);
  const right = players.slice(splitAt);

  return (
    <div className="grid grid-cols-2 gap-x-2">
      <PlayerColumn players={left} />
      <PlayerColumn players={right} />
    </div>
  );
}

function PlayerColumn({ players }: { players: PlayerStatRow[] }) {
  return (
    <ul className="space-y-1 min-w-0">
      {players.map((p) => (
        <li
          key={p.playerId}
          className={`flex flex-col gap-0.5 text-sm border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md pl-1.5 pr-1.5 py-1 ${attendanceRateRowClass(p.ratePct)}`}
        >
          <span className="truncate font-medium text-[11px] leading-tight">{p.name}</span>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] text-[var(--color-text-muted)]">
              {p.yes}/{p.sessionsHeld}
            </span>
            <span
              className={`text-xs font-bold ${attendanceRateTextClass(p.ratePct)}`}
            >
              {p.ratePct}%
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
