"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlayerSeasonGameStats, SeasonGameStats } from "@/lib/games";

type SortKey = "gamesPlayed" | "goals" | "assists" | "yellowCards" | "redCards";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "gamesPlayed", label: "GP" },
  { key: "goals", label: "G" },
  { key: "assists", label: "A" },
  { key: "yellowCards", label: "YC" },
  { key: "redCards", label: "RC" },
];

export function GameSeasonStatsTable({
  teamId,
  stats,
}: {
  teamId: string;
  stats: SeasonGameStats;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("gamesPlayed");

  const sorted = useMemo(() => {
    return [...stats.perPlayer].sort((a, b) => {
      const diff = b[sortKey] - a[sortKey];
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [stats.perPlayer, sortKey]);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
        <SummaryCard label="GP" value={stats.gamesPlayed} />
        <SummaryCard label="GF" value={stats.goalsFor} />
        <SummaryCard label="GA" value={stats.goalsAgainst} />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <SummaryCard label="A" value={stats.totalAssists} />
        <SummaryCard label="YC" value={stats.totalYellowCards} />
        <SummaryCard label="RC" value={stats.totalRedCards} />
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSortKey(opt.key)}
            className={`min-h-8 px-2 rounded text-xs font-semibold ${
              sortKey === opt.key
                ? "bg-[var(--color-primary)] text-white"
                : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            Sort {opt.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 text-[10px] font-semibold text-[var(--color-text-muted)] px-1 mb-1">
        <span className="flex-1">Player</span>
        <span className="w-7 text-center">GP</span>
        <span className="w-6 text-center">G</span>
        <span className="w-6 text-center">A</span>
        <span className="w-7 text-center">YC</span>
        <span className="w-7 text-center">RC</span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">No game data yet.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {sorted.map((p) => (
            <PlayerRow key={p.playerId} teamId={teamId} player={p} />
          ))}
        </ul>
      )}
      <p className="mt-3 text-[10px] text-[var(--color-text-muted)]">
        GF/GA from game scores (US / Them). A, YC, RC from player totals.
      </p>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] p-2">
      <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
      <p className="text-lg font-bold text-[var(--color-primary)]">{value}</p>
    </div>
  );
}

function PlayerRow({
  teamId,
  player: p,
}: {
  teamId: string;
  player: PlayerSeasonGameStats;
}) {
  return (
    <li className="flex gap-1 items-center border-b border-[var(--color-border)] py-1">
      <Link
        href={`/teams/${teamId}/reports/players/${p.playerId}`}
        className="flex-1 min-w-0 truncate font-medium text-xs text-[var(--color-primary)] underline underline-offset-2"
      >
        {p.name}
      </Link>
      <span className="w-7 text-center text-xs">{p.gamesPlayed}</span>
      <span className="w-6 text-center text-xs">{p.goals}</span>
      <span className="w-6 text-center text-xs">{p.assists}</span>
      <span className="w-7 text-center text-xs">{p.yellowCards}</span>
      <span className="w-7 text-center text-xs">{p.redCards}</span>
    </li>
  );
}
