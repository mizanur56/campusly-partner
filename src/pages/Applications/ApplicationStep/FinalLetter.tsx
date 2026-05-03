import { DownloadOutlined, UpOutlined } from "@ant-design/icons";
import React from "react";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PrimaryButton from "../../../components/common/Button/PrimaryButton";
import Collapsible from "../../../components/common/Shared/Collapsible";
import { config } from "../../../config";

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
  const [userToggledExpand, setUserToggledExpand] = React.useState(false);
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});

  const loaUrl = applicationApiData?.acceptanceLetter;
  const moneyReceiptUrl = applicationApiData?.moneyReceipt;

  const resolveAssetUrl = React.useCallback((url: string): string => {
    if (!url) return "";
    return String(url).startsWith("http") ? url : `${config.image_access_url}${url}`;
  }, []);

  const downloadDocument = React.useCallback(
    async (url: string, name?: string) => {
      if (!url) return;
      const resolved = resolveAssetUrl(url);
      try {
        const res = await fetch(resolved, { credentials: "include" });
        if (!res.ok) throw new Error(`${res.status}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = name?.trim() || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      } catch {
        window.open(resolved, "_blank");
      }
    },
    [resolveAssetUrl],
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const units = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${units[i]}`;
  };

  const getFileSize = React.useCallback(
    async (url: string): Promise<string> => {
      try {
        const resolved = resolveAssetUrl(url);
        const response = await fetch(resolved, { method: "HEAD", credentials: "include" });
        const contentLength = response.headers.get("content-length");
        if (contentLength) return formatFileSize(parseInt(contentLength, 10));
        const blob = await (await fetch(resolved, { credentials: "include" })).blob();
        return formatFileSize(blob.size);
      } catch {
        return "—";
      }
    },
    [resolveAssetUrl],
  );

  React.useEffect(() => {
    if (!applicationApiData) return;
    const fetchSizes = async () => {
      const sizes: Record<string, string> = {};
      if (loaUrl) sizes.acceptanceLetter = await getFileSize(loaUrl);
      if (moneyReceiptUrl) sizes.moneyReceipt = await getFileSize(moneyReceiptUrl);
      setFileSizes(sizes);
    };
    fetchSizes();
  }, [applicationApiData, loaUrl, moneyReceiptUrl, getFileSize]);

  const sections = React.useMemo(
    () => [
      {
        id: "loa",
        title: "Letter of Acceptance (LOA)",
        description:
          "Your documents have been submitted and are under review. We will send them to the college.",
        isCompleted: !!loaUrl,
        url: loaUrl ? resolveAssetUrl(loaUrl) : null,
        documentName: "Letter of Acceptance (LOA)",
        sizeKey: "acceptanceLetter",
      },
      {
        id: "money_receipt",
        title: "Money Receipt",
        description:
          "Your documents have been submitted and are under review. We will send them to the college.",
        isCompleted: !!moneyReceiptUrl,
        url: moneyReceiptUrl ? resolveAssetUrl(moneyReceiptUrl) : null,
        documentName: "Money Receipt",
        sizeKey: "moneyReceipt",
      },
    ],
    [loaUrl, moneyReceiptUrl, resolveAssetUrl],
  );

  const isAllRequiredCompleted = sections.every((s) => !!s.url);

  React.useEffect(() => {
    if (!embedded || userToggledExpand) return;
    setIsExpanded(Boolean(autoOpen));
  }, [autoOpen, embedded, userToggledExpand]);

  React.useEffect(() => {
    if (!embedded || stageUnlocked) return;
    setIsExpanded(false);
  }, [embedded, stageUnlocked]);

  const stageLockedVisual = embedded && !stageUnlocked;
  const expandToggleClass = stageLockedVisual ? "cursor-not-allowed opacity-50" : "cursor-pointer";
  const stageCardClass = stageLockedVisual
    ? "border border-primary-border rounded-2xl overflow-hidden bg-[#F4F6F5]"
    : "border border-primary-border rounded-2xl overflow-hidden";
  const stageHeaderClass = stageLockedVisual
    ? "bg-[#EEF2EF]"
    : "bg-[#DFF2E6] border-[#237D3B] border rounded-2xl";

  return (
    <>
      <div className={stageCardClass}>
        <div
          title={stageLockedVisual ? "Complete the previous stage first" : undefined}
          className={`${stageHeaderClass} p-6 flex items-center justify-between select-none ${stageLockedVisual ? "cursor-not-allowed" : "cursor-pointer"}`}
          onClick={() => {
            if (stageLockedVisual && !isExpanded) return;
            setUserToggledExpand(true);
            setIsExpanded((prev) => !prev);
          }}
        >
          <div>
            <h3
              className={`text-[20px] font-semibold ${
                isAllRequiredCompleted ? "text-primary" : "text-[#20242A]"
              }`}
            >
              Stage: 4 Final Letter
            </h3>
            <p
              className={`text-[14px] ${
                isAllRequiredCompleted ? "text-primary" : "text-[#4B5563]"
              }`}
            >
              Upload the acceptance letter and money receipt (if available).
            </p>
          </div>
          <div className={stageLockedVisual ? "opacity-50" : ""}>
            <UpOutlined
              className={`text-[#4B5563] transition-transform duration-300 ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          </div>
        </div>

        <Collapsible open={isExpanded}>
          <div className="space-y-4 p-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white border border-primary-border rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  {section.isCompleted ? (
                    <IoCheckmarkCircleSharp size={24} className="text-[#16A34A]" />
                  ) : (
                    <FaRegCircle size={22} className="text-gray-300" />
                  )}
                  <h4 className="text-[18px] font-semibold text-[#111827]">{section.title}</h4>
                </div>

                <p className="text-[14px] text-[#4B5563] mb-6 leading-relaxed">
                  {section.description}
                </p>

                {section.isCompleted && section.url && (
                  <div>
                    <p className="text-[16px] font-semibold text-[#111827] mb-3">
                      Attached Documents:
                    </p>
                    <div className="flex items-center justify-between border border-primary-border rounded-lg p-4 w-fit min-w-[280px]">
                      <div className="flex items-center gap-3">
                        <BsFileEarmarkBarGraph className="text-[20px]" />
                        <div>
                          <p className="text-[14px] font-medium text-[#20242A]">
                            {section.documentName}.pdf
                          </p>
                          <p className="text-[12px] text-[#6B7280]">
                            {fileSizes[section.sizeKey] || "—"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          downloadDocument(section.url ?? "", `${section.documentName}.pdf`)
                        }
                        className="text-[#4B5563] hover:text-[#237D3B] cursor-pointer ml-4"
                      >
                        <DownloadOutlined style={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Collapsible>
      </div>

      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/applications/${id}/checklist`)}
            className="px-6 cursor-pointer py-2 border border-primary-border rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <PrimaryButton
            text="Next"
            disabled={!isAllRequiredCompleted}
            className={!isAllRequiredCompleted ? "opacity-50 pointer-events-none" : ""}
            onClick={() => id && navigate(`/applications/${id}/embassy`)}
          />
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
