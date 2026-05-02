/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownloadOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import React from "react";
import { BiExport } from "react-icons/bi";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import PrimaryButton from "../../../components/common/Button/PrimaryButton";

import { CloseOutlined } from "@ant-design/icons";
import { Modal, Select } from "antd";
import { config } from "../../../config";
import { useApplicationDocumentUploadMutation } from "../../../redux/features/application/applicationApi";

import { FaPlusSquare } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import ModalContent from "../../../components/applicationStep/ModalContent";
import { useGetCountriesQuery } from "../../../redux/features/countries/countriesApi";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";
import {
  useGetEligibleStudyLevelsByCountryQuery,
  useGetStudentProfileQuery,
  useUpdateEducationMutation,
} from "../../../redux/features/profile/studentProfileApi";

/* ================= Types ================= */
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

interface QualificationDocumentItem {
  id: string;
  name: string;
  status: "pending" | "submitted";
  category: string;
}

interface QualificationDocumentGroup {
  label: string;
  studyLevelId: string;
  educationData?: any;
  items: QualificationDocumentItem[];
}

export type AdmissionStepProps = {
  applicationApiData: any;
  steps: any[];
  embedded?: boolean;
  autoOpen?: boolean;
  /** When false in embedded mode, the panel cannot be expanded until the previous stage is completed. */
  stageUnlocked?: boolean;
};

