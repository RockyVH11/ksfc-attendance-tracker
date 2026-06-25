import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { APP_NAME } from "@/lib/constants";

export type TeamNavKey =
  | "teams"
  | "planned"
  | "actual"
  | "games"
  | "reports"
  | "roster"
  | "season";

export type ReportsMode = "training" | "games";
export type TrainingReportTab = "players" | "sessions" | "overall";

type Props = {
  teamId: string;
  teamName: string;
  seasonLabel?: string;
  active: TeamNavKey;
  reportsMode?: ReportsMode;
  trainingTab?: TrainingReportTab;
  children: React.ReactNode;
};

const NAV: { key: TeamNavKey; label: string; href: (id: string) => string }[] = [
  { key: "teams", label: "Teams", href: () => "/teams" },
  { key: "roster", label: "Roster", href: (id) => `/teams/${id}/players` },
  { key: "planned", label: "Plan", href: (id) => `/teams/${id}/planned` },
  { key: "actual", label: "Actual", href: (id) => `/teams/${id}/actual` },
  { key: "games", label: "Games", href: (id) => `/teams/${id}/games` },
  {
    key: "reports",
    label: "Reports",
    href: (id) => `/teams/${id}/reports/training/players`,
  },
];

const TRAINING_TABS: {
  key: TrainingReportTab;
  label: string;
  href: (id: string) => string;
}[] = [
  {
    key: "players",
    label: "By player",
    href: (id) => `/teams/${id}/reports/training/players`,
  },
  {
    key: "sessions",
    label: "By session",
    href: (id) => `/teams/${id}/reports/training/sessions`,
  },
  {
    key: "overall",
    label: "Overall",
    href: (id) => `/teams/${id}/reports/training/overall`,
  },
];

export function TeamShell({
  teamId,
  teamName,
  seasonLabel,
  active,
  reportsMode,
  trainingTab,
  children,
}: Props) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-20 bg-[var(--color-primary)] text-white shadow-md">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide opacity-80">
              {APP_NAME}
            </p>
            <h1 className="text-base font-semibold leading-tight truncate">
              {teamName}
            </h1>
            {seasonLabel ? (
              <Link
                href={`/teams/${teamId}/season`}
                className="text-[10px] opacity-90 underline underline-offset-2"
              >
                Season: {seasonLabel}
              </Link>
            ) : null}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs underline underline-offset-2 opacity-90 shrink-0"
            >
              Sign out
            </button>
          </form>
        </div>

        <nav
          className="border-t border-white/20 bg-[var(--color-primary-muted)] overflow-x-auto"
          aria-label="Team sections"
        >
          <ul className="flex max-w-lg mx-auto min-w-max px-1">
            {NAV.map((item) => (
              <li key={item.key} className="flex-1 min-w-[3.25rem]">
                <Link
                  href={item.href(teamId)}
                  className={`flex items-center justify-center min-h-10 text-[10px] font-semibold whitespace-nowrap px-1 ${
                    active === item.key
                      ? "bg-white/15 text-white"
                      : "text-white/75"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {active === "reports" && reportsMode ? (
          <nav
            className="border-t border-white/15 bg-[var(--color-surface)]"
            aria-label="Report type"
          >
            <ul className="flex max-w-lg mx-auto">
              <li className="flex-1">
                <Link
                  href={`/teams/${teamId}/reports/training/players`}
                  className={`flex items-center justify-center min-h-9 text-[11px] font-semibold ${
                    reportsMode === "training"
                      ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  Training
                </Link>
              </li>
              <li className="flex-1">
                <Link
                  href={`/teams/${teamId}/reports/games`}
                  className={`flex items-center justify-center min-h-9 text-[11px] font-semibold ${
                    reportsMode === "games"
                      ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  Games
                </Link>
              </li>
            </ul>
            {reportsMode === "training" && trainingTab ? (
              <ul className="flex max-w-lg mx-auto border-t border-[var(--color-border)]">
                {TRAINING_TABS.map((tab) => (
                  <li key={tab.key} className="flex-1">
                    <Link
                      href={tab.href(teamId)}
                      className={`flex items-center justify-center min-h-9 text-[10px] font-medium ${
                        trainingTab === tab.key
                          ? "text-[var(--color-primary)] bg-[var(--color-bg)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </nav>
        ) : null}
      </header>

      <main className="flex-1 px-3 py-3 max-w-lg mx-auto w-full">{children}</main>
    </div>
  );
}
