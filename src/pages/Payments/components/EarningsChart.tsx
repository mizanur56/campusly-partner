import type { ApexOptions } from "apexcharts";
import { LineChart } from "lucide-react";
import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useIsDarkMode } from "./useIsDarkMode";

export interface EarningsPoint {
  date: string;
  amount: number;
}

interface EarningsChartProps {
  title: string;
  subtitle: string;
  data: EarningsPoint[];
  color: string;
  currencySymbol?: string;
  months?: number;
}

function buildBuckets(months: number) {
  const now = new Date();
  const buckets: { label: string; key: string; total: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      key: `${d.getFullYear()}-${d.getMonth()}`,
      total: 0,
    });
  }
  return buckets;
}

export default function EarningsChart({
  title,
  subtitle,
  data,
  color,
  currencySymbol = "€",
  months = 6,
}: EarningsChartProps) {
  const isDark = useIsDarkMode();

  const { categories, series, total, hasData } = useMemo(() => {
    const buckets = buildBuckets(months);
    const index = new Map(buckets.map((b, i) => [b.key, i]));

    data.forEach((point) => {
      if (!point.date) return;
      const d = new Date(point.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = index.get(key);
      if (idx == null) return;
      buckets[idx].total += Number(point.amount) || 0;
    });

    const values = buckets.map((b) => Math.round(b.total));
    return {
      categories: buckets.map((b) => b.label),
      series: values,
      total: values.reduce((sum, v) => sum + v, 0),
      hasData: data.length > 0,
    };
  }, [data, months]);

  const gridColor = isDark ? "#27272a" : "#eef0f2";
  const labelColor = isDark ? "#a1a1aa" : "#94a3b8";

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 240,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      animations: { speed: 500 },
      sparkline: { enabled: false },
    },
    colors: [color],
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
      padding: { left: 8, right: 8, top: 0 },
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
        formatter: (v) =>
          `${currencySymbol}${Math.round(v).toLocaleString()}`,
      },
    },
    legend: { show: false },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (v) => `${currencySymbol}${Number(v).toLocaleString()}`,
      },
    },
    markers: { size: 0, hover: { size: 5 } },
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100 dark:bg-neutral-900 dark:ring-neutral-800">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
            {subtitle}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Last {months}M
          </p>
          <p className="text-lg font-bold tabular-nums text-neutral-900 dark:text-white">
            {currencySymbol}
            {total.toLocaleString()}
          </p>
        </div>
      </div>

      {hasData ? (
        <Chart options={options} series={[{ name: title, data: series }]} type="area" height={240} />
      ) : (
        <div className="flex h-[240px] flex-col items-center justify-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50 text-neutral-300 dark:bg-neutral-800/60 dark:text-neutral-600">
            <LineChart className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            No activity yet
          </p>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            Earnings will appear here once transactions are recorded.
          </p>
        </div>
      )}
    </div>
  );
}
