"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlayerStatRow } from "@/lib/stats";

type Props = {
  players: PlayerStatRow[];
};

export function PlayerAttendanceChart({ players }: Props) {
  if (players.length === 0) {
    return (
      <p className="text-xs text-[var(--color-text-muted)]">
        Record actual sessions to see the chart.
      </p>
    );
  }

  const data = players.map((p) => ({
    name: p.shortName,
    pct: p.ratePct,
  }));

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">
        Attendance % by player (Y) — highest to lowest in list below
      </p>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -20, bottom: 48 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={56}
              label={{ value: "Player", position: "insideBottom", offset: -4, fontSize: 10 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
              label={{
                value: "Attendance %",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
            <Bar dataKey="pct" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
