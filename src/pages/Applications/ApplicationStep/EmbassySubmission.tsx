import { DownloadOutlined, UpOutlined } from "@ant-design/icons";
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
import Collapsible from "../../../components/common/Shared/Collapsible";
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

  const [isExpanded, setIsExpanded] = React.useState(true);
  const [userToggledExpand, setUserToggledExpand] = React.useState(false);
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});
  const [localUploads, setLocalUploads] = React.useState<Record<string, string>>({});

  const [createMedia] = useCreateMediaMutation();
  const [uploadDocument] = useApplicationDocumentUploadMutation();

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
      if (applicationApiData?.visaSubmissionProof)
        sizes.visaSubmissionProof = await getFileSize(
          applicationApiData.visaSubmissionProof,
        );
      setFileSizes((prev) => ({ ...prev, ...sizes }));
    };
    fetchSizes();
  }, [applicationApiData, getFileSize]);

  const sections = React.useMemo(
    () => [
      {
        id: "proof_visa_sub",
        title: "Visa Submission",
        category: "visaSubmissionProof",
        description: "Upload proof of visa submission (appointment confirmation / receipt).",
        url:
          localUploads.visaSubmissionProof ||
          (applicationApiData?.visaSubmissionProof
            ? resolveAssetUrl(applicationApiData.visaSubmissionProof)
            : null),
        isCompleted: !!(localUploads.visaSubmissionProof || applicationApiData?.visaSubmissionProof),
        type: "file",
      },
      {
        id: "visa_sub_date",
        title: "Visa Submission Date",
        category: "visaSubmissionDate",
        description: "Select the date the visa application was submitted.",
        url: applicationApiData?.visaSubmissionDate,
        isCompleted: !!applicationApiData?.visaSubmissionDate,
        type: "date",
      },
    ],
    [applicationApiData, resolveAssetUrl, localUploads],
  );

  const isAllRequiredCompleted = sections.every((s) => !!s.isCompleted);

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

  const handleFileUpload = async (categoryKey: string, file: File) => {
    if (!applicationApiData?.id) return;
    setUploadingId(categoryKey);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "document");
      const response = await createMedia(formData).unwrap();
      const documentUrl = response.data.url;
      await uploadDocument({ id: applicationApiData.id, [categoryKey]: documentUrl }).unwrap();

      // Immediate UI update
      setLocalUploads((prev) => ({ ...prev, [categoryKey]: resolveAssetUrl(documentUrl) }));
      setFileSizes((prev) => ({ ...prev, [categoryKey]: formatFileSize(file.size) }));
      toast.success("Document uploaded successfully");
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
      if (input.files?.[0]) handleFileUpload(categoryKey, input.files[0]);
    };
    input.click();
  };

  const handleDateChange = async (date: any) => {
    if (!date || !applicationApiData?.id) return;
    setUploadingId("visaSubmissionDate");
    try {
      await uploadDocument({
        id: applicationApiData.id,
        visaSubmissionDate: date.toISOString(),
      }).unwrap();
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
            {sections.map((section) => {
              const isUploading = uploadingId === section.category;

              return (
                <div
                  key={section.id}
                  className="bg-white border border-primary-border rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {section.isCompleted ? (
                        <IoCheckmarkCircleSharp size={24} className="text-[#16A34A]" />
                      ) : (
                        <FaRegCircle size={22} className="text-gray-300" />
                      )}
                      <h4 className="text-[18px] font-semibold">{section.title}</h4>
                    </div>

                    {section.type === "file" && (
                      <button
                        disabled={!!uploadingId}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileInput(section.category);
                        }}
                        className="border border-[#237D3B] text-[#237D3B] rounded-md p-2 hover:bg-[#F0FDF4] transition disabled:opacity-50 cursor-pointer"
                      >
                        {isUploading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full" />
                        ) : (
                          <BiExport size={18} />
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-[14px] text-[#4B5563] mb-4">{section.description}</p>

                  {section.type === "date" && (
                    <div className="relative w-full md:w-75">
                      <DatePicker
                        className="w-full"
                        value={section.url ? dayjs(section.url) : null}
                        onChange={handleDateChange}
                        disabled={uploadingId === "visaSubmissionDate"}
                        style={{ opacity: uploadingId === "visaSubmissionDate" ? 0.6 : 1 }}
                      />
                      {uploadingId === "visaSubmissionDate" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === "file" && section.isCompleted && section.url && (
                    <div className="mt-4 flex items-center justify-between border border-primary-border rounded-lg p-4 md:w-[40%]">
                      <div className="flex items-center gap-3">
                        <BsFileEarmarkBarGraph />
                        <div>
                          <p className="truncate text-sm font-medium">{section.title}</p>
                          <p className="text-[12px] text-[#6B7280]">
                            {fileSizes[section.category] || "—"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadDocument(section.url ?? "", section.title)}
                        className="text-[#4B5563] hover:text-[#237D3B] cursor-pointer"
                      >
                        <DownloadOutlined />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Collapsible>
      </div>

      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/applications/${id}/final-letter`)}
            className="px-6 py-2 cursor-pointer border border-primary-border rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50"
          >
            Previous
          </button>
          <PrimaryButton
            text="Next"
            disabled={!isAllRequiredCompleted}
            onClick={() => id && navigate(`/applications/${id}/visa`)}
          />
        </div>
      )}
    </>
  );
};

const EmbassySubmission: React.FC = () => {
  const { applicationApiData } = useOutletContext<{ applicationApiData: any }>();
  return <EmbassySubmissionStep applicationApiData={applicationApiData} />;
};

export default EmbassySubmission;
