import React, { useCallback, useMemo, useEffect } from "react";
import {
  useLazySearchCoursesQuery,
  useGetFilterOptionsQuery,
} from "../../redux/features/search/searchApi";
import { useAppDispatch } from "../../redux/features/hooks";
import { updateCoursesMeta } from "../../redux/features/search/searchMetaSlice";
import { useInfiniteScrollPagination } from "../../hooks/useInfiniteScrollPagination";
import CourseList from "./CourseList";
import Spinner from "../common/Loading/Spinner";
import SkeletonCourseCard from "./SkeletonCourseCard";
import type { SearchCourseItem } from "../../data/searchResultsTypes";
import { transformSearchCourse } from "../../utils/searchTransform";
import { transformFiltersToApi } from "../../utils/transformFiltersToApi";
import type { FilterState } from "./StudyPreferenceFilters";
import { useNavigate } from "react-router-dom";

export interface CourseForApply {
  id: string;
  title: string;
  level: string;
  institution: { name: string; logo?: string; location: string };
  price: string;
  intake?: string;
  duration?: string;
  startDates?: string;
  campus?: string;
  modeOfStudy?: string;
}

type CoursesResultsViewProps = {
  searchQuery: string;
  filters?: FilterState;
  onStartApplication?: (course: CourseForApply) => void;
  appliedCourseIds?: string[];
};

const COURSES_LIMIT = 20;

const transformToFilterFormData = (filters?: FilterState) => {
  if (!filters) return null;
  return {
    destination: filters.studyDestination ? [filters.studyDestination] : [],
    city: [],
    studyLevel:
      Array.isArray(filters.studyLevel) && filters.studyLevel.length > 0
        ? filters.studyLevel
        : ["Any"],
    subject: filters.subjects || [],
    duration: Array.isArray(filters.duration) ? filters.duration : [],
    institution: filters.institution ? [filters.institution] : [],
    startYear:
      Array.isArray(filters.startYear) && filters.startYear.length > 0
        ? filters.startYear
        : ["Any"],
    startMonth: Array.isArray(filters.startMonth) ? filters.startMonth : [],
    minFee: filters.feeRange?.min?.toString() || "",
    maxFee: filters.feeRange?.max?.toString() || "",
  };
};

export default function CoursesResultsView({
  searchQuery,
  filters,
  onStartApplication,
  appliedCourseIds,
}: CoursesResultsViewProps) {
  const dispatch = useAppDispatch();
  const [triggerCoursesSearch] = useLazySearchCoursesQuery();
  const navigate = useNavigate();

  // Fetch all filter options from single endpoint
  const { data: filterOptionsResponse } = useGetFilterOptionsQuery();

  // Transform filter-options response into the format expected by transformFiltersToApi
  const apiResponsesForTransform = useMemo(() => {
    if (!filterOptionsResponse?.data) return null;

    const filterData = filterOptionsResponse.data;
    return {
      countriesResponse: {
        data: filterData.countries || [],
      },
      citiesResponse: {
        data:
          filterData.countries?.flatMap((c) =>
            (c.cities || []).map((city) => ({
              ...city,
              country: { name: c.name },
            })),
          ) || [],
      },
      coursesResponse: {
        data: filterData.courses || [],
      },
      universitiesResponse: {
        data: filterData.universities || [],
      },
      studyLevelsResponse: {
        data: filterData.studyLevels || [],
      },
    };
  }, [filterOptionsResponse?.data]);

  const apiFilters = useMemo(() => {
    const filterFormData = transformToFilterFormData(filters);
    if (!filterFormData || !apiResponsesForTransform) return undefined;
    return transformFiltersToApi(
      filterFormData,
      searchQuery || "",
      apiResponsesForTransform.countriesResponse,
      apiResponsesForTransform.citiesResponse,
      apiResponsesForTransform.coursesResponse,
      apiResponsesForTransform.studyLevelsResponse,
      apiResponsesForTransform.universitiesResponse,
    );
  }, [filters, searchQuery, apiResponsesForTransform]);

  const fetchCourses = useCallback(
    async (page: number) => {
      const result = await triggerCoursesSearch({
        searchTerm: searchQuery || "",
        page,
        limit: COURSES_LIMIT,
        filters: apiFilters
          ? { ...apiFilters, page, limit: COURSES_LIMIT }
          : undefined,
      }).unwrap();

      if (result?.data && result?.meta) {
        if (page === 1) {
          dispatch(updateCoursesMeta(result.meta));
        }
        return {
          data: result.data.map(transformSearchCourse),
          meta: result.meta,
        };
      }
      return undefined;
    },
    [searchQuery, triggerCoursesSearch, apiFilters, dispatch],
  );

  const filtersKey = useMemo(
    () => (apiFilters ? JSON.stringify(apiFilters) : ""),
    [apiFilters],
  );

  const {
    data: courses,
    isLoading,
    isLoadingMore,
    hasMore,
    sentinelRef,
  } = useInfiniteScrollPagination<SearchCourseItem>({
    searchQuery: searchQuery || "",
    fetchFn: fetchCourses,
    limit: COURSES_LIMIT,
    filtersKey,
  });

  const transformedCourses = useMemo(
    (): CourseForApply[] =>
      courses.map((course) => ({
        id: course.id,
        title: course.title,
        level: course.studyLevel || "N/A",
        institution: {
          name: course.university || "N/A",
          location: course.location || "N/A",
          logo: course.image,
        },
        slug: course.slug,
        universitySlug: course.universitySlug,
        price: course.tuition || "N/A",
        intake: course.startYear || undefined,
        duration: course.duration || undefined,
        startDates: course.startDates || course.startYear || undefined,
        campus: course.location || course.city || "TBA",
        modeOfStudy: "On Campus",
      })),
    [courses],
  );

  // Scroll to top only when initial results load (not on every filter change)
  useEffect(() => {
    if (!isLoading && courses.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [filtersKey, isLoading, courses.length]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCourseCard key={`skeleton-course-${index}`} />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No courses found
        </h3>
        <p className="text-base text-gray-500">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  const handleViewDetails = (
    course: any,
    slug?: string,
    universitySlug?: string,
  ) => {
    const courseId = course?.id;
    // Find the full course details from the courses array
    const fullCourse = courses.find((course) => course.id === courseId);

    if (fullCourse) {
      console.log("Full course details:", fullCourse);

      // Navigate to course details page if slug and universitySlug are available
      const finalSlug = slug || fullCourse.slug;
      const finalUniversitySlug = universitySlug || fullCourse.universitySlug;

      if (finalUniversitySlug && finalSlug) {
        navigate(
          `/programs-schools/courses/${finalUniversitySlug}/${finalSlug}`,
        );
      } else {
        console.warn(
          "Course slug or university slug missing for course:",
          courseId,
          fullCourse,
        );
      }
    } else {
      console.warn("Course not found:", courseId);
    }
  };

  return (
    <div>
      <CourseList
        courses={transformedCourses}
        onStartApplication={onStartApplication}
        onViewDetails={handleViewDetails}
        appliedCourseIds={appliedCourseIds}
      />
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-8"
        >
          {isLoadingMore && <Spinner />}
        </div>
      )}
    </div>
  );
}
