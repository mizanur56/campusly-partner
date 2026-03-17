import { baseApi } from "../../api/baseApi";

export interface Advisor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  meetingLink: string | null;
  profile?: {
    id: string;
    url: string;
  } | null;
}

export interface PartnerProfileResponse {
  id: string;
  userId: string;
  registeredCompanyName: string | null;
  status: string;
  advisor: Advisor | null;
  businessName?: string | null;
  businessPhoto?: string | null;
  // Add other fields as needed
  [key: string]: unknown;
}

export interface PartnerDashboardTopStats {
  tasks_pending: number;
  applications_total: number;
  accepted_applications: number;
  rejected_applications: number;
  active_students: number;
}

export interface PartnerDashboardTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  status: string;
  contactNumber: string | null;
  countryCode: string | null;
  invitedAt: string;
}

export interface PartnerDashboardDestination {
  id: string;
  name: string;
  code: string | null;
  priority: number;
  imageUrl: string | null;
}

export interface PartnerDashboardSubject {
  id: string;
  name: string;
  applicationCount: number;
}

export interface PartnerDashboardUniversity {
  id: string;
  name: string;
  countryName: string;
  logoUrl: string | null;
  applicationCount: number;
}

export interface PartnerDashboardResponse {
  topStats: PartnerDashboardTopStats;
  supportPanel: Advisor[];
  teamMembers: PartnerDashboardTeamMember[];
  topDestinations: PartnerDashboardDestination[];
  topSubjects: PartnerDashboardSubject[];
  topUniversities: PartnerDashboardUniversity[];
}

export interface UpdatePartnerProfilePayload {
  ownerMobileNumber?: string;
  ownerWebsite?: string;
  ownerFacebook?: string;
  ownerInstagram?: string;
  companyAddress?: string;
  mainContactTelephone?: string;
  mainContactWhatsapp?: string;
  profilePhotoId?: string | null;
  businessPhoto?: string | null;
}

const partnerProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Get current partner's profile including advisor details */
    getPartnerProfile: builder.query<PartnerProfileResponse, void>({
      query: () => ({
        url: "/partners/profile",
        method: "GET",
      }),
      transformResponse: (response: any) =>
        (response?.data || {}) as PartnerProfileResponse,
      providesTags: ["partnerProfile"],
    }),

    /** Update current partner's profile (contact, photos) */
    updatePartnerProfile: builder.mutation<
      PartnerProfileResponse,
      UpdatePartnerProfilePayload
    >({
      query: (body) => ({
        url: "/partners/profile",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: any) =>
        (response?.data || {}) as PartnerProfileResponse,
      invalidatesTags: ["partnerProfile"],
    }),

    /** Signed dashboard data (KPIs, support, team members, top destinations/subjects/universities) */
    getPartnerDashboard: builder.query<PartnerDashboardResponse, void>({
      query: () => ({
        url: "/partners/dashboard",
        method: "GET",
      }),
      transformResponse: (response: any) =>
        (response?.data || {}) as PartnerDashboardResponse,
      providesTags: ["partnerProfile"],
    }),
  }),
});

export const {
  useGetPartnerProfileQuery,
  useLazyGetPartnerProfileQuery,
  useGetPartnerDashboardQuery,
  useUpdatePartnerProfileMutation,
} = partnerProfileApi;
