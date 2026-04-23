import { baseApi } from "../../api/baseApi";

const announcementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAnnouncements: builder.query({
      query: () => ({
        url: "/announcements/partner",
        method: "GET",
      }),
      providesTags: ["announcements"],
    }),
    
 
  }),
});



export const { useGetAnnouncementsQuery } = announcementsApi;