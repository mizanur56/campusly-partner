import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLazyUnifiedSearchQuery } from "../../redux/features/search/searchApi";
import { useAppDispatch } from "../../redux/features/hooks";
import { updateUnifiedMeta } from "../../redux/features/search/searchMetaSlice";
import SearchCourseCard from "./SearchCourseCard";
import SearchSectionHeader from "./SearchSectionHeader";
import SearchUniversityCard from "./SearchUniversityCard";
import SearchNotFound from "./SearchNotFound";
import LoadingState from "./LoadingState";
import ResultsGrid from "./ResultsGrid";
import {
  ALL_RESULTS_CONTAINER_CLASSES,
  SECTION_SPACING_CLASSES,
  getUniversityKey,
} from "../../utils/searchResultsHelpers";
import type {
  SearchCourseItem,
  SearchUniversityItem,
} from "../../data/searchResultsTypes";
import {
  transformSearchCourse,
  transformSearchUniversity,
} from "../../utils/searchTransform";
import type { ApiSearchParams } from "../../utils/transformFiltersToApi";

type AllResultsViewProps = {
  searchQuery: string;
  filters?: ApiSearchParams;
};

export default function AllResultsView({
  searchQuery,
  filters,
}: AllResultsViewProps) {
  const dispatch = useAppDispatch();
  const [courses, setCourses] = useState<SearchCourseItem[]>([]);
  const [universities, setUniversities] = useState<SearchUniversityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [triggerSearch] = useLazyUnifiedSearchQuery();
  const filtersKey = useMemo(
    () => (filters ? JSON.stringify(filters) : ""),
    [filters]
  );
  const prevFiltersKeyRef = useRef<string | null>(null);
  const prevSearchQueryRef = useRef<string | null>(null);

  useEffect(() => {
    const isSameQuery = prevSearchQueryRef.current === searchQuery;
    const isSameFilters = prevFiltersKeyRef.current === filtersKey;
    if (isSameQuery && isSameFilters) return;

    prevSearchQueryRef.current = searchQuery;
    prevFiltersKeyRef.current = filtersKey;
    setIsLoading(true);

    triggerSearch({ searchTerm: searchQuery, filters })
      .unwrap()
      .then((result) => {
        const results = result?.data;
        if (results) {
          if (results.courses?.data) {
            setCourses(results.courses.data.map(transformSearchCourse));
          } else setCourses([]);
          if (results.universities?.data) {
            setUniversities(
              results.universities.data.map(transformSearchUniversity)
            );
          } else setUniversities([]);
          dispatch(
            updateUnifiedMeta({
              courses: results.courses?.meta?.total ?? 0,
              universities: results.universities?.meta?.total ?? 0,
            })
          );
        } else {
          setCourses([]);
          setUniversities([]);
        }
      })
      .catch(() => {
        setCourses([]);
        setUniversities([]);
      })
      .finally(() => setIsLoading(false));
  }, [searchQuery, filtersKey, triggerSearch, dispatch, filters]);

  if (isLoading) {
    return <LoadingState type="all" count={3} />;
  }

  const hasAnyResults = courses.length > 0 || universities.length > 0;
  if (!hasAnyResults) {
    return <SearchNotFound searchQuery={searchQuery} />;
  }

  return (
    <div className={ALL_RESULTS_CONTAINER_CLASSES}>
      {courses.length > 0 && (
        <section className={SECTION_SPACING_CLASSES}>
          <SearchSectionHeader
            title="Courses"
            image="/icons/lucide_graduation-cap.svg"
          />
          <ResultsGrid>
            {courses.map((course) => (
              <div key={course.id}>
                <SearchCourseCard course={course} />
              </div>
            ))}
          </ResultsGrid>
        </section>
      )}
      {universities.length > 0 && (
        <section className={SECTION_SPACING_CLASSES}>
          <SearchSectionHeader
            title="Universities"
            image="/icons/hugeicons_university.svg"
          />
          <ResultsGrid>
            {universities.map((university) => (
              <div key={getUniversityKey(university)}>
                <SearchUniversityCard university={university} />
              </div>
            ))}
          </ResultsGrid>
        </section>
      )}
    </div>
  );
}
