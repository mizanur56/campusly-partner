import React from "react";

const SkeletonCourseCard: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 animate-pulse">
      {/* Title and Level */}
      <div className="mb-3 sm:mb-4">
        <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </div>

      {/* Institution Info */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
        <div className="min-w-0 flex-1">
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-2/3 mb-1"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      {/* Course Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div>
          <div className="h-4 bg-gray-200 rounded w-12 mb-1.5 sm:mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-xl"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-1.5 sm:mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-xl"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-1.5 sm:mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      {/* Price and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-3">
        {/* Price */}
        <div className="order-2 sm:order-1">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto">
          <div className="h-9 bg-gray-200 rounded-lg w-full sm:w-32"></div>
          <div className="h-9 bg-gray-200 rounded-lg w-full sm:w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCourseCard;
