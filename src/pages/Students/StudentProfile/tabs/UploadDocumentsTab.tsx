import { LoadingOutlined } from "@ant-design/icons";
import { Modal, Spin } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaPlusSquare } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEdit,
  FiEye,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";
import { toast } from "react-toastify";

import StatementOfPurposeAiModal from "../../../../components/ProfileTab/StatementOfPurposeAiModal";
import WorkExperienceCertificateAiModal from "../../../../components/ProfileTab/WorkExperienceCertificateAiModal";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
import Uploader from "../../../../components/common/Shared/Uploader";
import {
  SUPPORTED_DOCUMENT_ACCEPT,
  SUPPORTED_DOCUMENT_EXTENSIONS,
  SUPPORTED_DOCUMENT_MIME_TYPES,
} from "../../../../constants/documentTypes";
import { useGetCountriesQuery } from "../../../../redux/features/countries/countriesApi";
import { useCreateMediaMutation } from "../../../../redux/features/media/mediaApi";
import {
  useCreateEducationMutation,
  useDeleteDocumentMutation,
  useGetDocumentsByCategoryQuery,
  useGetEligibleStudyLevelsByCountryQuery,
  useGetStudentProfileQuery,
  useUpdateEducationMutation,
  useUpdateStudentProfileMutation,
  useUpsertDocumentMutation,
  useValidateDocumentWithAIMutation,
} from "../../../../redux/features/profile/studentProfileApi";
import { toBase64WithoutPrefix } from "../utils/academicDocumentValidation";
import {
  buildPersonalDocumentsUploadRows,
  resolvePassportDocumentTemplateId,
} from "../profileUploadShared";
import {
  AcademicCertificatesSectionSkeleton,
  PersonalDocumentsSectionSkeleton,
} from "../profileUploadSkeletons";
import ModalContent from "../utils/ModalContent";
import { getApiImageUrl } from "../../../../utils/getApiImageUrl";
import FileViewer from "../../../../utils/FileViewer";

interface DocumentItem {
  id: string;
  name: string;
  status: "pending" | "submitted";
  category: string;
  educationId?: string;
  documentId?: string;
}

interface DocumentGroup {
  label: string;
  studyLevelId: string;
  educationData?: any;
  items: DocumentItem[];
}

interface PendingDeleteState {
  id: string;
  name: string;
  category: string;
  documentId?: string;
}

/** Partner student profile fields used in this tab (RTK unwraps `response.data`). */
export interface StudentProfileUploadShape {
  userId?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  passportExpDate?: string;
  country?: string;
  data?: { country?: string };
  imageId?: string;
  passportNo?: string;
  cv?: string;
  statementOfPurpose?: string;
  educations?: Array<{
    id?: string;
    studyLevelId?: string;
    marksheet?: string;
    certificate?: string;
  }>;
  documents?: Array<{
    id?: string;
    documentId?: string;
    document?: string;
    documentRelation?: { name?: string; category?: { name?: string } };
  }>;
  image?: { url?: string };
}

interface UploadDocumentsTabProps {
  studentId: string;
  profile?: unknown;
  canEdit?: boolean;
  onUpdated?: () => void;
}

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function isImageFile(file: File): boolean {
  if (file.type && IMAGE_MIME_TYPES.has(file.type.toLowerCase())) return true;
  const lowerName = file.name.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

/** RTK / API may return the list at root `data` or nested. */
function unwrapBackgroundDocuments(payload: unknown): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null) {
    const p = payload as { data?: unknown };
    if (Array.isArray(p.data)) return p.data as any[];
    const nested = (p.data as { data?: unknown } | null | undefined)?.data;
    if (Array.isArray(nested)) return nested as any[];
  }
  return [];
}

