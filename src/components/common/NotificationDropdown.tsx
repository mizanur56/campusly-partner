import { BellOutlined } from "@ant-design/icons";
import { Badge, Button, Dropdown, Empty, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
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

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { data, isLoading } = useGetNotificationsQuery({ page: 1, limit: 10 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.data || [];
  const displayedNotifications = notifications.slice(0, 3);
  const unreadCount =
    data?.meta?.unreadCount ??
    notifications.filter((n: INotification) => !n.isRead).length;

  const handleNotificationClick = async (notification: INotification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id).unwrap();
      } catch {
        // ignore
      }
    }

    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch {
      // ignore
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

  const menuItems = {
    items: [
      {
        key: "header",
        label: (
          <div className="flex items-center justify-between gap-2 px-2 py-2 border-b">
            <div className="flex items-center gap-1 flex-wrap">
              <Text strong className="text-sm sm:text-base">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <span className="text-[10px] text-primary-600 font-normal">
                  {unreadCount} Unread Notification{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllAsRead();
                }}
                className="flex items-center cursor-pointer gap-1 p-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <RiCheckDoubleLine className="w-4 h-4 text-primary-600" />
                <span className="text-[12px] text-primary-600 font-medium whitespace-nowrap">
                  Mark all as read
                </span>
              </button>
            )}
          </div>
        ),
        disabled: true,
      },
      ...(isLoading
        ? [
            {
              key: "loading",
              label: (
                <div className="flex justify-center py-4">
                  <Spin size="small" />
                </div>
              ),
              disabled: true,
            },
          ]
        : notifications.length === 0
          ? [
              {
                key: "empty",
                label: (
                  <div className="py-8">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No notifications"
                      style={{ margin: 0 }}
                    />
                  </div>
                ),
                disabled: true,
              },
            ]
          : [
              ...displayedNotifications.map((notification: INotification) => ({
                key: notification.id,
                label: (
                  <div
                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Text strong={!notification.isRead} className="text-sm">
                            {notification.title}
                          </Text>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <Text
                          type="secondary"
                          className="text-xs block mt-1 line-clamp-2"
                        >
                          {notification.message}
                        </Text>
                        <Text type="secondary" className="text-xs block mt-1">
                          {formatTime(notification.createdAt)}
                        </Text>
                      </div>
                    </div>
                  </div>
                ),
              })),
              {
                key: "view-all",
                label: (
                  <div className="px-3 py-2 border-t">
                    <Button
                      type="link"
                      block
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/notifications");
                        setIsOpen(false);
                      }}
                      className="text-primary-600 font-medium text-sm p-0 h-auto"
                    >
                      All Notifications
                    </Button>
                  </div>
                ),
              },
            ]),
    ],
  };

  return (
    <Dropdown
      menu={menuItems}
      trigger={["click"]}
      open={isOpen}
      onOpenChange={setIsOpen}
      placement={isMobile ? "bottom" : "bottomRight"}
      overlayStyle={{
        width: isMobile ? "calc(100vw - 32px)" : "450px",
        maxWidth: "450px",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
      <button className="relative cursor-pointer p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 transition-colors">
        <BellOutlined className="text-xl sm:text-2xl" />
        {unreadCount > 0 && (
          <Badge
            count={unreadCount > 9 ? "9+" : unreadCount}
            size={isMobile ? "small" : "default"}
            className="absolute -top-2 sm:-top-4 -left-2 sm:-left-3"
            style={{ fontSize: isMobile ? "10px" : "12px" }}
          />
        )}
      </button>
    </Dropdown>
  );
};

export default NotificationDropdown;

