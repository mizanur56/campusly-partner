import {
  DeleteOutlined,
  EyeOutlined,
  FolderOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Image,
  Input,
  message,
  Modal,
  Upload,
} from "antd";
import type { RcFile } from "antd/es/upload/interface";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUploadImageMutation } from "../../../redux/features/media/mediaApi";
import { FolderNode, MediaImage } from "../../../types/media";
import Loader from "../Loading/Loader";
import FolderTree from "../media/FolderTree";
import MediaBreadcrumb from "../media/MediaBreadcrumb";
import MediaCard from "../media/MediaCard";

const { Dragger } = Upload;

interface MediaUploadModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onUpload?: (files: File[], folderPath: string) => void;
  folders?: FolderNode[];
  onCreateFolder?: (parentPath: string, name: string) => void;
  onRenameFolder?: (path: string, newName: string) => void;
  onDeleteFolder?: (path: string) => void;
  existingImages?: MediaImage[];
  folderOperationLoading?: boolean;
  imageOperationLoading?: boolean;
  selectionMode?: boolean;
  multiple?: boolean;
  onSelect?: (images: MediaImage[]) => void;
  selectedImages?: MediaImage[];
  initialFolder?: string; // Auto-select this folder when modal opens
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  open,
  setOpen,
  onUpload,
  folders = [],
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  existingImages = [],
  folderOperationLoading = false,
  imageOperationLoading = false,
  selectionMode = false,
  multiple = false,
  onSelect,
  selectedImages = [],
  initialFolder = "Root", // Default to Root if not provided
}) => {
  const [uploadFiles, setUploadFiles] = useState<RcFile[]>([]);
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [currentFolder, setCurrentFolder] = useState(initialFolder);
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Selection state
  const [internalSelectedImages, setInternalSelectedImages] =
    useState<MediaImage[]>(selectedImages);

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Infinite scroll states
  const [visibleImages, setVisibleImages] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  // Memoized current folder images
  const currentFolderImages = useMemo(() => {
    return existingImages.filter(
      (img) =>
        img.folder === currentFolder ||
        (currentFolder === "Root" && (!img.folder || img.folder === "Root"))
    );
  }, [existingImages, currentFolder]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset states when modal opens
  useEffect(() => {
    if (open) {
      setVisibleImages(12);
      setCurrentFolder(initialFolder); // Use initialFolder from props
      setInternalSelectedImages(selectedImages);
      setIsMobileSidebarOpen(false); // Close mobile sidebar when modal opens
    }
  }, [open, initialFolder, selectedImages]); // Added initialFolder to dependencies

  // Stable scroll handler with ref-based loading state
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !open) return;

    const handleScroll = () => {
      if (isLoadingMoreRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollThreshold = 100;

      if (
        scrollTop + clientHeight >= scrollHeight - scrollThreshold &&
        visibleImages < currentFolderImages.length
      ) {
        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);

        setTimeout(() => {
          setVisibleImages((prev) => {
            const newVisible = Math.min(prev + 12, currentFolderImages.length);
            isLoadingMoreRef.current = false;
            setIsLoadingMore(false);
            return newVisible;
          });
        }, 300);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [open, visibleImages, currentFolderImages.length]); // Minimal dependencies

  // Update internal selected images only when selectedImages prop changes AND modal is closed
  useEffect(() => {
    if (!open) {
      setInternalSelectedImages(selectedImages);
    }
  }, [selectedImages, open]);

  const handleRemove = useCallback((file: RcFile) => {
    setUploadFiles((prev) => prev.filter((f) => f.uid !== file.uid));
    setCustomNames((prev) => {
      const copy = { ...prev };
      delete copy[file.name];
      return copy;
    });
  }, []);

  const uploadProps = {
    multiple: true,
    accept: "image/*",
    showUploadList: false,
    beforeUpload: (file: RcFile) => {
      setUploadFiles((prev) => [...prev, file]);
      setCustomNames((prev) => ({ ...prev, [file.name]: file.name }));
      return false;
    },
  };

  const handleUploadAll = async () => {
    setIsUploadingFiles(true);
    try {
      let uploadedImages: MediaImage[] = [];

      if (onUpload) {
        await onUpload(
          uploadFiles,
          currentFolder === "Root" ? "" : currentFolder
        );
      } else {
        const formData = new FormData();
        uploadFiles.forEach((file) => {
          formData.append("files", file);
        });
        formData.append(
          "folder",
          currentFolder === "Root" ? "" : currentFolder
        );

        const response = await uploadImage(formData).unwrap();
        uploadedImages = response?.data || [];
      }

      message.success(
        `${uploadFiles.length} image${
          uploadFiles.length > 1 ? "s" : ""
        } uploaded successfully`
      );

      if (selectionMode && uploadedImages.length > 0) {
        setInternalSelectedImages((prev) => {
          if (multiple) {
            const newSelection = [...prev];
            uploadedImages.forEach((newImg) => {
              if (!newSelection.some((img) => img.id === newImg.id)) {
                newSelection.push(newImg);
              }
            });
            return newSelection;
          } else {
            return [uploadedImages[0]];
          }
        });
        message.info(
          `${uploadedImages.length} uploaded image${
            uploadedImages.length > 1 ? "s" : ""
          } added to selection`
        );
      }

      setUploadFiles([]);
      setCustomNames({});

      if (!selectionMode) {
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
      message.error("Image upload failed");
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const copyImageUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    message.success("Image URL copied to clipboard");
  }, []);

  // Selection handlers
  const handleImageSelect = useCallback(
    (image: MediaImage) => {
      if (!selectionMode) return;

      setInternalSelectedImages((prev) => {
        if (multiple) {
          const isSelected = prev.some((img) => img.id === image.id);
          if (isSelected) {
            return prev.filter((img) => img.id !== image.id);
          } else {
            return [...prev, image];
          }
        } else {
          const isSelected = prev.some((img) => img.id === image.id);
          return isSelected ? [] : [image];
        }
      });
    },
    [selectionMode, multiple]
  );

  const isImageSelected = useCallback(
    (image: MediaImage) => {
      return internalSelectedImages.some((img) => img.id === image.id);
    },
    [internalSelectedImages]
  );

  const handleConfirmSelection = useCallback(() => {
    if (onSelect) {
      onSelect(internalSelectedImages);
    }
    setOpen(false);
  }, [onSelect, internalSelectedImages, setOpen]);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setUploadFiles([]);
    setCustomNames({});
    setInternalSelectedImages([]);
    setIsMobileSidebarOpen(false);
  }, [setOpen]);

  return (
    <Modal
      open={open}
      destroyOnClose={true}
      maskClosable={false}
      keyboard={true}
      width={isMobileView ? "100%" : "100%"}
      className={`!min-h-screen ${isMobileView ? "!m-0 !max-w-none" : ""}`}
      style={isMobileView ? { top: 0, padding: 0 } : { top: 20 }}
      styles={{
        body: {
          padding: isMobileView ? "16px" : "16px 24px",
          maxHeight: isMobileView ? "100vh" : "calc(100vh - 160px)",
          overflowY: "auto",
        },
      }}
      title={
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-3">
            <span
              className={`font-semibold ${
                isMobileView ? "text-lg" : "text-xl"
              }`}
            >
              {selectionMode ? "Upload & Select Images" : "Upload Images"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {selectionMode ? (
              <>
                <div
                  className={`text-sm text-gray-500 ${
                    isMobileView ? "hidden" : ""
                  }`}
                >
                  {internalSelectedImages.length} image
                  {internalSelectedImages.length !== 1 ? "s" : ""} selected
                  {multiple ? "" : " (single selection)"}
                </div>
                {uploadFiles.length > 0 && (
                  <div className="text-sm text-primary-600">
                    {uploadFiles.length} file
                    {uploadFiles.length !== 1 ? "s" : ""} to upload
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">
                {uploadFiles.length} file{uploadFiles.length !== 1 ? "s" : ""}{" "}
                selected
              </div>
            )}
          </div>
        </div>
      }
      onCancel={handleCloseModal}
      footer={
        selectionMode ? (
          <div
            className={`flex justify-end gap-2 ${
              isMobileView ? "flex-col" : ""
            }`}
          >
            <div>
              <Button danger onClick={handleCloseModal} className="mr-2">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
                type="primary"
                disabled={internalSelectedImages.length === 0}
                className="bg-primary-600 hover:bg-primary-700 border-0 text-white"
              >
                Select{" "}
                {internalSelectedImages.length > 0
                  ? `(${internalSelectedImages.length})`
                  : ""}
              </Button>
            </div>
            <div>
              {uploadFiles.length > 0 && (
                <Button
                  onClick={handleUploadAll}
                  loading={isUploading || isUploadingFiles}
                  type="default"
                  className="mr-2"
                >
                  Upload {uploadFiles.length} File
                  {uploadFiles.length !== 1 ? "s" : ""}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleCloseModal}
              className="border-gray-300 hover:border-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadAll}
              loading={isUploading || isUploadingFiles || imageOperationLoading}
              type="primary"
              disabled={uploadFiles.length === 0 || imageOperationLoading}
              className="bg-primary-600 hover:bg-primary-700 border-0 text-white"
            >
              Upload {uploadFiles.length} File
              {uploadFiles.length !== 1 ? "s" : ""}
            </Button>
          </div>
        )
      }
    >
      {/* Mobile Backdrop */}
      {isMobileView && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main container with responsive layout */}
      <div
        className={`flex gap-6 ${
          isMobileView
            ? "h-[calc(100vh-200px)]"
            : "h-[75vh] min-h-[600px] max-h-[700px]"
        }`}
      >
        {/* Folder Tree Sidebar */}
        <div
          className={`
          ${
            isMobileView
              ? "fixed left-0 top-0 z-[110] h-full w-80 transform transition-transform duration-300 ease-in-out"
              : "w-56 flex-shrink-0"
          }
          ${
            isMobileView && !isMobileSidebarOpen
              ? "-translate-x-full"
              : "translate-x-0"
          }
        `}
        >
          {folderOperationLoading ? (
            <div className="border rounded-xl bg-white h-full flex items-center justify-center shadow-lg">
              <Loader text="Updating folders..." />
            </div>
          ) : (
            <FolderTree
              data={folders}
              currentPath={currentFolder}
              onFolderSelect={(path) => {
                setCurrentFolder(path);
                if (isMobileView) {
                  setIsMobileSidebarOpen(false); // Close sidebar after selection on mobile
                }
              }}
              onFolderCreate={onCreateFolder || (() => {})}
              onRenameFolder={onRenameFolder || (() => {})}
              onDeleteFolder={onDeleteFolder || (() => {})}
              compact={false}
              disabled={folderOperationLoading}
              isMobile={isMobileView}
              isOpen={isMobileSidebarOpen}
              onToggle={toggleMobileSidebar}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile Folder Selector - More Prominent */}
          {isMobileView && (
            <div className="mb-3 flex-shrink-0">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOutlined className="text-primary-600 text-base" />
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Upload to
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {currentFolder === "Root" ? "All Media" : currentFolder}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    icon={<FolderOutlined />}
                    onClick={toggleMobileSidebar}
                    className="h-8"
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumb with reduced margin */}
          <MediaBreadcrumb
            currentFolder={currentFolder}
            onFolderSelect={setCurrentFolder}
          />

          {/* Upload Area with reduced margin */}
          <div className="mb-3 flex-shrink-0">
            <Dragger
              {...uploadProps}
              className="transition-colors rounded-lg bg-gray-50 border-gray-300"
            >
              <div className="py-3">
                <p className="ant-upload-drag-icon text-2xl mb-2">
                  <InboxOutlined className="text-gray-400" />
                </p>
                <p className="ant-upload-text font-medium text-gray-700 mb-1 text-sm">
                  {selectionMode
                    ? "Upload new images to select"
                    : "Click or drag images to upload"}
                </p>
                <p className="ant-upload-hint text-xs text-gray-500">
                  Upload to:{" "}
                  <strong className="text-gray-700">
                    {currentFolder === "Root" ? "All Media" : currentFolder}
                  </strong>
                  {selectionMode && " (auto-selected)"}
                </p>
                {uploadFiles.length > 0 && (
                  <div className="mt-2 p-2 bg-primary-50 rounded border border-primary-200">
                    <p className="text-xs text-primary-700 font-medium">
                      {uploadFiles.length} file
                      {uploadFiles.length !== 1 ? "s" : ""} ready
                      {selectionMode && " for upload & selection"}
                    </p>
                  </div>
                )}
              </div>
            </Dragger>
          </div>

          {/* Uploaded Files Preview with reduced height */}
          {uploadFiles.length > 0 && (
            <div className="mb-3 flex-shrink-0 max-h-32 overflow-hidden">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                Files to Upload ({uploadFiles.length})
              </h4>
              <div className="space-y-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                {uploadFiles.map((file) => (
                  <Card
                    key={file.uid}
                    size="small"
                    className="border-l-4 border-l-primary-500 shadow-sm hover:shadow-md transition-shadow"
                    styles={{
                      body: {
                        padding: "8px 12px",
                      },
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded flex items-center justify-center border border-gray-200">
                        <Image
                          alt={file.name}
                          width={32}
                          height={32}
                          src={URL.createObjectURL(file)}
                          className="object-cover rounded"
                          preview={{ mask: <EyeOutlined /> }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Input
                          size="small"
                          placeholder="Custom filename"
                          value={customNames[file.name] || ""}
                          onChange={(e) =>
                            setCustomNames((prev) => ({
                              ...prev,
                              [file.name]: e.target.value,
                            }))
                          }
                          className="text-xs mb-1"
                        />
                        <p className="text-xs text-gray-500 truncate">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(file)}
                        className="flex-shrink-0 w-8 h-8 hover:bg-red-50"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Existing Images Section with increased height and proper padding */}
          <div
            className={`flex-1 flex flex-col min-h-0 ${
              uploadFiles.length === 0 && !selectionMode
                ? "border-t border-gray-200 pt-3"
                : "border-t border-gray-200 pt-3"
            }`}
            style={{ minHeight: "400px" }}
          >
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h4 className="font-semibold text-gray-800 text-sm">
                {selectionMode
                  ? "Select from existing images in"
                  : "Existing Images in"}{" "}
                <span className="text-primary-600">
                  {currentFolder === "Root" ? "All Media" : currentFolder}
                </span>
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border">
                {currentFolderImages.length} image
                {currentFolderImages.length !== 1 ? "s" : ""}
              </span>
            </div>

            {currentFolderImages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 min-h-[300px]">
                <Empty
                  description={
                    <div className="text-center">
                      <p className="text-gray-500 mb-2 text-sm">
                        No images in this folder
                      </p>
                      <p className="text-xs text-gray-400">
                        Upload images to get started
                      </p>
                    </div>
                  }
                />
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto min-h-0 custom-scrollbar"
                style={{
                  minHeight: "350px",
                  paddingBottom: "50px", // Added bottom padding to prevent cuttin
                }}
              >
                {/* Responsive grid */}
                <div
                  // change this field for mb 36
                  className={`grid gap-3 pb-4 mb-36 ${
                    isMobileView
                      ? "grid-cols-2 sm:grid-cols-3"
                      : "grid-cols-4 lg:grid-cols-5"
                  }`}
                >
                  {currentFolderImages
                    .slice(0, visibleImages)
                    .map((img, index) => (
                      <div
                        key={img.id || index}
                        className={`relative ${
                          selectionMode ? "cursor-pointer" : ""
                        }`}
                        onClick={
                          selectionMode
                            ? () => handleImageSelect(img)
                            : undefined
                        }
                      >
                        {selectionMode && (
                          <div
                            className={`absolute top-2 left-2 z-10 rounded border-2 flex items-center justify-center transition-all ${
                              isMobileView ? "w-6 h-6" : "w-5 h-5"
                            } ${
                              isImageSelected(img)
                                ? "bg-primary-600 border-primary-600"
                                : "bg-white border-gray-300 hover:border-primary-400"
                            }`}
                          >
                            {isImageSelected(img) && (
                              <svg
                                className={`${
                                  isMobileView ? "w-4 h-4" : "w-3 h-3"
                                } text-white`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        )}
                        <div
                          className={
                            selectionMode && isImageSelected(img)
                              ? "border-2 border-primary z-999 rounded-lg"
                              : ""
                          }
                        >
                          <MediaCard
                            image={img}
                            onCopy={selectionMode ? undefined : copyImageUrl}
                            onDelete={selectionMode ? undefined : undefined}
                            size={isMobileView ? "default" : "small"}
                            showActions={!selectionMode}
                            disabled={imageOperationLoading}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Load More Indicator - Reduced top padding since we added bottom padding to grid */}
                {visibleImages < currentFolderImages.length && (
                  <div className="text-center py-3 border-t border-gray-200 mt-2">
                    <Button
                      type="dashed"
                      loading={isLoadingMore}
                      onClick={() => {
                        setIsLoadingMore(true);
                        setTimeout(() => {
                          setVisibleImages((prev) =>
                            Math.min(prev + 12, currentFolderImages.length)
                          );
                          setIsLoadingMore(false);
                        }, 300);
                      }}
                      className={`border-gray-300 hover:border-primary-400 hover:text-primary-500 ${
                        isMobileView ? "w-full text-sm" : "w-full text-sm"
                      }`}
                    >
                      {isLoadingMore
                        ? "Loading..."
                        : `Load More (${
                            currentFolderImages.length - visibleImages
                          } remaining)`}
                    </Button>
                  </div>
                )}

                {/* End of List - Reduced padding */}
                {visibleImages >= currentFolderImages.length &&
                  currentFolderImages.length > 12 && (
                    <div className="text-center py-2 border-t border-gray-200">
                      <p
                        className={`text-gray-500 ${
                          isMobileView ? "text-sm" : "text-sm"
                        }`}
                      >
                        All {currentFolderImages.length} images loaded
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MediaUploadModal;
