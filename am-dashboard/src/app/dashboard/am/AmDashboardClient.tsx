"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/formatters";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils"; // shadcn creates this for you

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

interface AccountManager {
  id: number;
  name: string;
  email: string;
}

interface AmDashboardClientProps {
  userRole: "AM" | "MANAGEMENT";
  userEmail: string | null;
  userName: string | null;
  initialAccountManagerId: number | null;
  accountManagers?: AccountManager[];
  initialMetrics?: MetricMonthly[];
}

const COLORS = {
  netRetention: "#3b82f6",
  grossRetention: "#10b981",
  renewalPremium: "#8b5cf6",
  lostPremium: "#ef4444",
  newBizPremium: "#f59e0b",
};

function Delta({
  value,
  format = (n: number) => n.toString(),
  positiveIsGood = true,
}: {
  value: number;
  format?: (n: number) => string;
  positiveIsGood?: boolean;
}) {
  const isPositive = value >= 0;
  const good = positiveIsGood ? isPositive : !isPositive;

  return (
    <span className={cn("text-xs font-semibold", good ? "text-emerald-700" : "text-rose-700")}>
      {isPositive ? "+" : ""}
      {format(value)} vs prior month
    </span>
  );
}

export default function AmDashboardClient({
  userRole,
  userEmail,
  userName,
  initialAccountManagerId,
  accountManagers = [],
  initialMetrics = [],
}: AmDashboardClientProps) {
  const [selectedAccountManagerId, setSelectedAccountManagerId] = useState<number | null>(
    initialAccountManagerId
  );
  const [metrics, setMetrics] = useState<MetricMonthly[]>(initialMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startMonth, setStartMonth] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");

  const availableMonths = useMemo(() => {
    return [...new Set(metrics.map((m) => m.month))].sort();
  }, [metrics]);

  useEffect(() => {
    if (userRole === "MANAGEMENT" && selectedAccountManagerId) {
      fetchMetrics(selectedAccountManagerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountManagerId, userRole]);

  const fetchMetrics = async (accountManagerId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/metrics?accountManagerId=${accountManagerId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch metrics");
      }

      setMetrics(data?.metrics || []);
      setStartMonth("");
      setEndMonth("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = useMemo(() => {
    if (startMonth === "" && endMonth === "") return metrics;

    return metrics.filter((m) => {
      if (startMonth !== "" && m.month < startMonth) return false;
      if (endMonth !== "" && m.month > endMonth) return false;
      return true;
    });
  }, [metrics, startMonth, endMonth]);

  const latestMetrics = filteredMetrics.length ? filteredMetrics[filteredMetrics.length - 1] : null;
  const prevMetrics = filteredMetrics.length > 1 ? filteredMetrics[filteredMetrics.length - 2] : null;

  const deltas = useMemo(() => {
    if (!latestMetrics || !prevMetrics) return null;
    return {
      netRetention: latestMetrics.netRetention - prevMetrics.netRetention,
      grossRetention: latestMetrics.grossRetention - prevMetrics.grossRetention,
      renewalPremium: latestMetrics.renewalPremium - prevMetrics.renewalPremium,
      lostPremium: latestMetrics.lostPremium - prevMetrics.lostPremium,
      newBizPremium: latestMetrics.newBizPremium - prevMetrics.newBizPremium,
      policyEnd: latestMetrics.policyCountEnd - prevMetrics.policyCountEnd,
    };
  }, [latestMetrics, prevMetrics]);

  const chartData = useMemo(
    () =>
      filteredMetrics.map((m) => ({
        month: m.month,
        netRetention: m.netRetention,
        grossRetention: m.grossRetention,
      })),
    [filteredMetrics]
  );

  const pieChartData = useMemo(() => {
    if (!latestMetrics) return [];
    return [
      { name: "Net Retention", value: latestMetrics.netRetention, color: COLORS.netRetention },
      { name: "Gross Retention", value: latestMetrics.grossRetention, color: COLORS.grossRetention },
    ];
  }, [latestMetrics]);

  const roleBadgeVariant = userRole === "MANAGEMENT" ? "secondary" : "default";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl sm:text-3xl">AM Dashboard</CardTitle>
              <CardDescription>
                {userName ? `Welcome back, ${userName}.` : "Monthly retention & premium performance."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {userEmail && (
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{userEmail}</div>
                  <div className="text-xs text-muted-foreground">Signed in</div>
                </div>
              )}
              <Badge variant={roleBadgeVariant}>{userRole}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Sticky Filters */}
        <div className="sticky top-0 z-10 mb-6 rounded-xl border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                {userRole === "MANAGEMENT" && (
                  <div className="min-w-[260px]">
                    <div className="mb-2 text-sm font-semibold">Account Manager</div>
                    <Select
                      value={selectedAccountManagerId ? String(selectedAccountManagerId) : ""}
                      onValueChange={(val) => setSelectedAccountManagerId(val ? Number(val) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountManagers.map((am) => (
                          <SelectItem key={am.id} value={String(am.id)}>
                            {am.name} ({am.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {metrics.length > 0 && (
                  <>
                    <div className="min-w-[160px]">
                      <div className="mb-2 text-sm font-semibold">Start</div>
                      <Select value={startMonth} onValueChange={setStartMonth}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="All (Start)" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">All</SelectItem>
    {availableMonths.map((m) => (
      <SelectItem key={m} value={m}>
        {m}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

                    </div>

                    <div className="min-w-[160px]">
                      <div className="mb-2 text-sm font-semibold">End</div>
                      <Select value={endMonth} onValueChange={(v) => setEndMonth(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {availableMonths.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-6">
                      <Badge variant="outline">
                        Showing {filteredMetrics.length}/{metrics.length} months
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartMonth("");
                    setEndMonth("");
                  }}
                  disabled={startMonth === "" && endMonth === ""}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading metrics…</CardTitle>
                <CardDescription>Fetching the latest data for your selection.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Charts</CardTitle>
                <CardDescription>Preparing visuals…</CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[380px] w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && error && (
          <Card className="border-rose-200 bg-rose-50">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription className="text-rose-700">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-rose-800">
                Try changing the Account Manager or refreshing the page.
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && metrics.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No metrics to display</CardTitle>
              <CardDescription>
                {userRole === "MANAGEMENT" && !selectedAccountManagerId
                  ? "Select an Account Manager to load metrics."
                  : "No records were found for this Account Manager."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                If you believe this is incorrect, confirm the data exists for the selected month range.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main */}
        {!loading && !error && latestMetrics && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm">Net Retention</CardTitle>
                    <CardDescription>Latest: {latestMetrics.month}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold">{formatPercent(latestMetrics.netRetention)}</div>
                    {deltas && (
                      <div className="mt-2">
                        <Delta value={deltas.netRetention} format={(n) => formatPercent(n)} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm">Gross Retention</CardTitle>
                    <CardDescription>Latest: {latestMetrics.month}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold">{formatPercent(latestMetrics.grossRetention)}</div>
                    {deltas && (
                      <div className="mt-2">
                        <Delta value={deltas.grossRetention} format={(n) => formatPercent(n)} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm">Renewal Premium</CardTitle>
                    <CardDescription>Latest: {latestMetrics.month}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold">{formatCurrency(latestMetrics.renewalPremium)}</div>
                    {deltas && (
                      <div className="mt-2">
                        <Delta value={deltas.renewalPremium} format={(n) => formatCurrency(n)} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm">Lost Premium</CardTitle>
                    <CardDescription>Latest: {latestMetrics.month}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold">{formatCurrency(latestMetrics.lostPremium)}</div>
                    {deltas && (
                      <div className="mt-2">
                        <Delta
                          value={deltas.lostPremium}
                          format={(n) => formatCurrency(n)}
                          positiveIsGood={false}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm">New Biz Premium</CardTitle>
                    <CardDescription>Latest: {latestMetrics.month}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold">{formatCurrency(latestMetrics.newBizPremium)}</div>
                    {deltas && (
                      <div className="mt-2">
                        <Delta value={deltas.newBizPremium} format={(n) => formatCurrency(n)} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm">Policy Count</CardTitle>
                    <CardDescription>Latest: {latestMetrics.month}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-extrabold">
                      {latestMetrics.policyCountStart} → {latestMetrics.policyCountEnd}
                    </div>
                    {deltas && (
                      <div className="mt-2">
                        <Delta value={deltas.policyEnd} format={(n) => `${n}`} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Retention Breakdown</CardTitle>
                  <CardDescription>Latest month snapshot</CardDescription>
                </CardHeader>
                <CardContent className="h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${formatPercent(value)}`}
                        outerRadius={130}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          value !== undefined ? formatPercent(value) : ""
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends */}
            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Retention Trends</CardTitle>
                  <CardDescription>Net vs Gross retention over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[440px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" angle={-35} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          value !== undefined ? formatPercent(value) : ""
                        }
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="netRetention"
                        stroke={COLORS.netRetention}
                        strokeWidth={3}
                        name="Net Retention"
                        dot={{ r: 4, fill: COLORS.netRetention }}
                      />
                      <Line
                        type="monotone"
                        dataKey="grossRetention"
                        stroke={COLORS.grossRetention}
                        strokeWidth={3}
                        name="Gross Retention"
                        dot={{ r: 4, fill: COLORS.grossRetention }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Table */}
            <TabsContent value="table" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Monthly Metrics</CardTitle>
                    <CardDescription>Detailed records</CardDescription>
                  </div>
                  <Badge variant="outline">{filteredMetrics.length} rows</Badge>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-xs font-semibold text-muted-foreground">
                          <th className="px-4 py-3 text-left">Month</th>
                          <th className="px-4 py-3 text-right">Net %</th>
                          <th className="px-4 py-3 text-right">Gross %</th>
                          <th className="px-4 py-3 text-right">Renewal</th>
                          <th className="px-4 py-3 text-right">Lost</th>
                          <th className="px-4 py-3 text-right">New Biz</th>
                          <th className="px-4 py-3 text-right">Policies (S→E)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMetrics.map((m, idx) => (
                          <tr
                            key={m.id}
                            className={cn(idx % 2 === 0 ? "bg-background" : "bg-muted/20")}
                          >
                            <td className="px-4 py-3 font-medium">{m.month}</td>
                            <td className="px-4 py-3 text-right">{formatPercent(m.netRetention)}</td>
                            <td className="px-4 py-3 text-right">{formatPercent(m.grossRetention)}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(m.renewalPremium)}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(m.lostPremium)}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(m.newBizPremium)}</td>
                            <td className="px-4 py-3 text-right">
                              {m.policyCountStart} → {m.policyCountEnd}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
