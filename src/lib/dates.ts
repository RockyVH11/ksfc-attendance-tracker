const TZ = process.env.APP_TIMEZONE ?? "America/Chicago";

/** Calendar date string YYYY-MM-DD in club timezone */
export function todayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseDateString(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateLabel(value: Date | string): string {
  const d = typeof value === "string" ? parseDateString(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function playerDisplayName(p: { firstName: string; lastName: string }) {
  return `${p.firstName} ${p.lastName}`;
}
