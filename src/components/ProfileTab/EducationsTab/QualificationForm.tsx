import React, { useState, useEffect } from "react";
import { Form, Button, Tooltip } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} from "../../../redux/features/profile/studentProfileApi";
import { useGetCountriesQuery } from "../../../redux/features/countries/countriesApi";
import { FormDatePicker, FormInput, FormSelect } from "../../common/Forms";
import PrimaryButton from "../../common/Button/PrimaryButton";
import { FaRegEdit } from "react-icons/fa";
import { FiChevronUp } from "react-icons/fi";
import DeleteModal from "../../shared/DeleteModal";

interface QualificationFormProps {
  studentId: string;
  title: string;
  studyLevelId: string;
  educationData?: {
    id: string;
    instituteName?: string;
    country?: string;
    startYear?: string;
    endYear?: string;
    outOfGrade?: string;
    result?: string;
    subject?: string;
  } | null;
  canEdit: boolean;
  onUpdated?: () => void;
}

const QualificationForm: React.FC<QualificationFormProps> = ({
  studentId,
  title,
  studyLevelId,
  educationData,
  canEdit,
  onUpdated,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [createEducation, { isLoading: isCreating }] = useCreateEducationMutation();
  const [updateEducation, { isLoading: isUpdating }] = useUpdateEducationMutation();
  const [deleteEducation, { isLoading: isDeleting }] = useDeleteEducationMutation();
  const { data: countriesData } = useGetCountriesQuery({ page: 1, limit: 1000 });

  const countriesOptions =
    (countriesData?.data as { id: string; name: string }[])?.map((c) => ({
      label: c.name,
      value: c.name,
    })) ?? [];

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (educationData) {
      form.setFieldsValue({
        instituteName: educationData.instituteName ?? "",
        country: educationData.country ?? undefined,
        outOfGrade: educationData.outOfGrade ?? "",
        result: educationData.result ?? "",
        subject: educationData.subject ?? "",
        startYear: educationData.startYear ? dayjs(educationData.startYear) : null,
        endYear: educationData.endYear ? dayjs(educationData.endYear) : null,
      });
      setIsEditing(false);
    } else {
      form.resetFields();
      if (canEdit) setIsEditing(true);
    }
  }, [educationData, form, canEdit]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        studyLevelId,
        instituteName: values.instituteName,
        country: values.country || undefined,
        startYear: values.startYear
          ? dayjs(values.startYear).startOf("year").format("YYYY-MM-DD")
          : undefined,
        endYear: values.endYear
          ? dayjs(values.endYear).endOf("year").format("YYYY-MM-DD")
          : undefined,
        outOfGrade: values.outOfGrade || undefined,
        result: values.result || undefined,
        subject: values.subject || undefined,
      };

      if (educationData?.id) {
        await updateEducation({ studentId, educationId: educationData.id, body: payload }).unwrap();
        toast.success("Education updated successfully!");
      } else {
        await createEducation({ studentId, body: payload }).unwrap();
        toast.success("Education saved successfully!");
      }
      setIsEditing(false);
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to save education.");
    }
  };

  const handleDiscard = () => {
    form.resetFields();
    if (educationData) {
      form.setFieldsValue({
        instituteName: educationData.instituteName ?? "",
        country: educationData.country ?? undefined,
        outOfGrade: educationData.outOfGrade ?? "",
        result: educationData.result ?? "",
        subject: educationData.subject ?? "",
        startYear: educationData.startYear ? dayjs(educationData.startYear) : null,
        endYear: educationData.endYear ? dayjs(educationData.endYear) : null,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!educationData?.id) return;
    try {
      await deleteEducation({ studentId, educationId: educationData.id }).unwrap();
      toast.success("Education deleted");
      setDeleteModalOpen(false);
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to delete");
    }
  };

  return (
    <>
      <div className="bg-white border border-[#C7CACF] rounded-lg p-6 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#20242A]">{title}</h3>

          <div className="flex items-center gap-2">
            {canEdit && educationData && !isEditing && (
              <Tooltip title="Edit Qualification">
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => {
                    setIsEditing(true);
                    setIsExpanded(true);
                  }}
                >
                  <FaRegEdit size={20} color="#237D3B" />
                </button>
              </Tooltip>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="bg-transparent cursor-pointer border-none flex items-center"
            >
              <FiChevronUp
                size={26}
                className={`transition-transform duration-300 ${
                  isExpanded ? "rotate-0" : "rotate-180"
                }`}
              />
            </button>
          </div>
        </div>

        <div
          className={`
          transition-all duration-500 ease-in-out overflow-hidden
          ${isExpanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"}
        `}
        >
          <Form form={form} layout="vertical" disabled={!isEditing} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormInput
                name="instituteName"
                label="Institute Name"
                placeholder="Enter institute name"
                rules={[{ required: true, message: "Required" }]}
              />
              <FormSelect
                name="country"
                label="Country"
                placeholder="Select country"
                options={countriesOptions}
              />
              <FormDatePicker
                name="startYear"
                label="Start Year"
                picker="year"
                format="YYYY"
              />
              <FormDatePicker
                name="endYear"
                label="End Year"
                picker="year"
                format="YYYY"
              />
              <FormInput
                name="subject"
                label="Subject / Group"
                placeholder="Enter subject or group name"
              />
              <FormInput
                name="outOfGrade"
                label="Out of Grade"
                placeholder="e.g. 4.0"
              />
              <FormInput
                name="result"
                label="Result"
                placeholder="e.g. 3.75"
              />
            </div>

            {canEdit && isEditing && (
              <div className="flex justify-end gap-3 flex-wrap">
                {educationData?.id && (
                  <Button
                    size="large"
                    danger
                    loading={isDeleting}
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  size="large"
                  className="px-8 border-[#237D3B] text-[#237D3B] rounded-lg hover:bg-green-50"
                  onClick={handleDiscard}
                >
                  Discard
                </Button>
                <PrimaryButton
                  text={isSaving ? "Saving..." : "Save"}
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                />
              </div>
            )}
          </Form>
        </div>
      </div>

      <DeleteModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName="this education record"
        loading={isDeleting}
      />
    </>
  );
};

export default QualificationForm;
