import { Modal } from "antd";
import { useState } from "react";
import { FiDownload, FiX } from "react-icons/fi";

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".jfif", ".bmp", ".svg"];
const PDF_EXTS = [".pdf"];

function detectFileType(url: string): "image" | "pdf" | "other" {
  const lower = url.split("?")[0].toLowerCase();
  if (IMAGE_EXTS.some((ext) => lower.endsWith(ext))) return "image";
  if (PDF_EXTS.some((ext) => lower.endsWith(ext))) return "pdf";
  return "other";
}

interface FileViewerProps {
  open: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

export default function FileViewer({ open, url, title, onClose }: FileViewerProps) {
  const fileType = url ? detectFileType(url) : "other";
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!url || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = title || "file";
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // fallback: open in new tab if cors blocked
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={820}
      centered
      destroyOnClose
      closeIcon={<FiX className="text-lg" />}
      title={
        <div className="flex items-center justify-between pr-8">
          <span className="text-base font-semibold text-gray-800 truncate max-w-[500px]">
            {title || "File Preview"}
          </span>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50"
          >
            <FiDownload />
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>
      }
    >
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
        {!url ? (
          <p className="text-sm text-gray-400">No file to display.</p>
        ) : fileType === "image" ? (
          <img
            src={url}
            alt={title || "preview"}
            className="max-h-[70vh] max-w-full object-contain rounded"
          />
        ) : fileType === "pdf" ? (
          <iframe
            src={url}
            title={title || "PDF Preview"}
            className="w-full h-[70vh] border-0 rounded"
          />
        ) : (
          <div className="text-center space-y-3 py-10">
            <p className="text-sm text-gray-500">
              Preview not available for this file type.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
            >
              <FiDownload />
              {downloading ? "Downloading..." : "Download File"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
