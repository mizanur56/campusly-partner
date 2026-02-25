import React from "react";

const SkeletonInstitutionCard: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* University Logo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-xl"></div>
        </div>

        {/* University Info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-2"></div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-3">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>

          {/* Description */}
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>

          {/* Button */}
          <div className="h-9 bg-gray-200 rounded-lg w-28"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonInstitutionCard;
