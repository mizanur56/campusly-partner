import { useCallback, useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button, Tag } from "antd";
import { MediaUploadModal } from "../common/Modals";
import {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useGetAllFoldersQuery,
  useMediaListQuery,
  useRenameFolderMutation,
  useUploadImageMutation,
} from "../../redux/features/media/mediaApi";
import { MediaImage } from "../../types/media";
import { buildFolderTreeFromFolders } from "../../utils/mediaHelpers";

interface MediaPickerProps {
  label?: string;
  description?: string;
  buttonLabel?: string;
  helperText?: string;
  multiple?: boolean;
  value?: MediaImage | MediaImage[] | null | any;
  onChange?: (value: MediaImage | MediaImage[] | null) => void;
  className?: string;
  disabled?: boolean;
  initialFolder?: string;
}

const MediaPicker: React.FC<MediaPickerProps> = ({
  label = "Drag & drop your Cover Image",
  description = "or click to browse your media library",
  buttonLabel = "Choose file",
  helperText = "Supported formats: JPG, PNG, WEBP (max. 10MB)",
  multiple = false,
  value = null,
  onChange,
  className = "",
  disabled = false,
  initialFolder = "Root",
}) => {
  const [open, setOpen] = useState(false);
  const [folderOperationLoading, setFolderOperationLoading] = useState(false);
  const [imageOperationLoading, setImageOperationLoading] = useState(false);

  const { data: mediaResponse, refetch: refetchMedia } = useMediaListQuery([]);
  const { data: foldersResponse, refetch: refetchFolders } =
    useGetAllFoldersQuery(undefined);

  const [uploadImage] = useUploadImageMutation();
  const [createFolder] = useCreateFolderMutation();
  const [renameFolder] = useRenameFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();

  const mediaItems = useMemo(
    () => mediaResponse?.data || [],
    [mediaResponse?.data]
  );

  const folderTree = useMemo(
    () => buildFolderTreeFromFolders(foldersResponse?.data || ["Root"]),
    [foldersResponse?.data]
  );

  const normalizedValue = useMemo<MediaImage[]>(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const handleToggleModal = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const handleUpload = useCallback(
    async (files: File[], folderPath: string) => {
      setImageOperationLoading(true);
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        formData.append("folder", folderPath);
        await uploadImage(formData).unwrap();
        await Promise.all([refetchMedia(), refetchFolders()]);
      } finally {
        setImageOperationLoading(false);
      }
    },
    [uploadImage, refetchMedia, refetchFolders]
  );

  const handleCreateFolder = useCallback(
    async (parentPath: string, name: string) => {
      setFolderOperationLoading(true);
      try {
        await createFolder({
          name,
          parentPath: parentPath === "Root" ? "" : parentPath,
        }).unwrap();
        await refetchFolders();
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
        await Promise.all([refetchFolders(), refetchMedia()]);
      } finally {
        setFolderOperationLoading(false);
      }
    },
    [renameFolder, refetchFolders, refetchMedia]
  );

  const handleDeleteFolder = useCallback(
    async (path: string) => {
      setFolderOperationLoading(true);
      try {
        await deleteFolder(path).unwrap();
        await Promise.all([refetchFolders(), refetchMedia()]);
      } finally {
        setFolderOperationLoading(false);
      }
    },
    [deleteFolder, refetchFolders, refetchMedia]
  );

  const handleSelect = useCallback(
    (images: MediaImage[]) => {
      if (multiple) {
        onChange?.(images);
      } else {
        onChange?.(images[0] || null);
      }
    },
    [multiple, onChange]
  );

  return (
    <>
      <div
        className={`w-full border-2 border-dashed rounded-2xl bg-white p-6 text-center transition hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        } ${className}`}
        onClick={handleToggleModal}
      >
        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-6 h-6 text-primary-600" />
        </div>
        <p className="text-base font-semibold text-gray-900">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}

        <Button
          type="primary"
          className="mt-4 px-6 font-semibold"
          disabled={disabled}
        >
          {buttonLabel}
        </Button>

        {helperText && (
          <p className="text-xs text-gray-400 mt-3">{helperText}</p>
        )}

        {normalizedValue.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {normalizedValue.map((item) => (
              <Tag
                key={item.id}
                color="green"
                className="flex items-center gap-2 px-3 py-1 text-sm"
              >
                <span className="truncate max-w-[140px]">{item.name}</span>
              </Tag>
            ))}
          </div>
        )}
      </div>

      {open && (
        <MediaUploadModal
          open={open}
          setOpen={setOpen}
          folders={folderTree}
          existingImages={mediaItems}
          selectionMode
          multiple={multiple}
          selectedImages={normalizedValue}
          onSelect={handleSelect}
          onUpload={handleUpload}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          folderOperationLoading={folderOperationLoading}
          imageOperationLoading={imageOperationLoading}
          initialFolder={initialFolder}
        />
      )}
    </>
  );
};

export default MediaPicker;
