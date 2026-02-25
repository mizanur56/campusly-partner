import React, { useState, useEffect, useMemo } from "react";
import { useLazySearchCoursesQuery } from "../../redux/features/search/searchApi";
import { useAppDispatch } from "../../redux/features/hooks";
import { updateCoursesMeta } from "../../redux/features/search/searchMetaSlice";
import SearchCourseCard from "./SearchCourseCard";
import SearchSectionHeader from "./SearchSectionHeader";
import SearchNotFound from "./SearchNotFound";
import LoadingState from "./LoadingState";
import ResultsGrid from "./ResultsGrid";
import { SECTION_SPACING_CLASSES } from "../../utils/searchResultsHelpers";
import type { SearchCourseItem } from "../../data/searchResultsTypes";
import { transformSearchCourse } from "../../utils/searchTransform";
import type { ApiSearchParams } from "../../utils/transformFiltersToApi";

type CoursesResultsViewProps = {
  searchQuery: string;
  filters?: ApiSearchParams;
};

export default function CoursesResultsView({
  searchQuery,
  filters,
}: CoursesResultsViewProps) {
  const dispatch = useAppDispatch();
  const [courses, setCourses] = useState<SearchCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerCoursesSearch] = useLazySearchCoursesQuery();

  const filtersKey = useMemo(
    () => (filters ? JSON.stringify(filters) : ""),
    [filters]
  );

  useEffect(() => {
    setIsLoading(true);
    triggerCoursesSearch({
      searchTerm: searchQuery,
      page: 1,
      limit: 20,
      filters: filters ? { ...filters, page: 1, limit: 20 } : undefined,
    })
      .unwrap()
      .then((result) => {
        if (result?.data && result?.meta) {
          setCourses(result.data.map(transformSearchCourse));
          dispatch(updateCoursesMeta(result.meta));
        } else setCourses([]);
      })
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  }, [searchQuery, filtersKey, triggerCoursesSearch, dispatch, filters]);

  if (isLoading) {
    return (
      <section className={SECTION_SPACING_CLASSES}>
        <SearchSectionHeader
          title="Courses"
          image="/icons/lucide_graduation-cap.svg"
        />
        <LoadingState type="courses" count={6} />
      </section>
    );
  }

  if (courses.length === 0) {
    return <SearchNotFound searchQuery={searchQuery} />;
  }

  return (
    <section className={SECTION_SPACING_CLASSES}>
      <SearchSectionHeader
        title="Courses"
        image="/icons/lucide_graduation-cap.svg"
      />
      <ResultsGrid>
        {courses.map((course) => (
          <SearchCourseCard key={course.id} course={course} />
        ))}
      </ResultsGrid>
    </section>
  );
}
