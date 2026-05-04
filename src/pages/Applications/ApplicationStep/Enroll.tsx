import { DownloadOutlined, UpOutlined } from "@ant-design/icons";
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

export type EnrollStepProps = {
  applicationApiData: any;
  embedded?: boolean;
  autoOpen?: boolean;
  stageUnlocked?: boolean;
};

export const EnrollStep: React.FC<EnrollStepProps> = ({
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const units = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${units[i]}`;
  };

  const getFileSize = React.useCallback(async (url: string): Promise<string> => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      if (contentLength) return formatFileSize(parseInt(contentLength, 10));
      const blob = await (await fetch(url)).blob();
      return formatFileSize(blob.size);
    } catch {
      return "—";
    }
  }, []);

  React.useEffect(() => {
    if (!applicationApiData) return;
    const fetchSizes = async () => {
      const sizes: Record<string, string> = {};
      if (applicationApiData?.airticket)
        sizes.airticket = await getFileSize(applicationApiData.airticket);
      if (applicationApiData?.travelLetter)
        sizes.travelLetter = await getFileSize(applicationApiData.travelLetter);
      setFileSizes((prev) => ({ ...prev, ...sizes }));
    };
    fetchSizes();
  }, [applicationApiData, getFileSize]);

  const sections = React.useMemo(
    () => [
      {
        id: "air_ticket",
        title: "Air Ticket",
        category: "airticket",
        hasUploaded: true,
        description:
          "Upload your air ticket confirming travel arrangements to the destination country.",
        url:
          (localUploads.airticket && `${config.image_access_url}${localUploads.airticket}`) ||
          (applicationApiData?.airticket &&
            `${config.image_access_url}${applicationApiData.airticket}`),
        isCompleted: !!(localUploads.airticket || applicationApiData?.airticket),
      },
      {
        id: "travel_letter",
        title: "Travel Letter",
        category: "travelLetter",
        hasUploaded: true,
        description:
          "Upload the travel letter issued in connection with your enrollment and travel plans.",
        url:
          (localUploads.travelLetter && `${config.image_access_url}${localUploads.travelLetter}`) ||
          (applicationApiData?.travelLetter &&
            `${config.image_access_url}${applicationApiData.travelLetter}`),
        isCompleted: !!(localUploads.travelLetter || applicationApiData?.travelLetter),
      },
    ],
    [applicationApiData, localUploads],
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
      setLocalUploads((prev) => ({ ...prev, [categoryKey]: documentUrl }));
      setFileSizes((prev) => ({ ...prev, [categoryKey]: formatFileSize(file.size) }));
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
              Stage: 7 Enroll
            </h3>
            <p
              className={`text-[14px] ${
                isAllRequiredCompleted ? "text-primary" : "text-[#4B5563]"
              }`}
            >
              Upload final enrollment documents (air ticket, travel letter, etc.).
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
              const isSectionUploading = uploadingId === section.category;

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
                      <h4 className="text-[18px] font-semibold text-[#111827]">{section.title}</h4>
                    </div>

                    {section.hasUploaded && (
                      <button
                        disabled={!!uploadingId}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileInput(section.category);
                        }}
                        className="border border-[#237D3B] text-[#237D3B] rounded-md cursor-pointer p-2 hover:bg-[#F0FDF4] transition disabled:opacity-50"
                      >
                        {isSectionUploading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full" />
                        ) : (
                          <BiExport size={18} />
                        )}
                      </button>
                    )}
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
                              {section.title}
                            </p>
                            <p className="text-[12px] text-[#6B7280]">
                              {fileSizes[section.category] || "—"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(section.url, "_blank")}
                          className="text-[#4B5563] hover:text-[#237D3B] cursor-pointer ml-4"
                        >
                          <DownloadOutlined style={{ fontSize: 18 }} />
                        </button>
                      </div>
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
            onClick={() => navigate(`/applications/${id}/visa`)}
            className="px-6 py-2 border border-primary-border rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50 transition cursor-pointer"
          >
            Previous
          </button>
          <PrimaryButton
            text="Continue"
            disabled={!isAllRequiredCompleted}
            className={!isAllRequiredCompleted ? "opacity-50 pointer-events-none" : ""}
            onClick={() => navigate("/visa-success")}
          />
        </div>
      )}
    </>
  );
};

const Enroll: React.FC = () => {
  const { applicationApiData } = useOutletContext<{ applicationApiData: any }>();
  return <EnrollStep applicationApiData={applicationApiData} />;
};

export default Enroll;
