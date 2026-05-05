import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

import type { BreadcrumbItem } from "../../types/course";
import { cn } from "../../utils/cn";
import { toast } from "react-toastify";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGetMyAllApplicationsQuery } from "../../redux/features/application/applicationApi";

interface CourseDetailsHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  provider: {
    name: string;
    logo?: string;
    abbreviation?: string;
  };
  onFavorite?: () => void;
  onApply?: () => void;
  isFavorite?: boolean;
  universityCourseId?: string;
  className?: string;
}

export default function CourseDetailsHeader({
  breadcrumbs,
  title,
  provider,
  onFavorite,
  onApply,
  isFavorite = false,
  universityCourseId,
  className,
}: CourseDetailsHeaderProps) {
  return (
    <header className={cn("space-y-6", className)}>
      {/* <PageBreadcrumbs items={breadcrumbs} /> */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-3">
          <h1 className="text-[24px] sm:text-[28px] md:text-[30px] font-semibold text-neutral-900 leading-tight">
            {title}
          </h1>

          <div className="flex items-center gap-3">
            {provider.logo ? (
              <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-cover"
                />
              </div>
            ) : provider.abbreviation ? (
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200">
                <span className="text-xs sm:text-sm font-normal text-neutral-600">
                  {provider.abbreviation}
                </span>
              </div>
            ) : null}
            <p className="text-[15px] sm:text-[16px] md:text-[17px] font-normal text-neutral-600">
              {provider.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onApply}
            className="h-10 cursor-pointer sm:h-11 px-4 sm:px-6 text-sm sm:text-base font-semibold rounded-md bg-primary-500 hover:bg-primary-700 text-white transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>
    </header>
  );
}
