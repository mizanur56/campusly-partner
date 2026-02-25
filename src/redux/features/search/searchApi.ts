import { baseApi } from "../../api/baseApi";
import type {
  UnifiedSearchApiResponse,
  SearchCoursesApiResponse,
  SearchUniversitiesApiResponse,
  SearchArticlesApiResponse,
} from "../../../types/search";
import type { ApiSearchParams } from "../../../utils/transformFiltersToApi";
import { buildSearchQueryString } from "../../../utils/transformFiltersToApi";

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
  }),
});

export const {
  useLazyUnifiedSearchQuery,
  useLazySearchCoursesQuery,
  useLazySearchUniversitiesQuery,
  useLazySearchArticlesQuery,
} = searchApi;
