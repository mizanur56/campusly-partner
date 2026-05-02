import {
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import { Button, Form, Switch, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { FaRegEdit } from "react-icons/fa";
import { config } from "../../config";
import { useCreateMediaMutation } from "../../redux/features/media/mediaApi";
import {
  useGetStudentProfileQuery,
  useUpsertDocumentMutation,
} from "../../redux/features/profile/studentProfileApi";
import PrimaryButton from "../common/Button/PrimaryButton";
import { FormDatePicker, FormInput } from "../common/Forms";

type BackgroundDocument = {
  id: string;
  name: string;
  fields?: { id: string; name: string; type?: string }[];
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [upsertDocument] = useUpsertDocumentMutation();
  const [createMedia] = useCreateMediaMutation();
  const { data: profile, refetch } = useGetStudentProfileQuery(studentId, {
    skip: !studentId,
  });

  const [certificate, setCertificate] = useState<{
    url: string;
    name: string;
    file?: File;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Default OFF when no saved work-experience document exists.
  const [hasExperience, setHasExperience] = useState(false);

  const workExperienceDoc = (
    profile as {
      documents?: {
        documentRelation?: { name?: string };
        document?: string;
        studentDocumentFields?: {
          fieldId: string;
          result: string;
          documentField?: { name?: string };
        }[];
      }[];
    }
  )?.documents?.find((d: any) =>
    d.documentRelation?.name?.toLowerCase().includes("work experience"),
  );

  const fields = document.fields ?? [];

  useEffect(() => {
    if (workExperienceDoc) {
      setHasExperience(true);
      setIsEditing(false);
      if (workExperienceDoc.document) {
        setCertificate({
          url: workExperienceDoc.document.startsWith("http")
            ? workExperienceDoc.document
            : `${config?.image_access_url ?? ""}${workExperienceDoc.document}`,
          name: "Work Experience Certificate",
        });
      }
      const initialValues: Record<string, unknown> = {};
      workExperienceDoc.studentDocumentFields?.forEach((f: any) => {
        const isDate = f.documentField?.name?.toLowerCase().includes("date");
        initialValues[f.fieldId] = isDate
          ? dayjs(f.result, "DD-MM-YYYY")
          : f.result;
      });
      form.setFieldsValue(initialValues);
    } else {
      setHasExperience(false);
      setIsEditing(false);
      setCertificate(null);
      form.resetFields();
    }
  }, [workExperienceDoc, form, canEdit]);

  // If user enables the section manually (no saved doc), start in edit mode.
  useEffect(() => {
    if (workExperienceDoc) return;
    if (!hasExperience) {
      setIsEditing(false);
      return;
    }
    if (canEdit) setIsEditing(true);
  }, [canEdit, hasExperience, workExperienceDoc]);

  const getFileType = (file: { url?: string; name?: string }) => {
    const url = file?.url || file?.name || "";
    const lower = url.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
    if (lower.match(/\.(pdf)$/)) return "pdf";
    if (lower.match(/\.(doc|docx)$/)) return "doc";
    return "other";
  };

  const resolveUrl = (file: { url?: string }) => {
    if (!file?.url) return "";
    if (file.url.startsWith("http") || file.url.startsWith("blob:"))
      return file.url;
    return `${config?.image_access_url ?? ""}${file.url}`;
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      if (!certificate) {
        toast.warning("Please upload work experience certificate");
        return;
      }
      setSaving(true);
      let documentPath = certificate.url;
      if (certificate.file) {
        const formData = new FormData();
        formData.append("file", certificate.file);
        formData.append("category", "document");
        const mediaRes = await createMedia(formData).unwrap();
        documentPath =
          (mediaRes as { data?: { url?: string } })?.data?.url ?? documentPath;
      }
      const fieldResults = fields.map((field) => ({
        fieldId: field.id,
        result: field.name.toLowerCase().includes("date")
          ? dayjs(values[field.id]).format("DD-MM-YYYY")
          : String(values[field.id] ?? ""),
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
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to save");
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
                className="p-2 cursor-pointer text-[#237D3B] rounded-full transition-all"
              >
                <FaRegEdit
                  style={{
                    fontSize: "20px",
                    color: "#237D3B",
                    cursor: "pointer",
                  }}
                />
              </button>
            </Tooltip>
          )
        ) : canEdit ? (
          <div className="flex items-center gap-2">
            <Switch
              size="default"
              checked={hasExperience}
              onChange={(checked) => setHasExperience(checked)}
              className={hasExperience ? "bg-[#237D3B]" : ""}
            />
          </div>
        ) : null}
      </div>

      <h3 className="text-lg font-semibold mb-1">{document.name}</h3>
      <p className="text-sm text-gray-500 mb-4">
        If you have any work experience you can upload it
      </p>

      {hasExperience && (
        <Form form={form} layout="vertical" disabled={!isEditing}>
          <div className="mt-4 animate-in fade-in duration-500">
            {!certificate ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  style={{ display: "none" }}
                  tabIndex={-1}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      setCertificate({
                        url: URL.createObjectURL(file),
                        name: file.name,
                        file,
                      });
                    e.target.value = "";
                  }}
                />
                <div
                  className={`w-full rounded-2xl border border-dashed p-10 text-center transition-colors ${
                    !canEdit || !isEditing
                      ? "border-gray-200 bg-gray-50/30 opacity-70"
                      : "border-gray-200 bg-white hover:border-[#237D3B]/40 hover:bg-[#F4FBF6]"
                  }`}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EE]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 3v10m0-10 4 4m-4-4-4 4"
                        stroke="#237D3B"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 14v4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4"
                        stroke="#237D3B"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <p className="text-[16px] font-semibold text-[#237D3B]">
                    Upload Work Experience Certificate
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    or click to browse
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canEdit || !isEditing}
                    className={`mt-5 inline-flex items-center justify-center rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${
                      !canEdit || !isEditing
                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                        : "cursor-pointer bg-[#237D3B] text-white hover:bg-[#19592A]"
                    }`}
                  >
                    Choose file
                  </button>

                  <p className="mt-4 text-xs text-gray-500">
                    Supported formats: PDF, JPG, PNG (max. 10MB)
                  </p>
                </div>
              </div>
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
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      window.open(resolveUrl(certificate), "_blank")
                    }
                  />
                  {canEdit && isEditing && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => setCertificate(null)}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-x-4 mt-3">
              {fields.map((field) =>
                field.name.toLowerCase().includes("date") ? (
                  <FormDatePicker
                    key={field.id}
                    name={field.id}
                    label={field.name}
                    format="DD/MM/YYYY"
                  />
                ) : (
                  <FormInput
                    key={field.id}
                    name={field.id}
                    label={field.name}
                  />
                ),
              )}
            </div>

            {canEdit && isEditing && (
              <div className="flex justify-end mt-6 gap-3">
                {workExperienceDoc && (
                  <Button onClick={() => setIsEditing(false)}>Discard</Button>
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
