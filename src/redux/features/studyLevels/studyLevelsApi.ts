import { baseApi } from "../../api/baseApi";

type StudyLevel = {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  isActive: boolean;
};

type StudyLevelsApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: StudyLevel[];
  meta: { page: number; limit: number; total: number };
};

type GetStudyLevelsArgs = { page?: number; limit?: number };

const studyLevelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudyLevels: builder.query<StudyLevelsApiResponse, GetStudyLevelsArgs>({
      query: ({ page = 1, limit = 100000 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return { url: `/study-levels?${params.toString()}` };
      },
      providesTags: ["studyLevels"],
    }),
  }),
});

export const { useGetStudyLevelsQuery, useLazyGetStudyLevelsQuery } =
  studyLevelsApi;
