"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface AccountManager {
  id: number;
  name: string;
  email: string;
}

interface AmSelectorProps {
  accountManagers: AccountManager[];
}

export function AmSelector({ accountManagers }: AmSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get selected AM IDs from URL (can be multiple: ?amIds=1,2,3)
  const selectedAmIds = useMemo(() => {
    const amIdsParam = searchParams.get("amIds");
    if (!amIdsParam) return [];
    return amIdsParam.split(",").map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
  }, [searchParams]);

  const handleAmToggle = (amId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    let newSelectedIds: number[];
    if (selectedAmIds.includes(amId)) {
      // Remove from selection
      newSelectedIds = selectedAmIds.filter((id) => id !== amId);
    } else {
      // Add to selection
      newSelectedIds = [...selectedAmIds, amId];
    }

    if (newSelectedIds.length > 0) {
      params.set("amIds", newSelectedIds.join(","));
    } else {
      params.delete("amIds");
    }
    
    // Reset month filters when selection changes
    params.delete("start");
    params.delete("end");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSelectAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedAmIds.length === accountManagers.length) {
      // Deselect all
      params.delete("amIds");
    } else {
      // Select all
      const allIds = accountManagers.map((am) => am.id);
      params.set("amIds", allIds.join(","));
    }
    
    params.delete("start");
    params.delete("end");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const allSelected = selectedAmIds.length === accountManagers.length && accountManagers.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Select Account Managers (Multi-select):
        </label>
        <button
          onClick={handleSelectAll}
          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-white">
        {accountManagers.map((am) => {
          const isSelected = selectedAmIds.includes(am.id);
          return (
            <label
              key={am.id}
              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleAmToggle(am.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {am.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {am.email}
                </p>
              </div>
            </label>
          );
        })}
      </div>
      
      {selectedAmIds.length > 0 && (
        <p className="text-xs text-gray-600">
          {selectedAmIds.length} Account Manager{selectedAmIds.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
