import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import TaskMetricCard from "./TaskMetricCard";

interface TaskOverviewMetricsProps {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  teamProductivity: number;
  completionRate: number;
}

const TaskOverviewMetrics = ({
  total,
  completed,
  inProgress,
  overdue,
  teamProductivity,
  completionRate,
}: TaskOverviewMetricsProps) => (
  <section>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <TaskMetricCard
        label="Total Tasks"
        value={total}
        icon={ClipboardList}
        accent="bg-[#95d66d]"
        iconBg="bg-[#e8f7df] text-[#5fa836] dark:bg-[#95d66d]/15 dark:text-[#95d66d]"
      />
      <TaskMetricCard
        label="Completed"
        value={completed}
        icon={CheckCircle2}
        trend={`${completionRate}% rate`}
        accent="bg-emerald-400"
        iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
      />
      <TaskMetricCard
        label="In Progress"
        value={inProgress}
        icon={Activity}
        accent="bg-blue-400"
        iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
      />
      <TaskMetricCard
        label="Overdue"
        value={overdue}
        icon={AlertCircle}
        accent="bg-rose-400"
        iconBg="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
      />
      <TaskMetricCard
        label="Team Productivity"
        value={teamProductivity}
        suffix="%"
        icon={TrendingUp}
        trend="Active velocity"
        accent="bg-violet-400"
        iconBg="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
      />
      <TaskMetricCard
        label="Completion Rate"
        value={completionRate}
        suffix="%"
        icon={CheckCircle2}
        trend="All time"
        accent="bg-[#95d66d]"
        iconBg="bg-[#e8f7df] text-[#5fa836] dark:bg-[#95d66d]/15 dark:text-[#95d66d]"
      />
    </div>
  </section>
);

export default TaskOverviewMetrics;
