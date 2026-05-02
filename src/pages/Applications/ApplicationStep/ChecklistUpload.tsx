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

  // স্পেসিফিক লোডিং স্টেট
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);
  const [expandedDocuments, setExpandedDocuments] = React.useState<
    Record<string, boolean>
  >({});

  const [createMedia] = useCreateMediaMutation();
  const [uploadDocument] = useApplicationDocumentUploadMutation();
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});

  const downloadDocument = React.useCallback(
    async (url: string, name?: string) => {
      if (!url) return;
      try {
        const res = await fetch(url, { credentials: "include" });
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
        window.open(url, "_blank");
      }
    },
    [],
  );

  const toggleDocuments = (id: string) => {
    setExpandedDocuments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ================= Get File Size from URL ================= */
  const getFileSize = React.useCallback(
    async (url: string): Promise<string> => {
      try {
        const resolved =
          url && String(url).startsWith("http")
            ? url
            : `${config.image_access_url}${String(url || "")}`;

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
    [],
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

      // Fetch sizes for all document URLs
      if (applicationApiData?.vfsAppointmentLetter) {
        sizes.vfsAppointmentLetter = await getFileSize(
          `${config.image_access_url}${applicationApiData.vfsAppointmentLetter}`,
        );
      }
      if (applicationApiData?.bankStatement) {
        sizes.bankStatement = await getFileSize(
          `${config.image_access_url}${applicationApiData.bankStatement}`,
        );
      }
      if (applicationApiData?.affidavit) {
        sizes.affidavit = await getFileSize(
          `${config.image_access_url}${applicationApiData.affidavit}`,
        );
      }
      if (applicationApiData?.sponsor) {
        sizes.sponsor = await getFileSize(
          `${config.image_access_url}${applicationApiData.sponsor}`,
        );
      }
      if (applicationApiData?.internationalBankCard) {
        sizes.internationalBankCard = await getFileSize(
          `${config.image_access_url}${applicationApiData.internationalBankCard}`,
        );
      }

      setFileSizes(sizes);
    };

    if (applicationApiData) {
      fetchSizes();
    }
  }, [applicationApiData, getFileSize]);
  const sections = React.useMemo(
    () => [
      {
        id: "vfs_appointment",
        title: "VFS Appointment",
        category: "vfsAppointmentLetter",
        description:
          "Upload your VFS appointment confirmation letter (PDF/image).",
        // যদি লেটার থাকে তবেই URL জেনারেট হবে, নাহলে null
        url: applicationApiData?.vfsAppointmentLetter
          ? `${config.image_access_url}${applicationApiData.vfsAppointmentLetter}`
          : null,
        // Strict Check: null না হওয়া এবং খালি স্ট্রিং না হওয়া নিশ্চিত করে
        isCompleted:
          Boolean(applicationApiData?.vfsAppointmentLetter) &&
          applicationApiData?.vfsAppointmentLetter !== "",
      },
      {
        id: "bank_statement",
        title: "Bank Statement",
        category: "bankStatement",
        description:
          "Sponsor’s bank statement for the last 3 months, along with a recent bank certificate. The ending balance should be converted into Euros.",
        url:
          applicationApiData?.bankStatement &&
          `${config.image_access_url}${applicationApiData.bankStatement}`,
        isCompleted:
          Boolean(applicationApiData?.bankStatement) &&
          applicationApiData?.bankStatement !== "",
      },
      {
        id: "affidavit",
        title: "Affidavit",
        category: "affidavit",
        description:
          "Upload the signed sponsor affidavit / declaration letter (if applicable).",
        url:
          applicationApiData?.affidavit &&
          `${config.image_access_url}${applicationApiData.affidavit}`,
        isCompleted:
          Boolean(applicationApiData?.affidavit) &&
          applicationApiData?.affidavit !== "",
      },
      {
        id: "sponsor_identification",
        title: "Sponsor Identification",
        category: "sponsor",
        description:
          "Copy of identification of sponsor (front and back). If it is not English you have to upload it.",
        url:
          applicationApiData?.sponsor &&
          `${config.image_access_url}${applicationApiData.sponsor}`,
        isCompleted:
          Boolean(applicationApiData?.sponsor) &&
          applicationApiData?.sponsor !== "",
      },
      {
        id: "international_bank_card",
        title: "International Bank Card",
        category: "internationalBankCard",
        description:
          "Upload the international bank card linked to the submitted bank statement (front and back).",
        url:
          applicationApiData?.internationalBankCard &&
          `${config.image_access_url}${applicationApiData.internationalBankCard}`,
        isCompleted:
          Boolean(applicationApiData?.internationalBankCard) &&
          applicationApiData?.internationalBankCard !== "",
      },
    ],
    [applicationApiData],
  );
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
      // if (res.success || res) {
      //   toast.success(`${categoryKey.toUpperCase()} uploaded successfully`);
      // }
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

  // const isAllRequiredCompleted = sections.every((cat) => cat.isCompleted);
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
    : "border border-primary-border rounded-lg overflow-hidden";
  const stageHeaderClass = stageLockedVisual
    ? "bg-[#EEF2EF]"
    : "bg-[#DFF2E6] border-[#237D3B] border rounded-lg";

  return (
    <>
      <div className={stageCardClass}>
        <div
          className={`${stageHeaderClass} p-6 flex items-center justify-between`}
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
              const isCompleted = !!section.url;
              const isSectionUploading = uploadingId === section.category;

              return (
                <div
                  key={section.id}
                  className="bg-white border border-[#D1D5DB] rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
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

                    <button
                      disabled={!!uploadingId}
                      onClick={() => triggerFileInput(section.category)}
                      className="border border-[#237D3B] text-[#237D3B] rounded-md cursor-pointer p-2 hover:bg-[#F0FDF4] transition disabled:opacity-50"
                    >
                      {isSectionUploading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full"></div>
                      ) : (
                        <BiExport size={18} />
                      )}
                    </button>
                  </div>

                  <p className="text-[14px] text-[#4B5563] mb-4 leading-relaxed">
                    {section.description}
                  </p>

                  {/* ফাইল আপলোড করা থাকলে তবেই Read More দেখাবে */}
                  {isCompleted && (
                    <>
                      <div className="flex justify-end mb-3">
                        <button
                          onClick={() => toggleDocuments(section.id)}
                          className="flex items-center gap-1 cursor-pointer text-[#237D3B] font-medium text-[14px]"
                        >
                          {expandedDocuments[section.id]
                            ? "Read less"
                            : "Read more"}
                          {expandedDocuments[section.id] ? (
                            <UpOutlined />
                          ) : (
                            <DownOutlined />
                          )}
                        </button>
                      </div>

                      {expandedDocuments[section.id] && (
                        <div className="">
                          <p className="text-[16px] font-semibold text-[#111827] mb-3">
                            Attached Documents:
                          </p>
                          <div className="flex items-center justify-between border border-[#D1D5DB] rounded-lg p-4 w-full md:w-2/3 lg:w-1/2">
                            <div className="flex items-center gap-3">
                              <BsFileEarmarkBarGraph className="text-[20px]" />
                              <div>
                                <p className="text-[14px] font-medium text-[#20242A] truncate max-w-37.5">
                                  {section.title}
                                </p>
                                <p className="text-[12px] text-[#6B7280]">
                                  {fileSizes[section.category] || "—"}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                downloadDocument(
                                  section?.url ?? "",
                                  section?.title,
                                )
                              }
                              className="text-[#4B5563] hover:text-[#237D3B] cursor-pointer"
                            >
                              <DownloadOutlined style={{ fontSize: 18 }} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/applications/${id}/apply`)}
            className="px-6 py-2 cursor-pointer border border-[#D1D5DB] rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50 transition"
          >
            Previous
          </button>

          <div className={!isAllRequiredCompleted ? "cursor-not-allowed" : ""}>
            <PrimaryButton
              text="Next"
              disabled={!isAllRequiredCompleted}
              className={`${!isAllRequiredCompleted ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => navigate(`/applications/${id}/final-letter`)}
            />
          </div>
        </div>
      )}
    </>
  );
};

const ChecklistUpload: React.FC = () => {
  const { applicationApiData } = useOutletContext<{
    applicationApiData: any;
  }>();
  return <ChecklistUploadStep applicationApiData={applicationApiData} />;
};

export default ChecklistUpload;
