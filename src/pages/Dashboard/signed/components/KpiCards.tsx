import {
  CheckCircle2,
  FileText,
  GraduationCap,
  ListTodo,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

const KPI_CONFIG = [
  {
    key: "tasks_pending",
    label: "Tasks",
    sub: "Pending tasks",
    gradient: "linear-gradient(135.58deg, #387DF5 0.49%, #3F3FD1 99.51%)",
    icon: <ListTodo className="h-5 w-5 text-white" aria-hidden />,
  },
  {
    key: "applications_total",
    label: "Applications",
    sub: "Total submissions",
    gradient: "linear-gradient(135.58deg, #A855F7 0.49%, #7C3AED 99.51%)",
    icon: <FileText className="h-5 w-5 text-white" aria-hidden />,
  },
  {
    key: "accepted_applications",
    label: "Accepted",
    sub: "Approved applications",
    gradient: "linear-gradient(135.58deg, #61BF7A 0.49%, #237D3B 99.51%)",
    icon: <CheckCircle2 className="h-5 w-5 text-white" aria-hidden />,
  },
  {
    key: "rejected_applications",
    label: "Rejected",
    sub: "Declined applications",
    gradient: "linear-gradient(135.58deg, #EF4444 0.49%, #B91C1C 99.51%)",
    icon: <XCircle className="h-5 w-5 text-white" aria-hidden />,
  },
  {
    key: "active_students",
    label: "Students",
    sub: "Active students",
    gradient: "linear-gradient(135.58deg, #F59E0B 0.49%, #D97706 99.51%)",
    icon: <GraduationCap className="h-5 w-5 text-white" aria-hidden />,
  },
] as const;

export default function KpiCards({
  topStats,
  isLoading,
}: {
  topStats: Record<string, number> | undefined;
  isLoading: boolean;
}) {
  const kpiCards = useMemo(
    () =>
      KPI_CONFIG.map((cfg) => ({
        ...cfg,
        value: topStats?.[cfg.key] ?? 0,
      })),
    [topStats],
  );

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {isLoading
        ? KPI_CONFIG.map((kpi) => (
            <div
              key={kpi.key}
              className="relative overflow-hidden rounded-xl p-4 text-white card-shadow animate-pulse"
              style={{ background: kpi.gradient }}
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20" />
                <div className="h-7 w-10 rounded bg-white/35" />
              </div>
              <div className="relative mt-3 space-y-2">
                <div className="h-4 w-20 rounded bg-white/30" />
                <div className="h-3 w-24 rounded bg-white/20" />
              </div>
            </div>
          ))
        : kpiCards.map((kpi) => (
            <div
              key={kpi.key}
              className="relative overflow-hidden rounded-xl p-4 text-white card-shadow"
              style={{ background: kpi.gradient }}
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  {kpi.icon}
                </div>
                <div className="text-2xl font-bold leading-none">
                  {kpi.value}
                </div>
              </div>
              <div className="relative mt-3">
                <p className="text-sm font-semibold leading-tight">
                  {kpi.label}
                </p>
                <p className="mt-0.5 text-xs text-white/80">{kpi.sub}</p>
              </div>
            </div>
          ))}
    </div>
  );
}

