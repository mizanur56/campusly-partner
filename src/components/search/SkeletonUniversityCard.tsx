import React from "react";

export default function SkeletonUniversityCard() {
  return (
    <div className="flex flex-col items-start gap-3 sm:gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 h-full w-full animate-pulse">
      <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full bg-neutral-200 border border-neutral-200" />
      <div className="flex flex-col gap-1.5 min-w-0 w-full flex-1">
        <div className="space-y-1.5">
          <div className="h-[18px] sm:h-[20px] bg-neutral-200 rounded w-full"></div>
          <div className="h-[18px] sm:h-[20px] bg-neutral-200 rounded w-3/4"></div>
        </div>
        <div className="h-[14px] sm:h-[16px] bg-neutral-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}
