import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface TaskStatusRadialChartProps {
  completed: number;
  incomplete: number;
  pending: number;
}

const TaskStatusRadialChart: React.FC<TaskStatusRadialChartProps> = ({
  completed = 10,
  incomplete = 10,
  pending = 10,
}) => {
  const series = [completed, incomplete, pending];

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 300,
      offsetX: 0,
      offsetY: 0,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "50%",
        },
        track: {
          background: "",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          show: false,
        },
      },
    
    },
    colors: ["#00B561", "#FF4133", "#FF9100"], // Green, Red, Orange
    labels: ["Completed", "Incomplete", "Pending"],
    stroke: {
      lineCap: "round",
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Circular Bar Chart */}
      <div className="mb-6" style={{ transform: "rotate(-80deg)" }}>
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
          <span className="text-sm font-medium text-gray-900">{completed}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
            <span className="text-sm text-gray-600">Incomplete</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{incomplete}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{pending}%</span>
        </div>
      </div>
    </div>
  );
};

export default TaskStatusRadialChart;
