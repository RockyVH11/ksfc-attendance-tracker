/** Attendance % display tiers for stats */
export function attendanceTier(pct: number): "high" | "mid" | "low" {
  if (pct > 80) return "high";
  if (pct >= 50) return "mid";
  return "low";
}

export function attendanceRateTextClass(pct: number): string {
  const tier = attendanceTier(pct);
  if (tier === "high") return "text-[var(--color-success)]";
  if (tier === "mid") return "text-[var(--color-warning)]";
  return "text-[var(--color-danger)]";
}

export function attendanceRateBarFill(pct: number): string {
  const tier = attendanceTier(pct);
  if (tier === "high") return "var(--color-success)";
  if (tier === "mid") return "var(--color-warning)";
  return "var(--color-danger)";
}

export function attendanceRateRowClass(pct: number): string {
  const tier = attendanceTier(pct);
  if (tier === "high") return "border-l-4 border-l-[var(--color-success)]";
  if (tier === "mid") return "border-l-4 border-l-[var(--color-warning)]";
  return "border-l-4 border-l-[var(--color-danger)]";
}
