import {
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Form, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { FiChevronUp } from "react-icons/fi";
import { toast } from "react-toastify";

import { config } from "../../../config";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";
import { useUpsertDocumentMutation } from "../../../redux/features/profile/studentProfileApi";
import PrimaryButton from "../../common/Button/PrimaryButton";
import { FormDatePicker, FormInput } from "../../common/Forms";
import Uploader from "../../common/Shared/Uploader";

interface Props {
  id: string;
  type: string;
  onDelete: (id: string) => void;
  fields?: Array<{ id: string; name: string; type: string }>;
  form: any;
  submittedTestData?: any;
  onSaved?: () => void;
  record?: any;
  studentId?: string;
}

const LanguageTestCard: React.FC<Props> = ({
  id,
  type,
  onDelete,
  fields,
  form,
  submittedTestData,
  onSaved,
  // record,
  studentId,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);

  const [createMedia] = useCreateMediaMutation();
  const [upsertDocument] = useUpsertDocumentMutation();

  const certFieldName = `${id}_certificateId`;

  /* ================= Helpers ================= */
  const resolveUrl = (file: any) => {
    if (!file) return "";
    if (typeof file === "string")
      return file.startsWith("http")
        ? file
        : `${config.image_access_url}${file}`;
    return (
      file.url ||
      (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "")
    );
  };

  const getFileName = (file: any) => {
    if (!file) return "";
    if (typeof file === "string") return file.split("/").pop();
    return file.name || file.originFileObj?.name || "Document";
  };

  /* ================= Initial Data ================= */
  useEffect(() => {
    if (!form) return;

    if (submittedTestData) {
      setIsEditing(false);

      const values: Record<string, any> = {};

      if (submittedTestData.document) {
        values[certFieldName] = submittedTestData.document;
      }

      if (submittedTestData.studentDocumentFields && fields) {
        submittedTestData.studentDocumentFields.forEach((f: any) => {
          const field = fields.find((x) => x.id === f.fieldId);
          if (!field) return;

          const name = `${id}_${field.name.toLowerCase().replace(/\s+/g, "_")}`;

          const isDate =
            field.type === "date" || field.name.toLowerCase().includes("date");

          values[name] = isDate
            ? dayjs(f.result, ["DD-MM-YYYY", "YYYY-MM-DD"])
            : f.result;
        });
      }

      form.setFieldsValue(values);
    } else {
      setIsEditing(true);
    }
  }, [submittedTestData, fields, id, form, certFieldName]);

  /* ================= Save ================= */
  const handleInternalSave = async () => {
    try {
      setIsSaving(true);

      const fieldNames = [
        certFieldName,
        ...(fields?.map(
          (f) => `${id}_${f.name.toLowerCase().replace(/\s+/g, "_")}`,
        ) || []),
      ];

      const values = await form.validateFields(fieldNames);

      const certificate = values[certFieldName];
      if (!certificate) {
        toast.warning("Please upload certificate");
        return;
      }

      let documentPath = "";

      const fileToUpload =
        certificate?.originFileObj ||
        (certificate instanceof File ? certificate : null);

      if (fileToUpload) {
        const fd = new FormData();
        fd.append("file", fileToUpload);
        fd.append("category", "certificate");

        const res = await createMedia(fd).unwrap();
        documentPath = res?.data?.url;
      } else {
        documentPath = certificate?.url || certificate;
      }

      const fieldResults: Array<{ fieldId: string; result: string }> = [];

      fields?.forEach((field) => {
        const name = `${id}_${field.name.toLowerCase().replace(/\s+/g, "_")}`;
        const val = values[name];
        if (!val) return;

        const formatted =
          field.type === "date" || field.name.toLowerCase().includes("date")
            ? dayjs(val).format("DD-MM-YYYY")
            : String(val);

        fieldResults.push({
          fieldId: field.id,
          result: formatted,
        });
      });

      const payload = {
        documentId: id,
        document: documentPath,
        fields: fieldResults,
      };

      const response = await upsertDocument({
        studentId: studentId!,
        body: payload,
      }).unwrap();

      if (response.success) {
        toast.success(`${type} saved successfully`);
        form.setFieldsValue({ [certFieldName]: documentPath });
        setIsEditing(false);
        onSaved?.();
      }
    } catch {
      toast.error("Please fill all required fields");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    form.resetFields();
  };

  /* ================= UI ================= */
  return (
    <div className="bg-[#FFFFFF] border border-primary-border rounded-lg mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-[16px] font-semibold text-[#20242A]">{type}</h3>

        <div className="flex gap-1 items-center">
          {submittedTestData && !isEditing && (
            <Tooltip title="Edit">
              <button
                className="cursor-pointer"
                onClick={() => {
                  setIsEditing(true);
                  setOpen(true);
                }}
              >
                <FaRegEdit size={20} color="#237D3B" />
              </button>
            </Tooltip>
          )}

          <button onClick={() => setOpen((p) => !p)} className="cursor-pointer">
            <FiChevronUp
              size={26}
              className={`transition-transform duration-300 ${
                open ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Animated Content */}
      <div
        className={`
          transition-all duration-500 ease-in-out overflow-hidden
          ${open ? "max-h-625 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="p-6">
          <Form form={form} layout="vertical" disabled={!isEditing}>
            {/* Certificate */}
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const cert = getFieldValue(certFieldName);
                const url = resolveUrl(cert);
                const name = getFileName(cert);
                const isPdf =
                  url?.toLowerCase().endsWith(".pdf") ||
                  name?.toLowerCase().endsWith(".pdf");

                if (!cert) {
                  return (
                    <Uploader
                      label={`Upload ${type} Certificate`}
                      multiple={false}
                      onChange={(file: any) =>
                        form.setFieldsValue({
                          [certFieldName]: Array.isArray(file) ? file[0] : file,
                        })
                      }
                    />
                  );
                }

                return (
                  <div className="flex items-center gap-4 mb-6 border p-4 rounded bg-gray-50">
                    {isPdf ? (
                      <FileTextOutlined className="text-3xl text-red-500" />
                    ) : (
                      <img
                        src={url}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}

                    <div className="flex-1 truncate">{name}</div>

                    <div className="flex gap-2">
                      <button
                        className="cursor-pointer text-xl"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <EyeOutlined />
                      </button>

                      {isEditing && (
                        <button
                          className="cursor-pointer text-xl text-red-500"
                          onClick={() =>
                            form.setFieldsValue({ [certFieldName]: null })
                          }
                        >
                          <DeleteOutlined />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }}
            </Form.Item>

            {/* Dynamic fields */}
            <div className="grid md:grid-cols-2 gap-x-6 mt-4">
              {fields?.map((field) => {
                const name = `${id}_${field.name
                  .toLowerCase()
                  .replace(/\s+/g, "_")}`;

                const isDate =
                  field.type === "date" ||
                  field.name.toLowerCase().includes("date");

                return isDate ? (
                  <FormDatePicker
                    key={field.id}
                    name={name}
                    label={field.name}
                  />
                ) : (
                  <FormInput key={field.id} name={name} label={field.name} />
                );
              })}
            </div>

            {/* {isEditing && (
              <div className="flex justify-end gap-3 mt-6">
                <Button onClick={handleDiscard}>Discard</Button>
                <PrimaryButton
                  text={isSaving ? "Saving..." : "Save"}
                  loading={isSaving}
                  onClick={handleInternalSave}
                />
              </div>
            )} */}

            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button
                  size="large"
                  className="px-8 border-[#237D3B] text-[#237D3B]"
                  onClick={handleDiscard}
                >
                  Discard
                </Button>

                <PrimaryButton
                  text={isSaving ? "Saving" : "Save"}
                  loading={isSaving}
                  onClick={handleInternalSave}
                />
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LanguageTestCard;
