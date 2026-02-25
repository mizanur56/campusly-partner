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
      className={`flex flex-col items-start gap-3 sm:gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 h-full w-full transition-all duration-200 hover:border-primary-200 hover:bg-primary-50/30 ${className}`}
    >
      {university?.image ? (
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
          <img
            src={getApiImageUrl(university?.image)}
            alt={university?.name ?? ""}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200" />
      )}
      <div className="flex flex-col gap-1.5 min-w-0 w-full flex-1">
        <h3 className="text-[16px] sm:text-[17px] md:text-lg font-semibold text-neutral-900 line-clamp-2 leading-snug">
          {university?.name ?? ""}
        </h3>
        <p className="text-[14px] sm:text-[15px] text-neutral-500 font-normal">
          {university?.location ?? ""}
        </p>
      </div>
    </Link>
  );
}
