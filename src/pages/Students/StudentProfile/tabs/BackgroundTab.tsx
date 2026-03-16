import React, { useState, useEffect, useMemo } from "react";
import { Button, Form, Modal, Tooltip } from "antd";
import dayjs from "dayjs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaRegEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  useCreateVisaRejectionMutation,
  useUpdateVisaRejectionMutation,
  useDeleteVisaRejectionMutation,
  useUpdateStudentProfileMutation,
  useGetDocumentsByCategoryQuery,
} from "../../../../redux/features/profile/studentProfileApi";
import { FormDatePicker, FormInput } from "../../../../components/common/Forms";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
import DeleteModal from "../../../../components/shared/DeleteModal";
import WorkExperienceForm from "../../../../components/ProfileTab/WorkExperienceForm";

type VisaRejectionItem = {
  id: string;
  country?: string;
  rejectionDate?: string;
};

interface BackgroundTabProps {
  studentId: string;
  visaRejections: VisaRejectionItem[];
  cv?: string;
  statementOfPurpose?: string;
  canEdit: boolean;
  onUpdated?: () => void;
}

export default function BackgroundTab({
  studentId,
  visaRejections: existingData,
  canEdit,
  onUpdated,
}: BackgroundTabProps) {
  const [visaForm] = Form.useForm();
  const [isEditingVisa, setIsEditingVisa] = useState(false);
  const [rejections, setRejections] = useState<{ id: string; isNew: boolean }[]>([]);
  const [deleteVisaId, setDeleteVisaId] = useState<string | null>(null);

  const { data: backgroundData, isLoading: isLoadingBackground } = useGetDocumentsByCategoryQuery(
    { studentId, slug: "background-information" },
    { skip: !studentId }
  );

  const workExperienceDoc = useMemo(() => {
    const raw = Array.isArray(backgroundData) ? backgroundData : (backgroundData as { data?: unknown[] })?.data ?? [];
    const list = raw as { id: string; name?: string; fields?: { id: string; name: string; type?: string }[] }[];
    return list.find((d) => d.name?.toLowerCase().includes("work experience")) ?? null;
  }, [backgroundData]);

  const [createVisa, { isLoading: isCreatingVisa }] = useCreateVisaRejectionMutation();
  const [updateVisa, { isLoading: isUpdatingVisa }] = useUpdateVisaRejectionMutation();
  const [deleteVisa, { isLoading: isDeletingVisa }] = useDeleteVisaRejectionMutation();

  useEffect(() => {
    if (existingData.length > 0) {
      setIsEditingVisa(false);
      setRejections(existingData.map((r) => ({ id: r.id, isNew: false })));
      const values: Record<string, unknown> = {};
      existingData.forEach((r) => {
        values[`country_${r.id}`] = r.country;
        values[`date_${r.id}`] = r.rejectionDate ? dayjs(r.rejectionDate) : null;
      });
      visaForm.setFieldsValue(values);
    } else {
      setIsEditingVisa(canEdit);
      setRejections([{ id: `new_${Date.now()}`, isNew: true }]);
      visaForm.resetFields();
    }
  }, [existingData, visaForm, canEdit]);

  const handleVisaSave = async () => {
    try {
      const values = await visaForm.validateFields();
      await Promise.all(
        rejections.map((r) => {
          const payload = {
            country: values[`country_${r.id}`],
            rejectionDate: values[`date_${r.id}`] ? dayjs(values[`date_${r.id}`]).toISOString() : null,
          };
          return r.isNew
            ? createVisa({ studentId, body: payload }).unwrap()
            : updateVisa({ studentId, visaRejectionId: r.id, body: payload }).unwrap();
        })
      );
      toast.success("Records saved successfully");
      setIsEditingVisa(false);
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to save records");
    }
  };

  const addAnotherRejection = () => {
    setRejections((prev) => [...prev, { id: `new_${Date.now()}`, isNew: true }]);
  };

  const removeRejection = (r: { id: string; isNew: boolean }) => {
    if (r.isNew) {
      setRejections((prev) => prev.filter((x) => x.id !== r.id));
    } else {
      setDeleteVisaId(r.id);
    }
  };

  const confirmDeleteVisa = async () => {
    if (!deleteVisaId) return;
    try {
      await deleteVisa({ studentId, visaRejectionId: deleteVisaId }).unwrap();
      toast.success("Record deleted");
      setRejections((prev) => prev.filter((x) => x.id !== deleteVisaId));
      setDeleteVisaId(null);
      onUpdated?.();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (isLoadingBackground) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-[#C7CACF] rounded-lg p-4 relative">
          <div className="absolute top-4 right-4">
            <Skeleton height={24} width={24} circle />
          </div>
          <Skeleton height={24} width={200} className="mb-2" />
          <Skeleton height={16} width={300} className="mb-4" />
          <div className="grid md:grid-cols-2 gap-x-4 gap-y-4">
            <Skeleton height={100} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        </div>
        <div className="bg-white border border-[#C7CACF] rounded-lg p-4 relative">
          <div className="absolute top-4 right-4">
            <Skeleton height={24} width={24} circle />
          </div>
          <Skeleton height={24} width={200} className="mb-2" />
          <Skeleton height={16} width={350} className="mb-4" />
          <div className="space-y-4">
            <div className="border p-4 rounded-xl bg-gray-50/30">
              <div className="grid md:grid-cols-2 gap-x-4 gap-y-4">
                <Skeleton height={40} />
                <Skeleton height={40} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Work Experience - same as student */}
      {workExperienceDoc && (
        <WorkExperienceForm
          studentId={studentId}
          document={{
            id: workExperienceDoc.id,
            name: workExperienceDoc.name ?? "Work Experience",
            fields: workExperienceDoc.fields ?? [],
          }}
          canEdit={canEdit}
          onUpdated={onUpdated}
        />
      )}

      {/* Visa Rejections - same card and form as student VisaRejectionForm */}
      <div className="bg-white border rounded-lg p-4 relative">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {existingData.length > 0 && canEdit && (
            <Tooltip title={isEditingVisa ? "Cancel" : "Edit"}>
              <button
                type="button"
                onClick={() => setIsEditingVisa(!isEditingVisa)}
                className={`p-2 cursor-pointer rounded-full transition-all ${isEditingVisa ? "text-red-500 hover:text-white" : "text-[#237D3B]"}`}
              >
                <FaRegEdit style={{ fontSize: "20px", color: "#237D3B", cursor: "pointer" }} />
              </button>
            </Tooltip>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#20242A]">Visa Rejections</h3>
          <p className="text-sm text-gray-500">Mention details if your visa was ever rejected</p>
        </div>

        <Form form={visaForm} layout="vertical" disabled={!isEditingVisa}>
          <div className="space-y-4">
            {rejections.map((r) => (
              <div key={r.id} className="border p-4 rounded-xl relative bg-gray-50/30">
                {canEdit && isEditingVisa && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => removeRejection(r)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-all duration-200 flex items-center justify-center"
                    >
                      <RiDeleteBin6Line style={{ fontSize: "20px", cursor: "pointer" }} />
                    </button>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-x-4">
                  <FormInput
                    name={`country_${r.id}`}
                    label="Country"
                    placeholder="Enter country"
                    rules={[{ required: true, message: "Missing country" }]}
                  />
                  <FormDatePicker
                    name={`date_${r.id}`}
                    label="Date of Rejection"
                    format="DD/MM/YYYY"
                    rules={[{ required: true, message: "Missing date" }]}
                  />
                </div>
              </div>
            ))}
          </div>

          {canEdit && isEditingVisa && (
            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={addAnotherRejection}
                className="text-[#237D3B] font-semibold hover:underline cursor-pointer"
              >
                + Add another rejection
              </button>
              <div className="flex gap-3">
                {existingData.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsEditingVisa(false)}
                    className="px-6 py-2 border rounded-md cursor-pointer hover:bg-gray-100"
                  >
                    Discard
                  </button>
                )}
                <PrimaryButton
                  text="Save"
                  onClick={handleVisaSave}
                  loading={isCreatingVisa || isUpdatingVisa}
                />
              </div>
            </div>
          )}
        </Form>
      </div>

      <DeleteModal
        open={!!deleteVisaId}
        loading={isDeletingVisa}
        onCancel={() => setDeleteVisaId(null)}
        onConfirm={confirmDeleteVisa}
        title="Delete Rejection Record?"
        message="Are you sure? This will permanently remove this entry."
      />
    </div>
  );
}
