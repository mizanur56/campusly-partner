import { baseApi } from "../../api/baseApi";

type FeeRange = {
  id: string;
  min: number;
  max: number;
  step: number;
  isActive: boolean;
};

type FeeRangesApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: FeeRange[];
  meta: { page: number; limit: number; total: number };
};

type GetFeeRangesArgs = { page?: number; limit?: number };

const feeRangesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeRanges: builder.query<FeeRangesApiResponse, GetFeeRangesArgs>({
      query: ({ page = 1, limit = 100 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return { url: `/fee-ranges?${params.toString()}` };
      },
      providesTags: ["feeRanges"],
    }),
  }),
});

export const { useGetFeeRangesQuery, useLazyGetFeeRangesQuery } =
  feeRangesApi;
