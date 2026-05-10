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

const OLIVE = "#6B7C4E";
const GREY = "#64748B";

/**
 * @param {{ data: { date: string, avg_rating: number|null, google_rating: number|null }[], name: string }} props
 */
export function CompetitorDetailChart({ data, name }) {
  if (!data?.length) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg bg-[#FAFAF7] text-sm text-[#666666] sm:h-[220px]">
        No rating trend data.
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full min-w-0 sm:h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D6" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#666", fontSize: 10 }}
            axisLine={{ stroke: "#E5E0D6" }}
            tickLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#666", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={32}
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
            formatter={(value) => (
              <span className="text-[#2D2926]">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="avg_rating"
            name={name || "Avg. rating"}
            stroke={OLIVE}
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="google_rating"
            name="Google rating"
            stroke={GREY}
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
