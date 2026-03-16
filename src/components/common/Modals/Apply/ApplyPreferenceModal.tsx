import { Modal } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateApplicationMutation } from "../../../../redux/features/application/applicationApi";
import { toast } from "react-toastify";

interface ApplyPreferenceModalProps {
  open: boolean;
  onClose: () => void;
  studentId?: string;
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
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };
  const months = rawDates.join(",").split(",").map((m) => m.trim());
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
}: ApplyPreferenceModalProps) {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const navigate = useNavigate();
  const rawStartDates = Array.isArray(data.startDates)
    ? data.startDates
    : data.startDates ? [data.startDates] : [];

  const startDates = useMemo(
    () => getUpcomingStartDates(rawStartDates),
    [rawStartDates],
  );

  const defaultDate = startDates[0]?.label ?? `Mar ${new Date().getFullYear()}`;
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(defaultDate);

  const formatStudyMode = (mode: string) =>
    mode?.toUpperCase().replace(/\s+/g, "_") || "ON_CAMPUS";

  const handleContinue = async () => {
    const intake = selectedStartDate || defaultDate;
    const payload = {
      studentId: studentId as string | undefined,
      courseId: data.id,
      intake,
      campus: data.campus || "Main Campus",
      duration: data.duration || "1 year",
      studyMode: formatStudyMode(data.modeOfStudy as string),
      registrationForm: "https://example.com/form.pdf",
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

  const datesToShow = startDates.length > 0 ? startDates : [{ label: defaultDate, year: new Date().getFullYear(), monthIndex: 2 }];

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered width={600}>
      <div className="space-y-6">
        <h2 className="text-center text-[24px] font-semibold text-[#20242A]">
          Application preferences
        </h2>

        <div>
          <p className="text-[16px] font-semibold text-[#20242A] mb-2">Start Date</p>
          <div className="flex flex-wrap gap-2">
            {datesToShow.map((item) => {
              const isSelected = selectedStartDate === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setSelectedStartDate(item.label)}
                  className={`px-4 py-2 rounded-full text-sm cursor-pointer ${
                    isSelected ? "bg-[#E9F2EB] text-[#237D3B]" : "bg-[#EDEEEF] text-[#4B5563]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[16px] font-semibold text-[#20242A] mb-2">Campus</p>
          <span className="inline-block px-4 py-2 rounded-full text-sm bg-[#E9F2EB] text-[#237D3B]">
            {data.campus || "TBA"}
          </span>
        </div>

        <div>
          <p className="text-[16px] font-semibold text-[#20242A] mb-2">Duration</p>
          <span className="inline-block px-4 py-2 rounded-full text-sm bg-[#E9F2EB] text-[#237D3B]">
            {data.duration || "TBA"}
          </span>
        </div>

        <div>
          <p className="text-[16px] font-semibold text-[#20242A] mb-2">Mode of study</p>
          <span className="inline-block px-4 py-2 rounded-full text-sm bg-[#E9F2EB] text-[#237D3B]">
            {data.modeOfStudy || "TBA"}
          </span>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedStartDate || isLoading}
          className="w-full bg-[#237D3B] cursor-pointer text-[#E7E7E7] py-3 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Continue with application"}
        </button>
      </div>
    </Modal>
  );
}
