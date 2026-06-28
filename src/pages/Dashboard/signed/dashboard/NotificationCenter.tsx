import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  INotification,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
} from "../../../../redux/features/notifications/notificationApi";
import Panel from "./Panel";

const TYPE_META: Record<
  INotification["type"],
  { color: string; icon: typeof Info }
> = {
  INFO: { color: "#2563eb", icon: Info },
  SUCCESS: { color: "#10b981", icon: CheckCircle2 },
  WARNING: { color: "#f59e0b", icon: AlertTriangle },
  ERROR: { color: "#ef4444", icon: XCircle },
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetNotificationsQuery({ page: 1, limit: 6 });
  const [markAllAsRead, { isLoading: isMarking }] = useMarkAllAsReadMutation();

  const items = (data?.data ?? []).slice(0, 3);
  const unread =
    data?.meta?.unreadCount ?? items.filter((n) => !n.isRead).length;

  return (
    <Panel
      title="Notifications"
      subtitle={unread > 0 ? `${unread} unread` : "You're up to date"}
      icon={<Bell className="h-[18px] w-[18px]" aria-hidden />}
      accent="#e11d48"
      action={
        unread > 0 ? (
          <button
            type="button"
            disabled={isMarking}
            onClick={() => markAllAsRead()}
            className="inline-flex items-center gap-1 rounded-[6px] px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 disabled:opacity-50 dark:text-primary-400 dark:hover:bg-primary-500/10"
          >
            <CheckCheck className="h-3.5 w-3.5" aria-hidden />
            Mark all
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="rounded-[6px] px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10"
          >
            View all
          </button>
        )
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-2.5 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Bell className="mb-2 h-9 w-9 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No notifications yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {items.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.INFO;
            const Icon = meta.icon;
            return (
              <li
                key={n.id}
                onClick={() => navigate(n.link || "/notifications")}
                className={`flex cursor-pointer items-start gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-neutral-50/80 dark:hover:bg-white/5 ${
                  n.isRead ? "" : "bg-primary-50/40 dark:bg-primary-500/5"
                }`}
              >
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `${meta.color}1a`,
                    color: meta.color,
                  }}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-neutral-900 dark:text-white">
                    {n.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.isRead ? (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

<div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
  <button
    type="button"
    onClick={() => navigate("/notifications")}
    className="flex w-full items-center justify-center rounded-[6px] border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
  >
    View All Notifications
  </button>
</div>
    </Panel>
  );
}
