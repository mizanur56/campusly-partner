/* eslint-disable react-hooks/exhaustive-deps */
import { Modal } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateApplicationMutation,
  useGetSingleStudentApplicationsQuery,
} from "../../../../redux/features/application/applicationApi";
import { toast } from "react-toastify";
import StudentSelectBlock from "../../../courses/StudentSelectBlock";
import type { SelectedStudent } from "../../../courses/SelectedStudentCard";

interface ApplyPreferenceModalProps {
  open: boolean;
  onClose: () => void;
  studentId?: string;
  showStudentSelect?: boolean;
  data: {
    id: string;
    startDates?: string[] | string;
    campus?: string;
    duration?: string;
    modeOfStudy?: string;
  };
}

const getUpcomingStartDates = (rawDates: string[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthMap: Record<string, number> = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };
  const months = rawDates
    .join(",")
    .split(",")
    .map((m) => m.trim());
  const results: { label: string; year: number; monthIndex: number }[] = [];
  months.forEach((month) => {
    const monthIndex = monthMap[month];
    if (monthIndex === undefined) return;
    let year = currentYear;
    if (monthIndex < currentMonth) year += 1;
    results.push({ label: `${month.slice(0, 3)} ${year}`, year, monthIndex });
  });
  results.sort((a, b) =>
    a.year === b.year ? a.monthIndex - b.monthIndex : a.year - b.year,
  );
  return results.slice(0, 2);
};

export default function ApplyPreferenceModal({
  open,
  onClose,
  studentId,
  data,
  showStudentSelect = false,
}: ApplyPreferenceModalProps) {
  const [pickedStudent, setPickedStudent] = useState<SelectedStudent | null>(
    null,
  );

  useEffect(() => {
    if (!open) setPickedStudent(null);
  }, [open]);

  const { data: applicationsData } = useGetSingleStudentApplicationsQuery(
    { studentId: pickedStudent?.id || studentId },
    { skip: !(pickedStudent?.id || studentId) },
  );

  const appliedMap = useMemo(() => {
    const map = new Set<string>();
    const apps = applicationsData?.data ?? [];

    apps.forEach((app: any) => {
      map.add(`${app.courseId}_${app.intake}`);
    });

    return map;
  }, [applicationsData]);

  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const navigate = useNavigate();
  const rawStartDates = Array.isArray(data?.startDates)
    ? data.startDates
    : data.startDates
      ? [data.startDates]
      : [];

  const startDates = useMemo(
    () => getUpcomingStartDates(rawStartDates),
    [rawStartDates],
  );

  const defaultDate = startDates[0]?.label ?? `Mar ${new Date().getFullYear()}`;
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    defaultDate,
  );

  const formatStudyMode = (mode: string) =>
    mode?.toUpperCase().replace(/\s+/g, "_") || "ON_CAMPUS";

  const intake = selectedStartDate || defaultDate;
  const finalStudentId = pickedStudent?.id || studentId;

  const isAlreadyApplied = appliedMap.has(`${data.id}_${intake}`);
  const needsStudentPick = showStudentSelect && !studentId;
  const canSubmit =
    Boolean(selectedStartDate) &&
    Boolean(finalStudentId) &&
    !isLoading &&
    !isAlreadyApplied;

  const handleContinue = async () => {
    if (needsStudentPick && !pickedStudent?.id) {
      toast.error("Please select a student first");
      return;
    }

    const key = `${data.id}_${intake}`;

    if (appliedMap.has(key)) {
      toast.error("Already applied for this course & intake");
      return;
    }

    const payload = {
      studentId: finalStudentId as string,
      courseId: data.id,
      intake,
      campus: data.campus || "Main Campus",
      duration: data.duration || "1 year",
      studyMode: formatStudyMode(data.modeOfStudy as string),
    };

    try {
      const response = await createApplication(payload).unwrap();
      const applicationId =
        response?.data?.id ||
        response?.data?.applicationId ||
        response?.id ||
        (response as any)?.data?.data?.id;

      onClose();
      if (applicationId) {
        toast.success("Application created successfully");
        navigate("/applications");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create application");
    }
  };

  const datesToShow =
    startDates.length > 0
      ? startDates
      : [{ label: defaultDate, year: new Date().getFullYear(), monthIndex: 2 }];

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered width={600}>
      <div className="space-y-6">
        <h2 className="text-center text-[24px] font-semibold text-[#20242A]">
          Application preferences
        </h2>

        {showStudentSelect && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Select Student</p>
            <StudentSelectBlock
              selectedStudent={pickedStudent}
              onSelect={setPickedStudent}
              eagerFetch={open && showStudentSelect}
              nestedUnderModal={open && showStudentSelect}
            />
          </div>
        )}
        <div>
          <p className="text-[16px] font-semibold text-[#20242A] mb-2">
            Start Date
          </p>
          <div className="flex flex-wrap gap-2">
            {datesToShow.map((item) => {
              const isSelected = selectedStartDate === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setSelectedStartDate(item.label)}
                  className={`px-4 py-2 rounded-full text-sm cursor-pointer ${
                    isSelected
                      ? "bg-[#E9F2EB] text-[#237D3B]"
                      : "bg-[#EDEEEF] text-[#4B5563]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[16px] font-semibold text-[#20242A] mb-2">
            Campus
          </p>
          <span className="inline-block px-4 py-2 rounded-full text-sm bg-[#E9F2EB] text-[#237D3B]">
            {data.campus || "TBA"}
          </span>
        </div>
        <div>
          <p className="text-[16px] font-semibold text-[#20242A] mb-2">
            Duration
          </p>
          <span className="inline-block px-4 py-2 rounded-full text-sm bg-[#E9F2EB] text-[#237D3B]">
            {data.duration || "TBA"}
          </span>
        </div>
        <div>
          <p className="text-[16px] font-semibold text-[#20242A] mb-2">
            Mode of study
          </p>
          <span className="inline-block px-4 py-2 rounded-full text-sm bg-[#E9F2EB] text-[#237D3B]">
            {data.modeOfStudy || "TBA"}
          </span>
        </div>
        <button
          onClick={handleContinue}
          disabled={!canSubmit}
          className="w-full bg-[#237D3B] cursor-pointer text-[#E7E7E7] py-3 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Processing..."
            : isAlreadyApplied
              ? "Already Applied"
              : "Continue with application"}
        </button>
      </div>
    </Modal>
  );
}
