import { baseApi } from "../../api/baseApi";
import type { AcademyCategory, AcademyCourse, AcademyCourseDetail } from "../../../types/academy";

type ApiResponse<T> = { data: T };

export const academyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAcademyCategories: builder.query<AcademyCategory[], void>({
      query: () => "/academy-courses/categories",
      transformResponse: (response: ApiResponse<AcademyCategory[]>) => response?.data ?? [],
      providesTags: ["courses"],
    }),
    getAcademyCourses: builder.query<AcademyCourse[], void>({
      query: () => "/academy-courses/public",
      transformResponse: (response: ApiResponse<AcademyCourse[]>) => response?.data ?? [],
      providesTags: ["courses"],
    }),
    getAcademyCourseDetails: builder.query<AcademyCourseDetail, string>({
      query: (id) => `/academy-courses/${id}`,
      transformResponse: (response: ApiResponse<AcademyCourseDetail>) => response.data,
      providesTags: (_result, _err, id) => [{ type: "courses", id }],
    }),
    updateAcademyProgress: builder.mutation<
      unknown,
      { courseId: string; currentModuleId?: string; currentVideoId?: string; completedVideoId?: string }
    >({
      query: ({ courseId, ...body }) => ({
        url: `/academy-courses/${courseId}/progress`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { courseId }) => ["courses", { type: "courses", id: courseId }],
    }),
  }),
});

export const {
  useGetAcademyCategoriesQuery,
  useGetAcademyCoursesQuery,
  useGetAcademyCourseDetailsQuery,
  useUpdateAcademyProgressMutation,
} = academyApi;
