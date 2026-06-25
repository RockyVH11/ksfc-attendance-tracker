"use client";

import { useState } from "react";
import type { SessionDetail, SessionFilter } from "@/lib/stats";
import { filterSessionPlayers } from "@/lib/stats";

const FILTERS: { value: SessionFilter; label: string }[] = [
  { value: "YES", label: "Attended" },
  { value: "NO", label: "Not attended" },
  { value: "NOT_COMMUNICATED", label: "Not communicated" },
];

export function SessionDetailView({ detail }: { detail: SessionDetail }) {
  const [filter, setFilter] = useState<SessionFilter>("YES");
  const filtered = filterSessionPlayers(detail.players, filter);

  return (
    <>
      <label className="block text-xs font-medium mb-2">
        Show
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as SessionFilter)}
          className="mt-1 w-full min-h-10 px-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <p className="text-xs text-[var(--color-text-muted)] mb-2">
        {filtered.length} of {detail.rosterSize} players
      </p>

      <ul className="space-y-1">
        {filtered.length === 0 ? (
          <li className="text-xs text-[var(--color-text-muted)]">No players in this group.</li>
        ) : (
          filtered.map((p) => (
            <li
              key={p.playerId}
              className="text-sm font-medium border-b border-[var(--color-border)] py-1.5"
            >
              {p.name}
            </li>
          ))
        )}
      </ul>
    </>
  );
}
