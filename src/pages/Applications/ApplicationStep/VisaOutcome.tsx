import { DownOutlined, DownloadOutlined, UpOutlined } from "@ant-design/icons";
import React from "react";
import { BiExport } from "react-icons/bi";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PrimaryButton from "../../../components/common/Button/PrimaryButton";
import { config } from "../../../config";
import { useApplicationDocumentUploadMutation } from "../../../redux/features/application/applicationApi";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";

export type VisaOutcomeStepProps = {
  applicationApiData: any;
  embedded?: boolean;
  autoOpen?: boolean;
  stageUnlocked?: boolean;
};

export const VisaOutcomeStep: React.FC<VisaOutcomeStepProps> = ({
  applicationApiData,
  embedded = false,
  autoOpen = false,
  stageUnlocked = true,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);

  const [createMedia] = useCreateMediaMutation();
  const [uploadDocument] = useApplicationDocumentUploadMutation();
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});

  const hasVisaCopy = Boolean(applicationApiData?.visaCopy);
  const hasVisaRejectedSlip = Boolean(applicationApiData?.visaRejectedSlip);

  const resolveAssetUrl = React.useCallback((url: string): string => {
    if (!url) return "";
    const raw = String(url);
    if (raw.startsWith("http")) return raw;
    return `${config.image_access_url}${raw}`;
  }, []);

  const downloadDocument = React.useCallback(
    async (url: string, name?: string) => {
      if (!url) return;
      const resolved = resolveAssetUrl(url);
      try {
        const res = await fetch(resolved, { credentials: "include" });
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
        const blob = await res.blob();

        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = name?.trim() ? name.trim() : "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        console.error("Download failed:", err);
        window.open(resolved, "_blank");
      }
    },
    [resolveAssetUrl],
  );

  /* ================= Get File Size from URL ================= */
  const getFileSize = React.useCallback(
    async (url: string): Promise<string> => {
      try {
        const resolved = resolveAssetUrl(url);
        const response = await fetch(resolved, {
          method: "HEAD",
          credentials: "include",
        });
        const contentLength = response.headers.get("content-length");

        if (contentLength) {
          const bytes = parseInt(contentLength, 10);
          return formatFileSize(bytes);
        }

        // Fallback: fetch the file to get size
        const blobResponse = await fetch(resolved, { credentials: "include" });
        const blob = await blobResponse.blob();
        return formatFileSize(blob.size);
      } catch (error) {
        console.error("Error getting file size:", error);
        return "—";
      }
    },
    [resolveAssetUrl],
  );

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

      if (applicationApiData?.visaCopy) {
        sizes.visaCopy = await getFileSize(applicationApiData.visaCopy);
      }
      if (applicationApiData?.visaRejectedSlip) {
        sizes.visaRejectedSlip = await getFileSize(
          applicationApiData.visaRejectedSlip,
        );
      }

      setFileSizes(sizes);
    };

    if (applicationApiData) {
      fetchSizes();
    }
  }, [applicationApiData, getFileSize]);

  // Initial Selection Logic: যদি এপিআই-তে ডাটা থাকে তবে সেটি অটো সিলেক্ট হবে
  const [selectedSub, setSelectedSub] = React.useState<string | null>(
    applicationApiData?.visaCopy
      ? "visa_issued"
      : applicationApiData?.visaRejectedSlip
        ? "visa_rejected"
        : null,
  );

  const sections = React.useMemo(
    () => [
      {
        id: "visa_outcome",
        title: "Visa Outcome",
        description:
          "Please select your visa result and upload the corresponding document.",
        isCompleted: !!(
          applicationApiData?.visaCopy || applicationApiData?.visaRejectedSlip
        ),
        subSections: [
          {
            id: "visa_issued",
            subTitle: "Visa Issued",
            category: "visaCopy",
            description: "Visa approved by the embassy.",
            docTitle: "Visa Copy",
            docDesc: "Upload your approved visa copy issued by the embassy.",
            disabled: hasVisaRejectedSlip,

            url: applicationApiData?.visaCopy
              ? resolveAssetUrl(applicationApiData.visaCopy)
              : null,
          },
          {
            id: "visa_rejected",
            subTitle: "Visa Rejected",
            category: "visa_rejected",
            subTitle_actual: "Visa Rejected",
            category_actual: "visaRejectedSlip",
            description: "Visa refused by the embassy.",
            docTitle: "Visa Rejection Slip",
            docDesc:
              "Upload the rejection letter or slip provided by the embassy.",
            disabled: hasVisaCopy,
            url: applicationApiData?.visaRejectedSlip
              ? resolveAssetUrl(applicationApiData.visaRejectedSlip)
              : null,
          },
        ],
      },
    ],
    [applicationApiData, resolveAssetUrl, hasVisaCopy, hasVisaRejectedSlip],
  );

  const selectedData =
    sections[0].subSections.find((s) => s.id === selectedSub) || null;
  const isAllRequiredCompleted = !!selectedData?.url;

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
    ? "border border-primary-border rounded-lg overflow-hidden bg-[#F4F6F5]"
    : "border border-primary-border rounded-lg overflow-hidden";
  const stageHeaderClass = isAllRequiredCompleted
    ? "bg-[#DFF2E6] border-[#237D3B] border rounded-lg"
    : "bg-[#EEF2EF]";

  /** ================= Upload Handler ================= */
  const handleFileUpload = async (categoryKey: string, file: File) => {
    setUploadingId(categoryKey);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "document");

      const response = await createMedia(formData).unwrap();
      // const documentUrl = `${config.image_access_url}${response.data.url}`;
      const documentUrl = response.data.url;

      const payload = {
        id: applicationApiData.id,
        [categoryKey]: documentUrl,
      };

      const res = await uploadDocument(payload).unwrap();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const triggerFileInput = (categoryKey: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.png";
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        // actual category key পাঠানো হচ্ছে (visaCopy অথবা visaRejectedSlip)
        const actualKey =
          categoryKey === "visa_rejected" ? "visaRejectedSlip" : categoryKey;
        handleFileUpload(actualKey, input.files[0]);
      }
    };
    input.click();
  };

  const isVisaRejected =
    selectedSub === "visa_rejected" && !!applicationApiData?.visaRejectedSlip;

  return (
    <>
      <div className={stageCardClass}>
        {/* Header */}
        <div
          className={`${stageHeaderClass} p-6 flex items-center justify-between`}
        >
          <div>
            <h3
              className={`text-[20px] font-semibold ${
                isAllRequiredCompleted ? "text-primary" : "text-[#20242A]"
              }`}
            >
              Stage: 6 Visa Outcome
            </h3>
            <p
              className={`text-[14px] ${
                isAllRequiredCompleted ? "text-primary" : "text-[#4B5563]"
              }`}
            >
              Upload the approved visa copy or rejection slip once received.
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
            {isExpanded ? <UpOutlined /> : <DownOutlined />}
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white border border-primary-border rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
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

                <p className="text-[14px] text-[#4B5563] mb-6">
                  {section.description}
                </p>

                {/* Sub section cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.subSections.map((sub) => {
                    const isSelected = selectedSub === sub.id;
                    const isDisabled = Boolean((sub as any).disabled);
                    return (
                      <div
                        key={sub.id}
                        onClick={() => {
                          if (isDisabled) return;
                          setSelectedSub(sub.id);
                        }}
                        className={`border rounded-lg p-4 transition ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        } ${
                          isSelected
                            ? "border-[#16A34A] bg-[#F0FDF4]"
                            : "border-primary-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <IoCheckmarkCircleSharp
                              size={22}
                              className="text-[#16A34A]"
                            />
                          ) : (
                            <FaRegCircle size={20} className="text-gray-300" />
                          )}
                          <div>
                            <p className="text-[14px] font-semibold text-[#20242A]">
                              {sub.subTitle}
                            </p>
                            <p className="text-[12px] text-[#6B7280]">
                              {sub.description}
                            </p>
                            {isDisabled && (
                              <p className="text-[12px] text-[#6B7280] mt-1">
                                Already submitted the other outcome.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Document Upload & Display Section */}
                {selectedData && (
                  <div className="mt-6 border border-primary-border rounded-xl p-6 w-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[16px] font-semibold text-[#20242A]">
                          {selectedData.docTitle}
                        </p>
                        <p className="text-[14px] text-[#6B7280]">
                          {selectedData.docDesc}
                        </p>
                      </div>

                      <button
                        disabled={
                          !!uploadingId ||
                          Boolean((selectedData as any).disabled)
                        }
                        onClick={() => triggerFileInput(selectedData.category)}
                        className="border border-[#237D3B] text-[#237D3B] rounded-md cursor-pointer p-2 hover:bg-[#F0FDF4] transition disabled:opacity-50"
                      >
                        {uploadingId ===
                        (selectedData.id === "visa_rejected"
                          ? "visaRejectedSlip"
                          : selectedData.category) ? (
                          <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full"></div>
                        ) : (
                          <BiExport size={18} />
                        )}
                      </button>
                    </div>

                    {/* এপিআই-তে ফাইল থাকলে তবেই "Attached Documents" দেখাবে */}
                    {selectedData.url && (
                      <>
                        <p className="text-[16px] font-semibold text-[#111827] mb-3">
                          Attached Documents:
                        </p>
                        <div className="flex items-center justify-between border border-primary-border rounded-lg p-4 w-full md:w-1/3 min-w-70">
                          <div className="flex items-center gap-3">
                            <BsFileEarmarkBarGraph className="text-[20px]" />
                            <div>
                              <p className="text-[14px] font-medium text-[#20242A] truncate max-w-37.5">
                                {selectedData.docTitle}
                              </p>
                              <p className="text-[12px] text-[#6B7280]">
                                {selectedData.id === "visa_rejected"
                                  ? fileSizes.visaRejectedSlip || "—"
                                  : fileSizes.visaCopy || "—"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              downloadDocument(
                                selectedData?.url ?? "",
                                selectedData?.docTitle,
                              )
                            }
                            className="text-[#4B5563] hover:text-[#237D3B] cursor-pointer"
                          >
                            <DownloadOutlined style={{ fontSize: 18 }} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/applications/${id}/embassy`)}
            className="px-6 py-2 cursor-pointer border border-primary-border rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <div className={!isAllRequiredCompleted ? "cursor-not-allowed" : ""}>
            <PrimaryButton
              text={isVisaRejected ? "Continue" : "Next"}
              disabled={!isAllRequiredCompleted}
              className={`${
                !isAllRequiredCompleted ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={() => {
                if (isVisaRejected) {
                  navigate(`/visa-reject`);
                } else {
                  navigate(`/applications/${id}/enroll`);
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const VisaOutcome: React.FC = () => {
  const { applicationApiData } = useOutletContext<{
    applicationApiData: any;
  }>();
  return <VisaOutcomeStep applicationApiData={applicationApiData} />;
};

export default VisaOutcome;
