import { Form, Modal } from "antd";
import dayjs from "dayjs";
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
import {
  mapWorkExperienceExtractedToFormValues,
  WORK_EXPERIENCE_AI_FIELDS,
  WORK_EXPERIENCE_EXPECTED_TYPE,
} from "../../pages/Students/StudentProfile/utils/workExperienceAiUtils";
import { FormDatePicker, FormInput } from "../common/Forms";
import Uploader from "../common/Shared/Uploader";
import type { BackgroundDocument } from "./type";

const UPLOAD_AREA_CLASS = "min-h-[200px]";

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

function applyExtractedStringsToFieldsForm(
  form: ReturnType<typeof Form.useForm>[0],
  doc: BackgroundDocument,
  strings: Record<string, string>,
) {
  for (const [fieldId, val] of Object.entries(strings)) {
    if (!val) continue;
    const field = doc.fields.find((f) => f.id === fieldId);
    if (!field) continue;
    if (field.name.toLowerCase().includes("date")) {
      const d = dayjs(val, ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY"], true);
      if (d.isValid()) {
        form.setFieldValue(fieldId, d);
      }
    } else {
      form.setFieldValue(fieldId, val);
    }
  }
}

export type WorkExperienceCertificateAiModalProps = {
  open: boolean;
  onClose: () => void;
  document: BackgroundDocument;
  createMedia: (fd: FormData) => { unwrap: () => Promise<any> };
  onComplete: (args: {
    serverUrl: string;
    extractedStrings: Record<string, string>;
  }) => void;
};

/**
 * Modal: certificate file → process → edit all template fields here → confirm.
 */
const WorkExperienceCertificateAiModal = ({
  open,
  onClose,
  document,
  createMedia,
  onComplete,
}: WorkExperienceCertificateAiModalProps) => {
  const [form] = Form.useForm();
  const [validateDocumentWithAI] = useValidateDocumentWithAIMutation();
  const [step, setStep] = useState<"file" | "details">("file");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [message, setMessage] = useState("");

  const startDateField = document.fields.find((f) =>
    f.name.toLowerCase().includes("start"),
  );
  const endDateField = document.fields.find((f) => f.name.toLowerCase().includes("end"));
  const durationField = document.fields.find((f) =>
    f.name.toLowerCase().includes("duration"),
  );
  const startDate = Form.useWatch(startDateField?.id, form);
  const endDate = Form.useWatch(endDateField?.id, form);

  const calculateDuration = (start: unknown, end: unknown) => {
    if (!start || !end) return "";
    const s = dayjs(start as any);
    const e = dayjs(end as any);
    if (!s.isValid() || !e.isValid() || e.isBefore(s)) return "";
    const years = e.diff(s, "year");
    const months = e.diff(s.add(years, "year"), "month");
    const days = e.diff(s.add(years, "year").add(months, "month"), "day");
    const parts: string[] = [];
    if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    return parts.join(" ");
  };

  useEffect(() => {
    if (!startDate || !endDate || !durationField) return;
    if (dayjs(endDate).isBefore(dayjs(startDate))) {
      form.setFields([{ name: endDateField?.id, errors: ["End date cannot be before start date"] }]);
      return;
    }
    form.setFieldValue(durationField.id, calculateDuration(startDate, endDate));
  }, [startDate, endDate, durationField, endDateField?.id, form]);

  useEffect(() => {
    if (!open) return;
    setStep("file");
    setFile(null);
    setPreviewUrl("");
    setServerUrl(null);
    setStatus("idle");
    setMessage("");
    form.resetFields();
  }, [open, form]);

  useEffect(() => {
    if (!open || !file) {
      if (!file) setPreviewUrl("");
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

  const processFileAndExtract = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    setStatus("processing");
    setMessage("Processing your certificate…");

    try {
      const base64 = await toBase64WithoutPrefix(file);
      const validationRes: any = await validateDocumentWithAI({
        documentBase64: base64,
        mimeType: file.type || "image/jpeg",
        expectedDocumentType: WORK_EXPERIENCE_EXPECTED_TYPE,
        fields: [...WORK_EXPERIENCE_AI_FIELDS],
        matchSource: {},
        matchFields: [],
      }).unwrap();

      const aiPayload = validationRes?.data || {};
      const typeMatched = !!aiPayload?.data?.isDocumentTypeMatch;
      const matchCheck = aiPayload?.matchCheck;
      const allMatched =
        matchCheck?.isChecked === true ? matchCheck?.allMatched !== false : true;

      if (!typeMatched || !allMatched) {
        setStatus("error");
        setMessage("This file does not look like a work experience certificate.");
        toast.error("Please upload a valid work experience certificate.");
        return;
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "document");
      const res = await createMedia(fd).unwrap();
      if (!res?.success || !res?.data?.url) {
        throw new Error("Upload failed");
      }
      const url = res.data.url;
      const extracted =
        (aiPayload?.data?.extractedData as Record<string, unknown>) || {};
      const extractedStrings = mapWorkExperienceExtractedToFormValues(document, extracted);

      form.resetFields();
      applyExtractedStringsToFieldsForm(form, document, extractedStrings);
      setServerUrl(url);
      setStep("details");
      setStatus("idle");
      setMessage("");
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.data?.message || "Upload could not be completed.");
      toast.error(e?.data?.message || "Upload could not be completed.");
    }
  };

  const goBackToFile = () => {
    setStep("file");
    setServerUrl(null);
    setStatus("idle");
    setMessage("");
    form.resetFields();
  };

  const confirmDetails = async () => {
    if (!serverUrl) {
      toast.error("Certificate file is missing. Please start again.");
      return;
    }
    try {
      const values = await form.validateFields();
      const extractedStrings: Record<string, string> = {};
      for (const field of document.fields) {
        const raw = values[field.id];
        extractedStrings[field.id] = field.name.toLowerCase().includes("date")
          ? dayjs(raw).format("DD-MM-YYYY")
          : String(raw ?? "").trim();
      }
      onComplete({ serverUrl, extractedStrings });
      onClose();
    } catch (e: any) {
      if (!e?.errorFields) {
        toast.error(e?.data?.message || "Please complete all fields.");
      }
    }
  };

  return (
    <Modal
      open={open}
      title="Work Experience Certificate"
      onCancel={handleClose}
      footer={null}
      width={880}
      centered
      destroyOnClose
    >
      <div className="space-y-4 max-h-[min(85vh,900px)] overflow-y-auto pr-1">
        {step === "file" ? (
          <>
            <p className="text-sm text-gray-600">
              Choose your certificate file first. On the next step you can review and edit
              company, designation, dates, and duration before saving.
            </p>
            <div className="text-xs font-bold text-gray-500 uppercase italic">
              Certificate file
            </div>
            {!file ? (
              <div className={UPLOAD_AREA_CLASS}>
                <Uploader
                  label="Upload work experience certificate"
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
                  <div className="flex flex-1 min-h-[120px] items-center justify-center rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                    {previewUrl && !isPdfFile(file) ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="max-h-[160px] w-full object-contain"
                      />
                    ) : previewUrl && isPdfFile(file) ? (
                      <iframe
                        title="Certificate PDF preview"
                        src={previewUrl}
                        className="h-[160px] w-full border-0 bg-white"
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
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {status === "error" ? (
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
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
                onClick={processFileAndExtract}
                disabled={!file || status === "processing"}
              >
                <FiUploadCloud />
                Next: fill details
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 flex flex-wrap items-center justify-between gap-2">
              <span className="truncate font-medium">
                File: {file?.name ?? "Certificate uploaded"}
              </span>
              <button
                type="button"
                className="text-primary text-sm font-semibold hover:underline shrink-0"
                onClick={goBackToFile}
              >
                Change file
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Review and edit the details below, then confirm. Dates use day/month/year.
            </p>
            <Form form={form} layout="vertical">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                {document.fields.map((field) =>
                  field.name.toLowerCase().includes("date") ? (
                    <FormDatePicker
                      key={field.id}
                      name={field.id}
                      label={field.name}
                      format="DD/MM/YYYY"
                      rules={[{ required: true, message: `${field.name} is required` }]}
                    />
                  ) : (
                    <FormInput
                      key={field.id}
                      name={field.id}
                      label={field.name}
                      disabled={field.id === durationField?.id}
                      rules={[{ required: true, message: `${field.name} is required` }]}
                    />
                  ),
                )}
              </div>
            </Form>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:opacity-90 inline-flex items-center gap-1.5"
                onClick={confirmDetails}
              >
                <FiCheckCircle />
                Confirm & apply
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default WorkExperienceCertificateAiModal;
