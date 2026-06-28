import clsx from "clsx";
import { Spin } from "antd";
import { Inbox } from "lucide-react";
import type { EmployeeTask, EmployeeTaskStatus } from "./types";
import { STATUS_CONFIG } from "./taskConstants";
import TaskCard from "./TaskCard";
import GlassCard from "./GlassCard";
import TaskPagination from "./TaskPagination";
import { TASK_RADIUS } from "./taskStyles";

const KANBAN_COLUMNS: EmployeeTaskStatus[] = [
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_DOT: Record<EmployeeTaskStatus, string> = {
  IN_PROGRESS: "bg-blue-500",
  SUBMITTED: "bg-violet-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-rose-500",
};

interface TaskKanbanViewProps {
  tasks: EmployeeTask[];
  statusTotals: Record<EmployeeTaskStatus, number>;
  loading?: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  showAssigner?: boolean;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  activeStatus: EmployeeTaskStatus;
  onActiveStatusChange: (status: EmployeeTaskStatus) => void;
  onView: (task: EmployeeTask) => void;
  onEdit?: (task: EmployeeTask) => void;
  onComplete?: (task: EmployeeTask) => void;
  onCancel?: (task: EmployeeTask) => void;
  onDelete?: (task: EmployeeTask) => void;
  deleting?: boolean;
}

const TaskKanbanView = ({
  tasks,
  statusTotals,
  loading,
  canUpdate,
  canDelete,
  showAssigner,
  page,
  limit,
  onPageChange,
  activeStatus,
  onActiveStatusChange,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
  deleting,
}: TaskKanbanViewProps) => {
  const grouped = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<EmployeeTaskStatus, EmployeeTask[]>,
  );

  const activeConfig = STATUS_CONFIG[activeStatus];
  const activeTasks = grouped[activeStatus] || [];
  const activeTabTotal = statusTotals[activeStatus] ?? 0;
  const showPagination = activeTabTotal > 10;

  const hasAnyTasks = KANBAN_COLUMNS.some(
    (status) => (statusTotals[status] ?? 0) > 0,
  );

  if (!loading && !hasAnyTasks && tasks.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center bg-slate-100 dark:bg-slate-800 ${TASK_RADIUS}`}
        >
          <Inbox className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          No tasks yet
        </h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Create your first task or adjust filters to see work items on the board.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <Spin spinning={!!loading}>
        <div className="flex w-full flex-col">
          {/* Status tabs — full width */}
          <div
            className="flex w-full border-b border-slate-200 dark:border-slate-700"
            role="tablist"
            aria-label="Task status"
          >
            {KANBAN_COLUMNS.map((status) => {
              const config = STATUS_CONFIG[status];
              const isActive = activeStatus === status;
              const count = statusTotals[status] ?? 0;

              return (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onActiveStatusChange(status)}
                  className={clsx(
                    "flex cursor-pointer min-w-0 flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4",
                    isActive
                      ? "border-primary-500 bg-primary-50/50 text-primary-700 dark:border-primary-500 dark:bg-primary-950/20 dark:text-primary-300"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100",
                  )}
                >
                  <span
                    className={clsx(
                      "h-2 w-2 shrink-0 rounded-full",
                      STATUS_DOT[status],
                    )}
                  />
                  <span className="truncate">{config.label}</span>
                  <span
                    className={clsx(
                      "shrink-0 px-2 py-0.5 text-xs font-bold tabular-nums",
                      TASK_RADIUS,
                      isActive
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active tab content — full width */}
          <div className="w-full p-4">
            <div
              className={clsx(
                `flex min-h-[320px] w-full flex-col gap-3 border border-dashed p-4 ${TASK_RADIUS}`,
                activeConfig.border,
                "bg-slate-50/50 dark:bg-slate-900/30",
              )}
            >
              {activeTasks.length === 0 ? (
                <div
                  className={`flex flex-1 items-center justify-center border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-700 ${TASK_RADIUS}`}
                >
                  No {activeConfig.label.toLowerCase()} tasks
                </div>
              ) : (
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ">
                  {activeTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      compact
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      showAssigner={showAssigner}
                      onView={onView}
                      onEdit={onEdit}
                      onComplete={onComplete}
                      onCancel={onCancel}
                      onDelete={onDelete}
                      deleting={deleting}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showPagination && (
          <TaskPagination
            page={page}
            limit={limit}
            total={activeTabTotal}
            onPageChange={onPageChange}
          />
        )}
      </Spin>
    </GlassCard>
  );
};

export default TaskKanbanView;
