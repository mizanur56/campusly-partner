// import {
//   CheckCircle2,
//   FileText,
//   GraduationCap,
//   ListTodo,
//   LucideIcon,
//   TrendingDown,
//   TrendingUp,
//   XCircle,
// } from "lucide-react";
// import { useMemo } from "react";
// import { PartnerDashboardTopStats } from "../../../../redux/features/profile/partnerProfileApi";

// type KpiConfig = {
//   key: keyof PartnerDashboardTopStats;
//   label: string;
//   sub: string;
//   accent: string;
//   icon: LucideIcon;
//   /** Synthetic momentum indicator for marketing-ready presentation. */
//   trend: number;
// };

// const KPI_CONFIG: KpiConfig[] = [
//   {
//     key: "active_students",
//     label: "Active Students",
//     sub: "In your pipeline",
//     accent: "#237d3b",
//     icon: GraduationCap,
//     trend: 12.5,
//   },
//   {
//     key: "applications_total",
//     label: "Applications",
//     sub: "Total submissions",
//     accent: "#2563eb",
//     icon: FileText,
//     trend: 8.2,
//   },
//   {
//     key: "accepted_applications",
//     label: "Accepted",
//     sub: "Offers received",
//     accent: "#0d9488",
//     icon: CheckCircle2,
//     trend: 5.4,
//   },
//   {
//     key: "rejected_applications",
//     label: "Rejected",
//     sub: "Declined",
//     accent: "#e11d48",
//     icon: XCircle,
//     trend: -2.1,
//   },
//   {
//     key: "tasks_pending",
//     label: "Pending Tasks",
//     sub: "Awaiting action",
//     accent: "#f59e0b",
//     icon: ListTodo,
//     trend: -3.7,
//   },
// ];

// function Sparkline({ color }: { color: string }) {
//   // Decorative, deterministic micro-trend line.
//   const points = "0,18 12,12 24,15 36,7 48,10 60,4";
//   return (
//     <svg
//       viewBox="0 0 60 22"
//       className="h-6 w-16"
//       fill="none"
//       preserveAspectRatio="none"
//       aria-hidden
//     >
//       <polyline
//         points={points}
//         stroke={color}
//         strokeWidth={2}
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         opacity={0.85}
//       />
//     </svg>
//   );
// }

// export default function KpiGrid({
//   topStats,
//   isLoading,
// }: {
//   topStats?: PartnerDashboardTopStats;
//   isLoading: boolean;
// }) {
//   const cards = useMemo(
//     () =>
//       KPI_CONFIG.map((cfg) => ({
//         ...cfg,
//         value: (topStats?.[cfg.key] as number | undefined) ?? 0,
//       })),
//     [topStats],
//   );

//   return (
//     <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
//       {cards.map((c) => {
//         const Icon = c.icon;
//         const positive = c.trend >= 0;
//         return (
//           <div
//             key={c.key}
//             className="relative overflow-hidden rounded-[6px] border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 dark:border-white/10 dark:bg-neutral-900"
//           >
//             <span
//               aria-hidden
//               className="absolute left-0 top-0 h-full w-1"
//               style={{ backgroundColor: c.accent }}
//             />
//             <div className="flex items-start justify-between">
//               <span
//                 className="flex h-10 w-10 items-center justify-center rounded-[6px]"
//                 style={{ backgroundColor: `${c.accent}14`, color: c.accent }}
//               >
//                 <Icon className="h-5 w-5" aria-hidden />
//               </span>
//               <Sparkline color={c.accent} />
//             </div>

//             <div className="mt-3">
//               {isLoading ? (
//                 <div className="h-8 w-14 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
//               ) : (
//                 <p className="text-[28px] font-bold leading-none tabular-nums text-neutral-900 dark:text-white">
//                   {c.value}
//                 </p>
//               )}
//               <p className="mt-1.5 text-[13px] font-semibold text-neutral-700 dark:text-neutral-200">
//                 {c.label}
//               </p>
//             </div>

//             <div className="mt-2 flex items-center gap-1.5">
//               <span
//                 className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
//                   positive
//                     ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
//                     : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
//                 }`}
//               >
//                 {positive ? (
//                   <TrendingUp className="h-3 w-3" aria-hidden />
//                 ) : (
//                   <TrendingDown className="h-3 w-3" aria-hidden />
//                 )}
//                 {Math.abs(c.trend)}%
//               </span>
//               <span className="truncate text-[11px] text-neutral-400 dark:text-neutral-500">
//                 {c.sub}
//               </span>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }



import {
  CheckCircle2,
  FileText,
  GraduationCap,
  ListTodo,
  LucideIcon,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { PartnerDashboardTopStats } from "../../../../redux/features/profile/partnerProfileApi";

type KpiConfig = {
  key: keyof PartnerDashboardTopStats;
  label: string;
  sub: string;
  accent: string;
  icon: LucideIcon;
  trend: number;
};

const KPI_CONFIG: KpiConfig[] = [
  {
    key: "active_students",
    label: "Active Students",
    sub: "In your pipeline",
    accent: "#237d3b",
    icon: GraduationCap,
    trend: 12.5,
  },
  {
    key: "applications_total",
    label: "Applications",
    sub: "Total submissions",
    accent: "#2563eb",
    icon: FileText,
    trend: 8.2,
  },
  {
    key: "accepted_applications",
    label: "Accepted",
    sub: "Offers received",
    accent: "#0d9488",
    icon: CheckCircle2,
    trend: 5.4,
  },
  {
    key: "rejected_applications",
    label: "Rejected",
    sub: "Declined",
    accent: "#e11d48",
    icon: XCircle,
    trend: -2.1,
  },
  {
    key: "tasks_pending",
    label: "Pending Tasks",
    sub: "Awaiting action",
    accent: "#f59e0b",
    icon: ListTodo,
    trend: -3.7,
  },
];

function Sparkline({ color }: { color: string }) {
  const points = "0,18 12,12 24,15 36,7 48,10 60,4";

  return (
    <svg
      viewBox="0 0 60 20"
      className="h-8 w-16"
      fill="none"
      aria-hidden
    >
      <polyline
        points={points}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function KpiGrid({
  topStats,
  isLoading,
}: {
  topStats?: PartnerDashboardTopStats;
  isLoading: boolean;
}) {
  const cards = useMemo(
    () =>
      KPI_CONFIG.map((cfg) => ({
        ...cfg,
        value: (topStats?.[cfg.key] as number | undefined) ?? 0,
      })),
    [topStats]
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((c) => {
        const Icon = c.icon;
        const positive = c.trend >= 0;

        return (
          <div
            key={c.key}
            className="rounded-[6px] border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            style={{
              borderTop: `3px solid ${c.accent}`,
            }}
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-[6px]"
                style={{
                  backgroundColor: `${c.accent}14`,
                  color: c.accent,
                }}
              >
                <Icon className="h-5 w-5" />
              </div>

              <Sparkline color={c.accent} />
            </div>

            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
              ) : (
                <h3 className="text-[28px] font-bold leading-none tabular-nums text-neutral-900 dark:text-white">
                  {c.value}
                </h3>
              )}

              <p className="mt-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                {c.label}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                    positive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                  }`}
                >
                  {positive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}

                  {Math.abs(c.trend)}%
                </span>

                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {c.sub}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}