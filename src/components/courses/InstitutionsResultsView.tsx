import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLazySearchUniversitiesQuery } from "../../redux/features/search/searchApi";
import { useAppDispatch } from "../../redux/features/hooks";
import { updateUniversitiesMeta } from "../../redux/features/search/searchMetaSlice";
import { useInfiniteScrollPagination } from "../../hooks/useInfiniteScrollPagination";
import { useGetCountriesQuery } from "../../redux/features/countries/countriesApi";
import { useGetCitiesQuery } from "../../redux/features/cities/citiesApi";
import { useGetUniversityCoursesQuery } from "../../redux/features/universityCourses/universityCoursesApi";
import { useGetStudyLevelsQuery } from "../../redux/features/studyLevels/studyLevelsApi";
import Spinner from "../common/Loading/Spinner";
import SkeletonInstitutionCard from "./SkeletonInstitutionCard";
import type { SearchUniversityItem } from "../../data/searchResultsTypes";
import { transformSearchUniversity } from "../../utils/searchTransform";
import { transformFiltersToApi } from "../../utils/transformFiltersToApi";
import type { FilterState } from "./StudyPreferenceFilters";

type InstitutionsResultsViewProps = {
  searchQuery: string;
  filters?: FilterState;
};

const INSTITUTIONS_LIMIT = 15;

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

export default function InstitutionsResultsView({
  searchQuery,
  filters,
}: InstitutionsResultsViewProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [triggerUniversitiesSearch] = useLazySearchUniversitiesQuery();

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

  const fetchUniversities = useCallback(
    async (page: number) => {
      const result = await triggerUniversitiesSearch({
        searchTerm: searchQuery || "",
        page,
        limit: INSTITUTIONS_LIMIT,
        filters: apiFilters
          ? { ...apiFilters, page, limit: INSTITUTIONS_LIMIT }
          : undefined,
      }).unwrap();

      if (result?.data && result?.meta) {
        if (page === 1) {
          dispatch(updateUniversitiesMeta(result.meta));
        }
        return {
          data: result.data.map(transformSearchUniversity),
          meta: result.meta,
        };
      }
      return undefined;
    },
    [searchQuery, triggerUniversitiesSearch, apiFilters, dispatch],
  );

  const filtersKey = useMemo(
    () => (apiFilters ? JSON.stringify(apiFilters) : ""),
    [apiFilters],
  );

  const {
    data: universities,
    isLoading,
    isLoadingMore,
    hasMore,
    sentinelRef,
  } = useInfiniteScrollPagination<SearchUniversityItem>({
    searchQuery: searchQuery || "",
    fetchFn: fetchUniversities,
    limit: INSTITUTIONS_LIMIT,
    filtersKey,
  });

  const handleViewDetails = (universityId: string) => {
    const university = universities.find((u) => u.id === universityId);
    if (university?.slug) {
      navigate(`/programs-schools/universities/${university.slug}`);
    }
  };

  const handleViewCourses = (universityId: string) => {
    const university = universities.find((u) => u.id === universityId);
    if (university?.slug) {
      navigate(`/programs-schools?tab=courses&university=${university.slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonInstitutionCard key={`skeleton-institution-${index}`} />
        ))}
      </div>
    );
  }

  if (universities.length === 0) {
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No institutions found
        </h3>
        <p className="text-base text-gray-500">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {universities.map((university) => (
        <div
          key={university.id}
          className="bg-white border border-neutral-100 rounded-xl p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-gray-100">
                {university.image ? (
                  <img
                    src={university.image}
                    alt={university.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {university.name}
              </h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {university.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {university.location}
                  </div>
                )}
                {university.city && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {university.city}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewDetails(university.id)}
                  className="h-9 px-3.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleViewCourses(university.id)}
                  className="h-9 px-3.5 rounded-lg text-sm font-medium border border-primary-500 text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  View Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
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
