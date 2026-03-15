import { FolderOutlined } from "@ant-design/icons";
import { Button, Empty, Modal, Space, message } from "antd";
import React, { useCallback, useMemo, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { toast } from "react-toastify";
import Loader from "../../../components/common/Loading/Loader";
import { MediaUploadModal } from "../../../components/common/Modals";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import FolderTree from "../../../components/common/media/FolderTree";
import MediaBreadcrumb from "../../../components/common/media/MediaBreadcrumb";
import MediaCard from "../../../components/common/media/MediaCard";
import {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useDeleteMediaMutation,
  useGetAllFoldersQuery,
  useMediaListQuery,
  useRenameFolderMutation,
  useUploadImageMutation,
} from "../../../redux/features/media/mediaApi";
import { FolderNode, MediaImage } from "../../../types/media";
import {
  buildFolderTreeFromFolders,
  filterMediaByFolder,
} from "../../../utils/mediaHelpers";

const AllMediaList: React.FC = () => {
  const [currentFolder, setCurrentFolder] = useState("Root");
  const [openMediaUploadModal, setOpenMediaUploadModal] = useState(false);
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Loading states for specific operations
  const [folderOperationLoading, setFolderOperationLoading] = useState(false);
  const [imageOperationLoading, setImageOperationLoading] = useState(false);
  // Responsive handler
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cleanup: Close mobile sidebar when component unmounts or user navigates away
  React.useEffect(() => {
    return () => {
      setIsMobileSidebarOpen(false);
      // Ensure body overflow is reset when component unmounts
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const toggleMobileSidebar = React.useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  // Backend API calls
  const {
    data: mediaResponse,
    isLoading: mediaLoading,
    refetch: refetchMedia,
  } = useMediaListQuery([]);
  const {
    data: foldersResponse,
    isLoading: foldersLoading,
    refetch: refetchFolders,
  } = useGetAllFoldersQuery(undefined);

  const [uploadImage] = useUploadImageMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const [createFolder] = useCreateFolderMutation();
  const [renameFolder] = useRenameFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();

  // Memoize derived data to prevent unnecessary recalculations
  const mediaData: MediaImage[] = useMemo(
    () => mediaResponse?.data || [],
    [mediaResponse?.data]
  );

  const foldersList: string[] = useMemo(
    () => foldersResponse?.data || ["Root"],
    [foldersResponse?.data]
  );

  const folderTree: FolderNode[] = useMemo(
    () => buildFolderTreeFromFolders(foldersList),
    [foldersList]
  );

  const currentFolderImages = useMemo(
    () => filterMediaByFolder(mediaData, currentFolder),
    [mediaData, currentFolder]
  );

  const isLoading = mediaLoading || foldersLoading;

  // Memoize event handlers to prevent unnecessary re-renders
  const handleCreateFolder = useCallback(
    async (parentPath: string, name: string) => {
      setFolderOperationLoading(true);
      try {
        const payload = {
          name,
          parentPath: parentPath === "Root" ? "" : parentPath,
        };

        await createFolder(payload).unwrap();
        await refetchFolders();
        toast.success(`Folder "${name}" created successfully`);
      } catch (error: any) {
        console.error("Folder creation failed:", error);
        toast.error(error?.data?.message || "Failed to create folder");
      } finally {
        setFolderOperationLoading(false);
      }
    },
    [createFolder, refetchFolders]
  );

  const handleRenameFolder = useCallback(
    async (oldPath: string, newName: string) => {
      setFolderOperationLoading(true);
      try {
        await renameFolder({ oldPath, newName }).unwrap();
        await refetchFolders();
        await refetchMedia();

        // Update current folder if it was renamed
        if (currentFolder === oldPath) {
          const pathParts = oldPath.split("/");
          pathParts[pathParts.length - 1] = newName;
          const newPath = pathParts.join("/");
          setCurrentFolder(newPath);
        }

        toast.success(`Folder renamed to "${newName}" successfully`);
      } catch (error: any) {
        console.error("Folder rename failed:", error);
        toast.error(error?.data?.message || "Failed to rename folder");
      } finally {
        setFolderOperationLoading(false);
      }
    },
    [renameFolder, refetchFolders, refetchMedia, currentFolder]
  );

  const handleDeleteFolder = useCallback(
    async (path: string) => {
      if (path === "Root") {
        toast.error("Cannot delete Root folder");
        return;
      }

      setFolderOperationLoading(true);
      try {
        await deleteFolder(path).unwrap();
        await refetchFolders();
        await refetchMedia();

        // Navigate to parent if current folder was deleted
        if (currentFolder === path) {
          const parentPath = path.split("/").slice(0, -1).join("/") || "Root";
          setCurrentFolder(parentPath);
        }

        toast.success("Folder deleted successfully");
      } catch (error: any) {
        console.error("Folder deletion failed:", error);
        toast.error(error?.data?.message || "Failed to delete folder");
      } finally {
        setFolderOperationLoading(false);
      }
    },
    [deleteFolder, refetchFolders, refetchMedia, currentFolder]
  );

  const handleUploadImage = useCallback(
    async (files: File[], folderPath: string = "") => {
      setImageOperationLoading(true);
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        formData.append("folder", folderPath);

        await uploadImage(formData).unwrap();
        await refetchMedia();
        await refetchFolders();
        toast.success("Images uploaded successfully");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Image upload failed");
      } finally {
        setImageOperationLoading(false);
      }
    },
    [uploadImage, refetchMedia, refetchFolders]
  );

  const handleDeleteImage = useCallback(
    async (id: string) => {
      Modal.confirm({
        title: "Confirm Delete",
        content:
          "Are you sure you want to delete this image? This action cannot be undone.",
        okText: "Yes, Delete",
        cancelText: "Cancel",
        okButtonProps: { danger: true },
        onOk: async () => {
          setImageOperationLoading(true);
          try {
            await deleteMedia(id).unwrap();
            await refetchMedia();
            await refetchFolders();
            toast.success("Image deleted successfully");
          } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Image deletion failed");
          } finally {
            setImageOperationLoading(false);
          }
        },
      });
    },
    [deleteMedia, refetchMedia, refetchFolders]
  );

  const handleCopyImageUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    message.success("Image URL copied to clipboard");
  }, []);

  const handleOpenUploadModal = useCallback(() => {
    setOpenMediaUploadModal(true);
  }, []);

  return (
    <>
      <PageHeader
        title="Media Library"
        subtitle="Manage your media files and folders"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Media Library" },
        ]}
        extra={
          <Space>
            {isMobileView && (
              <Button
                type="text"
                icon={
                  <FolderOutlined
                    className="text-primary-600 text-sm"
                    style={{
                      color: "white",
                      fontSize: "20px",
                      backgroundColor: "green",
                      borderRadius: "6px",
                      padding: "6px",
                    }}
                    size={46}
                  />
                }
                onClick={toggleMobileSidebar}
                className="w-14 h-14 flex items-center justify-center hover:bg-primary-50 border border-gray-200 rounded-lg"
                title="Open folders"
              />
            )}
            <Button
              onClick={handleOpenUploadModal}
              type="primary"
              className="font-semibold"
              icon={<IoMdAdd className="text-lg" />}
              disabled={folderOperationLoading || imageOperationLoading}
            >
              Upload Media
            </Button>
          </Space>
        }
      />

      {/* Mobile Backdrop */}
      {isMobileView && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-35 transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      <div
        className={`flex gap-6 ${isMobileView ? "h-[calc(100vh-200px)]" : ""}`}
      >
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader text="Loading media library..." />
          </div>
        ) : (
          <>
            {/* Left Sidebar - Folder Tree */}
            {isMobileView ? (
              // Mobile: Only render when sidebar is open
              isMobileSidebarOpen && (
                <div className="fixed left-0 top-0 z-36 h-full w-80 transform transition-transform duration-300 ease-in-out">
                  {folderOperationLoading ? (
                    <div className="border rounded-xl bg-white h-full flex items-center justify-center shadow-lg">
                      <Loader text="Updating folders..." />
                    </div>
                  ) : (
                    <FolderTree
                      data={folderTree}
                      currentPath={currentFolder}
                      onFolderSelect={(path: string) => {
                        setCurrentFolder(path);
                        if (isMobileView) setIsMobileSidebarOpen(false);
                      }}
                      onFolderCreate={handleCreateFolder}
                      onRenameFolder={handleRenameFolder}
                      onDeleteFolder={handleDeleteFolder}
                      compact={false}
                      disabled={folderOperationLoading}
                      isMobile={isMobileView}
                      isOpen={isMobileSidebarOpen}
                      onToggle={toggleMobileSidebar}
                    />
                  )}
                </div>
              )
            ) : (
              // Desktop: Always render
              <div className="w-64 shrink-0">
                {folderOperationLoading ? (
                  <div className="border rounded-xl bg-white h-full flex items-center justify-center shadow-lg">
                    <Loader text="Updating folders..." />
                  </div>
                ) : (
                  <FolderTree
                    data={folderTree}
                    currentPath={currentFolder}
                    onFolderSelect={(path: string) => {
                      setCurrentFolder(path);
                      if (isMobileView) setIsMobileSidebarOpen(false);
                    }}
                    onFolderCreate={handleCreateFolder}
                    onRenameFolder={handleRenameFolder}
                    onDeleteFolder={handleDeleteFolder}
                    compact={false}
                    disabled={folderOperationLoading}
                    isMobile={isMobileView}
                    isOpen={isMobileSidebarOpen}
                    onToggle={toggleMobileSidebar}
                  />
                )}
              </div>
            )}

            {/* Right Content - Images */}
            <div className="flex-1">
              {/* Breadcrumb and Stats */}
              <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <MediaBreadcrumb
                  currentFolder={currentFolder}
                  onFolderSelect={setCurrentFolder}
                  showItemCount
                  itemCount={currentFolderImages.length}
                />

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-800">
                      {currentFolder === "Root" ? "All Media" : currentFolder}
                    </strong>
                    {" • "}
                    {currentFolderImages.length} image
                    {currentFolderImages.length !== 1 ? "s" : ""}
                  </span>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleOpenUploadModal}
                    icon={<IoMdAdd />}
                  >
                    Upload
                  </Button>
                </div>
              </div>

              {/* Images Grid */}
              <div>
                {currentFolderImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div className="text-center">
                          <p className="text-gray-500 mb-4">
                            No images in this folder
                          </p>
                          <Button
                            type="primary"
                            onClick={handleOpenUploadModal}
                          >
                            Upload Images
                          </Button>
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentFolderImages.map((img: MediaImage) => (
                      <MediaCard
                        key={img.id}
                        image={img}
                        onCopy={handleCopyImageUrl}
                        onDelete={handleDeleteImage}
                        size="default"
                        showActions={true}
                        disabled={imageOperationLoading}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Upload Modal - Only render when open */}
      {openMediaUploadModal && (
        <MediaUploadModal
          open={openMediaUploadModal}
          setOpen={setOpenMediaUploadModal}
          folders={folderTree}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onUpload={handleUploadImage}
          existingImages={mediaData}
          folderOperationLoading={folderOperationLoading}
          imageOperationLoading={imageOperationLoading}
          selectionMode={false}
          initialFolder={currentFolder}
        />
      )}
    </>
  );
};

export default AllMediaList;
