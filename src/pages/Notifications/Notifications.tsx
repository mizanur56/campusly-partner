import { Button, Empty, message, Spin, Typography } from "antd";
import { useMemo, useState } from "react";
import { RiCheckDoubleLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import {
  INotification,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "../../redux/features/notifications/notificationApi";
import { formatTime } from "../../utils/formatTime";

const { Text } = Typography;

type NotificationTabKey = "all" | "unread";

const normalizeNotificationLink = (link?: string | null) => {
  if (!link) return "";
  if (link.startsWith("/partner/")) return link.replace("/partner", "");
  return link;
};

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NotificationTabKey>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useGetNotificationsQuery({
    page: currentPage,
    limit,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.data || [];
  const total = data?.meta?.total || 0;
  const unreadCount = notifications.filter(
    (n: INotification) => !n.isRead,
  ).length;

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.isRead);
    return notifications;
  }, [notifications, activeTab]);

  const handleNotificationClick = async (notification: INotification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id).unwrap();
      } catch {
        // ignore
      }
    }
    const link = normalizeNotificationLink(notification.link);
    if (link) navigate(link);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      message.success("All notifications marked as read");
      refetch();
    } catch {
      message.error("Failed to mark all notifications as read");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "✅";
      case "ERROR":
        return "❌";
      case "WARNING":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[18px] font-semibold text-gray-900">
            Notifications
          </div>
          <div className="text-[12px] text-gray-500 mt-1">
            View and manage all your notifications
          </div>
        </div>

        {unreadCount > 0 && activeTab === "all" ? (
          <Button
            type="primary"
            icon={<RiCheckDoubleLine />}
            onClick={handleMarkAllAsRead}
            className="bg-primary-600 hover:bg-primary-700 border-none"
          >
            Mark All as Read
          </Button>
        ) : null}
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { key: "all" as const, label: "All" },
            { key: "unread" as const, label: "Unread" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`py-3 cursor-pointer text-[15px] transition-colors duration-200 relative whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-primary-700 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                activeTab === "unread"
                  ? "No unread notifications"
                  : "No notifications"
              }
            />
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary-300 ${
                !notification.isRead
                  ? "bg-blue-50 border-blue-200"
                  : "border-gray-200"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <Text
                        strong={!notification.isRead}
                        className="text-base text-gray-900"
                      >
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <Text type="secondary" className="text-xs flex-shrink-0">
                      {formatTime(notification.createdAt)}
                    </Text>
                  </div>
                  <Text type="secondary" className="text-sm block">
                    {notification.message}
                  </Text>
                </div>
              </div>
            </div>
          ))
        )}

        {/* simple pagination */}
        {total > limit && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span className="text-sm text-gray-600">Page {currentPage}</span>
            <Button
              disabled={currentPage * limit >= total}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
