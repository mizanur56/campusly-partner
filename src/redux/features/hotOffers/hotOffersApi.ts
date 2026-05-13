import { baseApi } from "../../api/baseApi";

export interface HotOfferCountryTab {
  id: string;
  countryId: string;
  name: string;
  flagUrl?: string | null;
}

export interface HotOfferFocusInstitution {
  id: string;
  universityId: string;
  name: string;
  logoUrl?: string | null;
  countryName: string;
  totalCourses: number;
  universitySlug?: string | null;
}

export interface HotOfferIntake {
  id: string;
  name: string;
  status: string;
}

export interface HotOfferIntakeUniversity {
  id: string;
  universityId: string;
  name: string;
  logoUrl?: string | null;
  countryName: string;
  universitySlug?: string | null;
}

export interface HotOfferProgramSpotlight {
  id: string;
  courseId: string;
  courseName: string;
  institutionName: string;
  institutionLogo?: string | null;
  countryName: string;
  tuitionFee?: number | null;
  startDate?: string | null;
  duration?: string | null;
  campusAddress?: string | null;
  modeOfStudy?: string | null;
  englishRequirement?: string | null;
}

export interface HotOfferServiceItem {
  id: string;
  articleId: string | number;
  title: string;
  intro?: string | null;
  imageUrl?: string | null;
  publishDate: string;
  slug: string;
}

export interface HotOffersAggregateResponse {
  countryTabs: HotOfferCountryTab[];
  selectedCountryId: string | null;
  focusInstitutions: HotOfferFocusInstitution[];
  upcomingIntakes: {
    intakes: HotOfferIntake[];
    selectedIntakeId: string | null;
    universities: HotOfferIntakeUniversity[];
  };
  programSpotlight: HotOfferProgramSpotlight[];
  servicesSection: {
    sectionTitle: string;
    sectionDescription: string;
    items: HotOfferServiceItem[];
  } | null;
  banner: {
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
    imageUrl?: string | null;
    status: string;
  } | null;
}

export interface HotOffersQueryParams {
  countryId?: string;
  intakeId?: string;
}

export const hotOffersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHotOffers: builder.query<HotOffersAggregateResponse, HotOffersQueryParams | undefined>({
      query: (params) => ({
        url: "/hot-offers",
        method: "GET",
        params: params
          ? Object.fromEntries(
              Object.entries(params).filter(([, v]) => v !== undefined),
            )
          : undefined,
      }),
      transformResponse: (response: { data?: HotOffersAggregateResponse }) =>
        response?.data ?? ({} as HotOffersAggregateResponse),
      providesTags: ["hotOffers"],
    }),
  }),
});

export const { useGetHotOffersQuery } = hotOffersApi;
