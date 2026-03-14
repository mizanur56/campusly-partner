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

export interface PartnerTaskDetail {
  id: string;
  task_title: string;
  task_description?: string | null;
  status: string;
  priority?: string | null;
  task_type?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  associated_with?: string | null;
  created_by?: string | null;
  assignedTo?: { id: string; name: string | null; email: string | null };
  studentId?: string | null;
  applicationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentWithActiveTasks {
  studentId: string;
  studentName: string;
  activeTaskCount: number;
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

export type CreateTaskBody = {
  title: string;
  description?: string;
  assignedToUserId: string;
  studentId?: string;
  applicationId?: string;
  taskType?: "TO_DO" | "FOLLOW_UP" | "REMINDER" | "INTERNAL_TASK";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  dueTime?: string;
};

export type UpdateTaskBody = Partial<
  Omit<CreateTaskBody, "assignedToUserId"> & { assignedToUserId?: string }
>;

export const partnerTasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerTasks: builder.query<PaginatedResponse<PartnerTaskListItem>, TaskListParams>({
      query: (params = {}) => {
        const { page = 1, limit = 10, assignedToMe, createdByMe, status, dueDateFrom, dueDateTo } = params;
        const queryParams: Record<string, number | boolean | string> = { page, limit };
        if (assignedToMe != null) queryParams.assignedToMe = assignedToMe;
        if (createdByMe != null) queryParams.createdByMe = createdByMe;
        if (status && status.trim()) queryParams.status = status.trim();
        if (dueDateFrom) queryParams.dueDateFrom = dueDateFrom;
        if (dueDateTo) queryParams.dueDateTo = dueDateTo;
        return {
          url: "/partners/tasks",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: any) => ({
        data: Array.isArray(response?.data) ? response.data : [],
        meta: response?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 },
      }),
      providesTags: ["partnerTasks"],
    }),

    getTaskById: builder.query<PartnerTaskDetail, string>({
      query: (id) => ({
        url: `/partners/tasks/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const d = response?.data;
        if (!d) return null as unknown as PartnerTaskDetail;
        return {
          id: d.id,
          task_title: d.task_title,
          task_description: d.task_description,
          status: d.status,
          priority: d.priority,
          task_type: d.task_type,
          due_date: d.due_date,
          due_time: d.due_time,
          associated_with: d.associated_with,
          created_by: d.created_by,
          assignedTo: d.assignedTo,
          studentId: d.studentId,
          applicationId: d.applicationId,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        };
      },
      providesTags: (_result, _err, id) => [{ type: "partnerTasks", id }],
    }),

    getStudentsWithActiveTasks: builder.query<
      StudentWithActiveTasks[],
      { assignedToMe?: boolean } | void
    >({
      query: (params) => ({
        url: "/partners/tasks/students-with-active-tasks",
        method: "GET",
        params:
          params && params.assignedToMe === true
            ? { assignedToMe: "true" }
            : undefined,
      }),
      transformResponse: (response: any) => (Array.isArray(response?.data) ? response.data : []),
      providesTags: ["partnerTasks"],
    }),

    createTask: builder.mutation<unknown, CreateTaskBody>({
      query: (body) => ({
        url: "/partners/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["partnerTasks"],
    }),

    updateTask: builder.mutation<unknown, { id: string; body: UpdateTaskBody }>({
      query: ({ id, body }) => ({
        url: `/partners/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["partnerTasks"],
    }),

    updateTaskStatus: builder.mutation<unknown, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/partners/tasks/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["partnerTasks"],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/partners/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["partnerTasks"],
    }),
  }),
});

export const {
  useGetPartnerTasksQuery,
  useGetTaskByIdQuery,
  useGetStudentsWithActiveTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} = partnerTasksApi;
