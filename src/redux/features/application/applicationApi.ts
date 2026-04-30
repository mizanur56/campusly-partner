import { baseApi } from "../../api/baseApi";

const applicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createApplication: builder.mutation({
      query: (info) => ({
        url: "/applications/partner",
        method: "POST",
        body: info,
      }),
      invalidatesTags: ["applications"],
    }),
    getMyAllApplications: builder.query({
      query: (params) => {
        const { page = 1, limit = 20, status = "", search = "" } = params || {};
        return {
          url: "/applications/partner",
          method: "GET",
          params: { page, limit, status, search },
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

    deleteApplication: builder.mutation({
      query: (id) => ({
        url: `/applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["applications"],
    }),
    applicationDocumentUpload: builder.mutation({
      query: ({ id, ...info }) => ({
        url: `/applications/partner/${id}`,
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

    getAllInvoicePayments: builder.query({
      query: (args?: { name: string; value: any }[]) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item) => {
            if (item.value !== undefined && item.value !== null) {
              params.append(item.name, item.value);
            }
          });
        }
        return {
          url: `/invoice-payments`,
          method: "GET",
          params: params,
        };
      },
      providesTags: ["applications", "invoices"],
    }),

    applicationRecord: builder.query({
      query: (applicationId: string) => ({
        url: `/applications/${applicationId}/records`,
        method: "GET",
      }),
      providesTags: ["applications", "invoices"],
    }),

    // ============================
    // Application Notes (comments)
    // ============================
    getApplicationNotes: builder.query({
      query: (applicationId: string) => ({
        url: `/applications/${applicationId}/notes`,
        method: "GET",
      }),
      providesTags: (_r, _e, applicationId) => [
        { type: "applicationNotes", id: applicationId },
      ],
    }),

    createApplicationNote: builder.mutation({
      query: ({
        applicationId,
        body,
      }: {
        applicationId: string;
        body: { title?: string; body: string };
      }) => ({
        url: `/applications/${applicationId}/notes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["applicationNotes"],
    }),

    replyToApplicationNote: builder.mutation({
      query: ({
        applicationId,
        noteId,
        body,
      }: {
        applicationId: string;
        noteId: string;
        body: { body: string };
      }) => ({
        url: `/applications/${applicationId}/notes/${noteId}/replies`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["applicationNotes"],
    }),

    updateApplicationNote: builder.mutation({
      query: ({
        applicationId,
        noteId,
        body,
      }: {
        applicationId: string;
        noteId: string;
        body: { title?: string | null; body?: string };
      }) => ({
        url: `/applications/${applicationId}/notes/${noteId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["applicationNotes"],
    }),

    deleteApplicationNote: builder.mutation({
      query: ({
        applicationId,
        noteId,
      }: {
        applicationId: string;
        noteId: string;
      }) => ({
        url: `/applications/${applicationId}/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["applicationNotes"],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useGetMyAllApplicationsQuery,
  useGetApplicationByIdQuery,
  useDeleteApplicationMutation,
  useApplicationDocumentUploadMutation,
  useSubmitPaymentReceiptMutation,
  useGetAllInvoicePaymentsQuery,
  useGetApplicationNotesQuery,
  useCreateApplicationNoteMutation,
  useReplyToApplicationNoteMutation,
  useUpdateApplicationNoteMutation,
  useDeleteApplicationNoteMutation,
  useApplicationRecordQuery,
} = applicationApi;

export { applicationApi };
