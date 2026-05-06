import { baseApi } from "../api/baseApi";
import type {
  UniversityDetailsApiResponse,
  UniversityFaqsApiResponse,
} from "../../types/course";

export const universityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUniversityBySlug: builder.query<UniversityDetailsApiResponse, string>({
      query: (slug) => `/universities/slug/${slug}`,
      providesTags: ["universities"],
    }),
    getUniversityFaqs: builder.query<UniversityFaqsApiResponse, string>({
      query: (slug) => `/faqs/university/${slug}`,
      providesTags: ["faqs"],
    }),
  }),
});

export const { useGetUniversityBySlugQuery, useGetUniversityFaqsQuery } =
  universityApi;
