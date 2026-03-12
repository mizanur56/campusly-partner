import { baseApi } from "../../api/baseApi";

/**
 * Partner API for viewing/editing student profile.
 * Uses /students/:id/profile when partner views a student.
 */
const studentProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentProfile: builder.query({
      query: (studentId: string) => ({
        url: `/students/${studentId}/profile`,
        method: "GET",
      }),
      providesTags: (_, __, studentId) => [
        { type: "studentProfile", id: studentId },
      ],
    }),
    updateStudentProfile: builder.mutation({
      query: ({ studentId, ...body }) => ({
        url: `/students/${studentId}/profile`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),
  }),
});

export const {
  useGetStudentProfileQuery,
  useUpdateStudentProfileMutation,
  useLazyGetStudentProfileQuery,
} = studentProfileApi;
