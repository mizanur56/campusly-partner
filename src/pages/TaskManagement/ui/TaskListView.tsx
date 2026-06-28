import clsx from "clsx";
import {
  CheckCircle2,
  Eye,
  Inbox,
  MoreVertical,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { Dropdown, Popconfirm, Spin, Tooltip } from "antd";
import type { MenuProps } from "antd";
import type { EmployeeTask } from "./types";
import DateTimeHighlight from "../../../components/common/DateTimeHighlight";
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from "./taskConstants";
import { getInitials } from "./taskUtils";
import GlassCard from "./GlassCard";
import TaskPagination from "./TaskPagination";
import { TASK_RADIUS } from "./taskStyles";

interface TaskRowActionsProps {
  task: EmployeeTask;
  mode: "all" | "my";
  canUpdate: boolean;
  canDelete: boolean;
  deleting?: boolean;
  onView: (task: EmployeeTask) => void;
  onEdit?: (task: EmployeeTask) => void;
  onComplete?: (task: EmployeeTask) => void;
  onCancel?: (task: EmployeeTask) => void;
  onDelete?: (task: EmployeeTask) => void;
}

const actionBtnClass = (variant: "default" | "menu" = "default") =>
  clsx(
    `flex h-8 w-8 items-center justify-center border transition-colors ${TASK_RADIUS}`,
    variant === "menu"
      ? "border-slate-200 text-slate-500 hover:border-[#95d66d] hover:text-[#5fa836] dark:border-slate-700"
      : "border-slate-200 text-slate-500 hover:border-[#95d66d] hover:text-[#5fa836] dark:border-slate-700",
  );

function buildMoreMenuItems({
  task,
  mode,
  canUpdate,
  canDelete,
  deleting,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
}: Omit<TaskRowActionsProps, "onView">): MenuProps["items"] {
  const items: NonNullable<MenuProps["items"]> = [];

  if (mode === "all" && canUpdate && task.status === "IN_PROGRESS" && onEdit) {
    items.push({
      key: "edit",
      label: "Edit task",
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: () => onEdit(task),
    });
  }

  if (canUpdate && task.status === "IN_PROGRESS" && onComplete) {
    items.push({
      key: "complete",
      label: "Mark complete",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      onClick: () => onComplete(task),
    });
  }

  if (mode === "all" && canUpdate && task.status === "IN_PROGRESS" && onCancel) {
    items.push({
      key: "cancel",
      label: "Cancel task",
      icon: <XCircle className="h-3.5 w-3.5" />,
      danger: true,
      onClick: () => onCancel(task),
    });
  }

  if (mode === "all" && canDelete && onDelete) {
    items.push({
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
    });
  }

  return items;
}

const TaskRowActions = ({
  task,
  mode,
  canUpdate,
  canDelete,
  deleting,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
}: TaskRowActionsProps) => {
  const moreItems = buildMoreMenuItems({
    task,
    mode,
    canUpdate,
    canDelete,
    deleting,
    onEdit,
    onComplete,
    onCancel,
    onDelete,
  });

  return (
    <div className="flex items-center gap-1">
      <Tooltip title="View">
        <button
          type="button"
          onClick={() => onView(task)}
          aria-label="View task"
          className={actionBtnClass()}
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      </Tooltip>

      {moreItems && moreItems.length > 0 ? (
        <Dropdown
          menu={{ items: moreItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Tooltip title="More actions">
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              aria-label="More actions"
              className={actionBtnClass("menu")}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </Dropdown>
      ) : (
        <Tooltip title="More actions">
          <button
            type="button"
            disabled
            aria-label="More actions"
            className={clsx(actionBtnClass("menu"), "cursor-not-allowed opacity-40")}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

interface TaskListViewProps {
  tasks: EmployeeTask[];
  loading?: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  canUpdate: boolean;
  canDelete: boolean;
  mode: "all" | "my";
  onView: (task: EmployeeTask) => void;
  onEdit?: (task: EmployeeTask) => void;
  onComplete?: (task: EmployeeTask) => void;
  onCancel?: (task: EmployeeTask) => void;
  onDelete?: (task: EmployeeTask) => void;
  deleting?: boolean;
}

const TaskListView = ({
  tasks,
  loading,
  page,
  limit,
  total,
  onPageChange,
  canUpdate,
  canDelete,
  mode,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
  deleting,
}: TaskListViewProps) => {
  if (!loading && tasks.length === 0 && total === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center bg-slate-100 dark:bg-slate-800 ${TASK_RADIUS}`}
        >
          <Inbox className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          No matching tasks
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your search or filters.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <Spin spinning={!!loading}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
                {["Task", "Priority", "Status", "Assignee", "Due", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((task) => {
                const priority = PRIORITY_CONFIG[task.priority];
                const status = STATUS_CONFIG[task.status];

                return (
                  <tr
                    key={task.id}
                    className="group transition-colors hover:bg-[#95d66d]/5 dark:hover:bg-[#95d66d]/5"
                  >
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => onView(task)}
                        className="text-left"
                      >
                        <p className="font-semibold text-slate-900 group-hover:text-[#5fa836] dark:text-white">
                          {task.title}
                        </p>
                        {mode === "all" && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            by {task.assignedBy?.name || "—"}
                          </p>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={clsx(
                          `inline-flex border px-2 py-0.5 text-[10px] font-bold uppercase ${TASK_RADIUS}`,
                          priority.bg,
                          priority.border,
                          priority.color,
                        )}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
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
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#95d66d] to-[#5fa836] text-[10px] font-bold text-white">
                          {getInitials(task.assignedTo?.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                            {task.assignedTo?.name}
                          </p>
                          <p className="truncate text-[10px] text-slate-400">
                            {task.assignedTo?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <DateTimeHighlight value={task.dueDate} />
                    </td>
                    <td className="px-4 py-3.5">
                      <TaskRowActions
                        task={task}
                        mode={mode}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                        deleting={deleting}
                        onView={onView}
                        onEdit={onEdit}
                        onComplete={onComplete}
                        onCancel={onCancel}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <TaskPagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={onPageChange}
        />
      </Spin>
    </GlassCard>
  );
};

export default TaskListView;
