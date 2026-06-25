"use client";

import { useTransition } from "react";
import { saveGameRosterAction } from "@/app/actions/games";
import { playerDisplayName } from "@/lib/dates";

type Row = {
  playerId: string;
  firstName: string;
  lastName: string;
  isPlaying: boolean;
};

export function GameRosterPicker({
  teamId,
  gameId,
  rows,
}: {
  teamId: string;
  gameId: string;
  rows: Row[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(() => void saveGameRosterAction(teamId, gameId, fd));
      }}
      className="space-y-3"
    >
      <p className="text-xs text-[var(--color-text-muted)]">
        Toggle who is in the lineup for this game.
      </p>
      <ul className="space-y-1 max-h-[55vh] overflow-y-auto">
        {rows.map((r) => (
          <li
            key={r.playerId}
            className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2"
          >
            <input
              type="checkbox"
              name="playing"
              value={r.playerId}
              defaultChecked={r.isPlaying}
              className="h-5 w-5 shrink-0"
            />
            <span className="text-sm font-medium truncate">
              {playerDisplayName(r)}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="submit"
        name="next"
        value="track"
        disabled={pending}
        className="w-full min-h-12 rounded-md bg-[var(--color-primary)] text-white font-semibold"
      >
        Continue to game
      </button>
      <button
        type="submit"
        name="next"
        value="save"
        disabled={pending}
        className="w-full min-h-10 rounded-md border border-[var(--color-border)] text-sm font-medium"
      >
        Save roster
      </button>
    </form>
  );
}
