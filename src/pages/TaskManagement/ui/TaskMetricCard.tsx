import CountUp from "react-countup";
import { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";
import { TASK_RADIUS } from "./taskStyles";

interface TaskMetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  trend?: string;
  accent: string;
  iconBg: string;
}

const TaskMetricCard = ({
  label,
  value,
  suffix = "",
  icon: Icon,
  trend,
  accent,
  iconBg,
}: TaskMetricCardProps) => (
  <GlassCard hover padding="md" className="group relative overflow-hidden">
    <div
      className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30 ${accent}`}
    />
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
          <CountUp end={value} duration={1.2} separator="," />
          {suffix}
        </p>
        {trend && (
          <p className="mt-1.5 text-xs font-medium text-[#5fa836] dark:text-[#95d66d]">
            {trend}
          </p>
        )}
      </div>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center ${TASK_RADIUS} ${iconBg}`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </GlassCard>
);

export default TaskMetricCard;
