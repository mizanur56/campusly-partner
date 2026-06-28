import clsx from "clsx";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { EmployeeTask } from "./types";
import { STATUS_CONFIG } from "./taskConstants";
import { formatDueLabel, getInitials } from "./taskUtils";
import GlassCard from "./GlassCard";
import { TASK_RADIUS } from "./taskStyles";

interface TaskTimelineViewProps {
  tasks: EmployeeTask[];
  onView: (task: EmployeeTask) => void;
}

const TaskTimelineView = ({ tasks, onView }: TaskTimelineViewProps) => {
  const sorted = useMemo(
    () =>
      [...tasks].sort(
        (a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf(),
      ),
    [tasks],
  );

  const grouped = useMemo(() => {
    const groups: Record<string, EmployeeTask[]> = {};
    sorted.forEach((t) => {
      const week = dayjs(t.dueDate).startOf("week").format("MMM D");
      const end = dayjs(t.dueDate).endOf("week").format("MMM D, YYYY");
      const key = `Week of ${week} – ${end}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [sorted]);

  if (sorted.length === 0) {
    return (
      <GlassCard className="py-12 text-center text-sm text-slate-500">
        No tasks to display on the timeline.
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="lg">
      <div className="relative space-y-8">
        {Object.entries(grouped).map(([weekLabel, weekTasks], gi) => (
          <div key={weekLabel}>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">
                {weekLabel}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
            </div>
            <div className="relative ml-4 space-y-4 border-l-2 border-[#95d66d]/30 pl-6 dark:border-[#95d66d]/20">
              {weekTasks.map((task, i) => {
                const status = STATUS_CONFIG[task.status];
                return (
                  <div key={task.id} className="relative">
                    <div
                      className={clsx(
                        "absolute -left-[31px] top-3 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#95d66d] dark:border-slate-900",
                        gi === 0 && i === 0 && "ring-4 ring-[#95d66d]/20",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => onView(task)}
                      className={`w-full border border-slate-200/80 bg-white/80 p-4 text-left transition-all hover:border-[#95d66d]/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80 ${TASK_RADIUS}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-500">
                            {dayjs(task.dueDate).format("ddd, MMM D · h:mm A")}
                          </p>
                          <h4 className="mt-1 font-semibold text-slate-900 dark:text-white">
                            {task.title}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDueLabel(task.dueDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              `border px-2 py-0.5 text-[10px] font-semibold ${TASK_RADIUS}`,
                              status.bg,
                              status.border,
                              status.color,
                            )}
                          >
                            {status.label}
                          </span>
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#95d66d] to-[#5fa836] text-[10px] font-bold text-white"
                            title={task.assignedTo?.name}
                          >
                            {getInitials(task.assignedTo?.name)}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default TaskTimelineView;
