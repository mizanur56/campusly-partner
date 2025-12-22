import { FolderNode, MediaImage } from "../types/media";

// Build folder tree from folder list
export const buildFolderTreeFromFolders = (folders: string[]): FolderNode[] => {
  const Root: FolderNode = {
    id: "Root",
    name: "Root",
    type: "folder",
    path: "Root",
    children: [],
  };

  const folderMap: { [path: string]: FolderNode } = { Root };

  folders.forEach((folderPath) => {
    if (folderPath === "Root") return;

    const parts = folderPath.split("/");
    let currentPath = "";

    parts.forEach((part) => {
      const parentPath = currentPath || "Root";
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!folderMap[currentPath]) {
        const newNode: FolderNode = {
          id: currentPath,
          name: part,
          type: "folder",
          path: currentPath,
          children: [],
        };

        folderMap[currentPath] = newNode;

        // Add to parent's children
        if (folderMap[parentPath]) {
          if (
            !folderMap[parentPath].children?.find(
              (child) => child.path === currentPath
            )
          ) {
            folderMap[parentPath].children?.push(newNode);
          }
        }
      }
    });
  });

  return [Root];
};

// Get breadcrumb items for current folder
export const getBreadcrumbItems = (currentFolder: string) => {
  const items: { title: string; path: string }[] = [];

  if (currentFolder === "Root") {
    return [{ title: "All Media", path: "Root" }];
  }

  const pathParts = currentFolder.split("/");
  let accumulatedPath = "";

  pathParts.forEach((part) => {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
    items.push({
      title: part,
      path: accumulatedPath,
    });
  });

  return items;
};

// Filter media by folder
export const filterMediaByFolder = (
  media: MediaImage[],
  folderPath: string
): MediaImage[] => {
  if (folderPath === "Root") {
    return media.filter((item) => !item.folder || item.folder === "Root");
  }
  return media.filter((item) => item.folder === folderPath);
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
