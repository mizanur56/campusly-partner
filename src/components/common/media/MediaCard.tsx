import { CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import React from "react";
import { MediaImage } from "../../../types/media";
import { formatFileSize } from "../../../utils/mediaHelpers";
import AntImage from "../../shared/AntImage";

interface MediaCardProps {
  image: MediaImage;
  onCopy?: (url: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  size?: "small" | "default";
  disabled?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({
  image,
  onCopy,
  onDelete,
  showActions = true,
  size = "default",
  disabled = false,
}) => {
  const isSmall = size === "small";

  return (
    <div
      className={`group relative bg-white rounded-lg border border-primary-border overflow-hidden transition-all duration-300 hover:border-gray-300  ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {/* Image Container with fixed aspect ratio */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden cursor-pointer">
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <AntImage
            accessurl
            preview
            alt={image.altText || image.name}
            src={image.url}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
            className="rounded"
          />
        </div>

        {/* Hover Actions Overlay */}
        {showActions && !disabled && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
            <div className="absolute top-2 right-2 flex gap-2 pointer-events-auto">
              {onCopy && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(image.url);
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200"
                  title="Copy URL"
                >
                  <CopyOutlined className="text-gray-700 text-sm" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id);
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors duration-200"
                  title="Delete"
                >
                  <DeleteOutlined className="text-red-500 text-sm" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Info */}
      <div
        className={`p-3 border-t border-primary-border ${isSmall ? "p-2" : ""}`}
      >
        <h4
          className={`font-medium text-gray-800 truncate mb-1 ${
            isSmall ? "text-xs" : "text-sm"
          }`}
          title={image.name}
        >
          {image.name}
        </h4>

        <div
          className={`text-gray-500 space-y-0.5 ${
            isSmall ? "text-[10px]" : "text-xs"
          }`}
        >
          <p className="flex justify-between items-center">
            <span className="text-gray-400">Size</span>
            <span className="font-medium">{formatFileSize(image.size)}</span>
          </p>
          {!isSmall && (
            <>
              <p className="flex justify-between items-center">
                <span className="text-gray-400">Type</span>
                <span className="font-medium uppercase">
                  {image.type.split("/")[1] || image.type}
                </span>
              </p>
              <p className="flex justify-between items-center">
                <span className="text-gray-400">Added</span>
                <span className="font-medium">
                  {new Date(image.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
            </>
          )}
          {isSmall && (
            <p className="text-center text-gray-400 mt-1">
              {new Date(image.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
