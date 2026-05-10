import { useMemo } from "react";
import { useGetFilterOptionsQuery } from "../redux/features/search/searchApi";
import { buildFilterOptionsQueryArg } from "../utils/buildFilterOptionsQueryArg";
import type { FilterState } from "../components/courses/filterTypes";

/**
 * Single subscription to GET /search/filter-options (unscoped + scoped) for Programs Schools.
 * Used by the sidebar and course/university search so the endpoint is not hit redundantly.
 */
export function useProgramsSchoolFilterOptions(filters: FilterState) {
  const { data: baseFilterOptions, isLoading: isLoadingBaseFilterOptions } =
    useGetFilterOptionsQuery(undefined);

  const scopedFilterArg = useMemo(() => {
    if (filters.studyDestinationCountryId) {
      return { countryIds: [filters.studyDestinationCountryId] };
    }
    return buildFilterOptionsQueryArg(
      filters.studyDestination,
      baseFilterOptions?.data,
    );
  }, [
    filters.studyDestinationCountryId,
    filters.studyDestination,
    baseFilterOptions?.data,
  ]);

  const {
    currentData: scopedFilterCurrent,
    isFetching: isFetchingScopedFilterOptions,
  } = useGetFilterOptionsQuery(scopedFilterArg!, {
    skip: !scopedFilterArg,
  });

  const hasDestinationSelected = Boolean(
    filters.studyDestinationCountryId || filters.studyDestination?.trim(),
  );

  const filterOptionsResponse = useMemo(() => {
    if (!hasDestinationSelected) return baseFilterOptions;
    if (scopedFilterArg != null) return scopedFilterCurrent;
    return undefined;
  }, [
    hasDestinationSelected,
    scopedFilterArg,
    scopedFilterCurrent,
    baseFilterOptions,
  ]);

  const isLoadingFilterOptions =
    isLoadingBaseFilterOptions ||
    (!!scopedFilterArg &&
      isFetchingScopedFilterOptions &&
      scopedFilterCurrent === undefined);

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

  /**
   * Never mark ready until unscoped (and when needed, scoped) filter-options have been
   * merged into `apiResponsesForTransform`. If we allowed ready before base `/search/filter-options`
   * finishes, courses/institutions search ran with incomplete `apiFilters`, then refetched when
   * options arrived — double load on first paint.
   */
  const filtersReady = useMemo(
    () => apiResponsesForTransform != null,
    [apiResponsesForTransform],
  );

  return {
    baseFilterOptions,
    scopedFilterCurrent,
    scopedFilterArg,
    filterOptionsResponse,
    isLoadingFilterOptions,
    /** True only while the unscoped `/search/filter-options` call is in flight */
    isLoadingBaseFilterOptions,
    apiResponsesForTransform,
    filtersReady,
    hasDestinationSelected,
  };
}

export type ProgramsSchoolFilterOptionsBundle = ReturnType<
  typeof useProgramsSchoolFilterOptions
>;
