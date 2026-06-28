import clsx from "clsx";
import dayjs, { Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { EmployeeTask } from "./types";
import { PRIORITY_CONFIG } from "./taskConstants";
import GlassCard from "./GlassCard";
import { TASK_RADIUS } from "./taskStyles";

interface TaskCalendarViewProps {
  tasks: EmployeeTask[];
  onView: (task: EmployeeTask) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TaskCalendarView = ({ tasks, onView }: TaskCalendarViewProps) => {
  const [current, setCurrent] = useState(() => dayjs().startOf("month"));

  const days = useMemo(() => {
    const start = current.startOf("month").startOf("week");
    const end = current.endOf("month").endOf("week");
    const result: Dayjs[] = [];
    let d = start;
    while (d.isBefore(end) || d.isSame(end, "day")) {
      result.push(d);
      d = d.add(1, "day");
    }
    return result;
  }, [current]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, EmployeeTask[]>();
    tasks.forEach((t) => {
      const key = dayjs(t.dueDate).format("YYYY-MM-DD");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [tasks]);

  return (
    <GlassCard padding="md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {current.format("MMMM YYYY")}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCurrent((c) => c.subtract(1, "month"))}
            className={`flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 ${TASK_RADIUS}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrent(dayjs().startOf("month"))}
            className={`border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 ${TASK_RADIUS}`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrent((c) => c.add(1, "month"))}
            className={`flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 ${TASK_RADIUS}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 gap-px overflow-hidden border border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-700 ${TASK_RADIUS}`}>
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="bg-slate-50 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = day.format("YYYY-MM-DD");
          const dayTasks = tasksByDate.get(key) || [];
          const isCurrentMonth = day.month() === current.month();
          const isToday = day.isSame(dayjs(), "day");

          return (
            <div
              key={key}
              className={clsx(
                "min-h-[100px] bg-white p-1.5 dark:bg-slate-900",
                !isCurrentMonth && "opacity-40",
              )}
            >
              <div
                className={clsx(
                  "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  isToday && "bg-[#95d66d] text-white",
                  !isToday && "text-slate-600 dark:text-slate-300",
                )}
              >
                {day.date()}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => {
                  const p = PRIORITY_CONFIG[task.priority];
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onView(task)}
                      className={clsx(
                        "block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium",
                        p.bg,
                        p.color,
                      )}
                    >
                      {task.title}
                    </button>
                  );
                })}
                {dayTasks.length > 3 && (
                  <p className="px-1 text-[10px] font-medium text-slate-400">
                    +{dayTasks.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default TaskCalendarView;
