import { baseApi } from "../../api/baseApi";

type Country = {
  id: string;
  name: string;
  isActive: boolean;
};

type CountriesApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: Country[];
  meta: { page: number; limit: number; total: number };
};

type GetCountriesArgs = { page?: number; limit?: number };

const countriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query<CountriesApiResponse, GetCountriesArgs>({
      query: ({ page = 1, limit = 100000 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return { url: `/countries?${params.toString()}` };
      },
      providesTags: ["countries"],
    }),
  }),
});

export const { useGetCountriesQuery, useLazyGetCountriesQuery } = countriesApi;
