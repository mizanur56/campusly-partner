import { defaultSerializeQueryArgs } from "@reduxjs/toolkit/query";
import { baseApi } from "../../api/baseApi";
import type {
  UnifiedSearchApiResponse,
  SearchCoursesApiResponse,
  SearchUniversitiesApiResponse,
  SearchArticlesApiResponse,
} from "../../../types/search";
import type { FilterOptionsResponse } from "../../../types/filterOptions";
import type { ApiSearchParams } from "../../../utils/transformFiltersToApi";
import { buildSearchQueryString } from "../../../utils/transformFiltersToApi";
import type { GetFilterOptionsQueryArg } from "../../../utils/buildFilterOptionsQueryArg";

type SearchCoursesArgs = {
  searchTerm: string;
  page?: number;
  limit?: number;
  filters?: ApiSearchParams;
};

type SearchUniversitiesArgs = {
  searchTerm: string;
  page?: number;
  limit?: number;
  filters?: ApiSearchParams;
};

type SearchArticlesArgs = {
  searchTerm: string;
  page?: number;
  limit?: number;
  filters?: ApiSearchParams;
};

const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    unifiedSearch: builder.query<
      UnifiedSearchApiResponse,
      { searchTerm: string; filters?: ApiSearchParams }
    >({
      query: ({ searchTerm, filters }) => {
        const baseParams: ApiSearchParams = {
          searchTerm: searchTerm.trim(),
          ...filters,
        };
        const queryString = buildSearchQueryString(baseParams);
        return { url: `/search/unified?${queryString}` };
      },
      providesTags: ["search"],
    }),
    searchCourses: builder.query<SearchCoursesApiResponse, SearchCoursesArgs>({
      query: ({ searchTerm, page = 1, limit = 20, filters }) => {
        const baseParams: ApiSearchParams = {
          searchTerm: searchTerm.trim(),
          page,
          limit,
          ...filters,
        };
        const queryString = buildSearchQueryString(baseParams);
        return { url: `/search/courses?${queryString}` };
      },
      providesTags: ["search"],
    }),
    searchUniversities: builder.query<
      SearchUniversitiesApiResponse,
      SearchUniversitiesArgs
    >({
      query: ({ searchTerm, page = 1, limit = 15, filters }) => {
        const baseParams: ApiSearchParams = {
          searchTerm: searchTerm.trim(),
          page,
          limit,
          ...filters,
        };
        const queryString = buildSearchQueryString(baseParams);
        return { url: `/search/universities?${queryString}` };
      },
      providesTags: ["search"],
    }),
    searchArticles: builder.query<
      SearchArticlesApiResponse,
      SearchArticlesArgs
    >({
      query: ({ searchTerm, page = 1, limit = 10, filters }) => {
        const baseParams: ApiSearchParams = {
          searchTerm: searchTerm.trim(),
          page,
          limit,
          ...filters,
        };
        const queryString = buildSearchQueryString(baseParams);
        return { url: `/search/articles?${queryString}` };
      },
      providesTags: ["search"],
    }),
    getFilterOptions: builder.query<
      FilterOptionsResponse,
      GetFilterOptionsQueryArg | undefined
    >({
      query: (arg) => {
        const qs =
          arg?.countryIds?.length
            ? buildSearchQueryString({ countryIds: arg.countryIds })
            : "";
        return {
          url: qs ? `/search/filter-options?${qs}` : "/search/filter-options",
        };
      },
      /** Distinct cache entries: unscoped vs per-countryIds (avoids wrong reuse). */
      serializeQueryArgs: ({ queryArgs, endpointDefinition, endpointName }) => {
        if (queryArgs?.countryIds?.length) {
          const sorted = [...queryArgs.countryIds].sort().join(",");
          return `${endpointName}?countryIds=${sorted}`;
        }
        return defaultSerializeQueryArgs({
          queryArgs,
          endpointDefinition,
          endpointName,
        });
      },
      providesTags: ["search"],
    }),
  }),
});

export const {
  useLazyUnifiedSearchQuery,
  useLazySearchCoursesQuery,
  useLazySearchUniversitiesQuery,
  useLazySearchArticlesQuery,
  useGetFilterOptionsQuery,
} = searchApi;
