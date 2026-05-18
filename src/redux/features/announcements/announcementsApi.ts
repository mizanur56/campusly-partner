import { baseApi } from "../../api/baseApi";

type AnnouncementQueryParams = {
  page?: number;
  limit?: number;
  isActive?: boolean;
};

export const announcementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query<
      { data: any[]; meta?: { total?: number; page?: number; limit?: number } },
      AnnouncementQueryParams | void
    >({
      query: (params) => ({
        url: "/announcements/partner",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: ["announcements"],
    }),
  }),
});

export const { useGetAnnouncementsQuery } = announcementsApi;
