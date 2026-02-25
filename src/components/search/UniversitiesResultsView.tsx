import React, { useState, useEffect, useMemo } from "react";
import { useLazySearchUniversitiesQuery } from "../../redux/features/search/searchApi";
import { useAppDispatch } from "../../redux/features/hooks";
import { updateUniversitiesMeta } from "../../redux/features/search/searchMetaSlice";
import SearchUniversityCard from "./SearchUniversityCard";
import SearchSectionHeader from "./SearchSectionHeader";
import SearchNotFound from "./SearchNotFound";
import LoadingState from "./LoadingState";
import ResultsGrid from "./ResultsGrid";
import {
  SECTION_SPACING_CLASSES,
  getUniversityKey,
} from "../../utils/searchResultsHelpers";
import type { SearchUniversityItem } from "../../data/searchResultsTypes";
import { transformSearchUniversity } from "../../utils/searchTransform";
import type { ApiSearchParams } from "../../utils/transformFiltersToApi";

type UniversitiesResultsViewProps = {
  searchQuery: string;
  filters?: ApiSearchParams;
};

export default function UniversitiesResultsView({
  searchQuery,
  filters,
}: UniversitiesResultsViewProps) {
  const dispatch = useAppDispatch();
  const [universities, setUniversities] = useState<SearchUniversityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerUniversitiesSearch] = useLazySearchUniversitiesQuery();

  const filtersKey = useMemo(
    () => (filters ? JSON.stringify(filters) : ""),
    [filters]
  );

  useEffect(() => {
    setIsLoading(true);
    triggerUniversitiesSearch({
      searchTerm: searchQuery,
      page: 1,
      limit: 15,
      filters: filters ? { ...filters, page: 1, limit: 15 } : undefined,
    })
      .unwrap()
      .then((result) => {
        if (result?.data && result?.meta) {
          setUniversities(result.data.map(transformSearchUniversity));
          dispatch(updateUniversitiesMeta(result.meta));
        } else setUniversities([]);
      })
      .catch(() => setUniversities([]))
      .finally(() => setIsLoading(false));
  }, [searchQuery, filtersKey, triggerUniversitiesSearch, dispatch, filters]);

  if (isLoading) {
    return (
      <section className={SECTION_SPACING_CLASSES}>
        <SearchSectionHeader
          title="Universities"
          image="/icons/hugeicons_university.svg"
        />
        <LoadingState type="universities" count={6} />
      </section>
    );
  }

  if (universities.length === 0) {
    return <SearchNotFound searchQuery={searchQuery} />;
  }

  return (
    <section className={SECTION_SPACING_CLASSES}>
      <SearchSectionHeader
        title="Universities"
        image="/icons/hugeicons_university.svg"
      />
      <ResultsGrid>
        {universities.map((university) => (
          <SearchUniversityCard
            key={getUniversityKey(university)}
            university={university}
          />
        ))}
      </ResultsGrid>
    </section>
  );
}
