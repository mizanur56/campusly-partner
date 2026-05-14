import { Modal } from "antd";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { toast } from "react-toastify";
import { LoadingOutlined } from "@ant-design/icons";
import {
  SUPPORTED_DOCUMENT_ACCEPT,
  SUPPORTED_DOCUMENT_EXTENSIONS,
  SUPPORTED_DOCUMENT_MIME_TYPES,
} from "../../constants/documentTypes";
import { useValidateDocumentWithAIMutation } from "../../redux/features/profile/studentProfileApi";
import { toBase64WithoutPrefix } from "../../pages/Students/StudentProfile/utils/academicDocumentValidation";
import Uploader from "../common/Shared/Uploader";

const UPLOAD_AREA_CLASS = "min-h-[238px]";
const SOP_EXPECTED_TYPE = "statement_of_purpose";

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const isSupportedDocumentFile = (file: File) => {
  const mime = (file.type || "").toLowerCase();
  if (
    SUPPORTED_DOCUMENT_MIME_TYPES.includes(
      mime as (typeof SUPPORTED_DOCUMENT_MIME_TYPES)[number],
    )
  ) {
    return true;
  }
  const lowerName = file.name.toLowerCase();
  return SUPPORTED_DOCUMENT_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
};

const formatFileSize = (sizeInBytes: number): string => {
  if (!sizeInBytes) return "0 KB";
  const mb = sizeInBytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${(sizeInBytes / 1024).toFixed(0)} KB`;
};

export type StatementOfPurposeAiModalProps = {
  open: boolean;
  onClose: () => void;
  profileData: any;
  createMedia: (fd: FormData) => { unwrap: () => Promise<any> };
  updateProfile: (body: { statementOfPurpose: string }) => { unwrap: () => Promise<any> };
  onSuccess: () => void;
};

const StatementOfPurposeAiModal = ({
  open,
  onClose,
  profileData,
  createMedia,
  updateProfile,
  onSuccess,
}: StatementOfPurposeAiModalProps) => {
  const [validateDocumentWithAI] = useValidateDocumentWithAIMutation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreviewUrl("");
      setStatus("idle");
      setMessage("");
      return;
    }
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const u = URL.createObjectURL(file);
    setPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file, open]);

  const handleClose = () => {
    if (status === "processing") return;
    onClose();
  };

  const runValidateAndUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    setStatus("processing");
    setMessage("Validating Statement of Purpose…");

    try {
      const base64 = await toBase64WithoutPrefix(file);
      const fullName =
        [profileData?.firstName, profileData?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || null;

      const validationRes: any = await validateDocumentWithAI({
        documentBase64: base64,
        mimeType: file.type || "image/jpeg",
        expectedDocumentType: SOP_EXPECTED_TYPE,
        fields: ["student_full_name", "document_title"],
        matchSource: {
          student_full_name: fullName,
        },
        matchFields: fullName ? ["student_full_name"] : [],
      }).unwrap();

      const aiPayload = validationRes?.data || {};
      const typeMatched = !!aiPayload?.data?.isDocumentTypeMatch;
      const matchCheck = aiPayload?.matchCheck;
      const allMatched =
        matchCheck?.isChecked === true ? matchCheck?.allMatched !== false : true;

      if (!typeMatched || !allMatched) {
        setStatus("error");
        setMessage(
          "Document could not be verified as your Statement of Purpose, or your name does not match your profile.",
        );
        toast.error("Please submit your own Statement of Purpose.");
        return;
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "statement-of-purpose");
      const res = await createMedia(fd).unwrap();
      if (!res?.success || !res?.data?.url) {
        throw new Error("Upload failed");
      }
      const url = res.data.url;
      await updateProfile({ statementOfPurpose: url }).unwrap();
      toast.success("Statement of Purpose uploaded.");
      onSuccess();
      setStatus("success");
      setMessage("Uploaded successfully.");
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.data?.message || "Validation or upload failed.");
      toast.error(e?.data?.message || "Validation or upload failed.");
    }
  };

  return (
    <Modal
      open={open}
      title="Statement of Purpose"
      onCancel={handleClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload your Statement of Purpose. We verify the document type and that your name
          matches your profile before saving.
        </p>
        <div className="text-xs font-bold text-gray-500 uppercase italic">Document</div>
        {!file ? (
          <div className={UPLOAD_AREA_CLASS}>
            <Uploader
              label="Upload Statement of Purpose"
              buttonLabel="Choose file"
              helperText="Supported formats: PDF, JPG, JPEG, JFIF, PNG, WEBP, GIF"
              accept={SUPPORTED_DOCUMENT_ACCEPT}
              disabled={status === "processing"}
              onChange={(f: any) => {
                const selectedFile = Array.isArray(f) ? f[0] : f;
                const actualFile = selectedFile?.originFileObj || selectedFile || null;
                if (actualFile && !isSupportedDocumentFile(actualFile)) {
                  toast.error(
                    "Unsupported file type. Allowed: JPG, JPEG, JFIF, PNG, WEBP, GIF, PDF.",
                  );
                  return;
                }
                setFile(actualFile);
                setStatus("idle");
                setMessage("");
              }}
            />
          </div>
        ) : (
          <div
            key={`${file.name}-${file.size}-${file.lastModified}`}
            className={`relative ${UPLOAD_AREA_CLASS} flex flex-col rounded-2xl border-2 border-dashed border-primary/30 bg-white shadow-sm overflow-hidden`}
          >
            <button
              type="button"
              disabled={status === "processing"}
              className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50"
              onClick={() => {
                setFile(null);
                setStatus("idle");
                setMessage("");
              }}
              aria-label="Remove selected file"
            >
              <FiTrash2 className="text-sm" />
              Delete
            </button>
            <div className="flex flex-1 flex-col min-h-0 pt-12 px-3 pb-2">
              <div className="flex flex-1 min-h-[140px] items-center justify-center rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                {previewUrl && !isPdfFile(file) ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="max-h-[180px] w-full object-contain"
                  />
                ) : previewUrl && isPdfFile(file) ? (
                  <iframe
                    title="SOP PDF preview"
                    src={previewUrl}
                    className="h-[180px] w-full border-0 bg-white"
                  />
                ) : (
                  <div className="px-4 text-center text-sm text-gray-500">
                    Preview is loading or not available.
                  </div>
                )}
              </div>
              <div className="mt-2 shrink-0 border-t border-gray-100 pt-2 text-center">
                <p className="truncate text-xs font-semibold text-gray-700">{file.name}</p>
                <p className="text-[11px] font-medium text-primary">
                  {formatFileSize(file.size)} · selected
                </p>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`rounded-lg p-3 text-sm font-medium flex items-start gap-2 ${
              status === "error"
                ? "bg-red-50 text-red-600 border border-red-200"
                : status === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            {status === "success" ? (
              <FiCheckCircle className="mt-0.5 shrink-0" />
            ) : status === "error" ? (
              <FiAlertCircle className="mt-0.5 shrink-0" />
            ) : (
              <LoadingOutlined style={{ fontSize: 14 }} spin />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
            onClick={handleClose}
            disabled={status === "processing"}
          >
            {status === "success" ? "Close" : "Cancel"}
          </button>
          {status !== "success" && (
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
              onClick={runValidateAndUpload}
              disabled={!file || status === "processing"}
            >
              <FiUploadCloud />
              Validate & upload
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StatementOfPurposeAiModal;
