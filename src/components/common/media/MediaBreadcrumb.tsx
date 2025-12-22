import React from "react";
import { Breadcrumb } from "antd";
import { getBreadcrumbItems } from "../../../utils/mediaHelpers";

interface MediaBreadcrumbProps {
  currentFolder: string;
  onFolderSelect: (path: string) => void;
  showItemCount?: boolean;
  itemCount?: number;
}

const MediaBreadcrumb: React.FC<MediaBreadcrumbProps> = ({
  currentFolder,
  onFolderSelect,
  showItemCount = false,
  itemCount = 0,
}) => {
  const breadcrumbItems = getBreadcrumbItems(currentFolder);

  return (
    <div className="flex items-center justify-between mb-3">
      <Breadcrumb>
        {breadcrumbItems.map((item, index) => (
          <Breadcrumb.Item
            key={item.path}
            onClick={() => onFolderSelect(item.path)}
            className={`cursor-pointer ${
              index === breadcrumbItems.length - 1
                ? "text-gray-900 font-semibold"
                : "text-gray-500 hover:text-primary-600"
            }`}
          >
            {item.title === "Root" ? "All Media" : item.title}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      {showItemCount && (
        <span className="text-sm text-gray-500">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
};

export default MediaBreadcrumb;
