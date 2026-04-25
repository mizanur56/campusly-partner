import { baseApi } from "../../api/baseApi";

export interface INotification {
  id: string;
  recipientId: string;
  senderId?: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  event?: string | null;
  link?: string | null;
  applicationId?: string | null;
  noteId?: string | null;
  threadRootNoteId?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationResponse {
  data: INotification[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    unreadCount?: number;
  };
}

interface NotificationQueryParams {
  page?: number;
  limit?: number;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<
      NotificationResponse,
      NotificationQueryParams
    >({
      query: (arg) => ({
        url: "/notifications",
        method: "GET",
        params: arg,
      }),
      providesTags: ["Notification"],
    }),

    getUnreadCount: build.query<{ data: { count: number } }, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),

    markAsRead: build.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: build.mutation<{ success: boolean; message?: string }, void>(
      {
        query: () => ({
          url: "/notifications/mark-all-read",
          method: "PATCH",
        }),
        invalidatesTags: ["Notification"],
      },
    ),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
