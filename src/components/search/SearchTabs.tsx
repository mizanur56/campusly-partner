import React from "react";
import type { SearchTabItem } from "../../data/searchResultsTypes";

interface SearchTabsProps {
  tabs: SearchTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function SearchTabs({
  tabs,
  activeTab,
  onTabChange,
}: SearchTabsProps) {
  const selectedTab =
    activeTab || tabs.find((tab) => tab.isPrimary)?.id || tabs[0]?.id || "";

  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="flex gap-4 sm:gap-5 overflow-x-auto sm:overflow-x-visible scrollbar-hide w-full">
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-[50px] font-[600] text-[16px] sm:text-[18px] transition-all duration-200 shrink-0 ${
              isSelected
                ? "bg-[#E9F2EB] text-[#237D3B]"
                : "bg-neutral-50 text-neutral-500 hover:bg-[#E5E7EB]"
            }`}
          >
            <span className="whitespace-nowrap">
              {tab.count} {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
