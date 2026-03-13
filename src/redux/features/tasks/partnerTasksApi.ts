import { baseApi } from "../../api/baseApi";

export interface PartnerTaskListItem {
  id: string;
  task_title: string;
  assigned_member_name: string;
  created_date_time: string;
  status: string;
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: string | null;
  taskType?: string | null;
}

interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

type TaskListParams = {
  page?: number;
  limit?: number;
  assignedToMe?: boolean;
  createdByMe?: boolean;
  status?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
};

export const partnerTasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerTasks: builder.query<PaginatedResponse<PartnerTaskListItem>, TaskListParams>({
      query: ({
        page = 1,
        limit = 10,
        assignedToMe,
        createdByMe,
        status = "",
        dueDateFrom,
        dueDateTo,
      } = {}) => ({
        url: "/partners/tasks",
        method: "GET",
        params: {
          page,
          limit,
          assignedToMe,
          createdByMe,
          status,
          dueDateFrom,
          dueDateTo,
        },
      }),
      transformResponse: (response: any) => ({
        data: response?.data || [],
        meta:
          response?.meta || ({ total: 0, page: 1, limit: 10, totalPages: 0 } as PaginatedMeta),
      }),
      providesTags: ["partnerTasks"],
    }),
  }),
});

export const { useGetPartnerTasksQuery } = partnerTasksApi;

