import { Button } from "antd";
import React from "react";

interface CourseCardProps {
  title: string;
  level: string;
  institution: {
    name: string;
    logo?: string;
    location: string;
  };
  price: string;
  intake?: string;
  duration?: string;
  startDates?: string;
  onStartApplication?: () => void;
  onViewDetails?: () => void;
  isApplied?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  level,
  institution,
  price,
  intake,
  duration,
  startDates,
  onStartApplication,
  onViewDetails,
  isApplied,
}) => {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-5 sm:p-6">
      {/* Title and Level */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
          {level}
        </span>
      </div>

      {/* Institution Info */}
      <div className="flex items-center gap-3 mb-4">
        {institution.logo ? (
          <img
            src={institution.logo}
            alt={institution.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-100"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-400 font-semibold text-xs">ECI</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base text-gray-900 truncate">
            {institution.name}
          </p>
          <p className="text-sm text-gray-600">{institution.location}</p>
        </div>
      </div>

      {/* Course Details - Display as text */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Intake
          </label>
          <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/80 text-gray-700 text-sm">
            {intake || "N/A"}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Duration
          </label>
          <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/80 text-gray-700 text-sm">
            {duration || "N/A"}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Start Dates
          </label>
          <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/80 text-gray-700 text-sm">
            {startDates || "N/A"}
          </div>
        </div>
      </div>

      {/* Price and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div
          className={
            onStartApplication || onViewDetails ? "order-2 sm:order-1" : ""
          }
        >
          <p className="text-lg font-semibold text-gray-900">{price}</p>
        </div>
        {(onStartApplication || onViewDetails) && (
          <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2 w-full sm:w-auto">
            {/* {onStartApplication && (
              <Button onClick={onStartApplication} type="primary">
                Start Application
              </Button>
            )} */}

            {onStartApplication && (
              <Button
                onClick={onStartApplication}
                type="primary"
                disabled={isApplied} // 👈 disable
              >
                {isApplied ? "Applied" : "Start Application"}{" "}
              </Button>
            )}
            {onViewDetails && (
              <Button onClick={onViewDetails} type="default">
                View Details
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
