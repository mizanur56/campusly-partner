import clsx from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AlertTriangle, Bell, Clock, Users } from "lucide-react";
import type { EmployeeTask } from "./types";
import GlassCard from "./GlassCard";
import { TASK_RADIUS } from "./taskStyles";
import { formatDueLabel, isTaskOverdue } from "./taskUtils";

dayjs.extend(relativeTime);

interface TaskNotificationCenterProps {
  tasks: EmployeeTask[];
  onView: (task: EmployeeTask) => void;
}

const TaskNotificationCenter = ({
  tasks,
  onView,
}: TaskNotificationCenterProps) => {
  const overdue = tasks.filter(isTaskOverdue);
  const upcoming = tasks
    .filter(
      (t) =>
        (t.status === "IN_PROGRESS" || t.status === "SUBMITTED") &&
        !isTaskOverdue(t) &&
        dayjs(t.dueDate).diff(dayjs(), "day") <= 3,
    )
    .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf())
    .slice(0, 5);

  const recentUpdates = [...tasks]
    .sort(
      (a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf(),
    )
    .slice(0, 4);

  return (
    <GlassCard padding="md">
      <div className="mb-4 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 ${TASK_RADIUS}`}>
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Notifications
          </h3>
          <p className="text-[10px] text-slate-500">Alerts & deadlines</p>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
            <AlertTriangle className="h-3 w-3" />
            Overdue ({overdue.length})
          </p>
          <div className="space-y-2">
            {overdue.slice(0, 3).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onView(t)}
                className={`flex w-full items-start gap-2 border border-rose-100 bg-rose-50/80 p-2.5 text-left transition-colors hover:bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 ${TASK_RADIUS}`}
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-rose-800 dark:text-rose-200">
                    {t.title}
                  </p>
                  <p className="text-[10px] text-rose-600">
                    {formatDueLabel(t.dueDate)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Clock className="h-3 w-3" />
          Upcoming Deadlines
        </p>
        {upcoming.length === 0 ? (
          <p className={`bg-slate-50 p-3 text-xs text-slate-400 dark:bg-slate-800/50 ${TASK_RADIUS}`}>
            No deadlines in the next 3 days
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onView(t)}
                className={`flex w-full items-center justify-between gap-2 border border-slate-100 p-2.5 text-left transition-colors hover:border-[#95d66d]/30 hover:bg-[#95d66d]/5 dark:border-slate-800 ${TASK_RADIUS}`}
              >
                <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                  {t.title}
                </p>
                <span className="shrink-0 text-[10px] font-semibold text-sky-600">
                  {formatDueLabel(t.dueDate)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Users className="h-3 w-3" />
          Team Updates
        </p>
        <div className="space-y-2">
          {recentUpdates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onView(t)}
              className={`flex w-full gap-2 p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${TASK_RADIUS}`}
            >
              <div
                className={clsx(
                  "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                  t.status === "COMPLETED"
                    ? "bg-emerald-500"
                    : t.status === "CANCELLED"
                      ? "bg-rose-500"
                      : "bg-blue-500",
                )}
              />
              <div className="min-w-0">
                <p className="truncate text-xs text-slate-700 dark:text-slate-200">
                  <span className="font-semibold">{t.assignedTo?.name}</span>{" "}
                  updated{" "}
                  <span className="font-medium">{t.title}</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  {dayjs(t.updatedAt).fromNow?.() ||
                    dayjs(t.updatedAt).format("MMM D, h:mm A")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default TaskNotificationCenter;