/* ================= Component ================= */
export const AdmissionStep: React.FC<AdmissionStepProps> = ({
  applicationApiData,
  steps,
  embedded = false,
  autoOpen = false,
  stageUnlocked = true,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const studentId = applicationApiData?.studentId;

  const { data: profileApiData, refetch: refetchProfile } =
    useGetStudentProfileQuery(studentId!);
  const studentProfile = profileApiData as any;
  const educationData = studentProfile?.educations;
  const hasQualificationDocs = Array.isArray(educationData)
    ? educationData.some((edu: any) =>
        Boolean(edu?.marksheet || edu?.certificate),
      )
    : false;

  const { data: countries } = useGetCountriesQuery({ page: 1, limit: 1000 });

  const selectedCountryId = React.useMemo(() => {
    const profileCountryName =
      studentProfile?.data?.country || studentProfile?.country;
    const countryList = countries?.data;
    if (!profileCountryName || !countryList) return null;
    const matchedCountry = countryList.find(
      (c: any) =>
        c.name.trim().toLowerCase() === profileCountryName.trim().toLowerCase(),
    );
    return matchedCountry ? matchedCountry.id : null;
  }, [studentProfile, countries]);

  const userId = applicationApiData?.student?.userId;

  const { data: studyLevelsRes } = useGetEligibleStudyLevelsByCountryQuery(
    {
      countryId: selectedCountryId,
      studentId: userId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !selectedCountryId || !studentId,
    },
  );
  const studyLevelData = studyLevelsRes?.data || [];

  const [createMedia, { isLoading: isCreatingMedia }] =
    useCreateMediaMutation();
  const [uploadDocument] = useApplicationDocumentUploadMutation();
  const [updateEducation, { isLoading: isUpdatingEducation }] =
    useUpdateEducationMutation();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isQualificationModalOpen, setIsQualificationModalOpen] =
    React.useState(false);
  const [
    selectedQualificationStudyLevelId,
    setSelectedQualificationStudyLevelId,
  ] = React.useState<string | null>(null);
  const [activeQualificationField, setActiveQualificationField] =
    React.useState<"marksheet" | "certificate" | null>(null);
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});

  const downloadDocument = React.useCallback(
    async (url: string, name?: string) => {
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
        // Fallback: open in a new tab if browser blocks download
        try {
          window.open(url, "_blank");
        } catch {
          // ignore
        }
      }
    },
    [],
  );

  const getFileSize = React.useCallback(
    async (url: string): Promise<string> => {
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
    },
    [],
  );
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

      // Registration Form (submitted)
      if (applicationApiData?.registrationForm) {
        sizes.registrationForm = await getFileSize(
          `${config.image_access_url}${applicationApiData.registrationForm}`,
        );
      }

      if (applicationApiData?.passportFile) {
        sizes.passportFile = await getFileSize(applicationApiData.passportFile);
      }

      // CV
      if (applicationApiData?.student?.cv) {
        sizes.cv = await getFileSize(applicationApiData.student.cv);
      }

      // Motivation Letter
      if (applicationApiData?.student?.motivationLetter) {
        sizes.motivationLetter = await getFileSize(
          applicationApiData.student.motivationLetter,
        );
      }

      setFileSizes((prev) => ({ ...prev, ...sizes }));
    };

    if (applicationApiData) {
      fetchSizes();
    }
  }, [applicationApiData, getFileSize]);

  /* ================= Fetch Qualification Document Sizes ================= */
  React.useEffect(() => {
    if (!educationData || !Array.isArray(educationData)) return;

    const fetchQualificationSizes = async () => {
      const sizes: Record<string, string> = {};

      for (const education of educationData) {
        if (education?.certificate) {
          const size = await getFileSize(education.certificate);
          sizes[`${education.id}-certificate`] = size;
        }
        if (education?.marksheet) {
          const size = await getFileSize(education.marksheet);
          sizes[`${education.id}-marksheet`] = size;
        }
      }

      setFileSizes((prev) => ({ ...prev, ...sizes }));
    };

    fetchQualificationSizes();
  }, [educationData, getFileSize]);

  // 🔥 category wise expand state
  const [expandedCategories, setExpandedCategories] = React.useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // categoryId track korar jonno state
  const [uploadingCategoryId, setUploadingCategoryId] = React.useState<
    string | null
  >(null);

  /* ================= Generate Qualification Documents ================= */
  const qualificationDocuments = React.useMemo(() => {
    if (!educationData || !Array.isArray(educationData)) return [];

    const documents: Document[] = [];

    educationData.forEach((education: any) => {
      // Split description and get shorter version (before parenthesis or first part)
      const fullDescription =
        education?.countryStudyLevelName || "Unknown Level";
      const levelName =
        fullDescription.split("(")[0].trim() ||
        fullDescription.split(":")[0].trim() ||
        fullDescription;

      // Add certificate if exists
      if (education?.certificate) {
        documents.push({
          id: `${education.id}-certificate`,
          name: `${levelName} Certificate`,
          size: fileSizes[`${education.id}-certificate`] || "—",
          url: education.certificate,
        });
      }

      // Add marksheet if exists
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

  /* ================= Academic groups (same as Profile UploadDocuments) ================= */
  const academicGroups: QualificationDocumentGroup[] = React.useMemo(() => {
    return studyLevelData.map((level: any) => {
      const edu = studentProfile?.educations?.find(
        (e: any) => e.studyLevelId === level.id,
      );
      return {
        label: level.countryStudyLevelName,
        studyLevelId: level.id,
        educationData: edu,
        items: [
          {
            id: `${level.id}_marksheet`,
            name: "Marksheet",
            status: edu?.marksheet ? "submitted" : "pending",
            category: "marksheet",
          },
          {
            id: `${level.id}_certificate`,
            name: "Certificate",
            status: edu?.certificate ? "submitted" : "pending",
            category: "certificate",
          },
        ],
      };
    });
  }, [studyLevelData, studentProfile]);

  /* ================= Dummy Data ================= */
  const documentCategories: DocumentCategory[] = React.useMemo(
    () => [
      {
        id: "registrationForm",
        title: "Registration Form",
        description:
          "Please download the sample form, fill it out, and upload the scanned copy here.",
        isRequired: true,
        isCompleted: !!applicationApiData?.registrationForm,
        documents: [
          {
            id: "sample-reg",
            name: "Campus_Transfer_Sample.pdf",
            size: "Sample",
            url: "/registration.pdf",
          },

          ...(applicationApiData?.registrationForm
            ? [
                {
                  id: "registrationForm",
                  name: "Submitted_Registration_Form.pdf",
                  size: fileSizes.registrationForm || "—",
                  url: `${config.image_access_url}${applicationApiData.registrationForm}`,
                },
              ]
            : []),
        ],
      },
      {
        id: "passportFile",
        title: "Passport",
        description:
          "Upload a clear copy of the student’s passport biodata page (and any relevant pages).",
        isRequired: true,

        isCompleted: !!applicationApiData?.passportFile,
        documents: applicationApiData?.passportFile
          ? [
              {
                id: "pf-1",
                name: "Passport.pdf",
                size: fileSizes.passportFile || "—",
                url: `${config.image_access_url}${applicationApiData?.passportFile}`,
              },
            ]
          : [],
      },
      {
        id: "qualifications",
        title: "Qualifications",
        description:
          "Upload qualification documents for each education level (marksheet and certificate).",
        isRequired: true,
        isCompleted: hasQualificationDocs,
        documents: qualificationDocuments,
      },
      {
        id: "cv",
        title: "CV",
        description: "Upload the student’s most recent CV / resume.",
        isRequired: true,
        isCompleted: !!applicationApiData?.student?.cv,
        documents: applicationApiData?.student?.cv
          ? [
              {
                id: "cv-1",
                name: "CV.pdf",
                size: fileSizes.cv || "—",
                url: `${config.image_access_url}${applicationApiData?.student?.cv}`,
              },
            ]
          : [],
      },
      {
        id: "motivation-letter",
        title: "Motivational Letter",
        description:
          "Upload the student’s motivation letter explaining study goals and reasons for choosing this program.",
        isRequired: true,
        isCompleted: !!applicationApiData?.student?.motivationLetter,
        documents: applicationApiData?.student?.motivationLetter
          ? [
              {
                id: "ml-1",
                name: "Motivation Letter.pdf",
                size: fileSizes.motivationLetter || "—",
                url: `${config.image_access_url}${applicationApiData?.student?.motivationLetter}`,
              },
            ]
          : [],
      },
    ],
    [
      qualificationDocuments,
      applicationApiData,
      fileSizes,
      hasQualificationDocs,
    ],
  );

  /** ================= Upload Handler ================= */
  const handleFileUpload = async (categoryId: string, file: File) => {
    setUploadingCategoryId(categoryId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "document");
      const response = await createMedia(formData).unwrap();
      const documentUrl = response.data.url;

      const fieldName =
        categoryId === "motivation-letter" ? "motivationLetter" : categoryId;

      const payload = {
        id: applicationApiData.id,
        [fieldName]: documentUrl, // এখানে [] ব্র্যাকেট দিয়ে ডাইনামিক কি (key) সেট করা হয়েছে
      };
      await uploadDocument(payload).unwrap();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingCategoryId(null);
    }
  };

  /** ================= Trigger File Manager ================= */
  const triggerFileInput = (categoryId: string) => {
    // Special handling for qualifications - open modal
    if (categoryId === "qualifications") {
      setIsQualificationModalOpen(true);
      return;
    }

    // For other categories, use the normal file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.png"; // allowed file types
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        handleFileUpload(categoryId, input.files[0]);
      }
    };
    input.click();
  };

  /** ================= Close Qualification Modal ================= */
  const handleCloseQualificationModal = () => {
    setIsQualificationModalOpen(false);
    setSelectedQualificationStudyLevelId(null);
    setActiveQualificationField(null);
  };

  const isAllRequiredCompleted = documentCategories.every(
    (cat) => cat.isCompleted,
  );

  const [userToggledExpand, setUserToggledExpand] = React.useState(false);

  React.useEffect(() => {
    if (!embedded) return;
    if (userToggledExpand) return;
    // Embedded view: keep in sync until user toggles manually.
    // Default collapsed; only the first incomplete stage auto-opens.
    setIsExpanded(Boolean(autoOpen) && !isAllRequiredCompleted);
  }, [autoOpen, embedded, isAllRequiredCompleted, userToggledExpand]);

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
    ? "border border-primary-border rounded-2xl overflow-hidden bg-[#F4F6F5]"
    : "border border-primary-border rounded-2xl overflow-hidden";
  const stageHeaderClass = stageLockedVisual
    ? "bg-[#EEF2EF]"
    : "bg-[#DFF2E6] border-[#237D3B] border rounded-2xl";

  return (
    <>
      {/* ================= Admission Card ================= */}
      <div className={stageCardClass}>
        {/* ===== Header ===== */}
        <div
          className={`${stageHeaderClass} p-6 flex items-center justify-between`}
          onClick={() => {
            if (embedded && !stageUnlocked && !isExpanded) return;
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
              Stage: 1 Admission
            </h3>
            <p
              className={`text-[14px] ${
                isAllRequiredCompleted ? "text-primary" : "text-[#4B5563]"
              }`}
            >
              Kindly upload the documents as per the admission requirements.
            </p>
          </div>

          <div
            title={
              embedded && !stageUnlocked
                ? "Complete the previous stage first"
                : undefined
            }
            className={expandToggleClass}
          >
            {isExpanded ? (
              <UpOutlined className="text-[#4B5563]" />
            ) : (
              <DownOutlined className="text-[#4B5563]" />
            )}
          </div>
        </div>

        {/* ===== Body ===== */}
        {isExpanded && (
          <div className="space-y-4 m-4">
            {documentCategories.map((category) => {
              const isCategoryExpanded =
                expandedCategories[category.id] ?? false;

              return (
                <div
                  key={category.id}
                  className="bg-white border border-primary-border rounded-xl p-6"
                >
                  {/* ===== Category Header ===== */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {category.isCompleted ? (
                        <IoCheckmarkCircleSharp
                          size={26}
                          className="text-[#16A34A]"
                        />
                      ) : (
                        <FaRegCircle size={22} />
                      )}

                      <h4 className="text-[18px] font-semibold text-[#111827]">
                        {category.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        disabled={uploadingCategoryId === category.id}
                        onClick={() => triggerFileInput(category.id)}
                        className="border border-[#237D3B] text-[#237D3B] rounded-md cursor-pointer p-2 hover:bg-[#F0FDF4] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingCategoryId === category.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full"></div>
                        ) : (
                          <BiExport size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ===== Expandable Content ===== */}

                  <>
                    <p className="text-[14px] text-[#4B5563] mb-2 leading-relaxed">
                      {category.description}
                    </p>

                    {/* <div className="flex items-center justify-end">
                      {/* Read more */}

                    {/* <button
                        onClick={() => toggleCategory(category.id)}
                        className="flex items-center gap-1 cursor-pointer text-[#237D3B] text-[14px] font-medium"
                      >
                        {isCategoryExpanded ? "Read less" : "Read more"}
                        {isCategoryExpanded ? <UpOutlined /> : <DownOutlined />}
                      </button>
                    </div> */}

                    {category.documents.length > 0 && (
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="flex items-center gap-1 cursor-pointer text-[#237D3B] text-[14px] font-medium"
                        >
                          {isCategoryExpanded ? "Read less" : "Read more"}
                          {isCategoryExpanded ? (
                            <UpOutlined />
                          ) : (
                            <DownOutlined />
                          )}
                        </button>
                      </div>
                    )}

                    {isCategoryExpanded && (
                      <>
                        {category.documents.length > 0 && (
                          <div>
                            <p className="text-[16px] font-semibold text-[#111827] mb-3">
                              Attached Documents:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                              {category.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between border border-primary-border rounded-lg p-4"
                                >
                                  <div
                                    className="flex items-center gap-2 flex-1 cursor-pointer"
                                    onClick={() =>
                                      doc.url && window.open(doc.url, "_blank")
                                    }
                                  >
                                    <BsFileEarmarkBarGraph />

                                    <div>
                                      <p className="text-[14px] font-medium text-[#20242A] hover:text-[#237D3B]">
                                        {doc.name.length > 18
                                          ? `${doc.name.slice(0, 18)}...`
                                          : doc.name}
                                      </p>
                                      <p className="text-[12px] text-[#6B7280]">
                                        {doc.size}
                                      </p>
                                    </div>
                                  </div>

                                  {doc.url && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadDocument(
                                          doc.url ?? "",
                                          doc.name,
                                        );
                                      }}
                                      className="text-[#4B5563] cursor-pointer hover:text-[#237D3B]"
                                    >
                                      <DownloadOutlined
                                        style={{ fontSize: 20 }}
                                      />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= Footer ================= */}
      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/applications`)}
            className="px-6 py-2 cursor-pointer border border-primary-border rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50"
          >
            Back
          </button>

          <PrimaryButton
            text="Next"
            onClick={() => {
              // Check if application is reviewed first
              navigate(`/applications/${id}/apply`);
            }}
          />
        </div>
      )}

      {/* ================= Qualifications — same as Profile UploadDocuments + ModalContent ================= */}
      <Modal
        open={isQualificationModalOpen}
        onCancel={handleCloseQualificationModal}
        footer={null}
        centered
        width={activeQualificationField ? 800 : 600}
        closable={false}
        destroyOnClose
        className="qualification-upload-modal"
        styles={{
          content: {
            padding: "24px",
            borderRadius: "12px",
          },
        }}
      >
        {!activeQualificationField ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#20242A]">
                Upload Qualification Documents
              </h2>
              <button
                type="button"
                onClick={handleCloseQualificationModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <CloseOutlined className="text-gray-500" />
              </button>
            </div>

            <p className="text-[14px] text-[#4B5563]">
              Select an education level, then upload marksheet and certificate
              using the same form as on your profile (academic details + files).
            </p>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#111827]">
                Select education level
              </label>
              <Select
                placeholder="Select an education level"
                allowClear
                value={selectedQualificationStudyLevelId ?? undefined}
                onChange={(value) => {
                  setSelectedQualificationStudyLevelId(value ?? null);
                }}
                className="w-full"
                size="large"
                options={academicGroups.map((g) => ({
                  value: g.studyLevelId,
                  label: g.label,
                }))}
              />
              {academicGroups.length === 0 && (
                <p className="text-[12px] text-[#6B7280]">
                  No eligible study levels found for your profile country. Add
                  or update your country in profile, then try again.
                </p>
              )}
            </div>

            {selectedQualificationStudyLevelId &&
              (() => {
                const group = academicGroups.find(
                  (g) => g.studyLevelId === selectedQualificationStudyLevelId,
                );
                if (!group) return null;
                return (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-600 mb-3 uppercase text-xs tracking-wider">
                      {group.label}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 border flex justify-between items-center rounded-md hover:bg-gray-50 transition-colors border-primary-border"
                        >
                          <div className="flex flex-col">
                            <span className="text-gray-700 font-medium">
                              {item.name}
                            </span>
                            {item.status === "submitted" && (
                              <span className="text-[#237D3B] text-[14px]">
                                Submitted
                              </span>
                            )}
                          </div>
                          {item.status === "submitted" ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="border border-primary-border cursor-pointer p-1 flex items-center hover:border-[#237D3B] hover:text-[#237D3B] rounded-lg text-[#237D3B]"
                                onClick={() =>
                                  setActiveQualificationField(
                                    item.category as
                                      | "marksheet"
                                      | "certificate",
                                  )
                                }
                              >
                                <FiEdit className="text-xl" />
                              </button>
                              <FaCircleCheck className="text-green-500 text-xl" />
                            </div>
                          ) : (
                            <FaPlusSquare
                              className="text-[#237D3B] text-xl cursor-pointer hover:scale-110 transition-transform"
                              onClick={() =>
                                setActiveQualificationField(
                                  item.category as "marksheet" | "certificate",
                                )
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveQualificationField(null)}
                className="text-[14px] font-medium text-[#237D3B] hover:underline"
              >
                ← Back to education list
              </button>
              <button
                type="button"
                onClick={handleCloseQualificationModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <CloseOutlined className="text-gray-500" />
              </button>
            </div>
            {selectedQualificationStudyLevelId && studentProfile && (
              <ModalContent
                selectedStudyLevelId={selectedQualificationStudyLevelId}
                profileData={studentProfile}
                refetch={refetchProfile}
                createMedia={createMedia}
                updateEducation={updateEducation}
                isCreatingMedia={isCreatingMedia}
                isUpdatingEducation={isUpdatingEducation}
                activeField={activeQualificationField}
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

const Admission: React.FC = () => {
  const { applicationApiData, steps } = useOutletContext<{
    applicationApiData: any;
    steps: any[];
  }>();
  return (
    <AdmissionStep applicationApiData={applicationApiData} steps={steps} />
  );
};

export default Admission;
