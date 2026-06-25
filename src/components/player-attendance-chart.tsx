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
  variant?: "full";
};

function BoldYAxisTick(props: {
  x?: string | number;
  y?: string | number;
  payload?: { value?: string };
}) {
  const x = typeof props.x === "number" ? props.x : Number(props.x);
  const y = typeof props.y === "number" ? props.y : Number(props.y);
  if (Number.isNaN(x) || Number.isNaN(y) || !props.payload?.value) return null;
  return (
    <text
      x={x - 4}
      y={y + 4}
      textAnchor="end"
      fill="var(--color-text)"
      fontSize={14}
      fontWeight={700}
    >
      {props.payload.value}
    </text>
  );
}

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
    ? Math.max(520, players.length * 40 + 80)
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
                ? { top: 8, right: 20, left: 4, bottom: 8 }
                : { top: 4, right: 4, left: -20, bottom: 48 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            {isFull ? (
              <>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 13, fill: "var(--color-text)" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={155}
                  tick={BoldYAxisTick}
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
                <Cell key={entry.name} fill={attendanceRateBarFill(entry.pct)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
