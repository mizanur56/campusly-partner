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
      className={`flex flex-col gap-3 sm:gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 h-full w-full transition-all duration-200 hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer ${className}`}
    >
      <h3 className="font-semibold text-neutral-900 text-[16px] sm:text-[17px] md:text-lg line-clamp-2 leading-snug">
        {course?.title ?? ""}
      </h3>
      <div className="flex items-center gap-3">
        {course?.image ? (
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
            <img
              src={getApiImageUrl(course?.image)}
              alt={course?.title ?? ""}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200" />
        )}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <p className="text-[15px] sm:text-[16px] font-medium text-neutral-600 truncate">
            {course?.university ?? ""}
          </p>
          <p className="text-xs sm:text-sm font-normal text-neutral-400 truncate">
            {course?.location ?? ""}
          </p>
        </div>
      </div>
      <div className="mt-auto text-[16px] sm:text-[17px] font-semibold text-primary-600 pt-2">
        {course?.tuition ?? ""}
      </div>
    </Link>
  );
}
