import React, { useState, useEffect, useMemo } from "react";
import { Button, Form, Input, Select, DatePicker, Card } from "antd";
import dayjs from "dayjs";
import { DownOutlined, PlusOutlined } from "@ant-design/icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaRegEdit } from "react-icons/fa";
import { FiChevronUp } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  useGetEligibleStudyLevelsQuery,
} from "../../../../redux/features/profile/studentProfileApi";
import { useGetCountriesQuery } from "../../../../redux/features/countries/countriesApi";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";

type EducationItem = {
  id: string;
  studyLevel?: { id?: string; name?: string };
  studyLevelId?: string;
  instituteName?: string;
  country?: string;
  startYear?: string;
  endYear?: string;
  result?: string;
  outOfGrade?: string;
  subject?: string;
};

interface EducationHistoryTabProps {
  studentId: string;
  profile: { country?: string } | null;
  educations: EducationItem[];
  canEdit: boolean;
  onUpdated?: () => void;
}

export default function EducationHistoryTab({
  studentId,
  profile,
  educations,
  canEdit,
  onUpdated,
}: EducationHistoryTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [createEducation, { isLoading: isCreating }] = useCreateEducationMutation();
  const [updateEducation, { isLoading: isUpdating }] = useUpdateEducationMutation();
  const [deleteEducation, { isLoading: isDeleting }] = useDeleteEducationMutation();

  const { data: countriesData } = useGetCountriesQuery({ page: 1, limit: 1000 });
  const countryId = useMemo(() => {
    if (!profile?.country || !countriesData?.data) return undefined;
    const c = (countriesData.data as { id: string; name: string }[]).find(
      (x) => x.name.toLowerCase() === (profile.country ?? "").toLowerCase()
    );
    return c?.id;
  }, [profile?.country, countriesData?.data]);

  const { data: studyLevelsData, isLoading: isLoadingStudyLevels } = useGetEligibleStudyLevelsQuery(
    { studentId, countryId },
    { skip: !studentId }
  );

  const studyLevelList = useMemo(() => {
    const data = Array.isArray(studyLevelsData) ? studyLevelsData : (studyLevelsData as { data?: unknown[] })?.data ?? [];
    return (data as { id?: string; countryStudyLevelName?: string; description?: string }[]).map((level) => ({
      label: level.countryStudyLevelName ?? level.description ?? "Education",
      value: level.id ?? "",
    }));
  }, [studyLevelsData]);

  const countryOptions = useMemo(
    () =>
      (countriesData?.data ?? []).map((c: { id: string; name: string }) => ({
        label: c.name,
        value: c.name,
      })),
    [countriesData]
  );

  const openAdd = (studyLevelId: string) => {
    setEditingId(studyLevelId);
    setExpandedId(studyLevelId);
    form.resetFields();
    form.setFieldsValue({ studyLevelId });
  };

  const openEdit = (edu: EducationItem) => {
    setEditingId(edu.id);
    setExpandedId(edu.studyLevelId ?? edu.studyLevel?.id ?? null);
    form.setFieldsValue({
      instituteName: edu.instituteName ?? "",
      country: edu.country ?? undefined,
      startYear: edu.startYear ? dayjs(edu.startYear) : null,
      endYear: edu.endYear ? dayjs(edu.endYear) : null,
      outOfGrade: edu.outOfGrade ?? "",
      result: edu.result ?? "",
      subject: edu.subject ?? "",
    });
  };

  const handleSave = async (studyLevelId: string, existingId?: string) => {
    try {
      const values = await form.validateFields();
      const payload = {
        studyLevelId,
        instituteName: values.instituteName || undefined,
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
      if (existingId) {
        await updateEducation({ studentId, educationId: existingId, body: payload }).unwrap();
        toast.success("Education updated successfully!");
      } else {
        await createEducation({ studentId, body: payload }).unwrap();
        toast.success("Education saved successfully!");
      }
      setEditingId(null);
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to save");
    }
  };

  const handleDiscard = () => {
    form.resetFields();
    setEditingId(null);
  };

  const handleDelete = async (educationId: string) => {
    if (!window.confirm("Delete this education record?")) return;
    try {
      await deleteEducation({ studentId, educationId }).unwrap();
      toast.success("Education deleted");
      setEditingId(null);
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to delete");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="w-full space-y-4">
      <h2 className="text-[20px] font-semibold text-[#20242A]">Last Qualifications</h2>

      {isLoadingStudyLevels ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="bg-[#FFFFFF] border border-[#C7CACF] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton height={24} width={200} />
                <Skeleton height={24} width={40} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {studyLevelList.map((level: { label: string; value: string }) => {
            const matchingEducation = educations.find((edu) => edu.studyLevelId === level.value || edu.studyLevel?.id === level.value);
            const isExpanded = expandedId === level.value;
            const isEditing = editingId === (matchingEducation?.id ?? level.value);

            return (
              <div key={level.value} className="bg-white border border-[#C7CACF] rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-semibold text-[#20242A]">{level.label}</h3>
                  <div className="flex items-center gap-2">
                    {canEdit && matchingEducation && !isEditing && (
                      <button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => openEdit(matchingEducation)}
                      >
                        <FaRegEdit size={20} color="#237D3B" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const next = isExpanded ? null : level.value;
                        setExpandedId(next);
                        if (next) {
                          if (matchingEducation) {
                            form.setFieldsValue({
                              instituteName: matchingEducation.instituteName ?? "",
                              country: matchingEducation.country ?? undefined,
                              startYear: matchingEducation.startYear ? dayjs(matchingEducation.startYear) : null,
                              endYear: matchingEducation.endYear ? dayjs(matchingEducation.endYear) : null,
                              subject: matchingEducation.subject ?? "",
                              outOfGrade: matchingEducation.outOfGrade ?? "",
                              result: matchingEducation.result ?? "",
                            });
                            if (!canEdit) setEditingId(null);
                          } else if (canEdit) {
                            setEditingId(level.value);
                            form.resetFields();
                          }
                        }
                      }}
                      className="bg-transparent cursor-pointer border-none flex items-center"
                    >
                      <FiChevronUp
                        size={26}
                        className={`transition-transform duration-300 ${isExpanded ? "rotate-0" : "rotate-180"}`}
                      />
                    </button>
                  </div>
                </div>

                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}
                >
                  {matchingEducation && !isEditing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div><span className="text-[#4B5563]">Institute</span><p className="font-medium">{matchingEducation.instituteName ?? "—"}</p></div>
                      <div><span className="text-[#4B5563]">Country</span><p className="font-medium">{matchingEducation.country ?? "—"}</p></div>
                      <div><span className="text-[#4B5563]">Start / End</span><p className="font-medium">{[matchingEducation.startYear, matchingEducation.endYear].filter(Boolean).join(" – ") || "—"}</p></div>
                      <div><span className="text-[#4B5563]">Result</span><p className="font-medium">{matchingEducation.result ?? matchingEducation.outOfGrade ?? "—"}</p></div>
                      {matchingEducation.subject && <div><span className="text-[#4B5563]">Subject</span><p className="font-medium">{matchingEducation.subject}</p></div>}
                      {canEdit && (
                        <div className="md:col-span-2 flex gap-2">
                          <Button size="small" onClick={() => openEdit(matchingEducation)}>Edit</Button>
                          <Button size="small" danger loading={isDeleting} onClick={() => handleDelete(matchingEducation.id)}>Delete</Button>
                        </div>
                      )}
                    </div>
                  )}

                  {canEdit && (isEditing || !matchingEducation) && (
                    <Form form={form} layout="vertical" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Form.Item name="instituteName" label="Institute Name" rules={[{ required: true }]}>
                          <Input placeholder="Enter institute name" />
                        </Form.Item>
                        <Form.Item name="country" label="Country">
                          <Select placeholder="Select country" allowClear options={countryOptions} />
                        </Form.Item>
                        <Form.Item name="startYear" label="Start Year">
                          <DatePicker className="w-full" picker="year" />
                        </Form.Item>
                        <Form.Item name="endYear" label="End Year">
                          <DatePicker className="w-full" picker="year" />
                        </Form.Item>
                        <Form.Item name="subject" label="Subject / Group">
                          <Input placeholder="Enter subject or group name" />
                        </Form.Item>
                        <Form.Item name="outOfGrade" label="Out of Grade">
                          <Input placeholder="e.g. 4.0" />
                        </Form.Item>
                        <Form.Item name="result" label="Result">
                          <Input placeholder="e.g. 3.75" />
                        </Form.Item>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button size="large" onClick={handleDiscard}>Discard</Button>
                        <PrimaryButton
                          text={isSaving ? "Saving..." : "Save"}
                          onClick={() => handleSave(level.value, matchingEducation?.id)}
                          loading={isSaving}
                          disabled={isSaving}
                        />
                      </div>
                    </Form>
                  )}

                  {!canEdit && matchingEducation && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm mt-4">
                      <div><span className="text-[#4B5563]">Institute</span><p className="font-medium">{matchingEducation.instituteName ?? "—"}</p></div>
                      <div><span className="text-[#4B5563]">Country</span><p className="font-medium">{matchingEducation.country ?? "—"}</p></div>
                      <div><span className="text-[#4B5563]">Start / End</span><p className="font-medium">{[matchingEducation.startYear, matchingEducation.endYear].filter(Boolean).join(" – ") || "—"}</p></div>
                      <div><span className="text-[#4B5563]">Result</span><p className="font-medium">{matchingEducation.result ?? matchingEducation.outOfGrade ?? "—"}</p></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-4 pt-2">
        <h2 className="text-[20px] font-semibold text-[#20242A]">English Language Tests</h2>
        <p className="text-[14px] text-[#4B5563]">Submitted English language proficiency tests appear in Upload Documents.</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#C7CACF] rounded-lg p-6 overflow-hidden">
        <h1 className="text-[18px] font-semibold text-[#20242A]">Medium of instruction</h1>
        <p className="text-[14px] text-[#4B5563] mt-1">Stored in General Information / profile.</p>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[#20242A]">Standardized Tests</h1>
        <p className="text-[14px] text-[#4B5563]">Add and manage standardized test scores from Upload Documents.</p>
      </div>
    </div>
  );
}
