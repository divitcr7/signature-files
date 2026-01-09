import { formatCurrency, formatPercent } from "@/lib/formatters";

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
  amName?: string;
}

interface MetricsTableProps {
  metrics: MetricMonthly[];
  showAmName?: boolean;
}

export function MetricsTable({ metrics, showAmName = false }: MetricsTableProps) {
  if (metrics.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <p className="text-center text-gray-500 text-lg">
          No metrics found for the selected range
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Monthly Metrics</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showAmName && (
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Account Manager
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Net Retention
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Gross Retention
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Renewal Premium
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Lost Premium
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                New Biz Premium
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Policies Start
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Policies End
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metrics.map((metric, index) => (
              <tr
                key={metric.id}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {showAmName && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                    {metric.amName || "N/A"}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {metric.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700 text-right">
                  {formatPercent(metric.netRetention)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700 text-right">
                  {formatPercent(metric.grossRetention)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-700 text-right">
                  {formatCurrency(metric.renewalPremium)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-700 text-right">
                  {formatCurrency(metric.lostPremium)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-amber-700 text-right">
                  {formatCurrency(metric.newBizPremium)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 text-right">
                  {metric.policyCountStart}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 text-right">
                  {metric.policyCountEnd}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
