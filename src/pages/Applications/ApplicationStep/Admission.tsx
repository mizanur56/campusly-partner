import React from "react";
import { DownOutlined, UpOutlined, DownloadOutlined } from "@ant-design/icons";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { BiExport } from "react-icons/bi";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PrimaryButton from "../../../components/common/Button/PrimaryButton";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";
import { config } from "../../../config";
import { useApplicationDocumentUploadMutation } from "../../../redux/features/application/applicationApi";
import { toast } from "react-toastify";
import { Modal, Select, Upload, Button } from "antd";
import { UploadOutlined, CloseOutlined } from "@ant-design/icons";
import { useUpdateEducationMutation } from "../../../redux/features/educations/educationsHistoryApi";

interface Document {
  id: string;
  name: string;
  size: string;
  url?: string;
}

interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  documents: Document[];
}

const Admission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applicationApiData } = useOutletContext<{
    applicationApiData: any;
    steps: any[];
  }>();

  const educationData = applicationApiData?.student?.educations || [];

  const [createMedia] = useCreateMediaMutation();
  const [uploadDocument] = useApplicationDocumentUploadMutation();
  const [updateEducation] = useUpdateEducationMutation();

  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isQualificationModalOpen, setIsQualificationModalOpen] = React.useState(false);
  const [selectedEducationId, setSelectedEducationId] = React.useState<string | null>(null);
  const [marksheetFile, setMarksheetFile] = React.useState<File | null>(null);
  const [certificateFile, setCertificateFile] = React.useState<File | null>(null);
  const [isUploadingQualification, setIsUploadingQualification] = React.useState(false);
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({});
  const [uploadingCategoryId, setUploadingCategoryId] = React.useState<string | null>(null);

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
      if (contentLength) {
        const bytes = parseInt(contentLength, 10);
        return formatFileSize(bytes);
      }
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
      if (applicationApiData?.passportFile) {
        sizes.passportFile = await getFileSize(applicationApiData.passportFile);
      }
      if (applicationApiData?.student?.cv) {
        sizes.cv = await getFileSize(applicationApiData.student.cv);
      }
      if (applicationApiData?.student?.motivationLetter) {
        sizes.motivationLetter = await getFileSize(applicationApiData.student.motivationLetter);
      }
      setFileSizes((prev) => ({ ...prev, ...sizes }));
    };
    if (applicationApiData) fetchSizes();
  }, [applicationApiData, getFileSize]);

  React.useEffect(() => {
    if (!educationData || !Array.isArray(educationData)) return;
    const fetchQualificationSizes = async () => {
      const sizes: Record<string, string> = {};
      for (const education of educationData) {
        if (education?.certificate) {
          sizes[`${education.id}-certificate`] = await getFileSize(education.certificate);
        }
        if (education?.marksheet) {
          sizes[`${education.id}-marksheet`] = await getFileSize(education.marksheet);
        }
      }
      setFileSizes((prev) => ({ ...prev, ...sizes }));
    };
    fetchQualificationSizes();
  }, [educationData, getFileSize]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const qualificationDocuments = React.useMemo(() => {
    if (!educationData || !Array.isArray(educationData)) return [];
    const documents: Document[] = [];
    educationData.forEach((education: any) => {
      const fullDescription = education?.studyLevel?.description || "Unknown Level";
      const levelName = fullDescription.split("(")[0].trim() || fullDescription.split(":")[0].trim() || fullDescription;
      if (education?.certificate) {
        documents.push({
          id: `${education.id}-certificate`,
          name: `${levelName} Certificate`,
          size: fileSizes[`${education.id}-certificate`] || "—",
          url: education.certificate,
        });
      }
      if (education?.marksheet) {
        documents.push({
          id: `${education.id}-marksheet`,
          name: `${levelName} Marksheet`,
          size: fileSizes[`${education.id}-marksheet`] || "—",
          url: education.marksheet,
        });
      }
    });
    return documents;
  }, [educationData, fileSizes]);

  const educationLevelsWithoutDocuments = React.useMemo(() => {
    if (!educationData || !Array.isArray(educationData)) return [];
    return educationData
      .filter((education: any) => !education?.marksheet || !education?.certificate)
      .map((education: any) => {
        const fullDescription = education?.studyLevel?.description || "Unknown Level";
        const levelName = fullDescription.split("(")[0].trim() || fullDescription.split(":")[0].trim() || fullDescription;
        return {
          id: education.id,
          label: `${levelName}${education?.instituteName ? ` - ${education.instituteName}` : ""}`,
        };
      });
  }, [educationData]);

  const documentCategories: DocumentCategory[] = React.useMemo(
    () => [
      {
        id: "registration",
        title: "Registration Form",
        description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
        isRequired: true,
        isCompleted: true,
        documents: [
          { id: "1", name: "Registration Form.pdf", size: "2.3 MB" },
          { id: "2", name: "Sample.pdf", size: "1.1 MB" },
        ],
      },
      {
        id: "passportFile",
        title: "Passport",
        description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
        isRequired: true,
        isCompleted: !!applicationApiData?.passportFile,
        documents: applicationApiData?.passportFile
          ? [{ id: "pf-1", name: "Passport.pdf", size: fileSizes.passportFile || "—", url: applicationApiData?.passportFile }]
          : [],
      },
      {
        id: "qualifications",
        title: "Qualifications",
        description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
        isRequired: true,
        isCompleted: true,
        documents: qualificationDocuments,
      },
      {
        id: "cv",
        title: "CV",
        description: "Curriculum Vitae of the student",
        isRequired: true,
        isCompleted: !!applicationApiData?.student?.cv,
        documents: applicationApiData?.student?.cv
          ? [{ id: "cv-1", name: "CV.pdf", size: fileSizes.cv || "—", url: applicationApiData?.student?.cv }]
          : [],
      },
      {
        id: "motivation-letter",
        title: "Motivational Letter",
        description: "Student motivation letter",
        isRequired: true,
        isCompleted: !!applicationApiData?.student?.motivationLetter,
        documents: applicationApiData?.student?.motivationLetter
          ? [{ id: "ml-1", name: "Motivation Letter.pdf", size: fileSizes.motivationLetter || "—", url: applicationApiData?.student?.motivationLetter }]
          : [],
      },
    ],
    [qualificationDocuments, applicationApiData, fileSizes]
  );

  const handleFileUpload = async (categoryId: string, file: File) => {
    setUploadingCategoryId(categoryId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "document");
      const response = await createMedia(formData).unwrap();
      const documentUrl = `${config.image_access_url}${response.data.url}`;
      const fieldName = categoryId === "motivation-letter" ? "motivationLetter" : categoryId;
      const payload = { id: applicationApiData.id, [fieldName]: documentUrl };
      await uploadDocument(payload).unwrap();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");
    } finally {
      setUploadingCategoryId(null);
    }
  };

  const triggerFileInput = (categoryId: string) => {
    if (categoryId === "qualifications") {
      setIsQualificationModalOpen(true);
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.png";
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        handleFileUpload(categoryId, input.files[0]);
      }
    };
    input.click();
  };

  const handleQualificationUpload = async () => {
    if (!selectedEducationId) {
      toast.error("Please select an education level");
      return;
    }
    if (!marksheetFile && !certificateFile) {
      toast.error("Please upload at least one document (marksheet or certificate)");
      return;
    }
    setIsUploadingQualification(true);
    try {
      const updatePayload: any = { id: selectedEducationId };
      if (marksheetFile) {
        const marksheetFormData = new FormData();
        marksheetFormData.append("file", marksheetFile);
        marksheetFormData.append("category", "marksheet");
        const marksheetResponse = await createMedia(marksheetFormData).unwrap();
        updatePayload.marksheet = `${config.image_access_url}${marksheetResponse.data.url}`;
      }
      if (certificateFile) {
        const certificateFormData = new FormData();
        certificateFormData.append("file", certificateFile);
        certificateFormData.append("category", "certificate");
        const certificateResponse = await createMedia(certificateFormData).unwrap();
        updatePayload.certificate = `${config.image_access_url}${certificateResponse.data.url}`;
      }
      const res = await updateEducation(updatePayload).unwrap();
      if (res.success) {
        toast.success("Documents uploaded successfully!");
        setIsQualificationModalOpen(false);
        setSelectedEducationId(null);
        setMarksheetFile(null);
        setCertificateFile(null);
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(err?.data?.message || "Failed to upload documents. Please try again.");
    } finally {
      setIsUploadingQualification(false);
    }
  };

  const handleCloseQualificationModal = () => {
    setIsQualificationModalOpen(false);
    setSelectedEducationId(null);
    setMarksheetFile(null);
    setCertificateFile(null);
  };

  const isAllRequiredCompleted = documentCategories.every((cat) => cat.isCompleted);

  return (
    <>
      <div className="border border-[#C7CACF] rounded-lg overflow-hidden">
        <div className="bg-[#E9F2EB] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-[20px] font-semibold text-[#20242A]">Admission</h3>
            <p className="text-[14px] text-[#4B5563]">Kindly upload the documents as per the checklist requirements.</p>
          </div>
          <div onClick={() => setIsExpanded((prev) => !prev)} className="cursor-pointer">
            {isExpanded ? <UpOutlined className="text-[#4B5563]" /> : <DownOutlined className="text-[#4B5563]" />}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 m-4">
            {documentCategories.map((category) => {
              const isCategoryExpanded = expandedCategories[category.id] ?? true;
              return (
                <div key={category.id} className="bg-white border border-[#D1D5DB] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {category.isCompleted ? (
                        <IoCheckmarkCircleSharp size={24} className="text-[#16A34A]" />
                      ) : (
                        <FaRegCircle size={22} />
                      )}
                      <h4 className="text-[18px] font-semibold text-[#111827]">{category.title}</h4>
                    </div>
                    <button
                      disabled={uploadingCategoryId === category.id || (category.id === "qualifications" && isUploadingQualification)}
                      onClick={() => triggerFileInput(category.id)}
                      className="border border-[#237D3B] text-[#237D3B] rounded-md cursor-pointer p-2 hover:bg-[#F0FDF4] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingCategoryId === category.id || (category.id === "qualifications" && isUploadingQualification) ? (
                        <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full"></div>
                      ) : (
                        <BiExport size={18} />
                      )}
                    </button>
                  </div>

                  <p className="text-[14px] text-[#4B5563] mb-2 leading-relaxed">{category.description}</p>
                  <div className="flex items-center justify-end">
                    <button onClick={() => toggleCategory(category.id)} className="flex items-center gap-1 cursor-pointer text-[#237D3B] text-[14px] font-medium">
                      {isCategoryExpanded ? "Read less" : "Read more"}
                      {isCategoryExpanded ? <UpOutlined /> : <DownOutlined />}
                    </button>
                  </div>

                  {isCategoryExpanded && category.documents.length > 0 && (
                    <div>
                      <p className="text-[16px] font-semibold text-[#111827] mb-3">Attached Documents:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {category.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between border border-[#D1D5DB] rounded-lg p-4">
                            <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => doc.url && window.open(doc.url, "_blank")}>
                              <BsFileEarmarkBarGraph />
                              <div>
                                <p className="text-[14px] font-medium text-[#20242A] hover:text-[#237D3B]">{doc.name}</p>
                                <p className="text-[12px] text-[#6B7280]">{doc.size}</p>
                              </div>
                            </div>
                            {doc.url && (
                              <button onClick={(e) => { e.stopPropagation(); window.open(doc.url, "_blank"); }} className="text-[#4B5563] cursor-pointer hover:text-[#237D3B]">
                                <DownloadOutlined style={{ fontSize: 20 }} />
                              </button>
                            )}
                          </div>
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
        <button onClick={() => navigate("/applications")} className="px-6 py-2 cursor-pointer border border-[#D1D5DB] rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50">
          Back
        </button>
        <div className={!isAllRequiredCompleted ? "cursor-not-allowed" : ""}>
          <PrimaryButton
            text="Next"
            disabled={!isAllRequiredCompleted}
            className={`${!isAllRequiredCompleted ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => navigate(`/applications/${id}/apply`)}
          />
        </div>
      </div>

      <Modal
        open={isQualificationModalOpen}
        onCancel={handleCloseQualificationModal}
        footer={null}
        centered
        width={600}
        closable={false}
        className="qualification-upload-modal"
        styles={{ content: { padding: "24px", borderRadius: "12px" } }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#20242A]">Upload Qualification Documents</h2>
            <button onClick={handleCloseQualificationModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <CloseOutlined className="text-gray-500" />
            </button>
          </div>
          <div className="space-y-4">
            <label className="text-[14px] font-medium text-[#111827]">
              Select Education Level <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Select an education level"
              value={selectedEducationId}
              onChange={(value) => setSelectedEducationId(value)}
              className="w-full"
              size="large"
              options={educationLevelsWithoutDocuments.map((item) => ({ value: item.id, label: item.label }))}
            />
            {educationLevelsWithoutDocuments.length === 0 && (
              <p className="text-[12px] text-[#6B7280]">All education levels already have documents uploaded.</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-[#111827]">Marksheet</label>
            <Upload beforeUpload={(file) => { setMarksheetFile(file); return false; }} onRemove={() => setMarksheetFile(null)} maxCount={1} accept=".pdf,.doc,.docx,.jpg,.png">
              <Button icon={<UploadOutlined />} className="w-full" size="large">
                {marksheetFile ? marksheetFile.name : "Click to upload marksheet"}
              </Button>
            </Upload>
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-[#111827]">Certificate</label>
            <Upload beforeUpload={(file) => { setCertificateFile(file); return false; }} onRemove={() => setCertificateFile(null)} maxCount={1} accept=".pdf,.doc,.docx,.jpg,.png">
              <Button icon={<UploadOutlined />} className="w-full" size="large">
                {certificateFile ? certificateFile.name : "Click to upload certificate"}
              </Button>
            </Upload>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={handleCloseQualificationModal} disabled={isUploadingQualification} size="large">
              Cancel
            </Button>
            <PrimaryButton
              text={isUploadingQualification ? "Uploading..." : "Upload"}
              disabled={isUploadingQualification || !selectedEducationId || (!marksheetFile && !certificateFile)}
              onClick={handleQualificationUpload}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Admission;
