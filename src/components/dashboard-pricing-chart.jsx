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

const OLIVE = "#6B7C4E";
const RED = "#B84A4A";

export function DashboardPricingChart({ data }) {
  return (
    <div className="h-[220px] w-full sm:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          barGap={6}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D6" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#666666", fontSize: 11 }}
            axisLine={{ stroke: "#E5E0D6" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#666666", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E0D6",
              fontSize: "12px",
            }}
            formatter={(value, name) => [`${value}`, name]}
          />
          <Bar dataKey="you" name="You" fill={OLIVE} radius={[4, 4, 0, 0]} />
          <Bar dataKey="bawarchi" name="Bawarchi" fill={RED} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
