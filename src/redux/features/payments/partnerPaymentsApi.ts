import { baseApi } from "../../api/baseApi";

type PaginatedRequest = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
};

export const partnerPaymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Active bank account details for payment instructions */
    getActiveBankAccount: builder.query<any, void>({
      query: () => ({
        url: "/bank-accounts/active",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data,
      providesTags: ["bankAccounts"],
    }),

    /** Combined purchase + commission stats (not used yet but available) */
    getCombinedStats: builder.query<any, void>({
      query: () => ({
        url: "/partner-payments/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data,
      providesTags: ["partnerPayments"],
    }),

    /** Purchase stats for top cards on Purchase tab */
    getPurchaseStats: builder.query<any, void>({
      query: () => ({
        url: "/partner-payments/purchase/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data,
      providesTags: ["partnerPayments"],
    }),

    /** Applications that have app fees to be paid */
    getPurchaseApplications: builder.query<any, PaginatedRequest>({
      query: ({ page = 1, limit = 10, status = "", search = "" } = {}) => ({
        url: "/partner-payments/purchase/applications",
        method: "GET",
        params: { page, limit, status, search },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["partnerPayments"],
    }),

    /** Purchase transactions history */
    getPurchaseTransactions: builder.query<any, PaginatedRequest>({
      query: ({ page = 1, limit = 10, status = "", search = "", from, to } = {}) => ({
        url: "/partner-payments/purchase/transactions",
        method: "GET",
        params: { page, limit, status, search, from, to },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["partnerPayments"],
    }),

    /** Bulk pay selected applications by uploading a single receipt */
    paySelectedApplications: builder.mutation<
      any,
      { applicationIds: string[]; currency?: string; receipt: File }
    >({
      query: ({ applicationIds, currency, receipt }) => {
        const formData = new FormData();
        formData.append("receipt", receipt);
        formData.append("applicationIds", JSON.stringify(applicationIds));
        if (currency) {
          formData.append("currency", currency);
        }
        return {
          url: "/partner-payments/purchase/pay",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["partnerPayments"],
    }),

    /** Commission stats for top cards on Commission tab */
    getCommissionStats: builder.query<any, void>({
      query: () => ({
        url: "/partner-payments/commission/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data,
      providesTags: ["partnerPayments"],
    }),

    /** Earned commissions list */
    getCommissionEarned: builder.query<any, PaginatedRequest>({
      query: ({ page = 1, limit = 10, status = "", search = "" } = {}) => ({
        url: "/partner-payments/commission/earned",
        method: "GET",
        params: { page, limit, status, search },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["partnerPayments"],
    }),

    /** Commission payout transactions history */
    getCommissionTransactions: builder.query<any, PaginatedRequest>({
      query: ({ page = 1, limit = 10, status = "", from, to } = {}) => ({
        url: "/partner-payments/commission/transactions",
        method: "GET",
        params: { page, limit, status, from, to },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["partnerPayments"],
    }),

    /** Partner claims a specific commission by uploading an invoice */
    claimCommission: builder.mutation<any, { commissionId: string; invoice: File }>({
      query: ({ commissionId, invoice }) => {
        const formData = new FormData();
        formData.append("invoice", invoice);
        return {
          url: `/partner-payments/commission/${commissionId}/claim`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["partnerPayments"],
    }),
  }),
});

export const {
  useGetActiveBankAccountQuery,
  useGetCombinedStatsQuery,
  useGetPurchaseStatsQuery,
  useGetPurchaseApplicationsQuery,
  useGetPurchaseTransactionsQuery,
  usePaySelectedApplicationsMutation,
  useGetCommissionStatsQuery,
  useGetCommissionEarnedQuery,
  useGetCommissionTransactionsQuery,
  useClaimCommissionMutation,
} = partnerPaymentsApi;

