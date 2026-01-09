import { formatCurrency, formatPercent } from "@/lib/formatters";

interface MetricCardProps {
  title: string;
  value: string | number;
  latestMonth: string;
  type: "percent" | "currency" | "count";
  color?: "blue" | "green" | "purple" | "red" | "amber" | "indigo";
}

const colorClasses = {
  blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
  green: "from-green-50 to-green-100 border-green-200 text-green-700",
  purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
  red: "from-red-50 to-red-100 border-red-200 text-red-700",
  amber: "from-amber-50 to-amber-100 border-amber-200 text-amber-700",
  indigo: "from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700",
};

export function MetricCard({
  title,
  value,
  latestMonth,
  type,
  color = "blue",
}: MetricCardProps) {
  const formattedValue =
    type === "percent"
      ? formatPercent(value as number)
      : type === "currency"
      ? formatCurrency(value as number)
      : value;

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg p-6 border-2 hover:shadow-xl transition-shadow`}
    >
      <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide opacity-90">
        {title}
      </h3>
      <p className="text-4xl font-bold mb-2">{formattedValue}</p>
      <p className="text-xs font-medium opacity-75">Latest: {latestMonth}</p>
    </div>
  );
}

