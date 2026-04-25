import { baseApi } from "../../api/baseApi";

const PARTNER_STUDENT_BASE = "/partners/students";

/**
 * Partner API for viewing/editing a student's profile.
 * Base: /partners/students/:studentId (GET profile, PUT profile, educations, visa-rejections, documents).
 * Auth: PARTNER (full), PARTNER_TEAM_MEMBER (GET profile only).
 */
export type CreateStudentPayload = {
  email: string;
  fullName: string;
  password?: string;
  phone?: string;
  /**
   * Optional profile fields.
   * Note: createStudent endpoint may ignore these; modal uses updateStudentProfile for full profile.
   */
  firstName?: string;
  lastName?: string;
  gender?: string;
  /** ISO date string (YYYY-MM-DD) */
  dateOfBirth?: string;
  /** Country id */
  countryId?: string;
  passportNo?: string;
  /** ISO date string (YYYY-MM-DD) */
  passportExpDate?: string;
  /** Study level / last education id */
  lastEducationId?: string;
  /** Passing year string (YYYY) or ISO date, depending on backend */
  lastEducationPassingYear?: string;
  /** Profile image media id */
  imageId?: string;
};

export type CreateStudentResponse = {
  studentId: string;
  userId: string;
  email: string;
  fullName: string;
  temporaryPassword?: string;
};

export const partnerStudentProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createStudent: builder.mutation<
      CreateStudentResponse,
      CreateStudentPayload
    >({
      query: (body) => ({
        url: PARTNER_STUDENT_BASE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["users"],
    }),

    getStudentProfile: builder.query({
      query: (studentId: string) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/profile`,
        method: "GET",
      }),
      transformResponse: (response: { data?: unknown }) =>
        response?.data ?? null,
      providesTags: (_result, _err, studentId) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    updateStudentProfile: builder.mutation({
      query: ({
        studentId,
        body,
      }: {
        studentId: string;
        body: Record<string, unknown>;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/profile`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    createEducation: builder.mutation({
      query: ({
        studentId,
        body,
      }: {
        studentId: string;
        body: Record<string, unknown>;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/educations`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    updateEducation: builder.mutation({
      query: ({
        studentId,
        educationId,
        body,
      }: {
        studentId: any;
        educationId: string;
        body: Record<string, unknown>;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/educations/${educationId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    deleteEducation: builder.mutation({
      query: ({
        studentId,
        educationId,
      }: {
        studentId: string;
        educationId: string;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/educations/${educationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    createVisaRejection: builder.mutation({
      query: ({
        studentId,
        body,
      }: {
        studentId: string;
        body: Record<string, unknown>;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/visa-rejections`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    updateVisaRejection: builder.mutation({
      query: ({
        studentId,
        visaRejectionId,
        body,
      }: {
        studentId: string;
        visaRejectionId: string;
        body: Record<string, unknown>;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/visa-rejections/${visaRejectionId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    deleteVisaRejection: builder.mutation({
      query: ({
        studentId,
        visaRejectionId,
      }: {
        studentId: string;
        visaRejectionId: string;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/visa-rejections/${visaRejectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    getDocumentsByCategory: builder.query({
      query: ({ studentId, slug }: { studentId: string; slug: string }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/documents-by-category/${slug}`,
        method: "GET",
      }),
      transformResponse: (response: { data?: unknown }) =>
        response?.data ?? null,
      providesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    getEligibleStudyLevels: builder.query({
      query: ({
        studentId,
        countryId,
      }: {
        studentId: string;
        countryId?: string;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/eligible-study-levels`,
        method: "GET",
        params: countryId ? { countryId } : undefined,
      }),
      transformResponse: (response: { data?: unknown }) =>
        response?.data ?? null,
      providesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    getStudentApplications: builder.query({
      query: ({
        studentId,
        page = 1,
        limit = 20,
        status = "",
        search = "",
      }: {
        studentId: string;
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/applications`,
        method: "GET",
        params: { page, limit, status, search },
      }),
      providesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
        "applications",
      ],
    }),

    upsertDocument: builder.mutation({
      query: ({
        studentId,
        body,
      }: {
        studentId: string;
        body: Record<string, unknown>;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/documents`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    deleteDocument: builder.mutation({
      query: ({
        studentId,
        documentId,
      }: {
        studentId: string;
        documentId: string;
      }) => ({
        url: `${PARTNER_STUDENT_BASE}/${studentId}/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: "studentProfile", id: studentId },
      ],
    }),

    getEligibleStudyLevelsByCountry: builder.query({
      query: ({ countryId, studentId }) => ({
        url: `/students/eligible-study-levels`,
        method: "GET",
        params: {
          countryId,
          studentId,
        },
      }),
      providesTags: ["countryStudyLevels"],
    }),
  }),
});

export const {
  useCreateStudentMutation,
  useGetStudentProfileQuery,
  useUpdateStudentProfileMutation,
  useLazyGetStudentProfileQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  useCreateVisaRejectionMutation,
  useUpdateVisaRejectionMutation,
  useDeleteVisaRejectionMutation,
  useGetDocumentsByCategoryQuery,
  useGetEligibleStudyLevelsQuery,
  useGetStudentApplicationsQuery,
  useUpsertDocumentMutation,
  useDeleteDocumentMutation,
  useGetEligibleStudyLevelsByCountryQuery,
} = partnerStudentProfileApi;
