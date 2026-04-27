import React from "react";
import { DownloadOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PrimaryButton from "../../../components/common/Button/PrimaryButton";
import { FaRegCircle } from "react-icons/fa";
import { BiExport } from "react-icons/bi";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { useApplicationDocumentUploadMutation } from "../../../redux/features/application/applicationApi";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";
import { config } from "../../../config";
import { toast } from "react-toastify";

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
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);



  // Get Tuition Fee Invoice
  const tuitionFeeInvoice = applicationApiData?.invoices?.find(
    (invoice: any) =>
      invoice.type === "TUITION_FEE_FULL_BEFORE" ||
      invoice.type === "TUITION_FEE_HALF_BEFORE",
  );

  const [createMedia] = useCreateMediaMutation();
  const [uploadDocument] = useApplicationDocumentUploadMutation();
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);

  /* ================= Get File Size from URL ================= */
  const getFileSize = React.useCallback(
    async (url: string): Promise<string> => {
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

      if (applicationApiData?.tuitionDepositReceipt) {
        sizes.tuitionDepositReceipt = await getFileSize(
          applicationApiData.tuitionDepositReceipt,
        );
      }
      if (applicationApiData?.airticket) {
        sizes.airticket = await getFileSize(applicationApiData.airticket);
      }
      if (applicationApiData?.travelLetter) {
        sizes.travelLetter = await getFileSize(applicationApiData.travelLetter);
      }

      setFileSizes(sizes);
    };

    if (applicationApiData) {
      fetchSizes();
    }
  }, [applicationApiData, getFileSize]);

  // এপিআই থেকে আসা ডাটার ভিত্তিতে সেকশনগুলো সাজানো হয়েছে
  const sections = React.useMemo(
    () => [
      // {
      //   id: "tuition_deposit_receipt",
      //   title: "Tuition Deposit Receipt",
      //   category: "tuitionDepositReceipt",
      //   hasUploaded: true,
      //   description:
      //     "Here is a guideline how to book an appointment. Check out the video. Also you can read the manual guideline.",
      //   url: applicationApiData?.tuitionDepositReceipt,
      //   // isCompleted: !!applicationApiData?.tuitionDepositReceipt,
      //   isCompleted: true,
      // },
      {
        id: "air_ticket",
        title: "Air Ticket",
        category: "airticket",
        hasUploaded: true,
        description:
          "Sponsor's bank statement for the last 3 months, along with a recent bank certificate, is attached. The ending balance should be converted into Euros.",
        url: applicationApiData?.airticket && `${config.image_access_url}${applicationApiData?.airticket}`,
        isCompleted: !!applicationApiData?.airticket,
      },
      {
        id: "travel_letter",
        title: "Travel Letter",
        category: "travelLetter",
        hasUploaded: false,
        description:
          "Sponsor's bank statement for the last 3 months, along with a recent bank certificate, is attached. The ending balance should be converted into Euros.",
        url: applicationApiData?.travelLetter && `${config.image_access_url}${applicationApiData?.travelLetter}`,
        isCompleted: !!applicationApiData?.travelLetter,
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
    : "border border-[#C7CACF] rounded-lg overflow-hidden";
  const stageHeaderClass = stageLockedVisual
    ? "bg-[#EEF2EF]"
    : "bg-[#E9F2EB]";

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
        handleFileUpload(categoryKey, input.files[0]);
      }
    };
    input.click();
  };

  return (
    <>
      <div className={stageCardClass}>
        {/* Header */}
        <div
          className={`${stageHeaderClass} p-6 flex items-center justify-between`}
        >
          <div>
            <h3 className="text-[20px] font-semibold text-[#20242A]">
              Stage: 7 Enroll
            </h3>
            <p className="text-[14px] text-[#4B5563]">
              Upload final enrollment documents (tuition receipt, air ticket, etc.).
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

        {isExpanded && (
          <div className="space-y-4 p-4">
            {sections.map((section) => {
              const isSectionUploading = uploadingId === section.category;

              return (
                <div
                  key={section.id}
                  className="bg-white border border-[#C7CACF] rounded-xl p-6"
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
                    {section.hasUploaded &&
                      (section.id === "tuition_deposit_receipt" ? (
                        <button
                          onClick={() => {
                            if (tuitionFeeInvoice) {
                              setIsPaymentModalOpen(true);
                            } else {
                              toast.error("Tuition fee invoice not found");
                            }
                          }}
                          className="border border-[#237D3B] text-[#237D3B] rounded-md cursor-pointer p-2 hover:bg-[#F0FDF4] transition"
                        >
                          <BiExport size={18} />
                        </button>
                      ) : (
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
                      ))}
                  </div>

                  <p className="text-[14px] text-[#4B5563] mb-6 leading-relaxed">
                    {section.description}
                  </p>

                  {/* ফাইল থাকলে তবেই এই সেকশনটি দেখাবে */}
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
                              {section.title}
                            </p>
                            <p className="text-[12px] text-[#6B7280]">
                              {fileSizes[section.category] || "—"}
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
              );
            })}
          </div>
        )}
      </div>

      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/applications/${id}/visa`)}
            className="px-6 py-2 border border-[#D1D5DB] rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <div className={!isAllRequiredCompleted ? "cursor-not-allowed" : ""}>
            <PrimaryButton
              text="Continue"
              disabled={!isAllRequiredCompleted}
              className={`${!isAllRequiredCompleted ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => navigate(`/visa-success`)}
            />
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {/* {tuitionFeeInvoice && (
        <PaymentReceiptModal
          open={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          invoice={tuitionFeeInvoice}
        />
      )} */}
    </>
  );
};

const Enroll: React.FC = () => {
  const { applicationApiData } = useOutletContext<{ applicationApiData: any }>();
  return <EnrollStep applicationApiData={applicationApiData} />;
};

export default Enroll;
