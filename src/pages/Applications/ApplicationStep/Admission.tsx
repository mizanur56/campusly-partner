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
  steps?: any[];
  embedded?: boolean;
  autoOpen?: boolean;
  stageUnlocked?: boolean;
};

import Collapsible from "../../../components/common/Shared/Collapsible";

/* ================= Component ================= */
export const AdmissionStep: React.FC<AdmissionStepProps> = ({
  applicationApiData,
  embedded = false,
  autoOpen = false,
  stageUnlocked = true,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const studentId = applicationApiData?.studentId;

  const { data: profileApiData, refetch: refetchProfile } =
    useGetStudentProfileQuery(studentId!, { skip: !studentId });
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
    const matched = countryList.find(
      (c: any) =>
        c.name.trim().toLowerCase() === profileCountryName.trim().toLowerCase(),
    );
    return matched?.id ?? null;
  }, [studentProfile, countries]);

  const userId = applicationApiData?.student?.userId;

  const { data: studyLevelsRes } = useGetEligibleStudyLevelsByCountryQuery(
    { countryId: selectedCountryId, studentId: userId },
    {
      refetchOnMountOrArgChange: true,
      skip: !selectedCountryId || !studentId,
    },
  );
  const studyLevelData = studyLevelsRes?.data ?? [];

  const [createMedia, { isLoading: isCreatingMedia }] = useCreateMediaMutation();
  const [uploadDocument] = useApplicationDocumentUploadMutation();
  const [updateEducation, { isLoading: isUpdatingEducation }] =
    useUpdateEducationMutation();

  const [isExpanded, setIsExpanded] = React.useState(true);
  const [userToggledExpand, setUserToggledExpand] = React.useState(false);
  const [isQualificationModalOpen, setIsQualificationModalOpen] =
    React.useState(false);
  const [selectedQualificationStudyLevelId, setSelectedQualificationStudyLevelId] =
    React.useState<string | null>(null);
  const [activeQualificationField, setActiveQualificationField] =
    React.useState<"marksheet" | "certificate" | null>(null);
  const [fileSizes, setFileSizes] = React.useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = React.useState<
    Record<string, boolean>
  >({});
  const [uploadingCategoryId, setUploadingCategoryId] = React.useState<
    string | null
  >(null);
  // Immediately reflects uploaded URLs in the UI without waiting for parent refetch
  const [localUploads, setLocalUploads] = React.useState<Record<string, string>>({});

  /* ================= Helpers ================= */
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

  const downloadDocument = React.useCallback(
    async (url: string, name?: string) => {
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
        try { window.open(url, "_blank"); } catch { /* ignore */ }
      }
    },
    [],
  );

  /* ================= Fetch File Sizes ================= */
  React.useEffect(() => {
    if (!applicationApiData) return;
    const fetchSizes = async () => {
      const sizes: Record<string, string> = {};
      if (applicationApiData.registrationForm)
        sizes.registrationForm = await getFileSize(
          `${config.image_access_url}${applicationApiData.registrationForm}`,
        );
      if (applicationApiData.passportFile)
        sizes.passportFile = await getFileSize(applicationApiData.passportFile);
      if (applicationApiData.student?.cv)
        sizes.cv = await getFileSize(applicationApiData.student.cv);
      if (applicationApiData.student?.motivationLetter)
        sizes.motivationLetter = await getFileSize(
          applicationApiData.student.motivationLetter,
        );
      setFileSizes((prev) => ({ ...prev, ...sizes }));
    };
    fetchSizes();
  }, [applicationApiData, getFileSize]);

  React.useEffect(() => {
    if (!Array.isArray(educationData)) return;
    const fetchQualificationSizes = async () => {
      const sizes: Record<string, string> = {};
      for (const edu of educationData) {
        if (edu?.certificate)
          sizes[`${edu.id}-certificate`] = await getFileSize(edu.certificate);
        if (edu?.marksheet)
          sizes[`${edu.id}-marksheet`] = await getFileSize(edu.marksheet);
      }
      setFileSizes((prev) => ({ ...prev, ...sizes }));
    };
    fetchQualificationSizes();
  }, [educationData, getFileSize]);

  /* ================= Embedded expand sync ================= */
  React.useEffect(() => {
    if (!embedded || userToggledExpand) return;
    setIsExpanded(Boolean(autoOpen));
  }, [autoOpen, embedded, userToggledExpand]);

  React.useEffect(() => {
    if (!embedded || stageUnlocked) return;
    setIsExpanded(false);
  }, [embedded, stageUnlocked]);

  /* ================= Qualification documents ================= */
  const qualificationDocuments = React.useMemo((): Document[] => {
    if (!Array.isArray(educationData)) return [];
    const docs: Document[] = [];
    educationData.forEach((edu: any) => {
      const raw = edu?.countryStudyLevelName || "Unknown Level";
      const label = raw.split("(")[0].trim() || raw.split(":")[0].trim() || raw;
      if (edu?.certificate)
        docs.push({
          id: `${edu.id}-certificate`,
          name: `${label} Certificate`,
          size: fileSizes[`${edu.id}-certificate`] || "—",
          url: edu.certificate,
        });
      if (edu?.marksheet)
        docs.push({
          id: `${edu.id}-marksheet`,
          name: `${label} Marksheet`,
          size: fileSizes[`${edu.id}-marksheet`] || "—",
          url: edu.marksheet,
        });
    });
    return docs;
  }, [educationData, fileSizes]);

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

  const documentCategories: DocumentCategory[] = React.useMemo(() => {
    const reg = localUploads.registrationForm || applicationApiData?.registrationForm;
    const passport = localUploads.passportFile || applicationApiData?.passportFile;
    const cv = localUploads.cv || applicationApiData?.student?.cv;
    const motivation = localUploads.motivationLetter || applicationApiData?.student?.motivationLetter;

    return [
      {
        id: "registrationForm",
        title: "Registration Form",
        description:
          "Please download the sample form, fill it out, and upload the scanned copy here.",
        isRequired: true,
        isCompleted: !!reg,
        documents: [
          {
            id: "sample-reg",
            name: "Campus_Transfer_Sample.pdf",
            size: "Sample",
            url: "/registration.pdf",
          },
          ...(reg
            ? [
                {
                  id: "registrationForm",
                  name: "Submitted_Registration_Form.pdf",
                  size: fileSizes.registrationForm || "—",
                  url: `${config.image_access_url}${reg}`,
                },
              ]
            : []),
        ],
      },
      {
        id: "passportFile",
        title: "Passport",
        description:
          "Upload a clear copy of the student's passport biodata page (and any relevant pages).",
        isRequired: true,
        isCompleted: !!passport,
        documents: passport
          ? [
              {
                id: "pf-1",
                name: "Passport.pdf",
                size: fileSizes.passportFile || "—",
                url: `${config.image_access_url}${passport}`,
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
        description: "Upload the student's most recent CV / resume.",
        isRequired: true,
        isCompleted: !!cv,
        documents: cv
          ? [
              {
                id: "cv-1",
                name: "CV.pdf",
                size: fileSizes.cv || "—",
                url: `${config.image_access_url}${cv}`,
              },
            ]
          : [],
      },
      {
        id: "motivation-letter",
        title: "Motivational Letter",
        description:
          "Upload the student's motivation letter explaining study goals and reasons for choosing this program.",
        isRequired: true,
        isCompleted: !!motivation,
        documents: motivation
          ? [
              {
                id: "ml-1",
                name: "Motivation Letter.pdf",
                size: fileSizes.motivationLetter || "—",
                url: `${config.image_access_url}${motivation}`,
              },
            ]
          : [],
      },
    ];
  }, [
    qualificationDocuments,
    applicationApiData,
    fileSizes,
    hasQualificationDocs,
    localUploads,
  ]);

  /* ================= Handlers ================= */
  const handleFileUpload = async (categoryId: string, file: File) => {
    if (!applicationApiData?.id) return;
    setUploadingCategoryId(categoryId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "document");
      const response = await createMedia(formData).unwrap();
      const documentUrl = response.data.url;
      const fieldName =
        categoryId === "motivation-letter" ? "motivationLetter" : categoryId;
      await uploadDocument({
        id: applicationApiData.id,
        [fieldName]: documentUrl,
      }).unwrap();
      // Immediately reflect the new document in the UI
      setLocalUploads((prev) => ({ ...prev, [fieldName]: documentUrl }));
      setFileSizes((prev) => ({ ...prev, [fieldName]: formatFileSize(file.size) }));
      setExpandedCategories((prev) => ({ ...prev, [categoryId]: true }));
    } catch (err) {
      console.error("Upload failed:", err);
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
      if (input.files?.[0]) handleFileUpload(categoryId, input.files[0]);
    };
    input.click();
  };

  const handleCloseQualificationModal = () => {
    setIsQualificationModalOpen(false);
    setSelectedQualificationStudyLevelId(null);
    setActiveQualificationField(null);
    refetchProfile();
    setExpandedCategories((prev) => ({ ...prev, qualifications: true }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isAllRequiredCompleted = documentCategories.every((cat) => cat.isCompleted);

  const stageLockedVisual = embedded && !stageUnlocked;
  const expandToggleClass =
    stageLockedVisual ? "cursor-not-allowed opacity-50" : "cursor-pointer";
  const stageCardClass = stageLockedVisual
    ? "border border-primary-border rounded-2xl overflow-hidden bg-[#F4F6F5]"
    : "border border-primary-border rounded-2xl overflow-hidden";
  const stageHeaderClass = stageLockedVisual
    ? "bg-[#EEF2EF]"
    : "bg-[#DFF2E6] border-[#237D3B] border rounded-2xl";

  return (
    <>
      <div className={stageCardClass}>
        {/* ===== Header ===== */}
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

          <div className={stageLockedVisual ? "opacity-50" : ""}>
            <UpOutlined
              className={`text-[#4B5563] transition-transform duration-300 ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          </div>
        </div>

        {/* ===== Body (animated) ===== */}
        <Collapsible open={isExpanded}>
          <div className="space-y-4 m-4">
            {documentCategories.map((category) => {
              const isCategoryExpanded = expandedCategories[category.id] ?? false;

              return (
                <div
                  key={category.id}
                  className="bg-white border border-primary-border rounded-xl p-6"
                >
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {category.isCompleted ? (
                        <IoCheckmarkCircleSharp size={26} className="text-[#16A34A]" />
                      ) : (
                        <FaRegCircle size={22} />
                      )}
                      <h4 className="text-[18px] font-semibold text-[#111827]">
                        {category.title}
                      </h4>
                    </div>

                    <button
                      disabled={uploadingCategoryId === category.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput(category.id);
                      }}
                      className="border border-[#237D3B] text-[#237D3B] rounded-md cursor-pointer p-2 hover:bg-[#F0FDF4] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingCategoryId === category.id ? (
                        <div className="animate-spin h-5 w-5 border-2 border-[#237D3B] border-t-transparent rounded-full" />
                      ) : (
                        <BiExport size={18} />
                      )}
                    </button>
                  </div>

                  <p className="text-[14px] text-[#4B5563] mb-2 leading-relaxed">
                    {category.description}
                  </p>

                  {category.documents.length > 0 && (
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category.id);
                        }}
                        className="flex items-center gap-1 cursor-pointer text-[#237D3B] text-[14px] font-medium"
                      >
                        {isCategoryExpanded ? "Read less" : "Read more"}
                        <UpOutlined
                          className={`transition-transform duration-300 ${
                            isCategoryExpanded ? "rotate-0" : "rotate-180"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Documents (animated) */}
                  <Collapsible open={isCategoryExpanded}>
                    {category.documents.length > 0 && (
                      <div className="pt-3">
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
                                    downloadDocument(doc.url ?? "", doc.name);
                                  }}
                                  className="text-[#4B5563] cursor-pointer hover:text-[#237D3B]"
                                >
                                  <DownloadOutlined style={{ fontSize: 20 }} />
                                </button>
                              )}
                            </div>
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

      {/* ================= Footer ================= */}
      {!embedded && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate("/applications")}
            className="px-6 py-2 cursor-pointer border border-primary-border rounded-lg text-[#237D3B] font-semibold hover:bg-gray-50"
          >
            Back
          </button>
          <PrimaryButton
            text="Next"
            onClick={() => id && navigate(`/applications/${id}/apply`)}
          />
        </div>
      )}

      {/* ================= Qualifications Modal ================= */}
      <Modal
        open={isQualificationModalOpen}
        onCancel={handleCloseQualificationModal}
        footer={null}
        centered
        width={activeQualificationField ? 800 : 600}
        closable={false}
        destroyOnClose
        className="qualification-upload-modal"
        styles={{ content: { padding: "24px", borderRadius: "12px" } }}
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
                onChange={(value) =>
                  setSelectedQualificationStudyLevelId(value ?? null)
                }
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

            {selectedQualificationStudyLevelId && (() => {
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
                                  item.category as "marksheet" | "certificate",
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
