import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  MinusSquareOutlined,
  PlusOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown, Input, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { FolderNode } from "../../../types/media";

interface FolderTreeProps {
  data: FolderNode[];
  currentPath: string;
  onFolderSelect: (path: string) => void;
  onFolderCreate: (parentPath: string, name: string) => void;
  onRenameFolder: (path: string, newName: string) => void;
  onDeleteFolder: (path: string) => void;
  compact?: boolean;
  disabled?: boolean;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

// Helper function to get all parent paths from a given path
const getParentPaths = (path: string): string[] => {
  if (path === "Root") return ["Root"];

  const paths: string[] = ["Root"];
  const parts = path.split("/");

  for (let i = 0; i < parts.length - 1; i++) {
    paths.push(parts.slice(0, i + 1).join("/"));
  }

  return paths;
};

const FolderTree: React.FC<FolderTreeProps> = ({
  data,
  currentPath,
  onFolderSelect,
  onFolderCreate,
  onRenameFolder,
  onDeleteFolder,
  disabled = false,
  isMobile = false,
  onToggle,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    // Initialize with Root and all parent paths of currentPath
    return new Set(getParentPaths(currentPath));
  });
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  // Auto-expand parent folders when currentPath changes
  useEffect(() => {
    const parentPaths = getParentPaths(currentPath);
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      parentPaths.forEach((path) => newExpanded.add(path));
      return newExpanded;
    });
  }, [currentPath]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = (parentPath: string) => {
    if (!newFolderName.trim()) {
      setCreatingFolder(null);
      return;
    }
    onFolderCreate(parentPath, newFolderName.trim());
    setCreatingFolder(null);
    setNewFolderName("");

    if (!expandedFolders.has(parentPath)) {
      setExpandedFolders(new Set([...expandedFolders, parentPath]));
    }
  };

  const handleRenameFolder = (path: string) => {
    if (!editName.trim()) {
      setEditingFolder(null);
      return;
    }
    onRenameFolder(path, editName.trim());
    setEditingFolder(null);
    setEditName("");
  };

  const getFolderItems = (path: string): MenuProps["items"] => {
    // Root folder should not have rename or delete options
    if (path === "Root") {
      return [];
    }

    return [
      {
        key: "rename",
        label: "Rename",
        icon: <EditOutlined />,
        onClick: () => {
          setEditingFolder(path);
          setEditName(data.find((f) => f.path === path)?.name || "");
        },
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          onDeleteFolder(path);
        },
      },
    ];
  };

  const renderFolder = (folder: FolderNode, level = 0) => {
    const isExpanded = expandedFolders.has(folder.path);
    const isSelected = currentPath === folder.path;
    const hasChildren = folder.children && folder.children.length > 0;

    // Reduced indentation: 12px per level instead of 16px for better space usage
    const paddingLeft = level * 12 + 8;

    // Determine max characters to show based on nesting level
    const maxNameLength = Math.max(20, 40 - level * 3);
    const displayName = folder.name === "Root" ? "All Media" : folder.name;
    const shouldTruncate = displayName.length > maxNameLength;
    const truncatedName = shouldTruncate
      ? displayName.substring(0, maxNameLength) + "..."
      : displayName;

    const handleFolderClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Toggle expansion if folder has children
      if (hasChildren) {
        toggleFolder(folder.path);
      }
      // Always select the folder
      onFolderSelect(folder.path);
    };

    return (
      <div key={folder.path} className="select-none">
        <div
          className={`
            flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50
            cursor-pointer transition-colors duration-150 rounded
            ${isSelected ? "bg-primary-50 border-l-2 border-primary-500" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${level > 0 ? "relative" : ""}
          `}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={disabled ? undefined : handleFolderClick}
        >
          {/* Depth indicator line for nested folders */}
          {level > 0 && (
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"
              style={{ left: `${(level - 1) * 12 + 8}px` }}
            />
          )}

          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) toggleFolder(folder.path);
              }}
              className="w-4 h-4 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 rounded transition-colors"
              disabled={disabled}
            >
              {isExpanded ? (
                <MinusSquareOutlined className="text-xs text-gray-600" />
              ) : (
                <PlusSquareOutlined className="text-xs text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Folder Icon */}
          <div className="flex-shrink-0">
            {isExpanded && hasChildren ? (
              <FolderOpenOutlined className="text-sm text-primary-500" />
            ) : (
              <FolderOutlined className="text-sm text-gray-500" />
            )}
          </div>

          {/* Folder Name or Edit Input */}
          {editingFolder === folder.path ? (
            <Input
              size="small"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onPressEnter={() => handleRenameFolder(folder.path)}
              onBlur={() => handleRenameFolder(folder.path)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-6"
            />
          ) : (
            <div className="flex-1 flex items-center justify-between group min-w-0">
              {shouldTruncate ? (
                <Tooltip title={displayName} placement="top">
                  <span
                    className={`text-sm truncate ${
                      isSelected
                        ? "text-primary-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {truncatedName}
                  </span>
                </Tooltip>
              ) : (
                <span
                  className={`text-sm truncate ${
                    isSelected
                      ? "text-primary-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {displayName}
                </span>
              )}

              {/* Action Buttons */}
              <div
                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined className="text-xs" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) {
                      setCreatingFolder(folder.path);
                      setNewFolderName("");
                    }
                  }}
                  className="w-6 h-6 p-0 flex items-center justify-center hover:bg-primary-50 hover:text-primary-600"
                  disabled={disabled}
                />
                {/* Hide dropdown menu for Root folder */}
                {folder.path !== "Root" && (
                  <Dropdown
                    menu={{ items: getFolderItems(folder.path) }}
                    trigger={["click"]}
                    placement="bottomRight"
                    disabled={disabled}
                  >
                    <Button
                      type="text"
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 p-0 flex items-center justify-center hover:bg-gray-100 text-gray-500"
                      disabled={disabled}
                    >
                      ⋮
                    </Button>
                  </Dropdown>
                )}
              </div>
            </div>
          )}
        </div>

        {/* New Folder Input */}
        {creatingFolder === folder.path && (
          <div
            style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
            className="py-1 px-2"
          >
            <Input
              size="small"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onPressEnter={() => handleCreateFolder(folder.path)}
              onBlur={() => handleCreateFolder(folder.path)}
              autoFocus
              className="h-6"
            />
          </div>
        )}

        {/* Children */}
        {isExpanded && folder.children && (
          <div className="transition-all duration-200">
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-primary-border rounded-lg bg-white shadow-sm h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-primary-border bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOutlined className="text-primary-600 text-base" />
            <h4 className="font-semibold text-gray-800 text-sm">Folders</h4>
          </div>
          <div className="flex items-center gap-2">
            {isMobile && onToggle && (
              <Button
                type="text"
                size="small"
                onClick={onToggle}
                className="w-7 h-7 p-0 flex items-center justify-center hover:bg-red-50 text-red-500"
                title="Close"
              >
                ✕
              </Button>
            )}
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                if (!disabled) {
                  setCreatingFolder("Root");
                  setNewFolderName("");
                }
              }}
              className="h-7 px-2"
              disabled={disabled}
            >
              New
            </Button>
          </div>
        </div>
      </div>

      {/* Content - with horizontal scroll for deep nesting */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-2">
        <div className="min-w-max">
          {data.map((folder) => renderFolder(folder))}
        </div>
      </div>
    </div>
  );
};

export default FolderTree;
