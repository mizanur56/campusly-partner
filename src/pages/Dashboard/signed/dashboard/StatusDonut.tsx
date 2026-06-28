import { ApexOptions } from "apexcharts";
import { PieChart } from "lucide-react";
import { useMemo } from "react";
import Chart from "react-apexcharts";
import { PartnerDashboardTopStats } from "../../../../redux/features/profile/partnerProfileApi";
import Panel from "./Panel";
import { useIsDarkMode } from "./useIsDarkMode";

export default function StatusDonut({
  topStats,
  isLoading,
}: {
  topStats?: PartnerDashboardTopStats;
  isLoading: boolean;
}) {
  const isDark = useIsDarkMode();

  const { series, labels, colors, total } = useMemo(() => {
    const accepted = topStats?.accepted_applications ?? 0;
    const rejected = topStats?.rejected_applications ?? 0;
    const totalApps = topStats?.applications_total ?? 0;
    const inProgress = Math.max(totalApps - accepted - rejected, 0);

    return {
      series: [accepted, inProgress, rejected],
      labels: ["Accepted", "In Progress", "Rejected"],
      colors: ["#10b981", "#2563eb", "#ef4444"],
      total: totalApps,
    };
  }, [topStats]);

  const hasData = series.some((s) => s > 0);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
    },
    labels,
    colors,
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              color: isDark ? "#a1a1aa" : "#64748b",
              offsetY: 18,
            },
            value: {
              show: true,
              fontSize: "26px",
              fontWeight: 700,
              color: isDark ? "#ffffff" : "#111827",
              offsetY: -16,
              formatter: (v) => `${v}`,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "12px",
              color: isDark ? "#a1a1aa" : "#64748b",
              formatter: () => `${total}`,
            },
          },
        },
      },
    },
    tooltip: { theme: isDark ? "dark" : "light", y: { formatter: (v) => `${v}` } },
    states: { hover: { filter: { type: "lighten" } } },
  };

  return (
    <Panel
      title="Application Status"
      subtitle="Breakdown of all submissions"
      icon={<PieChart className="h-[18px] w-[18px]" aria-hidden />}
      accent="#2563eb"
    >
      {isLoading ? (
        <div className="flex h-[280px] items-center justify-center">
          <div className="h-40 w-40 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
        </div>
      ) : hasData ? (
        <>
          <Chart options={options} series={series} type="donut" height={240} />
          <div className="mt-3 space-y-2">
            {labels.map((label, i) => (
              <div
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <span className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors[i] }}
                  />
                  {label}
                </span>
                <span className="font-semibold tabular-nums text-neutral-900 dark:text-white">
                  {series[i]}
                  <span className="ml-1.5 text-xs font-normal text-neutral-400">
                    {total > 0 ? Math.round((series[i] / total) * 100) : 0}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-[280px] flex-col items-center justify-center text-center">
          <PieChart className="mb-2 h-9 w-9 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No application data yet.
          </p>
        </div>
      )}
    </Panel>
  );
}
