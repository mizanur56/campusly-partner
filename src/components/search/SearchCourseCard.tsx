import React from "react";
import { Link } from "react-router-dom";
import type { SearchCourseItem } from "../../data/searchResultsTypes";
import { getApiImageUrl } from "../../utils/getApiImageUrl";

interface SearchCourseCardProps {
  course: SearchCourseItem;
  className?: string;
}

export default function SearchCourseCard({
  course,
  className = "",
}: SearchCourseCardProps) {
  const universitySlug = course?.universitySlug ?? "university";
  const courseSlug = course?.slug ?? course?.id ?? "course";
  const href = `/programs-schools/courses/${universitySlug}/${courseSlug}`;

  return (
    <Link
      to={href}
      className={`group flex flex-col gap-3 sm:gap-4 rounded-[24px] border border-neutral-100 bg-white p-4 md:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] h-full w-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] cursor-pointer ${className}`}
    >
      <h3 className="font-semibold text-neutral-900 text-[15px] sm:text-[16px] md:text-[17px] line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
        {course?.title ?? ""}
      </h3>
      <div className="flex items-center gap-3">
        {course?.image ? (
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50/80">
            <img
              src={getApiImageUrl(course?.image)}
              alt={course?.title ?? ""}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-400">
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <p className="text-[14px] sm:text-[15px] font-medium text-neutral-600 truncate">
            {course?.university ?? ""}
          </p>
          <p className="text-xs sm:text-sm font-normal text-neutral-400 truncate">
            {course?.location ?? ""}
          </p>
        </div>
      </div>
      <div className="mt-auto pt-3 border-t border-neutral-100">
        <p className="text-[15px] sm:text-[16px] font-semibold text-primary-600">
          {course?.tuition ?? ""}
        </p>
      </div>
    </Link>
  );
}
