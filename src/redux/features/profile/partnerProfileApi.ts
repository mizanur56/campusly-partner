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
  // Add other fields as needed
  [key: string]: unknown;
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
  }),
});

export const { useGetPartnerProfileQuery, useLazyGetPartnerProfileQuery } =
  partnerProfileApi;
