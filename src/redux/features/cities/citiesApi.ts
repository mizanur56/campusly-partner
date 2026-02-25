import { baseApi } from "../../api/baseApi";

type City = {
  id: string;
  name: string;
  countryId: string;
  isActive: boolean;
  country: { id: string; name: string; code: string };
};

type CitiesApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: City[];
  meta: { page: number; limit: number; total: number };
};

type GetCitiesArgs = { page?: number; limit?: number; countryId?: string };

const citiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query<CitiesApiResponse, GetCitiesArgs>({
      query: ({ page = 1, limit = 10000000, countryId }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (countryId) params.append("countryId", countryId);
        return { url: `/cities?${params.toString()}` };
      },
      providesTags: ["cities"],
    }),
  }),
});

export const { useGetCitiesQuery, useLazyGetCitiesQuery } = citiesApi;
