import {
  Download,
  FileBarChart,
  Plus,
  UserPlus,
} from "lucide-react";
import GlassCard from "./GlassCard";
import { TASK_RADIUS } from "./taskStyles";

interface TaskQuickActionsProps {
  canCreate: boolean;
  onCreateTask: () => void;
  onAssignTask: () => void;
  onExport: () => void;
  onSummary: () => void;
}

const TaskQuickActions = ({
  canCreate,
  onCreateTask,
  onAssignTask,
  onExport,
  onSummary,
}: TaskQuickActionsProps) => {
  const actions = [
    {
      label: "Create Task",
      desc: "Add new work item",
      icon: Plus,
      onClick: onCreateTask,
      primary: true,
      hidden: !canCreate,
    },
    {
      label: "Assign Task",
      desc: "Delegate to team",
      icon: UserPlus,
      onClick: onAssignTask,
      hidden: !canCreate,
    },
    {
      label: "Export Report",
      desc: "Download CSV",
      icon: Download,
      onClick: onExport,
    },
    {
      label: "Generate Summary",
      desc: "AI-style overview",
      icon: FileBarChart,
      onClick: onSummary,
    },
  ].filter((a) => !a.hidden);

  return (
    <GlassCard padding="md">
      <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`flex items-center gap-3 border p-3 text-left transition-all duration-200 ${TASK_RADIUS} ${
                action.primary
                  ? "border-[#95d66d]/40 bg-gradient-to-r from-[#95d66d]/15 to-[#95d66d]/5 hover:border-[#95d66d] hover:shadow-md dark:from-[#95d66d]/10 dark:to-transparent"
                  : "border-slate-200/80 bg-white/50 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center ${TASK_RADIUS} ${
                  action.primary
                    ? "bg-[#95d66d] text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {action.label}
                </p>
                <p className="text-[10px] text-slate-500">{action.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default TaskQuickActions;
