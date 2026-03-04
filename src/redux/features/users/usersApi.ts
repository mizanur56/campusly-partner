import { baseApi } from "../../api/baseApi";

export type StudentUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  designationId: string | null;
  isActive: boolean;
  meetingLink: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  designation: unknown;
};

export type GetStudentsResponse = {
  success: boolean;
  status: number;
  message: string;
  data: StudentUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetStudentsArgs = {
  page?: number;
  limit?: number;
};

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<GetStudentsResponse, GetStudentsArgs>({
      query: ({ page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        params.append("role", "STUDENT");
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return { url: `/users?${params.toString()}` };
      },
      providesTags: ["users"],
    }),
  }),
});

export const { useGetStudentsQuery, useLazyGetStudentsQuery } = usersApi;
