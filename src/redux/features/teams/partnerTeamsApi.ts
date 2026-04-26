import { baseApi } from "../../api/baseApi";

export interface PartnerTeamMember {
  id: string;
  userId?: string | null;
  profilePhoto?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  contactNumber?: string | null;
  countryCode?: string | null;
  status: "PENDING" | "ACTIVE";
  invitedAt: string;
  passwordCreatedAt?: string | null;
}

export interface PartnerTeamStats {
  total: number;
  pending: number;
  active: number;
}

interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export const partnerTeamsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeamMembers: builder.query<PaginatedResponse<PartnerTeamMember>, ListParams>({
      query: (arg = {}) => {
        const { page = 1, limit = 10, search, status } = arg;
        const params: Record<string, number | string> = { page, limit };
        if (search != null && String(search).trim() !== "") params.search = String(search).trim();
        if (status != null && String(status).trim() !== "") params.status = String(status).trim();
        return {
          url: "/partners/team-members",
          method: "GET",
          params,
        };
      },
      transformResponse: (response: any) => {
        const rawData = response?.data;
        const rawMeta = response?.meta;
        return {
          data: Array.isArray(rawData) ? rawData : [],
          meta: rawMeta && typeof rawMeta === "object"
            ? {
                total: Number(rawMeta.total) ?? 0,
                page: Number(rawMeta.page) ?? 1,
                limit: Number(rawMeta.limit) ?? 10,
                totalPages: Number(rawMeta.totalPages) ?? 0,
              }
            : { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
      },
      providesTags: ["partnerTeams"],
    }),

    getTeamStats: builder.query<PartnerTeamStats, void>({
      query: () => ({
        url: "/partners/team-members/stats",
        method: "GET",
      }),
      transformResponse: (response: any) =>
        (response?.data || { total: 0, pending: 0, active: 0 }) as PartnerTeamStats,
      providesTags: ["partnerTeams"],
    }),

    getTeamMemberById: builder.query<PartnerTeamMember, string>({
      query: (id) => ({
        url: `/partners/team-members/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => (response?.data || null) as PartnerTeamMember,
      providesTags: (result, error, id) => [{ type: "partnerTeams", id }],
    }),

    inviteTeamMember: builder.mutation<
      any,
      {
        email: string;
        firstName: string;
        lastName: string;
        contactNumber?: string;
        countryCode?: string;
        password: string;
        profilePhotoId?: string;
      }
    >({
      query: (body) => ({
        url: "/partners/team-members",
        method: "POST",
        body,
      }),
      invalidatesTags: ["partnerTeams"],
    }),

    resendTeamInvite: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/partners/team-members/${id}/resend`,
        method: "POST",
      }),
      invalidatesTags: ["partnerTeams"],
    }),

    updateTeamMember: builder.mutation<
      any,
      { id: string; data: Partial<Pick<PartnerTeamMember, "firstName" | "lastName" | "contactNumber" | "countryCode" | "status">> }
    >({
      query: ({ id, data }) => ({
        url: `/partners/team-members/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["partnerTeams"],
    }),

    deleteTeamMember: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/partners/team-members/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["partnerTeams"],
    }),

    changeTeamMemberPassword: builder.mutation<
      any,
      { id: string; data: { newPassword: string; confirmPassword: string } }
    >({
      query: ({ id, data }) => ({
        url: `/partners/team-members/${id}/change-password`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["partnerTeams"],
    }),
  }),
});

export const {
  useGetTeamMembersQuery,
  useGetTeamStatsQuery,
  useGetTeamMemberByIdQuery,
  useInviteTeamMemberMutation,
  useResendTeamInviteMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useChangeTeamMemberPasswordMutation,
} = partnerTeamsApi;

