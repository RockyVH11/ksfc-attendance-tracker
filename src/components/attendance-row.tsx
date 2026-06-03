"use client";

import type { AttendanceStatus } from "@prisma/client";
import { useTransition } from "react";
import { updateAttendanceAction } from "@/app/actions/sessions";
import { AttendanceToggle } from "@/components/attendance-toggle";
import { playerDisplayName } from "@/lib/dates";

type Props = {
  teamId: string;
  sessionId: string;
  player: { id: string; firstName: string; lastName: string };
  status: AttendanceStatus | null;
};

export function AttendanceRow({ teamId, sessionId, player, status }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5">
      <p className="flex-1 min-w-0 text-sm font-medium text-[var(--color-text)] truncate">
        {playerDisplayName(player)}
      </p>
      <AttendanceToggle
        compact
        value={status}
        disabled={pending}
        onChange={(next) => {
          startTransition(() => {
            void updateAttendanceAction(teamId, sessionId, player.id, next);
          });
        }}
      />
    </li>
  );
}
