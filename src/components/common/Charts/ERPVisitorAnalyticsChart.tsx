import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import Chart from "react-apexcharts";
// import { Loader } from "../Loading";

interface MonthlyData {
  month: string;
  totalSales: number;
  totalAmount: number;
  totalDiscount: number;
  totalFinalAmount: number;
  totalPaid: number;
  totalDue: number;
  averageOrderValue: number;
}

interface DayData {
  dayOfWeek: number;
  dayName: string;
  totalSales: number;
  totalAmount: number;
  averageAmount: number;
}

interface HourlyData {
  hour: number;
  hourLabel: string;
  totalSales: number;
  totalAmount: number;
  averageAmount: number;
}

const ERPVisitorAnalyticsChart: React.FC = () => {
  const hourlyPattern: any[] = [];

  const dayPattern: any[] = [];

  const monthlyComparison: any[] = [];

  const [activeFilter, setActiveFilter] = useState<
    "12 months" | "7 days" | "24 hours"
  >("7 days");

  // Process data from APIs
  const processChartData = () => {
    switch (activeFilter) {
      case "12 months": {
        const monthlyData = monthlyComparison.map(
          (item: MonthlyData) => item.totalSales || 0
        );
        const monthlyLabels = monthlyComparison.map((item: MonthlyData) => {
          const date = new Date(item.month);
          return date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
        });
        return {
          data: monthlyData,
          labels: monthlyLabels,
          originalData: monthlyComparison,
        };
      }

      case "7 days": {
        const dayData = [0, 0, 0, 0, 0, 0, 0];
        const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayOriginalData: (DayData | null)[] = Array(7).fill(null);

        dayPattern.forEach((item: DayData) => {
          dayData[item.dayOfWeek] = item.totalSales || 0;
          dayOriginalData[item.dayOfWeek] = item;
        });
        return {
          data: dayData,
          labels: dayLabels,
          originalData: dayOriginalData,
        };
      }

      case "24 hours": {
        const hourData = Array(24).fill(0);
        const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        const hourOriginalData: (HourlyData | null)[] = Array(24).fill(null);

        hourlyPattern.forEach((item: HourlyData) => {
          if (item.hour >= 0 && item.hour < 24) {
            hourData[item.hour] = item.totalSales || 0;
            hourOriginalData[item.hour] = item;
          }
        });
        return {
          data: hourData,
          labels: hourLabels,
          originalData: hourOriginalData,
        };
      }
    }
  };

  const {
    data: chartData,
    labels: categories,
    originalData,
  } = processChartData();

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#019532"],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        borderRadiusApplication: "end" as const,
        columnWidth: activeFilter === "24 hours" ? "60%" : "50%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: { colors: "#64748b", fontSize: "12px" },
        rotate: activeFilter === "24 hours" ? -45 : 0,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b", fontSize: "12px" },
        formatter: (value: number) => value.toFixed(0),
      },
      title: {
        text: "Number of Sales",
        style: {
          color: "#64748b",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      custom: function ({
        seriesIndex,
        dataPointIndex,
      }: {
        seriesIndex: number;
        dataPointIndex: number;
      }) {
        if (seriesIndex === undefined || dataPointIndex === undefined)
          return "";

        const currentData = originalData[dataPointIndex];
        const salesCount = chartData[dataPointIndex];
        const periodLabel = categories[dataPointIndex];

        // Format currency
        const formatCurrency = (amount: number | undefined) => {
          return (
            amount?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0"
          );
        };

        let tooltipContent = "";

        switch (activeFilter) {
          case "12 months": {
            const monthlyData = currentData as MonthlyData;
            tooltipContent = `
              <div style="padding: 12px; min-width: 220px; font-family: Inter, sans-serif;">
                <div style="font-weight: 600; color: #111827; font-size: 14px; margin-bottom: 8px;">
                  ${periodLabel}
                </div>
                <div style="display: grid; gap: 6px; font-size: 12px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Sales Count:</span>
                    <span style="color: #019532; font-weight: 600;">${salesCount}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Total Amount:</span>
                    <span style="color: #019532; font-weight: 600;">${formatCurrency(
                      monthlyData?.totalAmount
                    )} ৳</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Discount:</span>
                    <span style="color: #ef4444; font-weight: 600;">${formatCurrency(
                      monthlyData?.totalDiscount
                    )} ৳</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Final Amount:</span>
                    <span style="color: #10b981; font-weight: 600;">${formatCurrency(
                      monthlyData?.totalFinalAmount
                    )} ৳</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Paid:</span>
                    <span style="color: #10b981; font-weight: 600;">${formatCurrency(
                      monthlyData?.totalPaid
                    )} ৳</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Due:</span>
                    <span style="color: #ef4444; font-weight: 600;">${formatCurrency(
                      monthlyData?.totalDue
                    )} ৳</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Avg Order:</span>
                    <span style="color: #8b5cf6; font-weight: 600;">${formatCurrency(
                      monthlyData?.averageOrderValue
                    )} ৳</span>
                  </div>
                </div>
              </div>
            `;
            break;
          }

          case "7 days": {
            const dayData = currentData as DayData;
            tooltipContent = `
              <div style="padding: 12px; min-width: 220px; font-family: Inter, sans-serif;">
                <div style="font-weight: 600; color: #111827; font-size: 14px; margin-bottom: 8px;">
                  ${periodLabel}
                </div>
                <div style="display: grid; gap: 6px; font-size: 12px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Sales Count:</span>
                    <span style="color: #019532; font-weight: 600;">${salesCount}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Total Amount:</span>
                    <span style="color: #019532; font-weight: 600;">${formatCurrency(
                      dayData?.totalAmount
                    )} ৳</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Avg Amount:</span>
                    <span style="color: #8b5cf6; font-weight: 600;">${formatCurrency(
                      dayData?.averageAmount
                    )} ৳</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Day Name:</span>
                    <span style="color: #6b7280; font-weight: 500;">${
                      dayData?.dayName || periodLabel
                    }</span>
                  </div>
                </div>
              </div>
            `;
            break;
          }

          case "24 hours": {
            const hourlyData = currentData as HourlyData;
            tooltipContent = `
              <div style="padding: 12px; min-width: 220px; font-family: Inter, sans-serif;">
                <div style="font-weight: 600; color: #111827; font-size: 14px; margin-bottom: 8px;">
                  ${periodLabel}
                </div>
                <div style="display: grid; gap: 6px; font-size: 12px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Sales Count:</span>
                    <span style="color: #019532; font-weight: 600;">${salesCount}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Total Amount:</span>
                    <span style="color: #019532; font-weight: 600;">${formatCurrency(
                      hourlyData?.totalAmount
                    )} ৳</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Avg Amount:</span>
                    <span style="color: #8b5cf6; font-weight: 600;">${formatCurrency(
                      hourlyData?.averageAmount
                    )} ৳</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Hour Label:</span>
                    <span style="color: #6b7280; font-weight: 500;">${
                      hourlyData?.hourLabel || periodLabel
                    }</span>
                  </div>
                </div>
              </div>
            `;
            break;
          }
        }

        return `
          <div style="
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
          ">
            ${tooltipContent}
          </div>
        `;
      },
    },
  };

  const series = [
    {
      name: "Sales",
      data: chartData,
    },
  ];

  // Show loading state if any API is loading
  // const isLoading =
  //   hourlyPatternLoading || dayPatternLoading || monthlyComparisonLoading;

  // if (isLoading) {
  //   return (
  //    <Loader/>
  //   );
  // }

  return (
    <div className="bg-white rounded-xl border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sales Analytics
          </h3>
          <p className="text-sm text-gray-500">
            Sales performance for {activeFilter}
          </p>
        </div>
        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-md border">
          {["12 months", "7 days", "24 hours"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-white text-green-600 shadow-sm border border-green-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default ERPVisitorAnalyticsChart;
