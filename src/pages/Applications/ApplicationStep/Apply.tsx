// (old commented-out version preserved below)
// import React from "react";
// ... (original commented code omitted for brevity — see git history)

import { DownloadOutlined, UpOutlined } from "@ant-design/icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BiExport } from "react-icons/bi";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PrimaryButton from "../../../components/common/Button/PrimaryButton";
import Collapsible from "../../../components/common/Shared/Collapsible";

import { config } from "../../../config";
import {
  useGetAllInvoicePaymentsQuery,
  useSubmitPaymentReceiptMutation,
} from "../../../redux/features/application/applicationApi";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";

/* ================= Types ================= */
interface Document {
  id: string;
  name: string;
  size: string;
  url?: string;
}

interface Section {
  id: string;
  title: string;
  description: string | React.ReactNode;
  isCompleted: boolean;
  hasUpload?: boolean;
  document?: Document;
  documents?: Document[];
}

/* ================= Document Card ================= */
const DocumentCard: React.FC<{ doc: Document }> = ({ doc }) => {
  const handleDownload = async () => {
    if (!doc?.url) return;
    const fileName = doc.name || doc.url.split("/").pop() || "download";
    try {
      const res = await fetch(doc.url, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(doc.url, "_blank");
    }
  };

  return (
    <div className="flex items-center justify-between border border-primary-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <BsFileEarmarkBarGraph className="text-[20px]" />
        <div>
          <p className="text-[14px] font-medium text-[#20242A]">{doc?.name}</p>
          <p className="text-[12px] text-[#6B7280]">{doc?.size}</p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="text-[#4B5563] hover:text-[#237D3B] cursor-pointer transition-colors"
      >
        <DownloadOutlined style={{ fontSize: 18 }} />
      </button>
    </div>
  );
};

export type ApplyStepProps = {
  applicationApiData: any;
  steps?: any[];
  embedded?: boolean;
  autoOpen?: boolean;
  stageUnlocked?: boolean;
};

/* ================= Main Component ================= */
export const ApplyStep: React.FC<ApplyStepProps> = ({
  applicationApiData,
  embedded = false,
  autoOpen = false,
  stageUnlocked = true,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, refetch } = useGetAllInvoicePaymentsQuery([]);
  const [createMedia] = useCreateMediaMutation();
  const [submitPaymentReceipt] = useSubmitPaymentReceiptMutation();

  const submittedPayment = data?.data;

  const applicationFee = applicationApiData?.invoices?.find(
    (inv: any) => inv.type === "APPLICATION_FEE",
  );
  const tuitionFee = applicationApiData?.invoices?.find(
    (inv: any) =>
      inv.type === "TUITION_FEE_HALF_BEFORE" ||
      inv.type === "TUITION_FEE_FULL" ||
      inv.type === "TUITION_FEE_FULL_BEFORE" ||
      inv.type === "TUITION_FEE_FULL_AFTER_VISA",
  );

  const paymentDoc = submittedPayment?.find(
    (p: any) => p.invoiceId === applicationFee?.id,
  );
  const tuitionPaymentDoc = submittedPayment?.find(
    (p: any) => p.invoiceId === tuitionFee?.id,
  );

  const isPaymentPendingApproval = paymentDoc?.status === "PENDING";
  const isTuitionPendingApproval = submittedPayment?.some(
    (p: any) => p.invoiceId === tuitionFee?.id && p.status === "PENDING",
  );

  const [isExpanded, setIsExpanded] = useState(true);
  const [userToggledExpand, setUserToggledExpand] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [fileSizes, setFileSizes] = useState<Record<string, string>>({});
  const [uploadingCategoryId, setUploadingCategoryId] = useState<string | null>(
    null,
  );
  const [localReceipts, setLocalReceipts] = useState<Record<string, string>>(
    {},
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const units = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
  };

  const getFileSize = useCallback(async (url: string): Promise<string> => {
    if (!url) return "—";
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      if (contentLength) return formatFileSize(parseInt(contentLength, 10));
      return "—";
    } catch {
      return "—";
    }
  }, []);

  useEffect(() => {
    const fetchAllSizes = async () => {
      const sizes: Record<string, string> = {};
      if (applicationApiData?.conditionalOfferLetter)
        sizes.conditionalOfferLetter = await getFileSize(
          `${config.image_access_url}${applicationApiData.conditionalOfferLetter}`,
        );
      if (applicationFee?.invoiceFile)
        sizes.applicationInvoice = await getFileSize(
          `${config.image_access_url}${applicationFee.invoiceFile}`,
        );
      if (paymentDoc?.paymentReceipt)
        sizes.paymentReceiptSize = await getFileSize(
          `${config.image_access_url}${paymentDoc.paymentReceipt}`,
        );
      if (tuitionFee?.invoiceFile)
        sizes.tuitionInvoice = await getFileSize(
          `${config.image_access_url}${tuitionFee.invoiceFile}`,
        );
      if (tuitionPaymentDoc?.paymentReceipt)
        sizes.tuitionReceiptSize = await getFileSize(
          `${config.image_access_url}${tuitionPaymentDoc.paymentReceipt}`,
        );
      setFileSizes(sizes);
    };
    fetchAllSizes();
  }, [
    applicationApiData,
    applicationFee,
    tuitionFee,
    getFileSize,
    paymentDoc?.paymentReceipt,
    tuitionPaymentDoc?.paymentReceipt,
  ]);

  const sections: Section[] = useMemo(
    () => [
      {
        id: "docs_review",
        title: "Documents Review",
        description:
          "Your documents are currently under review. Once the review is complete, we will forward them to the college.",
        isCompleted: !!applicationApiData?.isReviewed,
      },
      {
        id: "college_submitted",
        title: "College Submitted",
        description:
          "Your application has been forwarded to the college. A conditional offer letter is expected to be issued within 2-3 working days.",
        isCompleted: !!applicationApiData?.isCollageSubmitted,
      },
      {
        id: "conditional_letter",
        title: "Conditional Letter",
        description:
          "The conditional offer letter has arrived. You may download the attachment provided.",
        isCompleted: !!applicationApiData?.conditionalOfferLetter,
        documents: applicationApiData?.conditionalOfferLetter
          ? [
              {
                id: "col-1",
                name: "Conditional Letter",
                size: fileSizes.conditionalOfferLetter || "—",
                url: `${config.image_access_url}${applicationApiData.conditionalOfferLetter}`,
              },
            ]
          : [],
      },
      {
        id: "application_fee",
        title: "Application Fee",
        description: applicationFee ? (
          applicationFee.status === "PAID" ? (
            <span>Your application fee has been successfully paid.</span>
          ) : (
            <span>
              Application fee invoice is available. Amount:{" "}
              {applicationFee.amount} {applicationFee.currency}.
            </span>
          )
        ) : (
          "Great news! You don't need to pay the application fee—it's fully waived."
        ),
        isCompleted:
          !applicationFee ||
          applicationFee.status === "PAID" ||
          applicationFee.amount === 0,
        hasUpload: !!applicationFee,
        documents: [
          applicationFee?.invoiceFile
            ? {
                id: "inv-1",
                name: "Application Fee Invoice",
                size: fileSizes.applicationInvoice || "—",
                url: `${config.image_access_url}${applicationFee.invoiceFile}`,
              }
            : null,
          localReceipts.application_fee || paymentDoc?.paymentReceipt
            ? {
                id: "pay-1",
                name: "Payment Receipt",
                size: fileSizes.paymentReceiptSize || "—",
                url: `${config.image_access_url}${localReceipts.application_fee || paymentDoc?.paymentReceipt}`,
              }
            : null,
        ].filter(Boolean) as Document[],
      },
      {
        id: "tuition_fee",
        title: "Tuition Fee",
        description: tuitionFee ? (
          tuitionFee.status === "PAID" ? (
            <span>Your tuition fee has been successfully paid.</span>
          ) : (
            <span>
              Tuition fee invoice is available. Amount: {tuitionFee.amount}{" "}
              {tuitionFee.currency}.
            </span>
          )
        ) : (
          "Great news! You don't need to pay the tuition fee—it's fully waived."
        ),
        isCompleted:
          !!tuitionFee &&
          (tuitionFee.status === "PAID" || tuitionFee.amount === 0),
        hasUpload: !!tuitionFee,
        documents: [
          tuitionFee?.invoiceFile
            ? {
                id: "inv-t-1",
                name: "Tuition Fee Invoice",
                size: fileSizes.tuitionInvoice || "—",
                url: `${config.image_access_url}${tuitionFee.invoiceFile}`,
              }
            : null,
          localReceipts.tuition_fee || tuitionPaymentDoc?.paymentReceipt
            ? {
                id: "pay-t-1",
                name: "Payment Receipt",
                size: fileSizes.tuitionReceiptSize || "—",
                url: `${config.image_access_url}${localReceipts.tuition_fee || tuitionPaymentDoc?.paymentReceipt}`,
              }
            : null,
        ].filter(Boolean) as Document[],
      },
    ],
    [
      applicationApiData,
      fileSizes,
      applicationFee,
      paymentDoc,
      tuitionFee,
      tuitionPaymentDoc,
      localReceipts,
    ],
  );

  const isAllRequiredCompleted = sections.every((s) => s.isCompleted);

  useEffect(() => {
    if (!embedded || userToggledExpand) return;
    setIsExpanded(Boolean(autoOpen));
  }, [autoOpen, embedded, userToggledExpand]);

  useEffect(() => {
    if (!embedded || stageUnlocked) return;
    setIsExpanded(false);
  }, [embedded, stageUnlocked]);

  const stageLockedVisual = embedded && !stageUnlocked;
  const stageCardClass = stageLockedVisual
    ? "border border-primary-border rounded-2xl overflow-hidden bg-[#F4F6F5]"
    : "border border-primary-border rounded-2xl overflow-hidden";
  const stageHeaderClass = stageLockedVisual
    ? "bg-[#EEF2EF]"
    : "bg-[#DFF2E6] border-[#237D3B] border rounded-2xl";

  const handleFileUpload = async (categoryId: string, file: File) => {
    setUploadingCategoryId(categoryId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "other");
      const response = await createMedia(formData).unwrap();
      const documentUrl = response.data.url;

      const payload = {
        applicationId: id,
        invoiceId:
          categoryId === "application_fee"
            ? applicationFee?.id
            : tuitionFee?.id,
        studentId: applicationApiData?.studentId,
        paymentReceipt: documentUrl,
      };
      await submitPaymentReceipt(payload).unwrap();

      // Immediate UI update
      setLocalReceipts((prev) => ({ ...prev, [categoryId]: documentUrl }));
      const sizeKey =
        categoryId === "application_fee"
          ? "paymentReceiptSize"
          : "tuitionReceiptSize";
      setFileSizes((prev) => ({
        ...prev,
        [sizeKey]: formatFileSize(file.size),
      }));
      setExpandedSections((prev) => ({ ...prev, [categoryId]: true }));

      refetch();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingCategoryId(null);
    }
  };

  const triggerFileInput = (categoryId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.png";
    input.onchange = () => {
      if (input.files?.[0]) handleFileUpload(categoryId, input.files[0]);
    };
    input.click();
  };

  return (
    <>
      <div className={stageCardClass}>
        <div
          title={
            stageLockedVisual ? "Complete the previous stage first" : undefined
          }
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
              Stage: 2 Apply
            </h3>
            <p
              className={`text-[14px] ${
                isAllRequiredCompleted ? "text-primary" : "text-[#4B5563]"
              }`}
            >
              Review your application package and upload any required receipts.
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
              const isSectionExpanded = expandedSections[section.id] ?? false;
              const hasDocs =
                section.document ||
                (section.documents && section.documents.length > 0);

              return (
                <div
                  key={section.id}
                  className="bg-white border border-primary-border rounded-xl p-6"
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

                    {section.hasUpload && !section.isCompleted && (
                      <button
                        disabled={uploadingCategoryId === section.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileInput(section.id);
                        }}
                        className="border border-[#237D3B] text-[#237D3B] rounded-md p-2 hover:bg-[#F0FDF4] transition disabled:opacity-50"
                      >
                        {uploadingCategoryId === section.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full" />
                        ) : (
                          <BiExport size={18} />
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-[14px] text-[#4B5563] mb-2">
                    {section.description}
                  </p>

                  {section.id === "application_fee" &&
                    isPaymentPendingApproval && (
                      <div className="mb-3 bg-[#FFFBEB] border border-[#FCD34D] p-3 rounded-lg text-[#92400E] text-sm">
                        Please wait for admin approval.
                      </div>
                    )}
                  {section.id === "tuition_fee" && isTuitionPendingApproval && (
                    <div className="mb-3 bg-[#FFFBEB] border border-[#FCD34D] p-3 rounded-lg text-[#92400E] text-sm">
                      Please wait for admin approval.
                    </div>
                  )}

                  {hasDocs && (
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection(section.id);
                        }}
                        className="flex items-center gap-1 text-[#237D3B] font-medium text-[14px]"
                      >
                        {isSectionExpanded ? "Read less" : "Read more"}
                        <UpOutlined
                          className={`transition-transform duration-300 ${
                            isSectionExpanded ? "rotate-0" : "rotate-180"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  <Collapsible open={isSectionExpanded}>
                    {hasDocs && (
                      <div className="mt-3">
                        <p className="text-[16px] font-semibold mb-3">
                          Attached Documents:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section?.document && (
                            <DocumentCard doc={section.document} />
                          )}
                          {section?.documents?.map((doc) => (
                            <DocumentCard key={doc?.id} doc={doc} />
                          ))}
                        </div>
                      </div>
                    )}
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </Collapsible>
      </div>

      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/applications/${id}/admission`)}
            className="px-6 cursor-pointer py-2 border border-primary-border rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50"
          >
            Previous
          </button>
          <PrimaryButton
            text="Next"
            disabled={!isAllRequiredCompleted}
            className={
              !isAllRequiredCompleted ? "opacity-50 cursor-not-allowed" : ""
            }
            onClick={() => id && navigate(`/applications/${id}/checklist`)}
          />
        </div>
      )}
    </>
  );
};

const Apply: React.FC = () => {
  const { applicationApiData, steps } = useOutletContext<{
    applicationApiData: any;
    steps: any[];
  }>();
  return <ApplyStep applicationApiData={applicationApiData} steps={steps} />;
};

export default Apply;
