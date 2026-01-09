"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatPercent } from "@/lib/formatters";

interface RetentionChartProps {
  data: Array<{
    month: string;
    netRetention: number;
    grossRetention: number;
  }>;
}

export function RetentionChart({ data }: RetentionChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
        <p className="text-center text-gray-500 text-lg">
          No data for selected range
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Retention Trends
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 500 }}
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 500 }}
            label={{
              value: "Retention %",
              angle: -90,
              position: "insideLeft",
              style: {
                textAnchor: "middle",
                fill: "#374151",
                fontWeight: 600,
              },
            }}
            stroke="#9ca3af"
          />
          <Tooltip
            formatter={(value: number | undefined) =>
              value !== undefined ? formatPercent(value) : ""
            }
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Line
            type="monotone"
            dataKey="netRetention"
            stroke="#3b82f6"
            strokeWidth={3}
            name="Net Retention"
            dot={{ r: 5, fill: "#3b82f6" }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="grossRetention"
            stroke="#10b981"
            strokeWidth={3}
            name="Gross Retention"
            dot={{ r: 5, fill: "#10b981" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
