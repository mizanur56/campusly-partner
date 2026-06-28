import clsx from "clsx";
import {
  Calendar,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { Dropdown, Popconfirm } from "antd";
import type { EmployeeTask } from "./types";
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from "./taskConstants";
import {
  deriveDepartment,
  formatDueLabel,
  getInitials,
  getTaskProgress,
  isTaskOverdue,
} from "./taskUtils";
import { TASK_RADIUS } from "./taskStyles";

interface TaskCardProps {
  task: EmployeeTask;
  compact?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  showAssigner?: boolean;
  onView: (task: EmployeeTask) => void;
  onEdit?: (task: EmployeeTask) => void;
  onComplete?: (task: EmployeeTask) => void;
  onCancel?: (task: EmployeeTask) => void;
  onDelete?: (task: EmployeeTask) => void;
  deleting?: boolean;
}

const TaskCard = ({
  task,
  compact = false,
  canUpdate,
  canDelete,
  showAssigner = false,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
  deleting,
}: TaskCardProps) => {
  const priority = PRIORITY_CONFIG[task.priority];
  const status = STATUS_CONFIG[task.status];
  const progress = getTaskProgress(task.status);
  const overdue = isTaskOverdue(task);
  const department = deriveDepartment(task);

  const menuItems = [
    {
      key: "view",
      label: "View details",
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: () => onView(task),
    },
    ...(canUpdate && task.status === "IN_PROGRESS" && onEdit
      ? [
          {
            key: "edit",
            label: "Edit task",
            icon: <Pencil className="h-3.5 w-3.5" />,
            onClick: () => onEdit(task),
          },
        ]
      : []),
    ...(canUpdate && task.status === "IN_PROGRESS" && onComplete
      ? [
          {
            key: "complete",
            label: "Mark complete",
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
            onClick: () => onComplete(task),
          },
        ]
      : []),
    ...(canUpdate && task.status === "IN_PROGRESS" && onCancel
      ? [
          {
            key: "cancel",
            label: "Cancel task",
            icon: <XCircle className="h-3.5 w-3.5" />,
            danger: true,
            onClick: () => onCancel(task),
          },
        ]
      : []),
    ...(canDelete && onDelete
      ? [
          {
            key: "delete",
            label: (
              <Popconfirm
                title="Delete this task?"
                onConfirm={() => onDelete(task)}
                okText="Delete"
                cancelText="Keep"
                okButtonProps={{ loading: deleting, danger: true }}
              >
                <span className="text-rose-600">Delete task</span>
              </Popconfirm>
            ),
            icon: <Trash2 className="h-3.5 w-3.5 text-rose-500" />,
          },
        ]
      : []),
  ];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onView(task)}
      onKeyDown={(e) => e.key === "Enter" && onView(task)}
      className={clsx(
        `group relative cursor-pointer border bg-white/90 p-4 shadow-sm transition-all duration-200 ${TASK_RADIUS}`,
        "hover:-translate-y-0.5 hover:border-[#95d66d]/40 hover:shadow-md",
        "dark:bg-slate-900/90 dark:hover:border-[#95d66d]/30",
        overdue
          ? "border-rose-200 dark:border-rose-900/50"
          : "border-slate-200/80 dark:border-slate-700/80",
        compact && "p-3",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={clsx(
              `inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TASK_RADIUS}`,
              priority.bg,
              priority.border,
              priority.color,
            )}
          >
            <span className={clsx("h-1.5 w-1.5 rounded-full", priority.dot)} />
            {priority.label}
          </span>
          <span
            className={clsx(
              `inline-flex border px-2 py-0.5 text-[10px] font-semibold ${TASK_RADIUS}`,
              status.bg,
              status.border,
              status.color,
            )}
          >
            {status.label}
          </span>
        </div>
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={`flex h-7 w-7 items-center justify-center text-slate-400 opacity-0 transition-all hover:bg-slate-100 group-hover:opacity-100 dark:hover:bg-slate-800 ${TASK_RADIUS}`}
            aria-label="Task actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </Dropdown>
      </div>

      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
        {task.title}
      </h3>

      {!compact && task.description && (
        <p
          className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400"
          dangerouslySetInnerHTML={{
            __html: task.description.replace(/<[^>]+>/g, " ").slice(0, 120),
          }}
        />
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 ${TASK_RADIUS}`}>
          {department}
        </span>
        <span className={`bg-[#e8f7df] px-2 py-0.5 text-[10px] font-medium text-[#5fa836] dark:bg-[#95d66d]/15 dark:text-[#95d66d] ${TASK_RADIUS}`}>
          {task.priority}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-slate-500">
          <span>Progress</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500",
              progress === 100
                ? "bg-emerald-500"
                : overdue
                  ? "bg-rose-500"
                  : "bg-[#95d66d]",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#95d66d] to-[#5fa836] text-[10px] font-bold text-white"
            title={task.assignedTo?.name}
          >
            {getInitials(task.assignedTo?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
              {task.assignedTo?.name || "Unassigned"}
            </p>
            {showAssigner && (
              <p className="truncate text-[10px] text-slate-400">
                by {task.assignedBy?.name || "—"}
              </p>
            )}
          </div>
        </div>
        <div
          className={clsx(
            `flex shrink-0 items-center gap-1 px-2 py-1 text-[10px] font-semibold ${TASK_RADIUS}`,
            overdue
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40"
              : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
          )}
        >
          <Calendar className="h-3 w-3" />
          <span>{formatDueLabel(task.dueDate)}</span>
        </div>
      </div>
    </article>
  );
};

export default TaskCard;
