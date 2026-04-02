import { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { TbCloudUpload } from "react-icons/tb";
import { MediaImage } from "../../../types/media";

interface UploaderProps {
  label?: string;
  description?: string;
  buttonLabel?: string;
  helperText?: string;
  multiple?: boolean;
  value?: MediaImage | MediaImage[] | null;
  onChange?: (value: MediaImage | MediaImage[] | null) => void;
  className?: string;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
}

const Uploader: React.FC<UploaderProps> = ({
  label = "Drag & drop your file",
  description = "or click to browse",
  buttonLabel = "Choose file",
  helperText = "Supported formats: PDF, JPG, PNG (max. 10MB)",
  multiple = false,
  value = null,
  onChange,
  className = "",
  disabled = false,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 10,
}) => {
  const normalizedValue = Array.isArray(value) ? value : value ? [value] : [];

  const handleChange: UploadProps["onChange"] = (info) => {
    const { fileList } = info;

    if (fileList.length === 0) {
      onChange?.(null);
      return;
    }

    const files = fileList.map((file) => {
      if (file.originFileObj) {
        return {
          id: file.uid || file.name,
          name: file.name,
          url: URL.createObjectURL(file.originFileObj),
          size: file.size || 0,
          type: file.type || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          folderPath: "",
          originFileObj: file.originFileObj as File,
        } as MediaImage;
      }
      return file as any;
    });

    if (multiple) {
      onChange?.(files);
    } else {
      onChange?.(files[0] || null);
    }
  };

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    const isValidType = accept
      .split(",")
      .some((ext) => file.name.toLowerCase().endsWith(ext.trim()));
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;

    if (!isValidType) {
      message.error(`You can only upload ${accept} files!`);
      return Upload.LIST_IGNORE;
    }
    if (!isLtMaxSize) {
      message.error(`File must be smaller than ${maxSize}MB!`);
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  const handleRemove = () => {
    onChange?.(null);
  };

  return (
    <Upload
      accept={accept}
      multiple={multiple}
      maxCount={multiple ? undefined : 1}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      onRemove={handleRemove}
      showUploadList={false}
      disabled={disabled}
      className="w-full"
      style={{
        width: "100%",
      }}
    >
      <div
        className={`w-full  border-2 border-dashed rounded-2xl bg-white p-6 text-center transition hover:border-[#237D3B] hover:bg-[#E9F2EB]/30 cursor-pointer ${disabled ? "opacity-60 cursor-not-allowed" : ""
          } ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-[#E9F2EB] flex items-center justify-center mx-auto mb-4">
          <TbCloudUpload className="w-6 h-6 text-[#237D3B]" />
        </div>
        <p className="text-[18px] font-semibold text-[#237D3B]">{label}</p>
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
          <p className="text-[14px] text-[#4B5563] mt-3">{helperText}</p>
        )}

        {normalizedValue.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {normalizedValue.map((item) => (
              <div
                key={item.id}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm flex items-center gap-2"
              >
                <span className="truncate max-w-[200px]">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Upload>
  );
};

export default Uploader;
