import React from "react";
import { DownOutlined, UpOutlined, DownloadOutlined } from "@ant-design/icons";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { FaRegCircle } from "react-icons/fa";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { BiExport } from "react-icons/bi";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PrimaryButton from "../../../components/common/Button/PrimaryButton";
import PaymentReceiptModal from "../../../components/common/Modals/PaymentReceiptModal";
import jsPDF from "jspdf";

interface Document {
  id: string;
  name: string;
  size: string;
  url?: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  hasUpload?: boolean;
  document?: Document;
  documents?: Document[];
}

const DocumentCard: React.FC<{ doc: Document; onDownload?: () => void }> = ({ doc, onDownload }) => {
  const handleDownload = () => {
    if (onDownload) onDownload();
    else if (doc.url) window.open(doc.url, "_blank");
  };
  return (
    <div className="flex items-center justify-between border border-[#D1D5DB] rounded-lg p-4">
      <div className="flex items-center gap-3">
        <BsFileEarmarkBarGraph className="text-[20px]" />
        <div>
          <p className="text-[14px] font-medium text-[#20242A]">{doc.name}</p>
          <p className="text-[12px] text-[#6B7280]">{doc.size}</p>
        </div>
      </div>
      <button onClick={handleDownload} className="text-[#4B5563] hover:text-[#237D3B] cursor-pointer transition-colors">
        <DownloadOutlined style={{ fontSize: 18 }} />
      </button>
    </div>
  );
};

