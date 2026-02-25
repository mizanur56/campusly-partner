import React from "react";

export default function SkeletonCourseCard() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 h-full w-full animate-pulse">
      <div className="space-y-1.5">
        <div className="h-[18px] sm:h-[20px] bg-neutral-200 rounded w-full"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full bg-neutral-200 border border-neutral-200" />
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="h-[16px] sm:h-[18px] bg-neutral-200 rounded w-3/4"></div>
          <div className="h-[12px] sm:h-[14px] bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-auto pt-2">
        <div className="h-[18px] sm:h-[20px] bg-neutral-200 rounded w-24"></div>
      </div>
    </div>
  );
}
