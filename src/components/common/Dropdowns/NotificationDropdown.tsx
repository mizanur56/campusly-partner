import { BellOutlined } from "@ant-design/icons";
import { Button, Dropdown, Empty, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  INotification,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "../../../redux/features/notifications/notificationApi";
import { formatTime } from "../../../utils/formatTime";

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
      } catch (error) {
        console.error(error);
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
    } catch (error) {
      console.error(error);
    }
  };

  const menuItems = {
    items: [
      {
        key: "header",
        label: (
          <div className="flex items-center justify-between py-5 px-4 border-b border-primary-border">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold text-gray-800">
                Notifications
              </h2>

              {unreadCount > 0 && (
                <span className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-red-500 text-white text-[12px] font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
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
                className="
                  flex items-center gap-1
                  px-2 py-1
                  text-[12px]
                  font-medium
                  text-primary-600
                  rounded-md
                  transition-all duration-200
                  hover:text-primary-700
                  hover:underline
                  active:scale-95
                "
              >
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        ),
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
                    <Empty description="No notifications" />
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
                    className={`
                    p-3 cursor-pointer border-b border-primary-border hover:bg-primary-50 transition-all duration-300
                  `}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="-space-y-1">
                          <div className="flex justify-between gap-2">
                            <p
                              className={`text-[14px] font-semibold ${!notification.isRead ? "text-primary-600 font-bold" : "text-gray-900"}`}
                            >
                              {notification.title}
                            </p>

                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-primary-400 rounded-full mt-1" />
                            )}
                          </div>

                          <p className="text-xs block mt-1 line-clamp-1 text-gray-600">
                            {notification.message}
                          </p>
                        </div>

                        <p className="text-xs block mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
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
                      className="text-[#237D3B] text-[14px] font-medium hover:underline hover:text-[#237D3B]/80 transition-all duration-300"
                    >
                      View all notifications
                    </Button>
                  </div>
                ),
              },
            ]),
    ],
  };

  return (
    <>
      {/* ✅ SAME FILE CSS OVERRIDE */}
      <style>{`
        .notification-dropdown-overlay .ant-dropdown-menu {
          padding: 0 !important;
          margin: 0 !important;
          border: 0.5px solid #C7CACF !important;
          border-radius: 17px !important;
          box-shadow: none !important;
        }

        .notification-dropdown-overlay .ant-dropdown-menu-item {
          padding: 0 !important;
          background: transparent !important;
        }

        .notification-dropdown-overlay .ant-dropdown-menu-item:hover {
          background: transparent !important;
        }

        .notification-dropdown-overlay .ant-dropdown-menu-item:first-child:hover {
          background: transparent !important;
        }

        .notification-dropdown-overlay .ant-dropdown-menu-item-active {
          background: transparent !important;
        }
      `}</style>

      <Dropdown
        menu={menuItems}
        trigger={["click"]}
        open={isOpen}
        onOpenChange={setIsOpen}
        placement={isMobile ? "bottom" : "bottomRight"}
        overlayStyle={{
          width: isMobile ? "calc(100vw - 32px)" : "350px",
          maxHeight: "500px",
        }}
        overlayClassName="notification-dropdown-overlay"
      >
        <div
          className="
            relative flex items-center justify-center
            w-10 h-10 rounded-xl
            border border-gray-200
            bg-white
            text-gray-600

            transition-all duration-200 ease-in-out
            hover:border-primary-500
            hover:text-primary-600
            hover:shadow-md

            cursor-pointer
          "
        >
          <BellOutlined className="text-[20px]" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] px-[4px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </Dropdown>
    </>
  );
};

export default NotificationDropdown;
