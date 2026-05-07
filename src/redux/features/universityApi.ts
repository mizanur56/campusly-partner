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
    getUniversityGalleries: builder.query<
      {
        data: Array<{
          id: string;
          universityId: string;
          mediaId: string;
          altText: string | null;
          priority: number;
          isActive: boolean;
          media?: {
            id: string;
            url: string;
            altText: string | null;
            name: string;
            title?: string | null;
          };
        }>;
      },
      string
    >({
      query: (slug) => `/university-galleries/${slug}`,
      providesTags: ["universityGallery"],
    }),
  }),
});

export const {
  useGetUniversityBySlugQuery,
  useGetUniversityFaqsQuery,
  useGetUniversityGalleriesQuery,
} = universityApi;
