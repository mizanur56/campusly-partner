import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

const TaskByStatus = () => {
  const series = [45, 20, 65]; // Completed (bigger), Incomplete (smaller), Pending (a bit bigger)

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 300,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "50%",
        },
        track: {
          background: "",
          strokeWidth: "100%",
        },
        dataLabels: {
          show: false,
        },
      },
    },
    colors: ["#10B981", "#EF4444", "#F59E0B"], // Green, Red, Orange
    labels: ["Completed", "Incomplete", "Pending"],
    stroke: {
      lineCap: "round",
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="bg-[#FFFFFF] rounded-lg border border-primary-border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Task By Status
      </h2>
      <div className="flex flex-col items-center justify-center py-4">
        {/* Circular Bar Chart */}
        <div className="mb-6">
          <Chart
            options={options}
            series={series}
            type="radialBar"
            height={300}
          />
        </div>
        {/* Legend */}
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <span className="text-sm font-medium text-gray-900">45%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
              <span className="text-sm text-gray-600">Incomplete</span>
            </div>
            <span className="text-sm font-medium text-gray-900">20%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <span className="text-sm font-medium text-gray-900">65%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskByStatus;
