"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlayerStatRow } from "@/lib/stats";
import { attendanceRateBarFill } from "@/lib/attendance-display";

type Props = {
  players: PlayerStatRow[];
  /** full = horizontal bars, large labels, for dedicated chart page */
  variant?: "full";
};

export function PlayerAttendanceChart({ players, variant }: Props) {
  if (players.length === 0) {
    return (
      <p className="text-xs text-[var(--color-text-muted)]">
        Record actual sessions to see the chart.
      </p>
    );
  }

  const data = players.map((p) => ({
    name: variant === "full" ? p.name : p.shortName,
    pct: p.ratePct,
  }));

  const isFull = variant === "full";
  const chartHeight = isFull
    ? Math.max(480, players.length * 36 + 80)
    : 208;

  return (
    <div className="w-full">
      {isFull ? (
        <p className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
          Green &gt;80% · Yellow 50–79% · Red &lt;50%
        </p>
      ) : null}
      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout={isFull ? "vertical" : "horizontal"}
            data={data}
            margin={
              isFull
                ? { top: 8, right: 16, left: 8, bottom: 8 }
                : { top: 4, right: 4, left: -20, bottom: 48 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            {isFull ? (
              <>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 13 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 12 }}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                />
              </>
            )}
            <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
            <Bar dataKey="pct" radius={isFull ? [0, 4, 4, 0] : [3, 3, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={attendanceRateBarFill(entry.pct)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
