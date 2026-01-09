import { formatCurrency, formatPercent } from "@/lib/formatters";

interface KpiCardProps {
  title: string;
  value: string | number;
  latestMonth: string;
  type: "percent" | "currency" | "count";
}

export function KpiCard({
  title,
  value,
  latestMonth,
  type,
}: KpiCardProps) {
  const formattedValue =
    type === "percent"
      ? formatPercent(value as number)
      : type === "currency"
      ? formatCurrency(value as number)
      : value;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow w-full">
      <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
        {title}
      </p>
      <p className="text-5xl font-bold text-gray-900 mb-2 leading-none">
        {formattedValue}
      </p>
      <p className="text-xs text-gray-500 mt-4">Latest: {latestMonth}</p>
    </div>
  );
}
