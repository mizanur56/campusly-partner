import { baseApi } from "../../api/baseApi";

const applicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createApplication: builder.mutation({
      query: (info) => ({
        url: "/applications",
        method: "POST",
        body: info,
      }),
      invalidatesTags: ["applications"],
    }),
    getMyAllApplications: builder.query({
      query: (params) => {
        const {
          page = 1,
          limit = 10,
          sortBy = "createdAt",
          sortOrder = "desc",
          ...rest
        } = params || {};
        return {
          url: "/applications/my-applications",
          method: "GET",
          params: { page, limit, sortBy, sortOrder, ...rest },
        };
      },
      providesTags: ["applications"],
    }),
    getApplicationById: builder.query({
      query: (id) => ({
        url: `/applications/${id}`,
        method: "GET",
      }),
      providesTags: ["applications"],
    }),
    applicationDocumentUpload: builder.mutation({
      query: ({ id, ...info }) => ({
        url: `/applications/${id}`,
        method: "PATCH",
        body: info,
      }),
      invalidatesTags: ["applications", "documents"],
    }),

    submitPaymentReceipt: builder.mutation({
      query: (data) => ({
        url: "/invoice-payments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["applications", "invoices"],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useGetMyAllApplicationsQuery,
  useGetApplicationByIdQuery,
  useApplicationDocumentUploadMutation,
  useSubmitPaymentReceiptMutation,
} = applicationApi;
