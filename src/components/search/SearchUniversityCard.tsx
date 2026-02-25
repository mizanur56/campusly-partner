import React from "react";
import { Link } from "react-router-dom";
import type { SearchUniversityItem } from "../../data/searchResultsTypes";
import { getApiImageUrl } from "../../utils/getApiImageUrl";

interface SearchUniversityCardProps {
  university: SearchUniversityItem;
  className?: string;
}

export default function SearchUniversityCard({
  university,
  className = "",
}: SearchUniversityCardProps) {
  const slug = university?.slug ?? university?.id ?? "university";
  const href = `/programs-schools/universities/${slug}`;

  return (
    <Link
      to={href}
      className={`group flex flex-col items-start gap-3 sm:gap-4 rounded-[24px] border border-neutral-100 bg-white p-4 md:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] h-full w-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${className}`}
    >
      {university?.image ? (
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50/80">
          <img
            src={getApiImageUrl(university?.image)}
            alt={university?.name ?? ""}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-400">
          <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      )}
      <div className="flex flex-col gap-1 min-w-0 w-full flex-1">
        <h3 className="text-[15px] sm:text-[16px] md:text-[17px] font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
          {university?.name ?? ""}
        </h3>
        <p className="text-[13px] sm:text-[14px] text-neutral-500 font-normal truncate">
          {university?.location ?? ""}
        </p>
      </div>
    </Link>
  );
}
