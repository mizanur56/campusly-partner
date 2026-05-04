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

export type ChecklistUploadStepProps = {
  applicationApiData: any;
  embedded?: boolean;
  autoOpen?: boolean;
  stageUnlocked?: boolean;
};

export const ChecklistUploadStep: React.FC<ChecklistUploadStepProps> = ({
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
  const [expandedDocuments, setExpandedDocuments] = React.useState<Record<string, boolean>>({});
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});
  const [localUploads, setLocalUploads] = React.useState<Record<string, string>>({});

  const [createMedia] = useCreateMediaMutation();
  const [uploadDocument] = useApplicationDocumentUploadMutation();

  const downloadDocument = React.useCallback(async (url: string, name?: string) => {
    if (!url) return;
    try {
      const res = await fetch(url, { credentials: "include" });
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
      window.open(url, "_blank");
    }
  }, []);

  const toggleDocuments = (sectionId: string) => {
    setExpandedDocuments((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const units = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${units[i]}`;
  };

  const getFileSize = React.useCallback(async (url: string): Promise<string> => {
    try {
      const resolved = url.startsWith("http") ? url : `${config.image_access_url}${url}`;
      const response = await fetch(resolved, { method: "HEAD", credentials: "include" });
      const contentLength = response.headers.get("content-length");
      if (contentLength) return formatFileSize(parseInt(contentLength, 10));
      const blob = await (await fetch(resolved, { credentials: "include" })).blob();
      return formatFileSize(blob.size);
    } catch {
      return "—";
    }
  }, []);

  React.useEffect(() => {
    if (!applicationApiData) return;
    const fetchSizes = async () => {
      const sizes: Record<string, string> = {};
      const fields = [
        "vfsAppointmentLetter",
        "bankStatement",
        "affidavit",
        "sponsor",
        "internationalBankCard",
      ] as const;
      for (const field of fields) {
        if (applicationApiData[field])
          sizes[field] = await getFileSize(
            `${config.image_access_url}${applicationApiData[field]}`,
          );
      }
      setFileSizes((prev) => ({ ...prev, ...sizes }));
    };
    fetchSizes();
  }, [applicationApiData, getFileSize]);

  const sections = React.useMemo(
    () => [
      {
        id: "vfs_appointment",
        title: "VFS Appointment",
        category: "vfsAppointmentLetter",
        description: "Upload your VFS appointment confirmation letter (PDF/image).",
        url:
          localUploads.vfsAppointmentLetter ||
          (applicationApiData?.vfsAppointmentLetter
            ? `${config.image_access_url}${applicationApiData.vfsAppointmentLetter}`
            : null),
        isCompleted:
          !!(localUploads.vfsAppointmentLetter || applicationApiData?.vfsAppointmentLetter),
      },
      {
        id: "bank_statement",
        title: "Bank Statement",
        category: "bankStatement",
        description:
          "Sponsor's bank statement for the last 3 months, along with a recent bank certificate. The ending balance should be converted into Euros.",
        url:
          localUploads.bankStatement ||
          (applicationApiData?.bankStatement
            ? `${config.image_access_url}${applicationApiData.bankStatement}`
            : null),
        isCompleted: !!(localUploads.bankStatement || applicationApiData?.bankStatement),
      },
      {
        id: "affidavit",
        title: "Affidavit",
        category: "affidavit",
        description: "Upload the signed sponsor affidavit / declaration letter (if applicable).",
        url:
          localUploads.affidavit ||
          (applicationApiData?.affidavit
            ? `${config.image_access_url}${applicationApiData.affidavit}`
            : null),
        isCompleted: !!(localUploads.affidavit || applicationApiData?.affidavit),
      },
      {
        id: "sponsor_identification",
        title: "Sponsor Identification",
        category: "sponsor",
        description:
          "Copy of identification of sponsor (front and back). If it is not English you have to upload it.",
        url:
          localUploads.sponsor ||
          (applicationApiData?.sponsor
            ? `${config.image_access_url}${applicationApiData.sponsor}`
            : null),
        isCompleted: !!(localUploads.sponsor || applicationApiData?.sponsor),
      },
      {
        id: "international_bank_card",
        title: "International Bank Card",
        category: "internationalBankCard",
        description:
          "Upload the international bank card linked to the submitted bank statement (front and back).",
        url:
          localUploads.internationalBankCard ||
          (applicationApiData?.internationalBankCard
            ? `${config.image_access_url}${applicationApiData.internationalBankCard}`
            : null),
        isCompleted: !!(
          localUploads.internationalBankCard || applicationApiData?.internationalBankCard
        ),
      },
    ],
    [applicationApiData, localUploads],
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
      setLocalUploads((prev) => ({ ...prev, [categoryKey]: `${config.image_access_url}${documentUrl}` }));
      setFileSizes((prev) => ({ ...prev, [categoryKey]: formatFileSize(file.size) }));
      const section = sections.find((s) => s.category === categoryKey);
      if (section) setExpandedDocuments((prev) => ({ ...prev, [section.id]: true }));
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
              Stage: 3 Checklist Upload
            </h3>
            <p
              className={`text-[14px] ${
                isAllRequiredCompleted ? "text-primary" : "text-[#4B5563]"
              }`}
            >
              Upload all checklist documents to move to the next stage.
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
              const isDocExpanded = expandedDocuments[section.id] ?? false;

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
                      <h4 className="text-[18px] font-semibold text-[#111827]">
                        {section.title}
                      </h4>
                    </div>

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
                  </div>

                  <p className="text-[14px] text-[#4B5563] mb-4 leading-relaxed">
                    {section.description}
                  </p>

                  {section.isCompleted && (
                    <>
                      <div className="flex justify-end mb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDocuments(section.id);
                          }}
                          className="flex items-center gap-1 cursor-pointer text-[#237D3B] font-medium text-[14px]"
                        >
                          {isDocExpanded ? "Read less" : "Read more"}
                          <UpOutlined
                            className={`transition-transform duration-300 ${
                              isDocExpanded ? "rotate-0" : "rotate-180"
                            }`}
                          />
                        </button>
                      </div>

                      <Collapsible open={isDocExpanded}>
                        <div>
                          <p className="text-[16px] font-semibold text-[#111827] mb-3">
                            Attached Documents:
                          </p>
                          <div className="flex items-center justify-between border border-primary-border rounded-lg p-4 w-full md:w-2/3 lg:w-1/2">
                            <div className="flex items-center gap-3">
                              <BsFileEarmarkBarGraph className="text-[20px]" />
                              <div>
                                <p className="text-[14px] font-medium text-[#20242A] truncate max-w-50">
                                  {section.title}
                                </p>
                                <p className="text-[12px] text-[#6B7280]">
                                  {fileSizes[section.category] || "—"}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadDocument(section?.url ?? "", section?.title)}
                              className="text-[#4B5563] hover:text-[#237D3B] cursor-pointer"
                            >
                              <DownloadOutlined style={{ fontSize: 18 }} />
                            </button>
                          </div>
                        </div>
                      </Collapsible>
                    </>
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
            onClick={() => navigate(`/applications/${id}/apply`)}
            className="px-6 py-2 cursor-pointer border border-primary-border rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <PrimaryButton
            text="Next"
            disabled={!isAllRequiredCompleted}
            className={!isAllRequiredCompleted ? "opacity-50 pointer-events-none" : ""}
            onClick={() => id && navigate(`/applications/${id}/final-letter`)}
          />
        </div>
      )}
    </>
  );
};

const ChecklistUpload: React.FC = () => {
  const { applicationApiData } = useOutletContext<{ applicationApiData: any }>();
  return <ChecklistUploadStep applicationApiData={applicationApiData} />;
};

export default ChecklistUpload;
