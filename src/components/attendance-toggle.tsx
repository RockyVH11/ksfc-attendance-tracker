"use client";

import type { AttendanceStatus } from "@prisma/client";
import { ATTENDANCE_LABELS } from "@/lib/sessions";

const OPTIONS: AttendanceStatus[] = ["YES", "NO", "NOT_COMMUNICATED"];

const STYLES: Record<AttendanceStatus, string> = {
  YES: "bg-[var(--color-success)] text-white border-[var(--color-success)]",
  NO: "bg-[var(--color-danger)] text-white border-[var(--color-danger)]",
  NOT_COMMUNICATED:
    "bg-[var(--color-warning)] text-[var(--color-brand-black)] border-[var(--color-warning)]",
};

type Props = {
  value: AttendanceStatus | null;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function AttendanceToggle({
  value,
  onChange,
  disabled,
  compact = false,
}: Props) {
  return (
    <div
      className={`flex gap-0.5 shrink-0 ${compact ? "w-[9.5rem]" : "w-full"}`}
      role="group"
      aria-label="Attendance"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt;
        const short =
          opt === "YES" ? "Y" : opt === "NO" ? "N" : "NC";
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            title={ATTENDANCE_LABELS[opt]}
            onClick={() => onChange(opt)}
            className={`flex-1 rounded border font-semibold transition-opacity ${
              compact ? "min-h-8 text-[11px]" : "min-h-11 text-sm"
            } ${
              active
                ? STYLES[opt]
                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]"
            } ${disabled ? "opacity-50" : ""}`}
          >
            {compact ? short : opt === "YES" ? "Yes" : opt === "NO" ? "No" : "N/C"}
          </button>
        );
      })}
    </div>
  );
}
