import { baseApi } from "../../api/baseApi";

export interface PartnerTeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  contactNumber?: string | null;
  countryCode?: string | null;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
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
      query: ({ page = 1, limit = 10, search = "", status = "" } = {}) => ({
        url: "/partners/team-members",
        method: "GET",
        params: { page, limit, search, status },
      }),
      transformResponse: (response: any) => ({
        data: response?.data || [],
        meta: response?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
      }),
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

    inviteTeamMember: builder.mutation<
      any,
      { email: string; firstName: string; lastName: string; contactNumber?: string; countryCode?: string }
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
  }),
});

export const {
  useGetTeamMembersQuery,
  useGetTeamStatsQuery,
  useInviteTeamMemberMutation,
  useResendTeamInviteMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} = partnerTeamsApi;

