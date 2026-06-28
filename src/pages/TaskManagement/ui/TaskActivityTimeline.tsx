import clsx from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  FileText,
  History,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import type { EmployeeTask } from "./types";
import GlassCard from "./GlassCard";
import { TASK_RADIUS } from "./taskStyles";

dayjs.extend(relativeTime);

interface ActivityItem {
  id: string;
  type: "update" | "comment" | "history" | "attachment";
  title: string;
  description: string;
  time: string;
  task: EmployeeTask;
}

interface TaskActivityTimelineProps {
  tasks: EmployeeTask[];
  onView: (task: EmployeeTask) => void;
}

const typeConfig = {
  update: {
    icon: History,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  },
  comment: {
    icon: MessageSquare,
    color:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  },
  history: {
    icon: FileText,
    color:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  attachment: {
    icon: Paperclip,
    color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
};

function buildActivities(tasks: EmployeeTask[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  tasks.forEach((task) => {
    items.push({
      id: `${task.id}-created`,
      type: "history",
      title: "Task created",
      description: `${task.assignedBy?.name || "System"} assigned to ${task.assignedTo?.name || "—"}`,
      time: task.createdAt,
      task,
    });

    if (task.updatedAt !== task.createdAt) {
      items.push({
        id: `${task.id}-updated`,
        type: "update",
        title: "Status updated",
        description: `Now ${task.status.replace(/_/g, " ").toLowerCase()} — ${task.title}`,
        time: task.updatedAt,
        task,
      });
    }

    if (task.reviewNote) {
      items.push({
        id: `${task.id}-note`,
        type: "comment",
        title: "Review note",
        description: task.reviewNote.replace(/<[^>]+>/g, " ").slice(0, 80),
        time: task.updatedAt,
        task,
      });
    }

    if (task.submissionNote) {
      items.push({
        id: `${task.id}-submission`,
        type: "comment",
        title: "Submission note",
        description: task.submissionNote.replace(/<[^>]+>/g, " ").slice(0, 80),
        time: task.updatedAt,
        task,
      });
    }
  });

  return items
    .sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf())
    .slice(0, 12);
}

const TaskActivityTimeline = ({
  tasks,
  onView,
}: TaskActivityTimelineProps) => {
  const activities = buildActivities(tasks);

  return (
    <GlassCard padding="md">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Activity Timeline
        </h3>
        <p className="text-[10px] text-slate-500">
          Recent updates, comments & history
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className={`mb-3 flex h-12 w-12 items-center justify-center bg-slate-100 dark:bg-slate-800 ${TASK_RADIUS}`}>
            <History className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500">No recent activity</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {activities.map((item, i) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onView(item.task)}
                className="relative flex w-full gap-3 pb-4 text-left last:pb-0"
              >
                {i < activities.length - 1 && (
                  <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-slate-200 dark:bg-slate-700" />
                )}
                <div
                  className={clsx(
                    `relative z-10 flex h-8 w-8 shrink-0 items-center justify-center ${TASK_RADIUS}`,
                    config.color,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {dayjs(item.time).fromNow()}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        {(
          [
            ["Updates", activities.filter((a) => a.type === "update").length],
            ["Comments", activities.filter((a) => a.type === "comment").length],
            ["History", activities.filter((a) => a.type === "history").length],
          ] as const
        ).map(([label, count]) => (
          <div
            key={label}
            className={`bg-slate-50 p-2 text-center dark:bg-slate-800/50 ${TASK_RADIUS}`}
          >
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {count}
            </p>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default TaskActivityTimeline;
