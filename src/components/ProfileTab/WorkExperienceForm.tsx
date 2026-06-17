import {
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Form, Switch, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { FaRegEdit } from "react-icons/fa";
import { config } from "../../config";
import {
  SUPPORTED_DOCUMENT_ACCEPT,
  SUPPORTED_DOCUMENT_EXTENSIONS,
  SUPPORTED_DOCUMENT_MIME_TYPES,
} from "../../constants/documentTypes";
import { useCreateMediaMutation } from "../../redux/features/media/mediaApi";
import {
  useGetStudentProfileQuery,
  useUpsertDocumentMutation,
  useValidateDocumentWithAIMutation,
} from "../../redux/features/profile/studentProfileApi";
import { toBase64WithoutPrefix } from "../../pages/Students/StudentProfile/utils/academicDocumentValidation";
import {
  mapWorkExperienceExtractedToFormValues,
  WORK_EXPERIENCE_AI_FIELDS,
  WORK_EXPERIENCE_EXPECTED_TYPE,
} from "../../pages/Students/StudentProfile/utils/workExperienceAiUtils";

import type { BackgroundDocument } from "./type";
import PrimaryButton from "../common/Button/PrimaryButton";
import Uploader from "../common/Shared/Uploader";
import { FormDatePicker, FormInput } from "../common/Forms";
import {
  disableEndDate,
  disableStartDate,
  endDateRules,
  startDateRules,
} from "../../utils/profileDateValidation";

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

const WorkExperienceForm = ({
  studentId,
  document,
  canEdit,
  onUpdated,
}: {
  studentId: string;
  document: BackgroundDocument;
  canEdit: boolean;
  onUpdated?: () => void;
}) => {
  const [form] = Form.useForm();
  const [upsertDocument] = useUpsertDocumentMutation();
  const [createMedia] = useCreateMediaMutation();
  const [validateDocumentWithAI] = useValidateDocumentWithAIMutation();
  const { data: profile, refetch } = useGetStudentProfileQuery(studentId, {
    skip: !studentId,
  });

  const [certificate, setCertificate] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasExperience, setHasExperience] = useState(false);
  const [certProcessing, setCertProcessing] = useState(false);
  const [certUploaderKey, setCertUploaderKey] = useState(0);

  const startDateField = document.fields.find((f) =>
    f.name.toLowerCase().includes("start"),
  );
  const endDateField = document.fields.find((f) =>
    f.name.toLowerCase().includes("end"),
  );
  const durationField = document.fields.find((f) =>
    f.name.toLowerCase().includes("duration"),
  );

  const startDate = Form.useWatch(startDateField?.id, form);
  const endDate = Form.useWatch(endDateField?.id, form);

  const calculateDuration = (start: any, end: any) => {
    if (!start || !end) return "";
    const s = dayjs(start);
    const e = dayjs(end);
    if (e.isBefore(s)) return "";
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
      form.setFields([
        {
          name: endDateField?.id,
          errors: ["End date cannot be before start date"],
        },
      ]);
      return;
    }
    const duration = calculateDuration(startDate, endDate);
    form.setFieldValue(durationField.id, duration);
  }, [startDate, endDate, durationField, form, endDateField?.id]);

  const applyExtractedStringsToForm = (strings: Record<string, string>) => {
    for (const [fieldId, val] of Object.entries(strings)) {
      if (!val) continue;
      const field = document.fields.find((f) => f.id === fieldId);
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
  };

  const runCertUploadAndFill = async (file: File) => {
    setCertProcessing(true);
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
        toast.error("Please upload a valid work experience certificate.");
        setCertUploaderKey((k) => k + 1);
        return;
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "document");
      const res = await createMedia(fd).unwrap();
      if (!res?.success || !res?.data?.url) {
        throw new Error("Upload failed");
      }
      const serverUrl = res.data.url;
      const extracted =
        (aiPayload?.data?.extractedData as Record<string, unknown>) || {};
      const extractedStrings = mapWorkExperienceExtractedToFormValues(
        document,
        extracted,
      );

      const cert = {
        url: serverUrl,
        name: "Work Experience Certificate",
        isExisting: true,
      };
      setCertificate(cert);
      form.setFieldsValue({ work_experience_certificate: cert });
      applyExtractedStringsToForm(extractedStrings);
      setIsEditing(true);
      toast.success(
        "Certificate attached and fields updated. Review below and click Save.",
      );
    } catch (e: any) {
      toast.error(e?.data?.message || "Could not process the certificate.");
      setCertUploaderKey((k) => k + 1);
    } finally {
      setCertProcessing(false);
    }
  };

  const workExperienceDoc = (profile as any)?.documents?.find((d: any) =>
    d.documentRelation?.name?.toLowerCase().includes("work experience"),
  );

  const hasExperienceStorageKey = `workExperience_hasExperience_${studentId}_${document.id}`;

  useEffect(() => {
    if (workExperienceDoc) {
      setHasExperience(true);
      setIsEditing(false);
      try {
        localStorage.setItem(hasExperienceStorageKey, "true");
      } catch {
        // ignore
      }

      if (workExperienceDoc.document) {
        const url = workExperienceDoc.document.startsWith("http")
          ? workExperienceDoc.document
          : `${config?.image_access_url ?? ""}${workExperienceDoc.document}`;
        const existingCert = {
          url,
          name: "Work Experience Certificate",
          isExisting: true,
        };
        setCertificate(existingCert);
        form.setFieldsValue({ work_experience_certificate: existingCert });
      }

      const initialValues: any = {};
      workExperienceDoc.studentDocumentFields?.forEach((f: any) => {
        const isDate = f.documentField?.name?.toLowerCase().includes("date");
        initialValues[f.fieldId] = isDate
          ? dayjs(f.result, "DD-MM-YYYY")
          : f.result;
      });
      form.setFieldsValue(initialValues);
    } else {
      try {
        const stored = localStorage.getItem(hasExperienceStorageKey);
        const nextHasExperience = stored === null ? false : stored === "true";
        setHasExperience(nextHasExperience);
        setIsEditing(nextHasExperience);
      } catch {
        setHasExperience(false);
        setIsEditing(false);
      }
    }
  }, [form, workExperienceDoc, hasExperienceStorageKey]);

  useEffect(() => {
    if (workExperienceDoc) return;
    setIsEditing(hasExperience);
  }, [hasExperience, workExperienceDoc]);

  const getFileType = (file: any) => {
    const url = file?.url || file?.name || "";
    const lower = url.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
    if (lower.match(/\.(pdf)$/)) return "pdf";
    if (lower.match(/\.(doc|docx)$/)) return "doc";
    return "other";
  };

  const resolveUrl = (file: any) => {
    if (!file?.url) return "";
    if (file.url.startsWith("http") || file.url.startsWith("blob:"))
      return file.url;
    return `${config?.image_access_url ?? ""}${file.url}`;
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const certValue = values.work_experience_certificate ?? certificate;

      if (!certValue) {
        toast.warning("Please upload work experience certificate");
        return;
      }

      let documentPath = certValue.url;

      if (String(documentPath).startsWith("blob:")) {
        const formData = new FormData();
        const fileToUpload = certValue.originFileObj || certValue.file || certValue;
        formData.append("file", fileToUpload);
        formData.append("category", "document");
        const mediaRes = await createMedia(formData).unwrap();
        documentPath = (mediaRes as { data?: { url?: string } })?.data?.url ?? documentPath;
      }

      const fieldResults = document.fields.map((field) => ({
        fieldId: field.id,
        result: field.name.toLowerCase().includes("date")
          ? dayjs(values[field.id]).format("DD-MM-YYYY")
          : String(values[field.id] || ""),
      }));

      await upsertDocument({
        studentId,
        body: {
          documentId: document.id,
          document: documentPath,
          fields: fieldResults,
        },
      }).unwrap();

      toast.success("Work experience saved successfully");
      await refetch();
      onUpdated?.();
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-primary-border rounded-lg p-4 relative transition-all duration-300">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {canEdit && workExperienceDoc ? (
          !isEditing && (
            <Tooltip title="Edit Work Experience">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-2 cursor-pointer text-[#237D3B] hover:bg-green-50 rounded-full transition-all"
              >
                <FaRegEdit size={20} />
              </button>
            </Tooltip>
          )
        ) : canEdit ? (
          <Switch
            size="default"
            checked={hasExperience}
            onChange={(checked) => {
              setHasExperience(checked);
              try {
                localStorage.setItem(hasExperienceStorageKey, String(checked));
              } catch {
                // ignore
              }
              if (!checked) {
                setCertificate(null);
                form.resetFields();
              }
            }}
            className={hasExperience ? "bg-[#237D3B]" : ""}
          />
        ) : null}
      </div>

      <h3 className="text-lg font-semibold mb-1">{document.name}</h3>
      <p className="text-sm text-gray-500 mb-4">
        If you have any work experience you can upload it
      </p>

      {hasExperience && (
        <Form form={form} layout="vertical" disabled={!isEditing || !canEdit}>
          <Form.Item
            name="work_experience_certificate"
            rules={[
              {
                required: true,
                message: "Work experience certificate is required",
              },
            ]}
            hidden
          >
            <input />
          </Form.Item>

          <div className="mt-4 animate-in fade-in duration-500">
            {!certificate ? (
              isEditing &&
              canEdit && (
                <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
                  {certProcessing && (
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                      <LoadingOutlined spin />
                      <span>Processing your certificate…</span>
                    </div>
                  )}
                  <Uploader
                    key={certUploaderKey}
                    label="Upload work experience certificate"
                    buttonLabel="Choose file"
                    helperText="Supported formats: PDF, JPG, JPEG, JFIF, PNG, WEBP, GIF"
                    accept={SUPPORTED_DOCUMENT_ACCEPT}
                    disabled={certProcessing}
                    onChange={(f: any) => {
                      if (!f) return;
                      const selected = Array.isArray(f) ? f[0] : f;
                      const actualFile = selected?.originFileObj as File | undefined;
                      if (!actualFile) return;
                      if (!isSupportedDocumentFile(actualFile)) {
                        toast.error(
                          "Unsupported file type. Allowed: JPG, JPEG, JFIF, PNG, WEBP, GIF, PDF.",
                        );
                        setCertUploaderKey((k) => k + 1);
                        return;
                      }
                      void runCertUploadAndFill(actualFile);
                    }}
                  />
                </div>
              )
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50 flex items-center gap-4">
                {getFileType(certificate) === "image" ? (
                  <img
                    src={resolveUrl(certificate)}
                    alt="cert"
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : getFileType(certificate) === "pdf" ? (
                  <FilePdfOutlined className="text-3xl text-red-500" />
                ) : getFileType(certificate) === "doc" ? (
                  <FileWordOutlined className="text-3xl text-blue-500" />
                ) : (
                  <FileTextOutlined className="text-3xl text-gray-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-[#20242A] truncate max-w-50">
                    {certificate.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(resolveUrl(certificate), "_blank")}
                    className="p-2 hover:bg-gray-200 rounded cursor-pointer"
                  >
                    <EyeOutlined />
                  </button>
                  {canEdit && isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setCertificate(null);
                        form.setFieldsValue({
                          work_experience_certificate: null,
                        });
                      }}
                      className="p-2 hover:bg-red-100 text-red-500 rounded cursor-pointer"
                    >
                      <DeleteOutlined />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-x-4 mt-3">
              {document.fields.map((field) => {
                const lowerName = field.name.toLowerCase();
                const isDateField = lowerName.includes("date");
                const isStartDateField = lowerName.includes("start");
                const isEndDateField = lowerName.includes("end");

                if (isDateField) {
                  return (
                    <FormDatePicker
                      key={field.id}
                      name={field.id}
                      label={field.name}
                      format="DD/MM/YYYY"
                      disabledDate={
                        isStartDateField
                          ? disableStartDate(endDate)
                          : isEndDateField
                            ? disableEndDate(startDate)
                            : undefined
                      }
                      rules={
                        isStartDateField
                          ? startDateRules(() => endDate)
                          : isEndDateField
                            ? endDateRules(() => startDate)
                            : [
                                {
                                  required: true,
                                  message: `${field.name} is required`,
                                },
                              ]
                      }
                    />
                  );
                }

                return (
                  <FormInput
                    key={field.id}
                    name={field.id}
                    label={field.name}
                    disabled={field.id === durationField?.id || !isEditing}
                    rules={[
                      { required: true, message: `${field.name} is required` },
                    ]}
                  />
                );
              })}
            </div>

            {canEdit && isEditing && (
              <div className="flex justify-end mt-6 gap-3">
                {workExperienceDoc && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 cursor-pointer py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <PrimaryButton
                  text={saving ? "Saving..." : "Save"}
                  onClick={save}
                  loading={saving}
                  disabled={saving}
                />
              </div>
            )}
          </div>
        </Form>
      )}
    </div>
  );
};

export default WorkExperienceForm;
