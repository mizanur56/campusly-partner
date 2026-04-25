import { baseApi } from "../../api/baseApi";

export interface INotification {
  id: string;
  recipientId: string;
  senderId?: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
<<<<<<< HEAD
  link?: string;
=======
  event?: string | null;
  link?: string | null;
  applicationId?: string | null;
  noteId?: string | null;
  threadRootNoteId?: string | null;
>>>>>>> 0b3ccda9c44dca4e2436db7928ed77ec846ac7e1
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationResponse {
<<<<<<< HEAD
  success: boolean;
  data: INotification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
=======
  data: INotification[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    unreadCount?: number;
>>>>>>> 0b3ccda9c44dca4e2436db7928ed77ec846ac7e1
  };
}

interface NotificationQueryParams {
  page?: number;
  limit?: number;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationResponse, NotificationQueryParams>({
<<<<<<< HEAD
      query: (params = {}) => ({
        url: "/notifications",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }),
      providesTags: ["Notification"],
    }),
    markAsRead: build.mutation<{ success: boolean; message: string }, string>({
=======
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
>>>>>>> 0b3ccda9c44dca4e2436db7928ed77ec846ac7e1
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
<<<<<<< HEAD
    markAllAsRead: build.mutation<{ success: boolean; message: string }, void>({
=======

    markAllAsRead: build.mutation<{ success: boolean; message?: string }, void>({
>>>>>>> 0b3ccda9c44dca4e2436db7928ed77ec846ac7e1
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
<<<<<<< HEAD
  overrideExisting: false,
=======
>>>>>>> 0b3ccda9c44dca4e2436db7928ed77ec846ac7e1
});

export const {
  useGetNotificationsQuery,
<<<<<<< HEAD
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
=======
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;

>>>>>>> 0b3ccda9c44dca4e2436db7928ed77ec846ac7e1
