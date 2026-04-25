import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RiCheckDoubleLine } from "react-icons/ri";
import { cn } from "../../../lib/utils";
import {
  INotification,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "../../../redux/features/notifications/notificationApi";

const normalizeNotificationLink = (link?: string | null) => {
  if (!link) return "";
  if (link.startsWith("/partner/")) return link.replace("/partner", "");
  return link;
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetNotificationsQuery(
    { page: 1, limit: 5 },
    { refetchOnMountOrArgChange: true },
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  useEffect(() => {
    if (isOpen) refetch();
  }, [isOpen, refetch]);

  useEffect(() => {
    const handleNotificationReceived = () => {
      refetch();
    };
    window.addEventListener("notification-received", handleNotificationReceived as EventListener, true);
    return () => {
      window.removeEventListener("notification-received", handleNotificationReceived as EventListener, true);
    };
  }, [refetch]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const notifications = useMemo(() => data?.data || [], [data]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const openNotification = async (notification: INotification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id).unwrap().catch(() => null);
    }
    const link = normalizeNotificationLink(notification.link);
    if (link) {
      navigate(link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-gray-900" />
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-[360px] rounded-xl border border-gray-200 bg-white shadow-xl z-[120] dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllAsRead().unwrap().catch(() => null)}
                className="flex items-center gap-1 text-xs text-primary-700 hover:text-primary-600"
              >
                <RiCheckDoubleLine className="h-3 w-3" />
                Mark all as read
              </button>
            ) : null}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={cn(
                    "w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/70",
                    !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/10",
                  )}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{notification.title}</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{notification.message}</p>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              navigate("/notifications");
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-1 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            All Notifications <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
