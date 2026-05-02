import { Button, Dropdown, Spin } from "antd";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RiCheckDoubleLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import {
  getStoredAnnouncementReadIds,
  persistAnnouncementReadIds,
} from "../../../lib/partnerAnnouncementReadIds";
import { useGetAnnouncementsQuery } from "../../../redux/features/announcements/announcementsApi";

type AnnouncementItem = {
  id: string;
  title?: string;
  body?: string;
  createdAt?: string;
};

const formatTime = (date?: string) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB");
};

export default function AnnouncementDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { data, isLoading } = useGetAnnouncementsQuery(
    { page: 1, limit: 10, isActive: true },
    { pollingInterval: 60000, refetchOnMountOrArgChange: true },
  );

  const announcements = useMemo<AnnouncementItem[]>(
    () => (data?.data as AnnouncementItem[]) || [],
    [data],
  );
  const unreadCount = useMemo(
    () => announcements.filter((item) => !readIds.includes(item.id)).length,
    [announcements, readIds],
  );

  useEffect(() => {
    setReadIds(getStoredAnnouncementReadIds());
  }, []);

  const persistReadIds = (ids: string[]) => {
    setReadIds(ids);
    persistAnnouncementReadIds(ids);
  };

  const handleMarkAllAsRead = () => {
    const merged = Array.from(
      new Set([...readIds, ...announcements.map((a) => a.id)]),
    );
    persistReadIds(merged);
  };

  const menuItems = {
    items: [
      {
        key: "header",
        label: (
          <div className="flex items-center justify-between py-3 px-4 border-b border-primary-border">
            <h2 className="text-[18px] font-semibold text-gray-800">
              Announcements
            </h2>
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                icon={<RiCheckDoubleLine />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllAsRead();
                }}
              >
                Mark all as read
              </Button>
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
        : announcements.length === 0
          ? [
              {
                key: "empty",
                label: (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No announcements yet
                  </div>
                ),
                disabled: true,
              },
            ]
          : announcements.map((announcement) => ({
              key: announcement.id,
              label: (
                <div
                  className="p-3 cursor-pointer border-b border-primary-border hover:bg-primary-50 transition-all duration-300"
                  onClick={() => {
                    if (!readIds.includes(announcement.id)) {
                      persistReadIds([...readIds, announcement.id]);
                    }
                    setIsOpen(false);
                    navigate(
                      `/announcements?id=${encodeURIComponent(announcement.id)}`,
                    );
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {announcement.title || "Announcement"}
                    </p>
                    {!readIds.includes(announcement.id) && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                    {announcement.body || ""}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {formatTime(announcement.createdAt)}
                  </p>
                </div>
              ),
            }))),

      {
        key: "view-all",
        label: (
          <div className="px-3 py-2 border-t">
            <Button
              type="link"
              block
              icon={<ChevronRight className="h-4 w-4" />}
              iconPosition="end"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                navigate("/announcements");
              }}
              className="text-[#237D3B]! text-[14px] font-medium hover:underline transition-all duration-300"
            >
              Recent announcements
            </Button>
          </div>
        ),
      },
    ],
  };

  return (
    <>
      <style>{`
        .announcement-dropdown-overlay .ant-dropdown-menu {
          padding: 0 !important;
          margin: 0 !important;
          border: 0.5px solid #C7CACF !important;
          border-radius: 17px !important;
          box-shadow: none !important;
        }
        .announcement-dropdown-overlay .ant-dropdown-menu-item {
          padding: 0 !important;
          background: transparent !important;
        }
        .announcement-dropdown-overlay .ant-dropdown-menu-item:hover {
          background: transparent !important;
        }
        .announcement-dropdown-overlay .ant-dropdown-menu-item-active {
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
          width: isMobile ? "calc(100vw - 32px)" : "360px",
          maxHeight: "500px",
        }}
        overlayClassName="announcement-dropdown-overlay"
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
          aria-label="Announcements"
        >
          <i className="fa-solid fa-bullhorn text-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] px-[4px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </Dropdown>
    </>
  );
}
