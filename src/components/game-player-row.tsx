"use client";

import { useTransition } from "react";
import {
  togglePlayingAction,
  updateAppearanceAction,
} from "@/app/actions/games";
import { playerDisplayName } from "@/lib/dates";

type Props = {
  teamId: string;
  gameId: string;
  player: { id: string; firstName: string; lastName: string };
  isPlaying: boolean;
  goals: number;
  assists: number;
  rating: number | null;
  notes: string;
};

export function GamePlayerRow({
  teamId,
  gameId,
  player,
  isPlaying,
  goals,
  assists,
  rating,
  notes,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <li
      className={`rounded-md border px-2 py-2 text-sm ${
        isPlaying
          ? "border-[var(--color-primary)]/40 bg-[var(--color-surface)]"
          : "border-[var(--color-border)] opacity-70"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <p className="flex-1 min-w-0 truncate font-medium">
          {playerDisplayName(player)}
        </p>
        <label className="flex items-center gap-1 text-xs shrink-0">
          <input
            type="checkbox"
            checked={isPlaying}
            disabled={pending}
            onChange={(e) => {
              startTransition(() => {
                void togglePlayingAction(
                  teamId,
                  gameId,
                  player.id,
                  e.target.checked,
                );
              });
            }}
          />
          Playing
        </label>
      </div>
      {isPlaying ? (
        <form
          action={updateAppearanceAction.bind(null, teamId, gameId, player.id)}
          className="grid grid-cols-4 gap-1.5 items-end"
        >
          <label className="text-[10px]">
            G
            <input
              name="goals"
              type="number"
              min={0}
              defaultValue={goals}
              className="w-full min-h-8 px-1 rounded border border-[var(--color-border)] text-xs"
            />
          </label>
          <label className="text-[10px]">
            A
            <input
              name="assists"
              type="number"
              min={0}
              defaultValue={assists}
              className="w-full min-h-8 px-1 rounded border border-[var(--color-border)] text-xs"
            />
          </label>
          <label className="text-[10px]">
            1–5
            <select
              name="rating"
              defaultValue={rating ?? ""}
              className="w-full min-h-8 px-0.5 rounded border border-[var(--color-border)] text-xs"
            >
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="min-h-8 rounded bg-[var(--color-primary)] text-white text-[10px] font-semibold"
          >
            Save
          </button>
          <label className="col-span-4 text-[10px]">
            Notes
            <input
              name="notes"
              type="text"
              defaultValue={notes}
              placeholder="Player notes"
              className="w-full min-h-8 px-2 rounded border border-[var(--color-border)] text-xs"
            />
          </label>
        </form>
      ) : null}
    </li>
  );
}
