import { ApexOptions } from "apexcharts";
import { Activity } from "lucide-react";
import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { useGetMyAllApplicationsQuery } from "../../../../redux/features/application/applicationApi";
import Panel from "./Panel";
import { accents } from "./tokens";
import { useIsDarkMode } from "./useIsDarkMode";

type AppRow = { status?: string; createdAt?: string };

const RANGES = [
  { key: "6m", label: "6M", months: 6 },
  { key: "12m", label: "12M", months: 12 },
] as const;

function buildBuckets(months: number) {
  const now = new Date();
  const buckets: { label: string; key: string; total: number; accepted: number }[] =
    [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      key: `${d.getFullYear()}-${d.getMonth()}`,
      total: 0,
      accepted: 0,
    });
  }
  return buckets;
}

export default function PerformanceAnalytics() {
  const isDark = useIsDarkMode();
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("6m");

  const { data, isLoading } = useGetMyAllApplicationsQuery({
    page: 1,
    limit: 200,
  });

  const months = RANGES.find((r) => r.key === range)?.months ?? 6;

  const { categories, totalSeries, acceptedSeries, totalCount } = useMemo(() => {
    const rows: AppRow[] = data?.data ?? [];
    const buckets = buildBuckets(months);
    const index = new Map(buckets.map((b, i) => [b.key, i]));

    rows.forEach((r) => {
      if (!r.createdAt) return;
      const d = new Date(r.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = index.get(key);
      if (idx == null) return;
      buckets[idx].total += 1;
      if (r.status === "SUCCESS") buckets[idx].accepted += 1;
    });

    return {
      categories: buckets.map((b) => b.label),
      totalSeries: buckets.map((b) => b.total),
      acceptedSeries: buckets.map((b) => b.accepted),
      totalCount: rows.length,
    };
  }, [data, months]);

  const gridColor = isDark ? "#27272a" : "#eef0f2";
  const labelColor = isDark ? "#a1a1aa" : "#64748b";

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 300,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      animations: { speed: 500 },
      sparkline: { enabled: false },
    },
    colors: [accents.green, accents.blue],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 95, 100],
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      padding: { left: 8, right: 8 },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: labelColor, fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: labelColor, fontSize: "12px" },
        formatter: (v) => `${Math.round(v)}`,
      },
    },
    legend: { show: false },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: { formatter: (v) => `${v} applications` },
    },
    markers: { size: 0, hover: { size: 5 } },
  };

  const series = [
    { name: "Submitted", data: totalSeries },
    { name: "Accepted", data: acceptedSeries },
  ];

  return (
    <Panel
      title="Performance Analytics"
      subtitle="Applications submitted vs. accepted over time"
      icon={<Activity className="h-[18px] w-[18px]" aria-hidden />}
      accent={accents.green}
      action={
        <div className="flex items-center gap-1 rounded-[6px] bg-neutral-100 p-0.5 dark:bg-neutral-800">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`rounded-[5px] px-2.5 py-1 text-xs font-semibold transition ${
                range === r.key
                  ? "bg-white text-primary-700 shadow-sm dark:bg-neutral-900 dark:text-primary-400"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <Legend color={accents.green} label="Submitted" />
        <Legend color={accents.blue} label="Accepted" />
        <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
          {isLoading ? "Loading…" : `${totalCount} total applications`}
        </span>
      </div>
      <Chart options={options} series={series} type="area" height={300} />
    </Panel>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