function isWorkExperienceDocName(name: unknown): boolean {
  const n = String(name ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (!n) return false;
  if (n.includes("work experience")) return true;
  if (n.includes("experience") && (n.includes("certificate") || n.includes("letter")))
    return true;
  if (n.includes("employment") && n.includes("experience")) return true;
  return false;
}

const PASSPORT_UPLOAD_AREA_CLASS = "min-h-[238px]";

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

function isSupportedDocumentFile(file: File): boolean {
  const mime = (file.type || "").toLowerCase();
  if (
    SUPPORTED_DOCUMENT_MIME_TYPES.includes(
      mime as (typeof SUPPORTED_DOCUMENT_MIME_TYPES)[number],
    )
  ) {
    return true;
  }
  const lowerName = file.name.toLowerCase();
  return SUPPORTED_DOCUMENT_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

interface PassportValidationState {
  item: DocumentItem | null;
  file: File | null;
  status: "idle" | "processing" | "success" | "error";
  open: boolean;
  message: string;
}

const UploadDocuments = ({
  studentId,
  profile: _profile,
  canEdit: _canEdit,
  onUpdated: _onUpdated,
}: UploadDocumentsTabProps) => {
  const canEdit = _canEdit !== false;
  const onUpdated = _onUpdated;
  const {
    data: profileDataRaw,
    refetch,
    isLoading: profileLoading,
  } = useGetStudentProfileQuery(studentId, { skip: !studentId });
  const profileData = profileDataRaw as
    | StudentProfileUploadShape
    | null
    | undefined;
  const documents = profileData?.documents ?? [];

  const submittedEnglishTestDocs = documents.filter(
    (item: any) =>
      item?.documentRelation?.category?.name === "English Language Tests",
  );

  const { data: countries } = useGetCountriesQuery({ page: 1, limit: 1000 });

  const selectedCountryId = useMemo(() => {
    // à§§. à¦¡à¦¾à¦Ÿà¦¾ à¦à¦–à¦¨à§‹ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡ à¦•à¦¿ à¦¨à¦¾ à¦¤à¦¾ à¦šà§‡à¦• à¦•à¦°à§à¦¨ (à¦ªà§à¦°à§‹à¦«à¦¾à¦‡à¦² à¦…à¦¬à¦œà§‡à¦•à§à¦Ÿà§‡à¦° à¦­à§‡à¦¤à¦° à¦¡à¦¾à¦Ÿà¦¾ à¦†à¦›à§‡ à¦•à¦¿ à¦¨à¦¾)
    const profileCountryName =
      profileData?.data?.country || profileData?.country;
    const countryList = countries?.data;

    if (!profileCountryName || !countryList) return null;

    // à§¨. à¦Ÿà§à¦°à¦¿à¦® à¦à¦¬à¦‚ à¦²à§‹à§Ÿà¦¾à¦°à¦•à§‡à¦¸ à¦•à¦°à§‡ à¦®à§à¦¯à¦¾à¦š à¦–à§à¦à¦œà§à¦¨
    // const matchedCountry = countryList.find(
    //   (c) =>
    //     c.name.trim().toLowerCase() === profileCountryName.trim().toLowerCase(),
    // );

    const matchedCountry = countryList.find((c) => {
      const input = profileCountryName?.toString().trim().toLowerCase();

      return (
        c.id?.toString() === profileCountryName?.toString() ||
        c.name?.trim().toLowerCase() === input
      );
    });

    return matchedCountry ? matchedCountry.id : null;
  }, [profileData, countries]);

  /** Profile may store country as id; passport AI match expects a human-readable country name. */
  const passportMatchCountryName = useMemo(() => {
    const raw = profileData?.data?.country ?? profileData?.country;
    if (raw == null || String(raw).trim() === "") return null;
    const str = String(raw).trim();
    const countryList = countries?.data as
      | { id?: string; name?: string }[]
      | undefined;
    if (countryList?.length) {
      const input = str.toLowerCase();
      const matched = countryList.find(
        (c) =>
          c.id?.toString() === str ||
          (c.name && c.name.trim().toLowerCase() === input),
      );
      if (matched?.name?.trim()) return matched.name.trim();
    }
    // Do not send opaque DB ids to the validator when we cannot resolve a name
    if (/^c[a-z0-9]{20,}$/i.test(str)) return null;
    if (str.length >= 20 && /^[a-z0-9]+$/i.test(str)) return null;
    return str;
  }, [profileData, countries?.data]);

  const userId = profileData?.userId as string;

  const { data: studyLevelsRes, isLoading: isLoadingStudyLevels } =
    useGetEligibleStudyLevelsByCountryQuery(
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

  const { data: backgroundData } = useGetDocumentsByCategoryQuery(
    { studentId, slug: "background-information" },
    { skip: !studentId },
  );

  const {
    data: docsPassportCategory,
    isLoading: passportCategoryLoading,
  } = useGetDocumentsByCategoryQuery(
    { studentId, slug: "passport" },
    { skip: !studentId },
  );
  const {
    data: docsIdentityCategory,
    isLoading: identityCategoryLoading,
  } = useGetDocumentsByCategoryQuery(
    { studentId, slug: "identity" },
    { skip: !studentId },
  );

  const personalSectionSkeleton =
    !studentId ||
    profileLoading ||
    passportCategoryLoading ||
    identityCategoryLoading;

  const passportTemplateId = useMemo(
    () =>
      resolvePassportDocumentTemplateId(
        docsPassportCategory,
        docsIdentityCategory,
      ),
    [docsPassportCategory, docsIdentityCategory],
  );

  const [createMedia, { isLoading: isCreatingMedia }] =
    useCreateMediaMutation();
  const [updateEducation, { isLoading: isUpdatingEducation }] =
    useUpdateEducationMutation();
  const [createEducation] = useCreateEducationMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateStudentProfileMutation();
  const [upsertStudentDocument] = useUpsertDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [validateDocumentWithAI] = useValidateDocumentWithAIMutation();

  const backgroundDataUnwrapped = useMemo(
    () => unwrapBackgroundDocuments(backgroundData),
    [backgroundData],
  );

  const workExpTemplateDoc = useMemo(() => {
    const fromProfile = documents.find(
      (d: any) =>
        d?.documentRelation?.name && isWorkExperienceDocName(d.documentRelation.name),
    );
    if (fromProfile?.documentId) {
      const byId = backgroundDataUnwrapped.find(
        (x: any) => x.id === fromProfile.documentId,
      );
      if (byId) return byId;
    }
    return backgroundDataUnwrapped.find((d: any) => isWorkExperienceDocName(d?.name));
  }, [backgroundDataUnwrapped, documents]);

  const [activeModal, setActiveModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DocumentGroup | null>(
    null,
  );
  const [activeField, setActiveField] = useState<
    "marksheet" | "certificate" | null
  >(null);
  const [selectedStudyLevelId, setSelectedStudyLevelId] = useState<
    string | null
  >(null);

  // Hidden input ref for direct uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeItem, setActiveItem] = useState<DocumentItem | null>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(
    null,
  );
  const [passportValidation, setPassportValidation] =
    useState<PassportValidationState>({
      item: null,
      file: null,
      status: "idle",
      open: false,
      message: "",
    });
  const [passportPreviewUrl, setPassportPreviewUrl] = useState("");
  const [passportUploaderReset, setPassportUploaderReset] = useState(0);
  const [weAiModalOpen, setWeAiModalOpen] = useState(false);
  const [weAiModalDoc, setWeAiModalDoc] = useState<any>(null);
  const [sopAiModalOpen, setSopAiModalOpen] = useState(false);
  const [fileViewer, setFileViewer] = useState<{ url: string; title: string } | null>(null);

  const isAdditionalWorkExperienceItem = useCallback(
    (item: DocumentItem) => {
      if (item.category !== "document" || !item.documentId) return false;
      if (workExpTemplateDoc && item.documentId === workExpTemplateDoc.id)
        return true;
      return isWorkExperienceDocName(item.name);
    },
    [workExpTemplateDoc],
  );

  const openWorkExperienceUploadModal = useCallback(
    (item: DocumentItem) => {
      const template = backgroundDataUnwrapped.find(
        (d: any) => String(d.id) === String(item.documentId),
      );
      if (!template?.fields?.length) {
        toast.error(
          "Could not load the work experience form. Wait for the page to finish loading or refresh.",
        );
        return;
      }
      setWeAiModalDoc(template);
      setWeAiModalOpen(true);
    },
    [backgroundDataUnwrapped],
  );

  const closeWorkExperienceModal = useCallback(() => {
    setWeAiModalOpen(false);
    setWeAiModalDoc(null);
  }, []);

  useEffect(() => {
    if (!passportValidation.file) {
      setPassportPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(passportValidation.file);
    setPassportPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [passportValidation.file]);
  const academicGroups: DocumentGroup[] = useMemo(() => {
    return studyLevelData.map((level: any) => {
      const edu = profileData?.educations?.find(
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
            educationId: edu?.id,
          },
          {
            id: `${level.id}_certificate`,
            name: "Certificate",
            status: edu?.certificate ? "submitted" : "pending",
            category: "certificate",
            educationId: edu?.id,
          },
        ],
      };
    });
  }, [studyLevelData, profileData]);

  const personalSectionItems = useMemo(
    (): DocumentItem[] =>
      buildPersonalDocumentsUploadRows({
        imageId: profileData?.imageId,
        cv: profileData?.cv,
        passportTemplateId,
        studentDocuments: profileData?.documents,
      }),
    [
      profileData?.documents,
      profileData?.imageId,
      profileData?.cv,
      passportTemplateId,
    ],
  );

  // /* ================= Section Logic ================= */
  const sections = useMemo(() => {
    const s: any[] = [];
    s.push({
      id: "personal",
      title: "Personal Documents",
      desc: "Submit a valid ID proof to enrol in courses.",
      items: personalSectionItems,
    });

    if (
      !!selectedCountryId &&
      studentId &&
      (isLoadingStudyLevels || academicGroups.length > 0)
    ) {
      s.push({
        id: "academic",
        title: "Academic Certificates",
        desc: "Secure admission to your best-matching courses by submitting accurate and comprehensive documents.",
        groups: academicGroups,
        academicBodyLoading:
          isLoadingStudyLevels && academicGroups.length === 0,
      });
    }

    if (submittedEnglishTestDocs.length > 0) {
      s.push({
        id: "english-tests",
        title: "English Language Tests",
        desc: "Provide one of the listed certificates to determine your course eligibility.",
        items: submittedEnglishTestDocs.map((doc: any) => ({
          id: doc.id,
          // à§«-à§¬ à¦²à§‡à¦Ÿà¦¾à¦° à¦¦à§‡à¦–à¦¾à¦¨à§‹à¦° à¦²à¦œà¦¿à¦•
          name:
            doc.documentRelation?.name?.length > 8
              ? `${doc.documentRelation.name.slice(0, 6)}...`
              : doc.documentRelation?.name || "English Test",
          status: "submitted",
          category: "english-test",
        })),
      });
    }

    s.push({
      id: "additional",
      title: "Additional Documents",
      desc: "Provide one of the listed certificates to determine your course eligibility.",
      items: [
        ...backgroundDataUnwrapped.map((doc: any) => {
          const isSubmitted = Boolean(
            profileData?.documents?.some((d: any) => d.documentId === doc.id),
          );

          return {
            id: doc.id,
            documentId: doc.id,
            name: doc.name,
            status: isSubmitted ? "submitted" : "pending",
            category: "document",
          };
        }),
        {
          id: "sop",
          name: "Statement of Purpose",
          status: profileData?.statementOfPurpose ? "submitted" : "pending",
          category: "statement-of-purpose",
        },
      ],
    });
    return s;
  }, [
    profileData,
    academicGroups,
    backgroundDataUnwrapped,
    submittedEnglishTestDocs,
    personalSectionItems,
    selectedCountryId,
    studentId,
    isLoadingStudyLevels,
  ]);

  // /* ================= Upload Handler ================= */
  const handleFileUpload = async (file: File, item: DocumentItem) => {
    if (!canEdit) return;
    setUploadingItemId(item.id);
    try {
      if (item.category === "profile" && !isImageFile(file)) {
        toast.error("Only image file (.jpg, .png, .webp, .gif) allowed.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "category",
        item.category === "document" ? "document" : item.category,
      );

      const res = await createMedia(formData).unwrap();
      const url = res.data.url;

      if (item.category === "profile")
        await updateProfile({
          studentId,
          body: { imageId: res.data.id },
        }).unwrap();
      else if (item.category === "cv")
        await updateProfile({ studentId, body: { cv: url } }).unwrap();
      else if (item.category === "document") {
        if (!item.documentId) {
          toast.error("Missing document configuration.");
          return;
        }
        await upsertStudentDocument({
          studentId,
          body: { documentId: item.documentId, document: url },
        }).unwrap();
      } else if (item.category === "statement-of-purpose")
        await updateProfile({
          studentId,
          body: { statementOfPurpose: url },
        }).unwrap();
      else if (
        item.category === "marksheet" ||
        item.category === "certificate"
      ) {
        if (!item.educationId) {
          toast.error("Missing education record for this study level.");
          return;
        }
        await updateEducation({
          studentId,
          educationId: item.educationId,
          body: { [item.category]: url },
        }).unwrap();
      }

      toast.success(`${item.name} uploaded successfully`);
      await refetch();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Upload failed");
    } finally {
      setUploadingItemId((prev) => (prev === item.id ? null : prev));
    }
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (!sizeInBytes) return "0 KB";
    const sizeInMb = sizeInBytes / (1024 * 1024);
    if (sizeInMb >= 1) return `${sizeInMb.toFixed(2)} MB`;
    return `${(sizeInBytes / 1024).toFixed(0)} KB`;
  };

  const openPassportValidationModal = (item: DocumentItem) => {
    setPassportUploaderReset((n) => n + 1);
    setPassportValidation({
      item,
      file: null,
      status: "idle",
      open: true,
      message: "",
    });
  };

  const closePassportValidationModal = () => {
    if (passportValidation.status === "processing") return;
    setPassportValidation({
      item: null,
      file: null,
      status: "idle",
      open: false,
      message: "",
    });
  };

  const handleValidateAndUploadPassport = async () => {
    const item = passportValidation.item;
    const file = passportValidation.file;
    if (!item || !file) {
      toast.error("Please select passport document first.");
      return;
    }
    if (!isSupportedDocumentFile(file)) {
      toast.error(
        "Unsupported file type. Allowed: JPG, JPEG, JFIF, PNG, WEBP, GIF, PDF.",
      );
      return;
    }

    setPassportValidation((prev) => ({
      ...prev,
      status: "processing",
      message: "We are progressing and validating your data....",
    }));

    try {
      const base64 = await toBase64WithoutPrefix(file);
      const fullName =
        [profileData?.firstName, profileData?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || null;

      const validationRes: any = await validateDocumentWithAI({
        documentBase64: base64,
        mimeType: file.type || "image/jpeg",
        expectedDocumentType: "passport",
        fields: [
          "full_name",
          "country",
          "gender",
          "passport_no",
          "date_of_birth",
          "passport_expiry_date",
        ],
        matchSource: {
          full_name: fullName,
          country: passportMatchCountryName,
          gender: profileData?.gender || null,
          passport_no: profileData?.passportNo || null,
          date_of_birth: profileData?.dateOfBirth || null,
          passport_expiry_date: profileData?.passportExpDate || null,
        },
      }).unwrap();

      const aiPayload = validationRes?.data || {};
      const typeMatched = !!aiPayload?.data?.isDocumentTypeMatch;
      const matchCheck = aiPayload?.matchCheck;
      const allMatched =
        matchCheck?.isChecked === true ? matchCheck?.allMatched !== false : true;

      if (!typeMatched || !allMatched) {
        setPassportValidation((prev) => ({
          ...prev,
          status: "error",
          message: "Please submit your own document.",
        }));
        toast.error("Please submit your own document.");
        return;
      }

      await handleFileUpload(file, item);
      setPassportValidation((prev) => ({
        ...prev,
        status: "success",
        message: "Validation successful. Passport uploaded.",
      }));
    } catch (err: any) {
      setPassportValidation((prev) => ({
        ...prev,
        status: "error",
        message: "Validation failed. Please try again.",
      }));
      toast.error(
        err?.data?.message ||
          err?.data?.error?.message ||
          "Passport validation failed",
      );
    }
  };

  const triggerDirectUpload = (item: DocumentItem) => {
    if (!canEdit) return;
    setActiveItem(item);
    fileInputRef.current?.click();
  };

  const resolveItemViewUrl = (item: DocumentItem): string => {
    if (item.category === "profile") return getApiImageUrl(profileData?.image?.url);
    if (item.category === "cv") return getApiImageUrl(profileData?.cv);
    if (item.category === "statement-of-purpose")
      return getApiImageUrl(profileData?.statementOfPurpose);
    if (item.category === "document" && item.documentId) {
      const matchedDoc = (profileData?.documents ?? []).find(
        (d) => d.documentId === item.documentId,
      );
      return getApiImageUrl(matchedDoc?.document);
    }
    return "";
  };

  const handleViewPersonalItem = (item: DocumentItem) => {
    const url = resolveItemViewUrl(item);
    if (!url) {
      toast.error("No file found to preview.");
      return;
    }
    setFileViewer({ url, title: item.name });
  };

  const requestDeletePersonalItem = (item: DocumentItem) => {
    if (!canEdit) return;
    if (item.category === "profile") {
      toast.info("Photo delete is not available here.");
      return;
    }
    if (item.category === "statement-of-purpose") {
      setPendingDelete({
        id: item.id,
        name: item.name,
        category: "statement-of-purpose",
      });
      return;
    }
    setPendingDelete({
      id: item.id,
      name: item.name,
      category: item.category,
      documentId: item.documentId,
    });
  };

  const handleConfirmDeletePersonalItem = async () => {
    if (!pendingDelete) return;
    const deleted = { ...pendingDelete };
    setDeletingItemId(deleted.id);
    try {
      if (deleted.category === "cv") {
        await updateProfile({ studentId, body: { cv: "" } }).unwrap();
      } else if (deleted.category === "statement-of-purpose") {
        await updateProfile({ studentId, body: { statementOfPurpose: "" } }).unwrap();
      } else if (deleted.category === "document" && deleted.documentId) {
        await deleteDocument({
          studentId,
          documentId: deleted.documentId,
        }).unwrap();
      } else {
        toast.error("Delete is not supported for this item.");
        return;
      }
      await refetch();

      if (
        deleted.category === "document" &&
        deleted.documentId &&
        passportTemplateId &&
        deleted.documentId === passportTemplateId
      ) {
        setPassportUploaderReset((n) => n + 1);
        setPassportValidation({
          item: null,
          file: null,
          status: "idle",
          open: false,
          message: "",
        });
      }
      if (deleted.category === "statement-of-purpose") {
        setSopAiModalOpen(false);
      }
      if (
        deleted.category === "document" &&
        deleted.documentId &&
        workExpTemplateDoc &&
        deleted.documentId === workExpTemplateDoc.id
      ) {
        setWeAiModalOpen(false);
        setWeAiModalDoc(null);
      }

      toast.success(`${deleted.name} removed.`);
      onUpdated?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Delete failed");
    } finally {
      setDeletingItemId(null);
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hidden input for direct uploads */}
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        disabled={uploadingItemId !== null}
        accept={
          activeItem?.category === "profile"
            ? "image/jpeg,image/jpg,image/png,image/webp,image/gif"
            : undefined
        }
        onChange={(e) => {
          if (e.target.files?.[0] && activeItem) {
            handleFileUpload(e.target.files[0], activeItem);
            e.target.value = ""; // reset
          }
        }}
      />

      {sections.map((section) => (
        <div
          key={section.id}
          className="bg-[#FFFFFF] p-4 rounded-lg border border-primary-border "
        >
          <div className="border-b pb-4 flex flex-col gap-2 mb-4">
            <h3 className="font-semibold text-[18px] text-[#20242A] ">
              {section.title}
            </h3>
            <p className="text-[14px] text-[#4B5563]">{section.desc}</p>
          </div>

          {section.id === "academic" &&
          section.groups &&
          section.groups.length === 0 &&
          section.academicBodyLoading ? (
            <AcademicCertificatesSectionSkeleton />
          ) : section.groups && section.groups.length > 0 ? (
            section.groups.map((group: DocumentGroup) => (
              <div key={group.studyLevelId} className="mb-6 last:mb-0 ">
                <h4 className="font-semibold text-gray-600 mb-2 uppercase text-xs tracking-wider">
                  {group.label}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border flex justify-between items-center rounded-md hover:bg-gray-50 transition-colors"
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
                        <div className="flex items-center gap-1.5">
                          {canEdit && (
                            <button
                              type="button"
                              className="border border-primary-border cursor-pointer p-1 flex items-center hover:border-primary hover:text-primary rounded-md"
                              onClick={() => {
                                setSelectedGroup(group);
                                setSelectedStudyLevelId(group.studyLevelId);
                                setActiveField(
                                  item.category as "marksheet" | "certificate",
                                );
                                setActiveModal(true);
                              }}
                              aria-label={`Edit ${item.name}`}
                            >
                              <FiEdit className="text-primary text-base" />
                            </button>
                          )}
                          <FaCircleCheck className="text-green-500 text-base" />
                        </div>
                      ) : canEdit ? (
                        <FaPlusSquare
                          className="text-primary text-lg cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => {
                            setSelectedGroup(group);
                            setSelectedStudyLevelId(group.studyLevelId);
                            setActiveField(
                              item.category as "marksheet" | "certificate",
                            );
                            setActiveModal(true);
                          }}
                        />
                      ) : (
                        <FaCircleCheck className="text-gray-300 text-base" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : section.id === "personal" && personalSectionSkeleton ? (
            <PersonalDocumentsSectionSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item: DocumentItem) => (
                <div
                  key={item.id}
                  className="p-3 border flex justify-between items-center rounded-md hover:bg-gray-50 transition-colors"
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
                    section.id === "personal" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="border border-[#CFCACF] p-1 rounded-md hover:border-primary hover:text-primary"
                          onClick={() => handleViewPersonalItem(item)}
                          aria-label={`View ${item.name}`}
                        >
                          <FiEye className="text-primary text-base" />
                        </button>
                        {item.category !== "profile" && canEdit && (
                          <button
                            type="button"
                            disabled={deletingItemId === item.id}
                            className="border border-[#CFCACF] p-1 rounded-md hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                            onClick={() => requestDeletePersonalItem(item)}
                            aria-label={`Delete ${item.name}`}
                          >
                            {deletingItemId === item.id ? (
                              <Spin
                                size="small"
                                indicator={
                                  <LoadingOutlined
                                    style={{ fontSize: 16, color: "#EF4444" }}
                                    spin
                                  />
                                }
                              />
                            ) : (
                              <FiTrash2 className="text-red-500 text-base" />
                            )}
                          </button>
                        )}
                        <FaCircleCheck className="text-green-500 text-base" />
                      </div>
                    ) : section.id === "additional" &&
                      isAdditionalWorkExperienceItem(item) ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="border border-[#CFCACF] p-1 rounded-md hover:border-primary hover:text-primary"
                          onClick={() => handleViewPersonalItem(item)}
                          aria-label={`View ${item.name}`}
                        >
                          <FiEye className="text-primary text-base" />
                        </button>
                        <FaCircleCheck className="text-green-500 text-base" />
                      </div>
                    ) : section.id === "additional" &&
                      item.category === "statement-of-purpose" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="border border-[#CFCACF] p-1 rounded-md hover:border-primary hover:text-primary"
                          onClick={() => handleViewPersonalItem(item)}
                          aria-label={`View ${item.name}`}
                        >
                          <FiEye className="text-primary text-base" />
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            className="border border-[#CFCACF] cursor-pointer p-1 flex items-center hover:border-primary hover:text-primary rounded-md"
                            onClick={() => setSopAiModalOpen(true)}
                            aria-label={`Edit ${item.name}`}
                          >
                            <FiEdit className="text-primary text-base" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            type="button"
                            disabled={deletingItemId === item.id}
                            className="border border-[#CFCACF] p-1 rounded-md hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                            onClick={() => requestDeletePersonalItem(item)}
                            aria-label={`Delete ${item.name}`}
                          >
                            {deletingItemId === item.id ? (
                              <Spin
                                size="small"
                                indicator={
                                  <LoadingOutlined
                                    style={{ fontSize: 16, color: "#EF4444" }}
                                    spin
                                  />
                                }
                              />
                            ) : (
                              <FiTrash2 className="text-red-500 text-base" />
                            )}
                          </button>
                        )}
                        <FaCircleCheck className="text-green-500 text-base" />
                      </div>
                    ) : (
                      <FaCircleCheck className="text-green-500 text-base" />
                    )
                  ) : uploadingItemId === item.id ? (
                    <Spin
                      size="small"
                      indicator={
                        <LoadingOutlined
                          style={{ fontSize: 20, color: "#237D3B" }}
                          spin
                        />
                      }
                    />
                  ) : canEdit ? (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-0 m-0 border-0 bg-transparent cursor-pointer text-primary text-lg hover:scale-110 transition-transform"
                      onClick={() => {
                        const isPassportPersonalItem =
                          section.id === "personal" &&
                          item.category === "document" &&
                          item.documentId === passportTemplateId;
                        if (isPassportPersonalItem) {
                          openPassportValidationModal(item);
                          return;
                        }
                        if (section.id === "additional") {
                          if (isAdditionalWorkExperienceItem(item)) {
                            openWorkExperienceUploadModal(item);
                            return;
                          }
                          if (item.category === "statement-of-purpose") {
                            setSopAiModalOpen(true);
                            return;
                          }
                        }
                        triggerDirectUpload(item);
                      }}
                      aria-label={`Upload ${item.name}`}
                    >
                      <FaPlusSquare className="pointer-events-none" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <Modal
        open={activeModal}
        footer={null}
        onCancel={() => {
          setActiveModal(false);
          setActiveField(null);
          setSelectedStudyLevelId(null);
          setSelectedGroup(null);
        }}
        width={800}
        destroyOnClose
        centered
      >
        {selectedStudyLevelId && activeField && (
          <ModalContent
            studentId={studentId}
            selectedStudyLevelId={selectedStudyLevelId}
            profileData={profileData}
            refetch={refetch}
            createMedia={createMedia}
            createEducation={createEducation}
            updateEducation={updateEducation}
            isCreatingMedia={isCreatingMedia}
            isUpdatingEducation={isUpdatingEducation}
            isUpdatingProfile={isUpdatingProfile}
            activeField={activeField}
            selectedStudyLevelLabel={
              selectedGroup?.label ||
              academicGroups.find((g) => g.studyLevelId === selectedStudyLevelId)
                ?.label ||
              ""
            }
            onClose={() => {
              setActiveModal(false);
              setActiveField(null);
              setSelectedStudyLevelId(null);
              setSelectedGroup(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!pendingDelete}
        title="Delete document?"
        okText="Delete"
        okButtonProps={{ danger: true, loading: !!deletingItemId }}
        cancelButtonProps={{ disabled: !!deletingItemId }}
        onOk={handleConfirmDeletePersonalItem}
        onCancel={() => (deletingItemId ? null : setPendingDelete(null))}
      >
        <p className="text-sm text-gray-600">
          {pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.name}"?`
            : ""}
        </p>
      </Modal>

      <Modal
        open={passportValidation.open}
        title="Passport Document Validation"
        onCancel={closePassportValidationModal}
        footer={null}
        width={800}
        centered
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase italic">
              Passport Document
            </div>
            {!passportValidation.file ? (
              <div className={PASSPORT_UPLOAD_AREA_CLASS}>
                <Uploader
                  key={`passport-uploader-${passportUploaderReset}`}
                  label="Upload Passport"
                  buttonLabel="Choose file"
                  helperText="Supported formats: PDF, JPG, JPEG, JFIF, PNG, WEBP, GIF"
                  accept={SUPPORTED_DOCUMENT_ACCEPT}
                  disabled={passportValidation.status === "processing"}
                  onChange={(f: any) => {
                    const selectedFile = Array.isArray(f) ? f[0] : f;
                    const file = selectedFile?.originFileObj || selectedFile || null;
                    if (file && !isSupportedDocumentFile(file)) {
                      toast.error(
                        "Unsupported file type. Allowed: JPG, JPEG, JFIF, PNG, WEBP, GIF, PDF.",
                      );
                      return;
                    }
                    setPassportValidation((prev) => ({
                      ...prev,
                      file,
                      status: "idle",
                      message: "",
                    }));
                  }}
                />
              </div>
            ) : (
              <div
                key={`${passportValidation.file.name}-${passportValidation.file.size}-${passportValidation.file.lastModified}`}
                className={`relative ${PASSPORT_UPLOAD_AREA_CLASS} flex flex-col rounded-2xl border-2 border-dashed border-primary/30 bg-white shadow-sm overflow-hidden`}
              >
                <button
                  type="button"
                  disabled={passportValidation.status === "processing"}
                  className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50"
                  onClick={() => {
                    setPassportUploaderReset((n) => n + 1);
                    setPassportValidation((prev) => ({
                      ...prev,
                      file: null,
                      status: "idle",
                      message: "",
                    }));
                  }}
                  aria-label="Remove selected file"
                >
                  <FiTrash2 className="text-sm" />
                  Delete
                </button>

                <div className="flex flex-1 flex-col min-h-0 pt-12 px-3 pb-2">
                  <div className="flex flex-1 min-h-[140px] items-center justify-center rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                    {passportPreviewUrl && passportValidation.file && !isPdfFile(passportValidation.file) ? (
                      <img
                        src={passportPreviewUrl}
                        alt={passportValidation.file.name}
                        className="max-h-[180px] w-full object-contain"
                      />
                    ) : passportPreviewUrl && passportValidation.file && isPdfFile(passportValidation.file) ? (
                      <iframe
                        title="Passport PDF preview"
                        src={passportPreviewUrl}
                        className="h-[180px] w-full border-0 bg-white"
                      />
                    ) : (
                      <div className="px-4 text-center text-sm text-gray-500">
                        Preview is loading or not available for this file type.
                      </div>
                    )}
                  </div>
                  <div className="mt-2 shrink-0 border-t border-gray-100 pt-2 text-center">
                    <p className="truncate text-xs font-semibold text-gray-700">
                      {passportValidation.file.name}
                    </p>
                    <p className="text-[11px] font-medium text-primary">
                      {formatFileSize(passportValidation.file.size)} · selected
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {passportValidation.message && (
            <div
              className={`rounded-lg p-3 text-sm font-medium flex items-start gap-2 ${
                passportValidation.status === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : passportValidation.status === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-primary/10 text-primary border border-primary/20"
              }`}
            >
              {passportValidation.status === "success" ? (
                <FiCheckCircle className="mt-0.5" />
              ) : passportValidation.status === "error" ? (
                <FiAlertCircle className="mt-0.5" />
              ) : (
                <LoadingOutlined style={{ fontSize: 14 }} spin />
              )}
              <span>{passportValidation.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
              onClick={closePassportValidationModal}
              disabled={passportValidation.status === "processing"}
            >
              {passportValidation.status === "success" ? "Close" : "Cancel"}
            </button>
            {passportValidation.status !== "success" && (
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
                onClick={handleValidateAndUploadPassport}
                disabled={
                  !passportValidation.file || passportValidation.status === "processing"
                }
              >
                <FiUploadCloud />
                Upload
              </button>
            )}
          </div>
        </div>
      </Modal>

      {weAiModalOpen && weAiModalDoc && (
        <WorkExperienceCertificateAiModal
          open={weAiModalOpen}
          onClose={closeWorkExperienceModal}
          document={weAiModalDoc as any}
          createMedia={createMedia}
          onComplete={async ({ serverUrl, extractedStrings }) => {
            try {
              const fieldResults = (weAiModalDoc as any).fields.map((field: any) => {
                const raw = extractedStrings[field.id];
                const isDate = field.name.toLowerCase().includes("date");
                let result = String(raw ?? "").trim();
                if (isDate && raw) {
                  const d = dayjs(raw, ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY"], true);
                  result = d.isValid() ? d.format("DD-MM-YYYY") : result;
                }
                return { fieldId: field.id, result };
              });
              await upsertStudentDocument({
                studentId,
                body: {
                  documentId: weAiModalDoc.id,
                  document: serverUrl,
                  fields: fieldResults,
                },
              }).unwrap();
              await refetch();
              closeWorkExperienceModal();
              toast.success("Work experience saved from upload.");
              onUpdated?.();
            } catch (e: any) {
              toast.error(e?.data?.message || "Failed to save work experience");
            }
          }}
        />
      )}

      <StatementOfPurposeAiModal
        open={sopAiModalOpen}
        onClose={() => setSopAiModalOpen(false)}
        profileData={profileData}
        createMedia={createMedia}
        updateProfile={(body) => updateProfile({ studentId, body })}
        onSuccess={() => {
          void refetch();
          setSopAiModalOpen(false);
          onUpdated?.();
        }}
      />

      <FileViewer
        open={!!fileViewer}
        url={fileViewer?.url ?? ""}
        title={fileViewer?.title}
        onClose={() => setFileViewer(null)}
      />

      <div className="flex justify-end mt-6">
        <PrimaryButton
          text="Next"
          to={`/students/${studentId}/profile?tab=apply-now`}
        />
      </div>
    </div>
  );
};

export default UploadDocuments;
