"use client";

import { useMemo, Suspense } from "react";
import { UserInfoCard } from "../am/components/UserInfoCard";
import { MonthRangeFilter } from "../am/components/MonthRangeFilter";
import { KpiCard } from "../am/components/KpiCard";
import { RetentionChart } from "../am/components/RetentionChart";
import { MetricsTable } from "../am/components/MetricsTable";
import { AmSelector } from "./components/AmSelector";
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

interface MetricMonthly {
  id: string;
  month: string;
  netRetention: number;
  grossRetention: number;
  renewalPremium: number;
  lostPremium: number;
  newBizPremium: number;
  policyCountStart: number;
  policyCountEnd: number;
  amName: string;
  accountManagerId: number;
}

interface AccountManager {
  id: number;
  name: string;
  email: string;
}

interface ManagementDashboardProps {
  user: {
    name: string | null;
    email: string | null;
    role: "AM" | "MANAGEMENT";
  };
  accountManagers: AccountManager[];
  metrics: MetricMonthly[];
  availableMonths: string[];
  selectedAmNames?: string[];
}

export function ManagementDashboard({
  user,
  accountManagers,
  metrics,
  availableMonths,
  selectedAmNames = [],
}: ManagementDashboardProps) {
  // Group metrics by AM for comparison
  const metricsByAm = useMemo(() => {
    const grouped: Record<number, MetricMonthly[]> = {};
    metrics.forEach((metric) => {
      if (!grouped[metric.accountManagerId]) {
        grouped[metric.accountManagerId] = [];
      }
      grouped[metric.accountManagerId].push(metric);
    });
    return grouped;
  }, [metrics]);

  // Get latest month metrics for each selected AM (for aggregated view)
  const latestMetricsByAm = useMemo(() => {
    const latest: Record<number, MetricMonthly | null> = {};
    Object.entries(metricsByAm).forEach(([amId, amMetrics]) => {
      if (amMetrics.length > 0) {
        latest[parseInt(amId, 10)] = amMetrics[amMetrics.length - 1];
      }
    });
    return latest;
  }, [metricsByAm]);

  // Calculate aggregated metrics (average or sum depending on metric type)
  const aggregatedLatestMetrics = useMemo(() => {
    const latestMetrics = Object.values(latestMetricsByAm).filter(
      (m): m is MetricMonthly => m !== null
    );

    if (latestMetrics.length === 0) return null;
    if (latestMetrics.length === 1) return latestMetrics[0];

    // For multiple AMs, calculate averages for percentages, sums for currency
    const latestMonth = latestMetrics[0].month; // All should have same latest month

    return {
      month: latestMonth,
      netRetention:
        latestMetrics.reduce((sum, m) => sum + m.netRetention, 0) /
        latestMetrics.length,
      grossRetention:
        latestMetrics.reduce((sum, m) => sum + m.grossRetention, 0) /
        latestMetrics.length,
      renewalPremium: latestMetrics.reduce(
        (sum, m) => sum + m.renewalPremium,
        0
      ),
      lostPremium: latestMetrics.reduce((sum, m) => sum + m.lostPremium, 0),
      newBizPremium: latestMetrics.reduce(
        (sum, m) => sum + m.newBizPremium,
        0
      ),
      policyCountStart: latestMetrics.reduce(
        (sum, m) => sum + m.policyCountStart,
        0
      ),
      policyCountEnd: latestMetrics.reduce(
        (sum, m) => sum + m.policyCountEnd,
        0
      ),
    };
  }, [latestMetricsByAm]);

  // Prepare chart data for comparison (one line per AM)
  const comparisonChartData = useMemo(() => {
    if (Object.keys(metricsByAm).length === 0) return [];

    // Get all unique months
    const allMonths = [...new Set(metrics.map((m) => m.month))].sort();

    // Create data points for each month
    return allMonths.map((month) => {
      const dataPoint: Record<string, string | number> = { month };

      Object.entries(metricsByAm).forEach(([amId, amMetrics]) => {
        const monthMetric = amMetrics.find((m) => m.month === month);
        if (monthMetric) {
          const amName = monthMetric.amName;
          dataPoint[`${amName} - Net`] = monthMetric.netRetention;
          dataPoint[`${amName} - Gross`] = monthMetric.grossRetention;
        }
      });

      return dataPoint;
    });
  }, [metrics, metricsByAm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Header Row - HORIZONTAL */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Management Dashboard
          </h1>
          <UserInfoCard name={user.name} email={user.email} role={user.role} />
        </div>

        {/* AM Selector Row - HORIZONTAL */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 px-4 py-3">
          <Suspense
            fallback={
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            }
          >
            <AmSelector accountManagers={accountManagers} />
          </Suspense>
        </div>

        {/* Selected AM Names */}
        {selectedAmNames.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm font-medium text-blue-900">
              Viewing metrics for:{" "}
              <span className="font-semibold">
                {selectedAmNames.length === 1
                  ? selectedAmNames[0]
                  : `${selectedAmNames.length} Account Managers: ${selectedAmNames.join(", ")}`}
              </span>
            </p>
          </div>
        )}

        {/* Filters Row - HORIZONTAL */}
        {availableMonths.length > 0 && (
          <div className="bg-gray-100 rounded-lg border border-gray-200 px-4 py-3">
            <Suspense
              fallback={
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              }
            >
              <MonthRangeFilter availableMonths={availableMonths} />
            </Suspense>
          </div>
        )}

        {/* KPI Section - Per-AM when multiple selected, single when one selected */}
        {selectedAmNames.length === 1 && aggregatedLatestMetrics ? (
          // Single AM - show normal KPIs
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
            <KpiCard
              title="Net Retention"
              value={aggregatedLatestMetrics.netRetention}
              latestMonth={aggregatedLatestMetrics.month}
              type="percent"
            />
            <KpiCard
              title="Gross Retention"
              value={aggregatedLatestMetrics.grossRetention}
              latestMonth={aggregatedLatestMetrics.month}
              type="percent"
            />
            <KpiCard
              title="Renewal Premium"
              value={aggregatedLatestMetrics.renewalPremium}
              latestMonth={aggregatedLatestMetrics.month}
              type="currency"
            />
            <KpiCard
              title="Lost Premium"
              value={aggregatedLatestMetrics.lostPremium}
              latestMonth={aggregatedLatestMetrics.month}
              type="currency"
            />
            <KpiCard
              title="New Biz Premium"
              value={aggregatedLatestMetrics.newBizPremium}
              latestMonth={aggregatedLatestMetrics.month}
              type="currency"
            />
            <KpiCard
              title="Policy Count"
              value={`${aggregatedLatestMetrics.policyCountStart} → ${aggregatedLatestMetrics.policyCountEnd}`}
              latestMonth={aggregatedLatestMetrics.month}
              type="count"
            />
          </div>
        ) : selectedAmNames.length > 1 && Object.keys(latestMetricsByAm).length > 0 ? (
          // Multiple AMs - show per-AM KPIs
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm font-semibold text-blue-900">
                Aggregated Overview
              </p>
            </div>
            {aggregatedLatestMetrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
                <KpiCard
                  title="Avg Net Retention"
                  value={aggregatedLatestMetrics.netRetention}
                  latestMonth={aggregatedLatestMetrics.month}
                  type="percent"
                />
                <KpiCard
                  title="Avg Gross Retention"
                  value={aggregatedLatestMetrics.grossRetention}
                  latestMonth={aggregatedLatestMetrics.month}
                  type="percent"
                />
                <KpiCard
                  title="Total Renewal Premium"
                  value={aggregatedLatestMetrics.renewalPremium}
                  latestMonth={aggregatedLatestMetrics.month}
                  type="currency"
                />
                <KpiCard
                  title="Total Lost Premium"
                  value={aggregatedLatestMetrics.lostPremium}
                  latestMonth={aggregatedLatestMetrics.month}
                  type="currency"
                />
                <KpiCard
                  title="Total New Biz Premium"
                  value={aggregatedLatestMetrics.newBizPremium}
                  latestMonth={aggregatedLatestMetrics.month}
                  type="currency"
                />
                <KpiCard
                  title="Total Policy Count"
                  value={`${aggregatedLatestMetrics.policyCountStart} → ${aggregatedLatestMetrics.policyCountEnd}`}
                  latestMonth={aggregatedLatestMetrics.month}
                  type="count"
                />
              </div>
            )}
            
            {/* Per-AM KPI Sections */}
            <div className="space-y-6 mt-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <p className="text-sm font-semibold text-blue-900">
                  Individual Account Manager KPIs
                </p>
              </div>
              {Object.entries(latestMetricsByAm)
                .sort(([amIdA], [amIdB]) => parseInt(amIdA, 10) - parseInt(amIdB, 10))
                .map(([amId, latestMetric]) => {
                  if (!latestMetric) return null;
                  
                  const amName = latestMetric.amName || `AM ${amId}`;
                  const amEmail = accountManagers.find(
                    (am) => am.id === parseInt(amId, 10)
                  )?.email || "";

                  return (
                    <div key={amId} className="space-y-3">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-4 py-2">
                        <h3 className="text-lg font-bold text-gray-900">{amName}</h3>
                        {amEmail && (
                          <p className="text-xs text-gray-600 mt-0.5">{amEmail}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        <KpiCard
                          title="Net Retention"
                          value={latestMetric.netRetention}
                          latestMonth={latestMetric.month}
                          type="percent"
                        />
                        <KpiCard
                          title="Gross Retention"
                          value={latestMetric.grossRetention}
                          latestMonth={latestMetric.month}
                          type="percent"
                        />
                        <KpiCard
                          title="Renewal Premium"
                          value={latestMetric.renewalPremium}
                          latestMonth={latestMetric.month}
                          type="currency"
                        />
                        <KpiCard
                          title="Lost Premium"
                          value={latestMetric.lostPremium}
                          latestMonth={latestMetric.month}
                          type="currency"
                        />
                        <KpiCard
                          title="New Biz Premium"
                          value={latestMetric.newBizPremium}
                          latestMonth={latestMetric.month}
                          type="currency"
                        />
                        <KpiCard
                          title="Policy Count"
                          value={`${latestMetric.policyCountStart} → ${latestMetric.policyCountEnd}`}
                          latestMonth={latestMetric.month}
                          type="count"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
            <p className="text-center text-gray-500 text-lg">
              {selectedAmNames.length === 0
                ? "Please select one or more Account Managers to view metrics"
                : "No metrics found for the selected range"}
            </p>
          </div>
        )}

        {/* Comparison Chart - Multiple AMs */}
        {comparisonChartData.length > 0 && selectedAmNames.length > 1 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Retention Comparison
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={comparisonChartData}>
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
                {Object.entries(metricsByAm).map(([amId, amMetrics], index) => {
                  const amName = amMetrics[0]?.amName || `AM ${amId}`;
                  const colors = [
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <>
                      <Line
                        key={`${amId}-net`}
                        type="monotone"
                        dataKey={`${amName} - Net`}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name={`${amName} - Net`}
                      />
                      <Line
                        key={`${amId}-gross`}
                        type="monotone"
                        dataKey={`${amName} - Gross`}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name={`${amName} - Gross`}
                      />
                    </>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Single AM Chart */}
        {metrics.length > 0 && selectedAmNames.length === 1 && (
          <div>
            <RetentionChart
              data={metrics.map((metric) => ({
                month: metric.month,
                netRetention: metric.netRetention,
                grossRetention: metric.grossRetention,
              }))}
            />
          </div>
        )}

        {/* Metrics Tables - Separate table for each AM when multiple selected */}
        {metrics.length > 0 && selectedAmNames.length === 1 && (
          <div>
            <MetricsTable metrics={metrics} showAmName={false} />
          </div>
        )}

        {/* Separate tables for each AM when multiple selected */}
        {metrics.length > 0 && selectedAmNames.length > 1 && (
          <div className="space-y-8">
            {Object.entries(metricsByAm)
              .sort(([amIdA], [amIdB]) => parseInt(amIdA, 10) - parseInt(amIdB, 10))
              .map(([amId, amMetrics]) => {
                const amName = amMetrics[0]?.amName || `AM ${amId}`;
                const amEmail = accountManagers.find(
                  (am) => am.id === parseInt(amId, 10)
                )?.email || "";

                return (
                  <div key={amId} className="space-y-2">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-t-lg px-6 py-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {amName}
                      </h3>
                      {amEmail && (
                        <p className="text-sm text-gray-600 mt-1">{amEmail}</p>
                      )}
                    </div>
                    <MetricsTable metrics={amMetrics} showAmName={false} />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
