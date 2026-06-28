import clsx from "clsx";
import {
  CalendarDays,
  Columns3,
  GanttChart,
  LayoutList,
  Search,
} from "lucide-react";
import { Input, Select } from "antd";
import AdminFilterDrawer, {
  type FilterField,
  type FilterValues,
} from "../../../components/common/Filters/AdminFilterDrawer";
import type { EmployeeTaskPriority, EmployeeTaskStatus } from "./types";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  VIEW_MODES,
  type TaskViewMode,
} from "./taskConstants";
import { TASK_RADIUS } from "./taskStyles";

const VIEW_ICONS: Record<TaskViewMode, typeof LayoutList> = {
  kanban: Columns3,
  list: LayoutList,
  calendar: CalendarDays,
  timeline: GanttChart,
};

interface TaskFiltersBarProps {
  mode: "all" | "my";
  viewMode: TaskViewMode;
  onViewModeChange: (mode: TaskViewMode) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterFields: FilterField[];
  drawerValue: FilterValues;
  defaultFilters: FilterValues;
  onApplyFilters: (values: FilterValues) => void;
  activeFilterCount: number;
  departments: string[];
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  showAdvancedFilters?: boolean;
}

const TaskFiltersBar = ({
  mode,
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  filterFields,
  drawerValue,
  defaultFilters,
  onApplyFilters,
  activeFilterCount,
  departments,
  departmentFilter,
  onDepartmentChange,
  showAdvancedFilters = true,
}: TaskFiltersBarProps) => (
  <div className="space-y-4">
    <div
      className={`inline-flex border border-slate-200/80 bg-white/60 p-1 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60 ${TASK_RADIUS}`}
    >
      {VIEW_MODES.map(({ key, label }) => {
        const Icon = VIEW_ICONS[key];
        const active = viewMode === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onViewModeChange(key)}
            className={clsx(
              `flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold transition-all ${TASK_RADIUS}`,
              active
                ? "bg-[#95d66d] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center">
      <Input
        prefix={<Search className="h-4 w-4 text-slate-400" />}
        placeholder="Search tasks by title or description..."
        allowClear
        defaultValue={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`!h-10 w-full sm:max-w-xs [&_.ant-input]:!${TASK_RADIUS}`}
        style={{ borderRadius: 6 }}
      />
      <div className="flex flex-shrink-0 items-center gap-2 sm:ml-auto">
        <Select
          placeholder="Department"
          allowClear
          size="large"
          value={departmentFilter || undefined}
          onChange={(v) => onDepartmentChange(v || "")}
          className="!h-10 min-w-[140px] task-select-6 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-[6px]"
          style={{ borderRadius: 6 }}
          options={departments.map((d) => ({ value: d, label: d }))}
        />
        {showAdvancedFilters && (
          <AdminFilterDrawer
            title={mode === "all" ? "Advanced filters" : "My task filters"}
            description="Filter by status, priority, assignee, and date range."
            fields={filterFields}
            value={drawerValue}
            defaultValue={defaultFilters}
            onApply={onApplyFilters}
            activeCount={activeFilterCount}
          />
        )}
      </div>
    </div>
  </div>
);

export type { FilterValues };
export { STATUS_OPTIONS, PRIORITY_OPTIONS };
export type { EmployeeTaskPriority, EmployeeTaskStatus };
export default TaskFiltersBar;
