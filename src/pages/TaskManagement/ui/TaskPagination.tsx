import clsx from "clsx";
import { TASK_RADIUS } from "./taskStyles";

interface TaskPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const TaskPagination = ({
  page,
  limit,
  total,
  onPageChange,
  className,
}: TaskPaginationProps) => {
  const totalPages = Math.ceil(total / limit) || 1;
  if (totalPages <= 1 && total <= limit) return null;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div
      className={clsx(
        "flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800",
        className,
      )}
    >
      <p className="text-xs text-slate-500">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
          )
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== p - 1 && (
                <span className="px-1 text-slate-300">…</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={clsx(
                  `flex h-8 min-w-8 items-center justify-center ${TASK_RADIUS} px-2 text-xs font-semibold transition-colors`,
                  p === page
                    ? "bg-[#95d66d] text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                {p}
              </button>
            </span>
          ))}
      </div>
    </div>
  );
};

export default TaskPagination;
