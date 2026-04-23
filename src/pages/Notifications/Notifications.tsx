import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { cn } from "../../lib/utils";
import {
  INotification,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "../../redux/features/notifications/notificationApi";

const normalizeNotificationLink = (link?: string) => {
  if (!link) return "";
  if (link.startsWith("/partner/")) return link.replace("/partner", "");
  return link;
};

const Notifications = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 50 },
    { refetchOnMountOrArgChange: true },
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpen = async (notification: INotification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id).unwrap().catch(() => null);
    }
    const link = normalizeNotificationLink(notification.link);
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Notifications | Partner Portal" description="Notifications" />
      <PageHeader
        title="Notifications"
        subtitle="Track onboarding, applications, and payments updates"
      />

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Unread: {unreadCount}
          </p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllAsRead().unwrap().catch(() => null)}
              className="text-sm font-medium text-primary-700 hover:text-primary-600"
            >
              Mark all as read
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="p-8 text-sm text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleOpen(notification)}
              className={cn(
                "w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60",
                !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/10",
              )}
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{notification.title}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
