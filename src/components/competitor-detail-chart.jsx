"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const OLIVE = "#6B7C4E";
const GREY = "#9CA3AF";

export function CompetitorDetailChart({ data, competitorSeriesName }) {
  return (
    <div className="h-[200px] w-full min-w-0 sm:h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D6" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#666", fontSize: 10 }}
            axisLine={{ stroke: "#E5E0D6" }}
            tickLine={false}
          />
          <YAxis
            domain={[3.6, 4.8]}
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
          <Bar
            dataKey="competitor"
            name={competitorSeriesName}
            fill={OLIVE}
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
          />
          <Line
            type="monotone"
            dataKey="market"
            name="Market avg."
            stroke={GREY}
            strokeWidth={2}
            dot={{ r: 3, fill: GREY }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
