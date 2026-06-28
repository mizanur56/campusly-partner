import { CheckCircle2, Clock, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetPartnerTasksQuery } from "../../../../redux/features/tasks/partnerTasksApi";
import Panel from "./Panel";

const PRIORITY_STYLE: Record<string, { label: string; color: string }> = {
  URGENT: { label: "Urgent", color: "#e11d48" },
  HIGH: { label: "High", color: "#f59e0b" },
  MEDIUM: { label: "Medium", color: "#2563eb" },
  LOW: { label: "Low", color: "#64748b" },
};

function dueLabel(dueDate?: string | null) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  const diff = Math.ceil(
    (d.setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true };
  if (diff === 0) return { text: "Due today", overdue: false };
  if (diff === 1) return { text: "Due tomorrow", overdue: false };
  return { text: `Due in ${diff}d`, overdue: false };
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function TaskWidget() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetPartnerTasksQuery({
    page: 1,
    limit: 5,
    assignedToMe: true,
  });

  const tasks = data?.data ?? [];
  const stats = data?.meta?.stats?.byStatus;
  const pending = stats?.PENDING ?? 0;
  const inProgress = stats?.IN_PROGRESS ?? 0;
  const completed = stats?.COMPLETED ?? 0;

  return (
    <Panel
      title="My Tasks"
      subtitle="Assigned to you"
      icon={<ListChecks className="h-[18px] w-[18px]" aria-hidden />}
      accent="#0d9488"
      action={
        <button
          type="button"
          onClick={() => navigate("/my-tasks")}
          className="rounded-[6px] px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10"
        >
          View all
        </button>
      }
    >
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Pending"
          value={pending}
          color="#f59e0b"
        />
        <Stat
          icon={<ListChecks className="h-3.5 w-3.5" />}
          label="In progress"
          value={inProgress}
          color="#2563eb"
        />
        <Stat
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          label="Completed"
          value={completed}
          color="#10b981"
        />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 rounded-[6px] border border-neutral-100 p-2.5 dark:border-white/5"
            >
              <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-2.5 w-1/3 rounded bg-neutral-100 dark:bg-neutral-800" />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-2 h-9 w-9 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              You're all caught up.
            </p>
          </div>
        ) : (
          tasks.map((t) => {
            const prio =
              PRIORITY_STYLE[(t.priority ?? "LOW").toUpperCase()] ??
              PRIORITY_STYLE.LOW;
            const due = dueLabel(t.dueDate);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => navigate("/my-tasks")}
                className="flex w-full items-center gap-3 rounded-[6px] border border-neutral-100 p-2.5 text-left transition-colors hover:bg-neutral-50/80 dark:border-white/5 dark:hover:bg-white/5"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: `${prio.color}1a`,
                    color: prio.color,
                  }}
                >
                  {initials(t.assigned_member_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-white">
                    {t.task_title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: prio.color }}
                    >
                      {prio.label}
                    </span>
                    {due ? (
                      <>
                        <span className="text-neutral-300 dark:text-neutral-600">
                          •
                        </span>
                        <span
                          className={`text-[11px] ${
                            due.overdue
                              ? "font-semibold text-rose-500"
                              : "text-neutral-400"
                          }`}
                        >
                          {due.text}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </Panel>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-[6px] border border-neutral-100 bg-neutral-50/60 p-2.5 dark:border-white/5 dark:bg-white/5">
      <span
        className="inline-flex items-center gap-1 text-[11px] font-medium"
        style={{ color }}
      >
        {icon}
        {label}
      </span>
      <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
