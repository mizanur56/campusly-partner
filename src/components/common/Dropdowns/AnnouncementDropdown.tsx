import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useGetAnnouncementsQuery(
    { page: 1, limit: 10, isActive: true },
    {
      pollingInterval: 60000,
      refetchOnMountOrArgChange: true,
    },
  );

  const announcements = useMemo<AnnouncementItem[]>(
    () => (data?.data as AnnouncementItem[]) || [],
    [data],
  );
  const totalCount = data?.meta?.total ?? announcements.length;

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Announcements"
      >
        <i className="fa-solid fa-bullhorn text-[18px]" />
        {totalCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold leading-4 text-white">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-[360px] rounded-xl border border-gray-200 bg-white shadow-xl z-[120] dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
            Announcements
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Loading announcements...
              </div>
            ) : announcements.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No announcements yet
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="w-full border-b border-gray-100 px-4 py-3 text-left dark:border-gray-800"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {announcement.title || "Announcement"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                    {announcement.body || ""}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    {formatTime(announcement.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="flex w-full items-center gap-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            Recent announcements <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
