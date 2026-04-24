
import React from "react";
import { DownOutlined, DownloadOutlined, UpOutlined } from "@ant-design/icons";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PrimaryButton from "../../../components/common/Button/PrimaryButton";
import { FaRegCircle } from "react-icons/fa";
import { BsFileEarmarkBarGraph } from "react-icons/bs";

export type FinalLetterStepProps = {
  applicationApiData: any;
  embedded?: boolean;
  autoOpen?: boolean;
  stageUnlocked?: boolean;
};

export const FinalLetterStep: React.FC<FinalLetterStepProps> = ({
  applicationApiData,
  embedded = false,
  autoOpen = false,
  stageUnlocked = true,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(true);

  // এপিআই থেকে ডাটা নেওয়া হচ্ছে
  const loaUrl = applicationApiData?.acceptanceLetter;
  const moneyReceiptUrl = applicationApiData?.moneyReceipt;
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});

  /* ================= Get File Size from URL ================= */
  const getFileSize = React.useCallback(async (url: string): Promise<string> => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      
      if (contentLength) {
        const bytes = parseInt(contentLength, 10);
        return formatFileSize(bytes);
      }
      
      // Fallback: fetch the file to get size
      const blobResponse = await fetch(url);
      const blob = await blobResponse.blob();
      return formatFileSize(blob.size);
    } catch (error) {
      console.error("Error getting file size:", error);
      return "—";
    }
  }, []);

  /* ================= Format File Size ================= */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  /* ================= Fetch File Sizes ================= */
  React.useEffect(() => {
    const fetchSizes = async () => {
      const sizes: Record<string, string> = {};

      if (loaUrl) {
        sizes.acceptanceLetter = await getFileSize(loaUrl);
      }
      if (moneyReceiptUrl) {
        sizes.moneyReceipt = await getFileSize(moneyReceiptUrl);
      }

      setFileSizes(sizes);
    };

    if (applicationApiData) {
      fetchSizes();
    }
  }, [applicationApiData, loaUrl, moneyReceiptUrl, getFileSize]);

  const sections = React.useMemo(() => [
    {
      id: "loa",
      title: "Letter of Acceptance (LOA)",
      description:
        "Your documents has been submitted, you documents under review, we will send it to the college.",
      isCompleted: !!loaUrl,
      url: loaUrl,
      documentName: "Letter of Acceptance (LOA)",
    },
    {
      id: "money_receipt",
      title: "Money Receipt",
      description:
        "Your documents has been submitted, you documents under review, we will send it to the college.",
      isCompleted: !!moneyReceiptUrl,
      url: moneyReceiptUrl,
      documentName: "Money Receipt",
    },
  ], [loaUrl, moneyReceiptUrl]);

  const isAllRequiredCompleted = sections.every((section) => !!section.url);

  const didInitExpand = React.useRef(false);
  React.useEffect(() => {
    if (!embedded) return;
    if (didInitExpand.current) return;
    setIsExpanded(Boolean(autoOpen) && !isAllRequiredCompleted);
    didInitExpand.current = true;
  }, [autoOpen, embedded, isAllRequiredCompleted]);

  React.useEffect(() => {
    if (!embedded || stageUnlocked) return;
    setIsExpanded(false);
  }, [embedded, stageUnlocked]);

  const expandToggleClass =
    embedded && !stageUnlocked
      ? "cursor-not-allowed opacity-50"
      : "cursor-pointer";

  const stageLockedVisual = embedded && !stageUnlocked;
  const stageCardClass = stageLockedVisual
    ? "border border-[#D1D5DB] rounded-lg overflow-hidden bg-[#F4F6F5]"
    : "border border-[#C7CACF] rounded-lg overflow-hidden";
  const stageHeaderClass = stageLockedVisual
    ? "bg-[#EEF2EF]"
    : "bg-[#E9F2EB]";

  return (
    <>
      <div className={stageCardClass}>
        {/* Header Section */}
        <div
          className={`${stageHeaderClass} p-6 flex items-center justify-between`}
        >
          <div>
            <h3 className="text-[20px] font-semibold text-[#20242A]">
              Stage: 4 Final Letter
            </h3>
            <p className="text-[14px] text-[#4B5563]">
              Upload the acceptance letter and money receipt (if available).
            </p>
          </div>
          <div
            title={
              embedded && !stageUnlocked
                ? "Complete the previous stage first"
                : undefined
            }
            onClick={() => {
              if (embedded && !stageUnlocked && !isExpanded) return;
              setIsExpanded((prev) => !prev);
            }}
            className={expandToggleClass}
          >
            {isExpanded ? (
              <UpOutlined className="text-[#4B5563]" />
            ) : (
              <DownOutlined className="text-[#4B5563]" />
            )}
          </div>
        </div>

        {/* Content Section */}
        {isExpanded && (
          <div className="space-y-4 p-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white border border-[#D1D5DB] rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {section.isCompleted ? (
                      <IoCheckmarkCircleSharp
                        size={24}
                        className="text-[#16A34A]"
                      />
                    ) : (
                      <FaRegCircle size={22} className="text-gray-300" />
                    )}

                    <h4 className="text-[18px] font-semibold text-[#111827]">
                      {section.title}
                    </h4>
                  </div>
                </div>

                <p className="text-[14px] text-[#4B5563] mb-6 leading-relaxed">
                  {section.description}
                </p>

                {/* শুধু তখনই দেখাবে যখন URL থাকবে (অর্থাৎ null নয়) */}
                {section.isCompleted && section.url && (
                  <div>
                    <p className="text-[16px] font-semibold text-[#111827] mb-3">
                      Attached Documents:
                    </p>
                    <div className="flex items-center justify-between border border-[#D1D5DB] rounded-lg p-4 w-fit min-w-70">
                      <div className="flex items-center gap-3">
                        <BsFileEarmarkBarGraph className="text-[20px]" />
                        <div>
                          <p className="text-[14px] font-medium text-[#20242A]">
                            {section.documentName}.pdf
                          </p>
                          <p className="text-[12px] text-[#6B7280]">
                            {section.id === "loa" 
                              ? (fileSizes.acceptanceLetter || "—")
                              : (fileSizes.moneyReceipt || "—")}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(section.url, "_blank")}
                        className="text-[#4B5563] hover:text-[#237D3B] cursor-pointer"
                      >
                        <DownloadOutlined style={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/applications/${id}/checklist`)}
            className="px-6 cursor-pointer py-2 border border-[#D1D5DB] rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <div className={!isAllRequiredCompleted ? "cursor-not-allowed" : ""}>
            <PrimaryButton
              text="Next"
              disabled={!isAllRequiredCompleted}
              className={`${!isAllRequiredCompleted ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => navigate(`/applications/${id}/embassy`)}
            />
          </div>
        </div>
      )}
    </>
  );
};

const FinalLetter: React.FC = () => {
  const { applicationApiData } = useOutletContext<{ applicationApiData: any }>();
  return <FinalLetterStep applicationApiData={applicationApiData} />;
};

export default FinalLetter;
