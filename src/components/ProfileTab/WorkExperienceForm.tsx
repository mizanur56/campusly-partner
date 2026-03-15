import { useState, useEffect, useRef } from "react";
import { Form, Tooltip, Switch } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";

import { useGetStudentProfileQuery } from "../../redux/features/profile/studentProfileApi";
import { useCreateMediaMutation } from "../../redux/features/media/mediaApi";
import { useUpsertDocumentMutation } from "../../redux/features/profile/studentProfileApi";
import { FormDatePicker, FormInput } from "../common/Forms";
import PrimaryButton from "../common/Button/PrimaryButton";
import { config } from "../../config";
import { FaRegEdit } from "react-icons/fa";

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
  const { data: profile, refetch } = useGetStudentProfileQuery(studentId, { skip: !studentId });

  const [certificate, setCertificate] = useState<{ url: string; name: string; file?: File } | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasExperience, setHasExperience] = useState(true);

  const workExperienceDoc = (profile as { documents?: { documentRelation?: { name?: string }; document?: string; studentDocumentFields?: { fieldId: string; result: string; documentField?: { name?: string } }[] }[] })?.documents?.find((d: any) =>
    d.documentRelation?.name?.toLowerCase().includes("work experience"),
  );

  const fields = document.fields ?? [];

  useEffect(() => {
    if (workExperienceDoc) {
      setHasExperience(true);
      setIsEditing(false);
      if (workExperienceDoc.document) {
        setCertificate({
          url: workExperienceDoc.document.startsWith("http") ? workExperienceDoc.document : `${config?.image_access_url ?? ""}${workExperienceDoc.document}`,
          name: "Work Experience Certificate",
        });
      }
      const initialValues: Record<string, unknown> = {};
      workExperienceDoc.studentDocumentFields?.forEach((f: any) => {
        const isDate = f.documentField?.name?.toLowerCase().includes("date");
        initialValues[f.fieldId] = isDate ? dayjs(f.result, "DD-MM-YYYY") : f.result;
      });
      form.setFieldsValue(initialValues);
    } else {
      setHasExperience(true);
      if (canEdit) setIsEditing(true);
    }
  }, [workExperienceDoc, form, canEdit]);

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
    if (file.url.startsWith("http") || file.url.startsWith("blob:")) return file.url;
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
        documentPath = (mediaRes as { data?: { url?: string } })?.data?.url ?? documentPath;
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
    <div className="bg-white border border-[#C7CACF] rounded-lg p-4 relative transition-all duration-300">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {canEdit && workExperienceDoc ? (
          !isEditing && (
            <Tooltip title="Edit Work Experience">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-2 cursor-pointer text-[#237D3B] rounded-full transition-all"
              >
                <FaRegEdit style={{ fontSize: "20px", color: "#237D3B", cursor: "pointer" }} />
              </button>
            </Tooltip>
          )
        ) : canEdit ? (
          <div className="flex items-center gap-2">
            <Switch size="default" checked={hasExperience} onChange={(checked) => setHasExperience(checked)} className={hasExperience ? "bg-[#237D3B]" : ""} />
          </div>
        ) : null}
      </div>

      <h3 className="text-lg font-semibold mb-1">{document.name}</h3>
      <p className="text-sm text-gray-500 mb-4">If you have any work experience you can upload it</p>

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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCertificate({ url: URL.createObjectURL(file), name: file.name, file });
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canEdit || !isEditing}
                  className="px-4 py-2 border border-[#C7CACF] rounded-lg text-[#237D3B] hover:border-[#237D3B] cursor-pointer"
                >
                  Upload Work Experience Certificate
                </button>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50 flex items-center gap-4">
                {getFileType(certificate) === "image" ? (
                  <img src={resolveUrl(certificate)} alt="cert" className="w-16 h-16 object-cover rounded border" />
                ) : getFileType(certificate) === "pdf" ? (
                  <FilePdfOutlined className="text-3xl text-red-500" />
                ) : getFileType(certificate) === "doc" ? (
                  <FileWordOutlined className="text-3xl text-blue-500" />
                ) : (
                  <FileTextOutlined className="text-3xl text-gray-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-[#20242A] truncate max-w-50">{certificate.name}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => window.open(resolveUrl(certificate), "_blank")} className="p-2 cursor-pointer hover:bg-gray-200 rounded">
                    <EyeOutlined />
                  </button>
                  {canEdit && isEditing && (
                    <button type="button" onClick={() => setCertificate(null)} className="p-2 cursor-pointer hover:bg-red-100 text-red-500 rounded">
                      <DeleteOutlined />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-x-4 mt-3">
              {fields.map((field) =>
                field.name.toLowerCase().includes("date") ? (
                  <FormDatePicker key={field.id} name={field.id} label={field.name} format="DD/MM/YYYY" />
                ) : (
                  <FormInput key={field.id} name={field.id} label={field.name} />
                ),
              )}
            </div>

            {canEdit && isEditing && (
              <div className="flex justify-end mt-6 gap-3">
                {workExperienceDoc && (
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-md hover:border-[#237D3B] hover:text-[#237D3B] cursor-pointer">
                    Discard
                  </button>
                )}
                <PrimaryButton text={saving ? "Saving..." : "Save"} onClick={save} loading={saving} disabled={saving} />
              </div>
            )}
          </div>
        </Form>
      )}
    </div>
  );
};

export default WorkExperienceForm;
