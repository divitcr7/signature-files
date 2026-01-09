"use client";

import { useMemo, Suspense } from "react";
import { UserInfoCard } from "./components/UserInfoCard";
import { MonthRangeFilter } from "./components/MonthRangeFilter";
import { KpiCard } from "./components/KpiCard";
import { RetentionChart } from "./components/RetentionChart";
import { MetricsTable } from "./components/MetricsTable";

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
}

interface AmDashboardProps {
  user: {
    name: string | null;
    email: string | null;
    role: "AM" | "MANAGEMENT";
  };
  metrics: MetricMonthly[];
  availableMonths: string[];
}

export function AmDashboard({
  user,
  metrics,
  availableMonths,
}: AmDashboardProps) {
  // Get latest month metrics for KPI cards
  const latestMetrics = useMemo(() => {
    if (metrics.length === 0) return null;
    return metrics[metrics.length - 1];
  }, [metrics]);

  // Prepare chart data
  const chartData = useMemo(
    () =>
      metrics.map((metric) => ({
        month: metric.month,
        netRetention: metric.netRetention,
        grossRetention: metric.grossRetention,
      })),
    [metrics]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Header Row - HORIZONTAL */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            AM Dashboard
          </h1>
          <UserInfoCard name={user.name} email={user.email} role={user.role} />
        </div>

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

        {/* KPI Section - HORIZONTAL GRID */}
        {latestMetrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
            <KpiCard
              title="Net Retention"
              value={latestMetrics.netRetention}
              latestMonth={latestMetrics.month}
              type="percent"
            />
            <KpiCard
              title="Gross Retention"
              value={latestMetrics.grossRetention}
              latestMonth={latestMetrics.month}
              type="percent"
            />
            <KpiCard
              title="Renewal Premium"
              value={latestMetrics.renewalPremium}
              latestMonth={latestMetrics.month}
              type="currency"
            />
            <KpiCard
              title="Lost Premium"
              value={latestMetrics.lostPremium}
              latestMonth={latestMetrics.month}
              type="currency"
            />
            <KpiCard
              title="New Biz Premium"
              value={latestMetrics.newBizPremium}
              latestMonth={latestMetrics.month}
              type="currency"
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
            <p className="text-center text-gray-500 text-lg">
              No metrics found for the selected range
            </p>
          </div>
        )}

        {/* Retention Chart */}
        {metrics.length > 0 && (
          <div>
            <RetentionChart data={chartData} />
          </div>
        )}

        {/* Metrics Table */}
        {metrics.length > 0 && (
          <div>
            <MetricsTable metrics={metrics} />
          </div>
        )}
      </div>
    </div>
  );
}