const Apply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applicationApiData } = useOutletContext<{ applicationApiData: any; steps: any[] }>();

  const applicationFee = applicationApiData?.invoices?.find((invoice: any) => invoice.type === "APPLICATION_FEE");

  const [isExpanded, setIsExpanded] = React.useState(true);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileSize = React.useCallback(async (url: string): Promise<string> => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      if (contentLength) return formatFileSize(parseInt(contentLength, 10));
      const blobResponse = await fetch(url);
      const blob = await blobResponse.blob();
      return formatFileSize(blob.size);
    } catch (error) {
      console.error("Error getting file size:", error);
      return "—";
    }
  }, []);

  React.useEffect(() => {
    const fetchSizes = async () => {
      const sizes: Record<string, string> = {};
      if (applicationApiData?.conditionalOfferLetter) {
        sizes.conditionalOfferLetter = await getFileSize(applicationApiData.conditionalOfferLetter);
      }
      setFileSizes(sizes);
    };
    if (applicationApiData) fetchSizes();
  }, [applicationApiData, getFileSize]);

  const generateInvoicePDF = () => {
    if (!applicationFee) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    doc.setFillColor(35, 125, 59);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth / 2, 30, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Application Fee", pageWidth / 2, 40, { align: "center" });
    yPos = 60;
    doc.setTextColor(0, 0, 0);

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, yPos, contentWidth, 15, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(35, 125, 59);
    doc.text("Invoice #", margin + 5, yPos + 10);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(String(applicationFee.id).substring(0, 20), margin + 35, yPos + 10);
    yPos += 30;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("TOTAL AMOUNT DUE", margin + 10, yPos + 10);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(35, 125, 59);
    const amountText = `${applicationFee.amount} ${applicationFee.currency}`;
    const amountWidth = doc.getTextWidth(amountText);
    doc.text(amountText, pageWidth - margin - 10 - amountWidth, yPos + 20);

    const footerY = pageHeight - 30;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated invoice. No signature required.", pageWidth / 2, footerY + 5, { align: "center" });

    doc.save(`Invoice-${String(applicationFee.id).substring(0, 12)}.pdf`);
  };

  const sections: Section[] = React.useMemo(
    () => [
      {
        id: "docs_review",
        title: "Documents Review",
        description: "Your documents are currently under review. Once the review is complete, we will forward them to the college.",
        isCompleted: !!applicationApiData?.isReviewed,
      },
      {
        id: "college_submitted",
        title: "College Submitted",
        description: "Your application has been forwarded to the college. A conditional offer letter is expected to be issued within 2-3 working days.",
        isCompleted: !!applicationApiData?.isCollageSubmitted,
      },
      {
        id: "conditional_letter",
        title: "Conditional Letter",
        description: "The conditional offer letter has arrived. You may download the attachment provided.",
        isCompleted: !!applicationApiData?.conditionalOfferLetter,
        documents: applicationApiData?.conditionalOfferLetter
          ? [{ id: "col-1", name: "Conditional Offer Letter.pdf", size: fileSizes.conditionalOfferLetter || "—", url: applicationApiData.conditionalOfferLetter }]
          : [],
      },
      {
        id: "application_fee",
        title: "Application Fee",
        description: applicationFee
          ? `Application fee invoice is available. Amount: ${applicationFee.amount} ${applicationFee.currency}. Status: ${applicationFee.status}.`
          : "Great news! You don't need to pay the application fee—it's fully waived for you as part of our special offer.",
        isCompleted: true,
        hasUpload: true,
        document: undefined,
      },
    ],
    [applicationApiData, fileSizes, applicationFee]
  );

  const isAllRequiredCompleted = sections.every((cat) => cat.isCompleted);

  return (
    <>
      <div className="border border-[#C7CACF] rounded-lg overflow-hidden">
        <div className="bg-[#E9F2EB] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-[20px] font-semibold text-[#20242A]">Apply</h3>
            <p className="text-[14px] text-[#4B5563]">We will review your documents, and once the review is complete, we will forward them to the institute.</p>
          </div>
          <div onClick={() => setIsExpanded((prev) => !prev)} className="cursor-pointer">
            {isExpanded ? <UpOutlined className="text-[#4B5563]" /> : <DownOutlined className="text-[#4B5563]" />}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 p-4">
            {sections.map((section) => {
              const isSectionExpanded = expandedSections[section.id] ?? true;
              const hasDocuments = section.document || (section.documents && section.documents.length > 0);

              return (
                <div key={section.id} className="bg-white border border-[#D1D5DB] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {section.isCompleted ? <IoCheckmarkCircleSharp size={24} className="text-[#16A34A]" /> : <FaRegCircle size={22} className="text-gray-300" />}
                      <h4 className="text-[18px] font-semibold text-[#111827]">{section.title}</h4>
                    </div>
                    {section.hasUpload && section.id === "application_fee" && applicationFee && (
                      <button onClick={() => setIsPaymentModalOpen(true)} className="border border-[#237D3B] text-[#237D3B] rounded-md cursor-pointer p-2 hover:bg-[#F0FDF4] transition">
                        <BiExport size={18} />
                      </button>
                    )}
                  </div>

                  <p className="text-[14px] text-[#4B5563] mb-2 leading-relaxed">{section.description}</p>

                  {hasDocuments && (
                    <div className="flex justify-end mb-3">
                      <button onClick={() => toggleSection(section.id)} className="flex items-center gap-1 cursor-pointer text-[#237D3B] font-medium text-[14px]">
                        {isSectionExpanded ? "Read less" : "Read more"}
                        {isSectionExpanded ? <UpOutlined /> : <DownOutlined />}
                      </button>
                    </div>
                  )}

                  {isSectionExpanded && hasDocuments && (
                    <div>
                      <p className="text-[16px] font-semibold text-[#111827] mb-3">Attached Documents:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {section.document && (
                          <DocumentCard doc={section.document} onDownload={section.id === "application_fee" ? generateInvoicePDF : undefined} />
                        )}
                        {section.documents?.map((doc) => (
                          <DocumentCard key={doc.id} doc={doc} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button onClick={() => navigate(`/applications/${id}/admission`)} className="px-6 py-2 cursor-pointer border border-[#D1D5DB] rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50 transition">
          Previous
        </button>
        <div className={!isAllRequiredCompleted ? "cursor-not-allowed" : ""}>
          <PrimaryButton
            text="Next"
            disabled={!isAllRequiredCompleted}
            className={`${!isAllRequiredCompleted ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => navigate(`/applications/${id}/checklist`)}
          />
        </div>
      </div>

      {applicationFee && (
        <PaymentReceiptModal open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} invoice={applicationFee} />
      )}
    </>
  );
};

export default Apply;
