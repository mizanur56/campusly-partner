import { baseApi } from "../../api/baseApi";

const educationsHistoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateEducation: builder.mutation({
      query: ({ id, ...educationData }) => ({
        url: `/students/educations/${id}`,
        method: "PATCH",
        body: educationData,
      }),
      invalidatesTags: ["applications"],
    }),
  }),
});

export const { useUpdateEducationMutation } = educationsHistoryApi;
