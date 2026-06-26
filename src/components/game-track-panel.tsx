"use client";

import { useTransition } from "react";
import {
  decrementPlayerStatAction,
  decrementScoreAction,
  incrementPlayerStatAction,
  incrementScoreAction,
} from "@/app/actions/games";
import { formatGameScore } from "@/lib/games";
import type { GamePlayerLine } from "@/lib/games";

type Props = {
  teamId: string;
  gameId: string;
  scoreUs: number;
  scoreThem: number;
  players: GamePlayerLine[];
};

type PlayerStat = "goals" | "assists" | "yellowCards" | "redCards";

export function GameTrackPanel({
  teamId,
  gameId,
  scoreUs,
  scoreThem,
  players,
}: Props) {
  const [pending, startTransition] = useTransition();

  function bump(playerId: string, stat: PlayerStat, delta: 1 | -1) {
    startTransition(() => {
      const action =
        delta === 1 ? incrementPlayerStatAction : decrementPlayerStatAction;
      void action(teamId, gameId, playerId, stat);
    });
  }

  return (
    <>
      <div className="rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-3 mb-4">
        <p className="text-xs font-semibold text-center mb-3">Score</p>
        <div className="flex items-center justify-center gap-4">
          <ScoreColumn
            label="US"
            score={scoreUs}
            disabled={pending}
            onInc={() =>
              startTransition(() => void incrementScoreAction(teamId, gameId, "us"))
            }
            onDec={() =>
              startTransition(() => void decrementScoreAction(teamId, gameId, "us"))
            }
          />
          <span className="text-2xl font-bold text-[var(--color-text-muted)]">–</span>
          <ScoreColumn
            label="Them"
            score={scoreThem}
            disabled={pending}
            onInc={() =>
              startTransition(() => void incrementScoreAction(teamId, gameId, "them"))
            }
            onDec={() =>
              startTransition(() => void decrementScoreAction(teamId, gameId, "them"))
            }
          />
        </div>
        <p className="text-center mt-2 text-lg font-bold text-[var(--color-primary)]">
          {formatGameScore(scoreUs, scoreThem)}
        </p>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          No players selected. Edit roster first.
        </p>
      ) : (
        <ul className="space-y-2">
          {players.map((p) => (
            <li
              key={p.playerId}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2"
            >
              <p className="text-sm font-semibold mb-2 truncate">{p.name}</p>
              <div className="grid grid-cols-4 gap-1.5">
                <StatColumn
                  label="G"
                  value={p.goals}
                  disabled={pending}
                  onInc={() => bump(p.playerId, "goals", 1)}
                  onDec={() => bump(p.playerId, "goals", -1)}
                />
                <StatColumn
                  label="A"
                  value={p.assists}
                  disabled={pending}
                  onInc={() => bump(p.playerId, "assists", 1)}
                  onDec={() => bump(p.playerId, "assists", -1)}
                />
                <StatColumn
                  label="YC"
                  value={p.yellowCards}
                  disabled={pending}
                  onInc={() => bump(p.playerId, "yellowCards", 1)}
                  onDec={() => bump(p.playerId, "yellowCards", -1)}
                />
                <StatColumn
                  label="RC"
                  value={p.redCards}
                  disabled={pending}
                  onInc={() => bump(p.playerId, "redCards", 1)}
                  onDec={() => bump(p.playerId, "redCards", -1)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ScoreColumn({
  label,
  score,
  disabled,
  onInc,
  onDec,
}: {
  label: string;
  score: number;
  disabled: boolean;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold">{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onInc}
        className="min-h-10 min-w-14 rounded-md bg-[var(--color-success)] text-white text-lg font-bold"
      >
        +1
      </button>
      <span className="text-2xl font-bold tabular-nums">{score}</span>
      <button
        type="button"
        disabled={disabled || score <= 0}
        onClick={onDec}
        className="min-h-8 min-w-14 rounded border border-[var(--color-border)] text-xs"
      >
        −1
      </button>
    </div>
  );
}

function StatColumn({
  label,
  value,
  disabled,
  onInc,
  onDec,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] py-1">
      <span className="text-[10px] font-semibold">{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onInc}
        className="mt-0.5 min-h-7 w-full text-xs font-bold text-[var(--color-success)] active:bg-[var(--color-success)] active:text-white"
      >
        +1
      </button>
      <span className="text-base font-bold tabular-nums py-0.5">{value}</span>
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={onDec}
        className="min-h-7 w-full text-xs font-bold text-[var(--color-text-muted)] active:bg-[var(--color-border)] disabled:opacity-40"
      >
        −1
      </button>
    </div>
  );
}
