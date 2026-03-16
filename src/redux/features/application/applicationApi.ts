import { baseApi } from "../../api/baseApi";

const applicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createApplication: builder.mutation({
      query: (info) => ({
        // Partner portal: submit application via partner-specific endpoint
        url: "/partners/applications",
        method: "POST",
        body: info,
      }),
      invalidatesTags: ["applications"],
    }),
    getMyAllApplications: builder.query({
      query: (params) => {
        const {
          page = 1,
          limit = 20,
          status = "",
          search = "",
        } = params || {};
        return {
          url: "/partners/applications",
          method: "GET",
          params: { page, limit, status, search },
        };
      },
      providesTags: ["applications"],
    }),
    getApplicationById: builder.query({
      query: (id) => ({
        // Partner portal: get single application via partner-scoped endpoint
        url: `/partners/applications/${id}`,
        method: "GET",
      }),
      providesTags: ["applications"],
    }),
    applicationDocumentUpload: builder.mutation({
      query: ({ id, ...info }) => ({
        // Partner portal: update application via partner-scoped endpoint
        url: `/partners/applications/${id}`,
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
