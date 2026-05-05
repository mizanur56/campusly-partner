import { SingleUniversityCourseApiResponse } from "../../types/course";
import { baseApi } from "../api/baseApi";

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourseBySlug: builder.query<SingleUniversityCourseApiResponse, string>({
      query: (slug) => `/university-courses/slug/${slug}`,
      providesTags: ["universityCourses"],
    }),
  }),
});

export const { useGetCourseBySlugQuery } = courseApi;
