import React, { useCallback, useMemo } from "react";
import { useLazySearchCoursesQuery } from "../../redux/features/search/searchApi";
import { useAppDispatch } from "../../redux/features/hooks";
import { updateCoursesMeta } from "../../redux/features/search/searchMetaSlice";
import { useInfiniteScrollPagination } from "../../hooks/useInfiniteScrollPagination";
import { useGetCountriesQuery } from "../../redux/features/countries/countriesApi";
import { useGetCitiesQuery } from "../../redux/features/cities/citiesApi";
import { useGetUniversityCoursesQuery } from "../../redux/features/universityCourses/universityCoursesApi";
import { useGetStudyLevelsQuery } from "../../redux/features/studyLevels/studyLevelsApi";
import CourseList from "./CourseList";
import Spinner from "../common/Loading/Spinner";
import SkeletonCourseCard from "./SkeletonCourseCard";
import type { SearchCourseItem } from "../../data/searchResultsTypes";
import { transformSearchCourse } from "../../utils/searchTransform";
import { transformFiltersToApi } from "../../utils/transformFiltersToApi";
import type { FilterState } from "./StudyPreferenceFilters";

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
}: CoursesResultsViewProps) {
  const dispatch = useAppDispatch();
  const [triggerCoursesSearch] = useLazySearchCoursesQuery();

  const { data: countriesResponse } = useGetCountriesQuery({
    page: 1,
    limit: 100000,
  });
  const { data: citiesResponse } = useGetCitiesQuery({
    page: 1,
    limit: 10000000,
  });
  const { data: coursesResponse } = useGetUniversityCoursesQuery({
    page: 1,
    limit: 10000000,
  });
  const { data: studyLevelsResponse } = useGetStudyLevelsQuery({
    page: 1,
    limit: 100000,
  });

  const apiFilters = useMemo(() => {
    const filterFormData = transformToFilterFormData(filters);
    if (!filterFormData) return undefined;
    return transformFiltersToApi(
      filterFormData,
      searchQuery || "",
      countriesResponse,
      citiesResponse,
      coursesResponse,
      studyLevelsResponse,
    );
  }, [
    filters,
    searchQuery,
    countriesResponse,
    citiesResponse,
    coursesResponse,
    studyLevelsResponse,
  ]);

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
        price: course.tuition || "N/A",
        intake: course.startYear || undefined,
        duration: course.duration || undefined,
        startDates: course.startDates || course.startYear || undefined,
        campus: course.location || course.city || "TBA",
        modeOfStudy: "On Campus",
      })),
    [courses],
  );

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

  return (
    <div>
      <CourseList
        courses={transformedCourses}
        onStartApplication={onStartApplication}
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
