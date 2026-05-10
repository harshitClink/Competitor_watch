"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PALETTE = [
  "#5C6B47",
  "#B84A4A",
  "#2563EB",
  "#CA8A04",
  "#7C3AED",
  "#DB2777",
  "#0D9488",
  "#EA580C",
];

/**
 * @param {{ chartData: Record<string, string|number>[], lineKeys: { key: string, name: string }[] }} props
 */
export function LeaderboardScoreChart({ chartData, lineKeys }) {
  if (!chartData?.length || !lineKeys?.length) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-lg bg-[#FAFAF7] text-sm text-[#666666] sm:h-[260px]">
        No score history in this range.
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full sm:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D6" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#666666", fontSize: 10 }}
            axisLine={{ stroke: "#E5E0D6" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#666666", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E0D6",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
            formatter={(value) => <span className="text-[#2D2926]">{value}</span>}
          />
          {lineKeys.map((lk, i) => (
            <Line
              key={lk.key}
              type="monotone"
              dataKey={lk.key}
              name={lk.name}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
