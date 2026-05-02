import { DownOutlined, DownloadOutlined, UpOutlined } from "@ant-design/icons";
import { DatePicker } from "antd";
import dayjs from "dayjs";
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

export type EmbassySubmissionStepProps = {
  applicationApiData: any;
  embedded?: boolean;
  autoOpen?: boolean;
  stageUnlocked?: boolean;
};

export const EmbassySubmissionStep: React.FC<EmbassySubmissionStepProps> = ({
  applicationApiData,
  embedded = false,
  autoOpen = false,
  stageUnlocked = true,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const submissionDate = applicationApiData?.visaSubmissionDate;

  /* ================= States ================= */
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);

  const [createMedia] = useCreateMediaMutation();
  const [uploadDocument] = useApplicationDocumentUploadMutation();
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});

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

      if (applicationApiData?.visaSubmissionProof) {
        sizes.visaSubmissionProof = await getFileSize(
          applicationApiData.visaSubmissionProof,
        );
      }

      setFileSizes(sizes);
    };

    if (applicationApiData) {
      fetchSizes();
    }
  }, [applicationApiData, getFileSize]);

  /* ================= Sections ================= */
  const sections = React.useMemo(
    () => [
      {
        id: "proof_visa_sub",
        title: "Visa Submission",
        category: "visaSubmissionProof",
        description:
          "Upload proof of visa submission (appointment confirmation / receipt).",
        url: applicationApiData?.visaSubmissionProof
          ? resolveAssetUrl(applicationApiData.visaSubmissionProof)
          : null,
        isCompleted: !!applicationApiData?.visaSubmissionProof,
        type: "file",
      },
      {
        id: "visa_sub_date",
        title: "Visa Submission Date",
        category: "visaSubmissionDate", // ✅ DateTime
        description: "Select the date the visa application was submitted.",
        url: applicationApiData?.visaSubmissionDate,
        isCompleted: !!applicationApiData?.visaSubmissionDate,
        type: "date",
      },
    ],
    [applicationApiData],
  );

  const isAllRequiredCompleted = sections.every(
    (section) => !!section.isCompleted,
  );

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
    : "border border-primary-border rounded-lg overflow-hidden";
  const stageHeaderClass = stageLockedVisual
    ? "bg-[#EEF2EF]"
    : "bg-[#DFF2E6] border-[#237D3B] border rounded-lg";

  /* ================= File Upload ================= */
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

      if (res?.success || res) {
        toast.success("Document uploaded successfully");
      }
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
        handleFileUpload(categoryKey, input.files[0]);
      }
    };
    input.click();
  };

  /* ================= Date Update ================= */
  const handleDateChange = async (date: any) => {
    if (!date) return;

    setUploadingId("visaSubmissionDate"); // Set loading state for date
    try {
      const payload = {
        id: applicationApiData.id,
        visaSubmissionDate: date.toISOString(), // ✅ Prisma-friendly
      };

      const res = await uploadDocument(payload).unwrap();
    } catch (err) {
      console.error("Date update failed:", err);
      toast.error("Failed to update date");
    } finally {
      setUploadingId(null);
    }
  };

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
              Stage: 5 Embassy Submission
            </h3>
            <p
              className={`text-[14px] ${
                isAllRequiredCompleted ? "text-primary" : "text-[#4B5563]"
              }`}
            >
              Provide visa submission proof and the submission date.
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
          <div className="space-y-4 p-4">
            {sections.map((section) => {
              const isUploading = uploadingId === section.category;

              return (
                <div
                  key={section.id}
                  className="bg-white border border-[#D1D5DB] rounded-xl p-6"
                >
                  {/* Header */}
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
                      <h4 className="text-[18px] font-semibold">
                        {section.title}
                      </h4>
                    </div>

                    {/* Upload button only for file */}
                    {section.type === "file" && (
                      <button
                        disabled={!!uploadingId}
                        onClick={() => triggerFileInput(section.category)}
                        className="border border-[#237D3B] text-[#237D3B] rounded-md p-2 disabled:opacity-50"
                      >
                        {isUploading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full" />
                        ) : (
                          <BiExport size={18} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[14px] text-[#4B5563] mb-4">
                    {section.description}
                  </p>

                  {/* Date Picker */}
                  {section.type === "date" && (
                    <div className="relative w-full md:w-75">
                      <DatePicker
                        className="w-full"
                        value={
                          section.url
                            ? dayjs(section.url) // ✅ ISO → dayjs
                            : null
                        }
                        onChange={handleDateChange}
                        disabled={uploadingId === "visaSubmissionDate"}
                        style={{
                          opacity:
                            uploadingId === "visaSubmissionDate" ? 0.6 : 1,
                        }}
                      />
                      {uploadingId === "visaSubmissionDate" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Attached Document */}
                  {section.type === "file" &&
                    section.isCompleted &&
                    section.url && (
                      <div className="mt-4 flex items-center justify-between border rounded-lg p-4 md:w-[40%]">
                        <div className="flex items-center gap-3">
                          <BsFileEarmarkBarGraph />
                          <div>
                            <p className="truncate text-sm font-medium">
                              {section.title}
                            </p>
                            <p className="text-[12px] text-[#6B7280]">
                              {fileSizes.visaSubmissionProof || "—"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            downloadDocument(
                              section.url ?? "",
                              `${section.title}`,
                            )
                          }
                        >
                          <DownloadOutlined />
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/applications/${id}/final-letter`)}
            className="px-6 py-2 cursor-pointer border rounded-lg text-[#237D3B]"
          >
            Previous
          </button>

          <PrimaryButton
            text="Next"
            disabled={!isAllRequiredCompleted}
            onClick={() => navigate(`/applications/${id}/visa`)}
          />
        </div>
      )}
    </>
  );
};

const EmbassySubmission: React.FC = () => {
  const { applicationApiData } = useOutletContext<{
    applicationApiData: any;
  }>();
  return <EmbassySubmissionStep applicationApiData={applicationApiData} />;
};

export default EmbassySubmission;
