"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface MonthRangeFilterProps {
  availableMonths: string[];
}

export function MonthRangeFilter({ availableMonths }: MonthRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const startMonth = searchParams.get("start") || "";
  const endMonth = searchParams.get("end") || "";

  const updateFilter = (type: "start" | "end", value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }

    // If both are set, ensure start <= end
    if (type === "start" && endMonth && value > endMonth) {
      params.delete("end");
    }
    if (type === "end" && startMonth && value < startMonth) {
      params.delete("start");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-x-4">
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Month Range:
      </label>
      <select
        value={startMonth}
        onChange={(e) => updateFilter("start", e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <option value="">All (Start)</option>
        {availableMonths.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-500 whitespace-nowrap">to</span>
      <select
        value={endMonth}
        onChange={(e) => updateFilter("end", e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <option value="">All (End)</option>
        {availableMonths.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
}
