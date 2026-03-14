import React, { useState, useEffect } from "react";
import { Button, Form, Input, DatePicker, Card, Modal, Tooltip } from "antd";
import dayjs from "dayjs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaRegEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useCreateVisaRejectionMutation,
  useUpdateVisaRejectionMutation,
  useDeleteVisaRejectionMutation,
  useUpdateStudentProfileMutation,
} from "../../../../redux/features/profile/studentProfileApi";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
import DeleteModal from "../../../../components/shared/DeleteModal";

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
  cv,
  statementOfPurpose,
  canEdit,
  onUpdated,
}: BackgroundTabProps) {
  const [visaForm] = Form.useForm();
  const [sopForm] = Form.useForm();
  const [isEditingVisa, setIsEditingVisa] = useState(false);
  const [rejections, setRejections] = useState<{ id: string; isNew: boolean }[]>([]);
  const [deleteVisaId, setDeleteVisaId] = useState<string | null>(null);
  const [sopModalOpen, setSopModalOpen] = useState(false);

  const [createVisa, { isLoading: isCreatingVisa }] = useCreateVisaRejectionMutation();
  const [updateVisa, { isLoading: isUpdatingVisa }] = useUpdateVisaRejectionMutation();
  const [deleteVisa, { isLoading: isDeletingVisa }] = useDeleteVisaRejectionMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateStudentProfileMutation();

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
            rejectionDate: values[`date_${r.id}`]
              ? dayjs(values[`date_${r.id}`]).toISOString()
              : null,
          };
          return r.isNew
            ? createVisa({ studentId, body: payload }).unwrap()
            : updateVisa({
                studentId,
                visaRejectionId: r.id,
                body: payload,
              }).unwrap();
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

  const openSopModal = () => {
    sopForm.setFieldsValue({ statementOfPurpose: statementOfPurpose ?? "" });
    setSopModalOpen(true);
  };

  const handleSopSave = async () => {
    try {
      const values = await sopForm.validateFields();
      await updateProfile({
        studentId,
        body: { statementOfPurpose: values.statementOfPurpose || undefined },
      }).unwrap();
      toast.success("Statement of purpose updated");
      setSopModalOpen(false);
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to save");
    }
  };

  const handleCvSave = async (url: string) => {
    try {
      await updateProfile({ studentId, body: { cv: url || undefined } }).unwrap();
      toast.success("CV link updated");
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to save");
    }
  };

  return (
    <div className="space-y-4">
      {/* Visa Rejections — same as student */}
      <div className="bg-white border border-[#C7CACF] rounded-lg p-4 relative">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {existingData.length > 0 && canEdit && (
            <Tooltip title={isEditingVisa ? "Cancel" : "Edit"}>
              <button
                type="button"
                onClick={() => setIsEditingVisa(!isEditingVisa)}
                className="p-2 cursor-pointer rounded-full transition-all text-[#237D3B]"
              >
                <FaRegEdit style={{ fontSize: "20px", cursor: "pointer" }} />
              </button>
            </Tooltip>
          )}
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#20242A]">Visa Rejections</h3>
          <p className="text-sm text-gray-500">
            Mention details if your visa was ever rejected
          </p>
        </div>
        <Form form={visaForm} layout="vertical" disabled={!isEditingVisa}>
          <div className="space-y-4">
            {rejections.map((r) => (
              <div
                key={r.id}
                className="border p-4 rounded-xl relative bg-gray-50/30"
              >
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
                  <Form.Item
                    name={`country_${r.id}`}
                    label="Country"
                    rules={[{ required: true, message: "Missing country" }]}
                  >
                    <Input placeholder="Enter country" />
                  </Form.Item>
                  <Form.Item
                    name={`date_${r.id}`}
                    label="Date of Rejection"
                    rules={[{ required: true, message: "Missing date" }]}
                  >
                    <DatePicker className="w-full" format="DD/MM/YYYY" />
                  </Form.Item>
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

      {/* CV — same structure as student */}
      <div className="bg-white border border-[#C7CACF] rounded-lg p-4">
        <h3 className="text-lg font-semibold text-[#20242A] mb-1">CV</h3>
        <p className="text-sm text-gray-500 mb-4">Link to the student&apos;s resume or CV</p>
        {canEdit ? (
          <CVEditForm initialUrl={cv} onSave={handleCvSave} />
        ) : cv ? (
          <a
            href={cv}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#237D3B] hover:underline"
          >
            View CV
          </a>
        ) : (
          <p className="text-[#4B5563]">No CV link.</p>
        )}
      </div>

      {/* Statement of Purpose — same as student */}
      <div className="bg-white border border-[#C7CACF] rounded-lg p-4">
        <h3 className="text-lg font-semibold text-[#20242A] mb-1">Statement of Purpose</h3>
        <p className="text-sm text-gray-500 mb-4">Student&apos;s statement of purpose</p>
        {canEdit ? (
          <>
            {statementOfPurpose ? (
              <p className="text-[#20242A] whitespace-pre-wrap mb-2">{statementOfPurpose}</p>
            ) : (
              <p className="text-[#4B5563] mb-2">No statement of purpose.</p>
            )}
            <Button type="primary" size="small" onClick={openSopModal}>
              {statementOfPurpose ? "Edit" : "Add"} statement of purpose
            </Button>
          </>
        ) : statementOfPurpose ? (
          <p className="text-[#20242A] whitespace-pre-wrap">{statementOfPurpose}</p>
        ) : (
          <p className="text-[#4B5563]">No statement of purpose.</p>
        )}
      </div>

      <DeleteModal
        open={!!deleteVisaId}
        loading={isDeletingVisa}
        onCancel={() => setDeleteVisaId(null)}
        onConfirm={confirmDeleteVisa}
        title="Delete Rejection Record?"
        message="Are you sure? This will permanently remove this entry."
      />

      <Modal
        title="Statement of purpose"
        open={sopModalOpen}
        onCancel={() => setSopModalOpen(false)}
        onOk={handleSopSave}
        confirmLoading={isUpdatingProfile}
        okText="Save"
        width={640}
      >
        <Form form={sopForm} layout="vertical" className="mt-4">
          <Form.Item name="statementOfPurpose" label="Statement of purpose">
            <Input.TextArea rows={8} placeholder="Enter statement of purpose..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function CVEditForm({
  initialUrl,
  onSave,
}: {
  initialUrl?: string;
  onSave: (url: string) => Promise<void>;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(url);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="flex-1 min-w-[200px]"
      />
      <Button type="primary" onClick={handleSave} loading={saving}>
        Save link
      </Button>
      {initialUrl && (
        <a
          href={initialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#237D3B] hover:underline text-sm"
        >
          Open current
        </a>
      )}
    </div>
  );
}
