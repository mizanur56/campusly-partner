import React from "react";

interface DashboardStatsCardProps {
  icon: React.ReactNode;
  color: "blue" | "purple" | "green";
  title: string;
  value: string | number;
  subtitle?: string;
}

const colorMap: Record<
  string,
  {
    gradient: string;
    iconBg: string;
  }
> = {
  blue: {
    gradient: "linear-gradient(135.58deg, #387DF5 0.49%, #3F3FD1 99.51%)",
    iconBg: "#3F3FD1",
  },
  purple: {
    gradient: "linear-gradient(135.58deg, #99A5FF 0.49%, #6B7AED 99.51%)",
    iconBg: "#6B7AED",
  },
  green: {
    gradient: "linear-gradient(135.58deg, #61BF7A 0.49%, #237D3B 99.51%)",
    iconBg: "#237D3B",
  },
};

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({
  icon,
  color,
  title,
  value,
  subtitle = "Pending",
}) => {
  const colorClasses = colorMap[color] || colorMap.blue;

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-5 text-white shadow-lg"
      style={{
        height: "200px",
        background: colorClasses.gradient,
        boxShadow: "0px 20px 20px 0px rgba(31, 31, 31, 0.05)",
      }}
    >
      {/* LEFT SIDE CURVED SHAPE */}
      <div
        className="absolute rounded-full"
        style={{
          width: "560px",
          height: "450px",
          top: "-200px",
          left: "-150px",
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          mixBlendMode: "soft-light",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex justify-between h-full">
        <div>
          <div
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3"
          >
            <span className="text-white text-xl">{icon}</span>
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm opacity-80">{subtitle}</p>
        </div>

        <div className="text-3xl font-bold">{value}</div>
      </div>
    </div>
  );
};

export default DashboardStatsCard;
