import { useRef } from "react";
import { Button } from "antd";
import { toast } from "react-toastify";
import { useUploadImageMutation } from "../../../redux/features/media/mediaApi";
import type { MediaImage } from "../../../types/media";

export default function ChangePhotoFileButton({
  uploadFolder,
  onUploaded,
  className = "",
}: {
  uploadFolder: string;
  onUploaded: (image: MediaImage) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadImage, { isLoading }] = useUploadImageMutation();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("files", file);
    formData.append("folder", uploadFolder);

    try {
      const res: any = await uploadImage(formData).unwrap();
      const raw = res?.data;
      const first: MediaImage | undefined = Array.isArray(raw) ? raw[0] : raw;
      if (first?.id && first?.url) {
        onUploaded(first);
      } else {
        toast.error("Upload succeeded but no image data returned.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to upload image.");
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="primary"
        className={className}
        loading={isLoading}
        onClick={() => inputRef.current?.click()}
      >
        Change Photo
      </Button>
    </>
  );
}
