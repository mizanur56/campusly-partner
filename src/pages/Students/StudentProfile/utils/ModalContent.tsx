/* eslint-disable @typescript-eslint/no-unused-vars */
import QualificationForm from "../../../../components/ProfileTab/EducationsTab/QualificationForm";
import Uploader from "../../../../components/common/Shared/Uploader";
import { toast } from "react-toastify";
import { Modal } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";
import { useValidateDocumentWithAIMutation } from "../../../../redux/features/profile/studentProfileApi";
import {
  SUPPORTED_DOCUMENT_ACCEPT,
  SUPPORTED_DOCUMENT_EXTENSIONS,
  SUPPORTED_DOCUMENT_MIME_TYPES,
} from "../../../../constants/documentTypes";
import { getApiImageUrl } from "../../../../utils/getApiImageUrl";
import {
  buildFieldMismatchMessage,
  buildMatchSourceFromEducationData,
  buildStudyLevelMismatchMessage,
  getAcademicDocFields,
  mapAiExtractedToEducationData,
  mergeEducationDataWithoutOverride,
  toBase64WithoutPrefix,
  UploadDocType,
  ValidationState,
} from "./academicDocumentValidation";

const ACADEMIC_UPLOAD_AREA_CLASS = "min-h-[238px]";

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const isPdfUrlString = (url: string) =>
  /\.pdf(\?|$)/i.test(url) || url.toLowerCase().includes("application%2Fpdf");

const isSupportedDocumentFile = (file: File) => {
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
};

const formatFileSize = (sizeInBytes: number): string => {
  if (!sizeInBytes) return "0 KB";
  const mb = sizeInBytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${(sizeInBytes / 1024).toFixed(0)} KB`;
};

const fileLabelFromUrl = (url: string, fallback: string) => {
  try {
    const path = url.split("?")[0];
    const seg = path.split("/").filter(Boolean).pop();
    return seg && seg.length < 120 ? decodeURIComponent(seg) : fallback;
  } catch {
    return fallback;
  }
};

const EMPTY_QUALIFICATION_DISPLAY = {
  instituteName: "",
  country: "",
  subject: "",
  result: "",
  outOfGrade: "",
  startYear: null as string | null,
  endYear: null as string | null,
};

const ModalContent = ({
  studentId,
  selectedStudyLevelId,
  profileData,
  refetch,
  createMedia,
  createEducation,
  updateEducation,
  activeField,
  selectedStudyLevelLabel,
  onClose,
}: any) => {
  const selectedEducation = profileData?.educations?.find(
    (e: any) => e.studyLevelId === selectedStudyLevelId,
  );

  const [uploadedFiles, setUploadedFiles] = useState({
    marksheet: selectedEducation?.marksheet || "",
    certificate: selectedEducation?.certificate || "",
  });
  const [validateDocumentWithAI] = useValidateDocumentWithAIMutation();
  const [validationState, setValidationState] = useState<ValidationState>({
    status: "idle",
    message: "",
  });
  const [aiExtractedEducationData, setAiExtractedEducationData] = useState<any>({});
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState("");
  const [qualFormRemountKey, setQualFormRemountKey] = useState(0);
  const [postDeleteClearInputs, setPostDeleteClearInputs] = useState(false);
  const suppressUploadedFilesSyncRef = useRef(false);
  const lastDeletedFieldRef = useRef<UploadDocType | null>(null);
  const targetDocLabel = activeField === "certificate" ? "certificate" : "marksheet";

  const marksheetUrl = (
    uploadedFiles.marksheet ||
    selectedEducation?.marksheet ||
    ""
  ).trim();
  const certificateUrl = (
    uploadedFiles.certificate ||
    selectedEducation?.certificate ||
    ""
  ).trim();
  /** No file URLs for this study level — do not surface stale institute/subject etc. from DB in the modal. */
  const noAcademicFilesForThisLevel = !marksheetUrl && !certificateUrl;

  const qualificationEducationData = useMemo(() => {
    const files = {
      marksheet: uploadedFiles.marksheet || "",
      certificate: uploadedFiles.certificate || "",
    };
    if (postDeleteClearInputs || noAcademicFilesForThisLevel) {
      return {
        id: selectedEducation?.id,
        studyLevelId: selectedStudyLevelId,
        ...EMPTY_QUALIFICATION_DISPLAY,
        ...files,
      };
    }
    return {
      ...selectedEducation,
      ...aiExtractedEducationData,
      ...files,
    };
  }, [
    postDeleteClearInputs,
    noAcademicFilesForThisLevel,
    selectedEducation,
    selectedStudyLevelId,
    uploadedFiles.marksheet,
    uploadedFiles.certificate,
    aiExtractedEducationData,
  ]);

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(pendingFile);
    setPendingPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingFile]);

  useEffect(() => {
    setValidationState({ status: "idle", message: "" });
    setPendingFile(null);
    setPostDeleteClearInputs(false);
    lastDeletedFieldRef.current = null;
  }, [activeField]);

  useEffect(() => {
    setAiExtractedEducationData({});
    setPostDeleteClearInputs(false);
    lastDeletedFieldRef.current = null;
    suppressUploadedFilesSyncRef.current = false;
  }, [selectedStudyLevelId]);

  useEffect(() => {
    if (suppressUploadedFilesSyncRef.current) return;
    setUploadedFiles({
      marksheet: selectedEducation?.marksheet || "",
      certificate: selectedEducation?.certificate || "",
    });
  }, [
    selectedStudyLevelId,
    selectedEducation?.marksheet,
    selectedEducation?.certificate,
  ]);

  /** End delete flow only when profile refetch shows the file cleared on the server. */
  useEffect(() => {
    if (!postDeleteClearInputs) return;
    const field = lastDeletedFieldRef.current;
    if (!field) {
      suppressUploadedFilesSyncRef.current = false;
      setPostDeleteClearInputs(false);
      return;
    }
    const serverVal = String(selectedEducation?.[field] ?? "").trim();
    if (!serverVal) {
      lastDeletedFieldRef.current = null;
      suppressUploadedFilesSyncRef.current = false;
      setPostDeleteClearInputs(false);
    }
  }, [
    postDeleteClearInputs,
    selectedEducation?.marksheet,
    selectedEducation?.certificate,
  ]);

  // ফাইল হ্যান্ডলার
  const handleFileUpload = async (file: File, type: UploadDocType) => {
    try {
      if (!file) {
        toast.error("Please select a file first.");
        return;
      }
      setValidationState({
        status: "processing",
        message: `We are progressing and validating your ${type} data....`,
      });

      const base64 = await toBase64WithoutPrefix(file);
      const expectedDocumentType =
        type === "marksheet" ? "marksheet" : "certificate";
      const requestedFields = getAcademicDocFields(type, selectedStudyLevelLabel);

      /** After file delete, education row may still hold old institute/result — do not send those as match targets. */
      const hasStoredFileForActiveType =
        type === "marksheet" ? Boolean(marksheetUrl) : Boolean(certificateUrl);
      const existingEducationForMatch = hasStoredFileForActiveType
        ? { ...(selectedEducation || {}), ...aiExtractedEducationData }
        : {};

      const { matchSource, matchFields } =
        buildMatchSourceFromEducationData(existingEducationForMatch, requestedFields);
      const validationRes: any = await validateDocumentWithAI({
        documentBase64: base64,
        mimeType: file.type || "image/jpeg",
        expectedDocumentType,
        fields: requestedFields,
        matchSource: {
          study_level: selectedStudyLevelLabel || null,
          ...matchSource,
        },
        matchFields: ["study_level", ...matchFields],
      }).unwrap();

      const aiPayload = validationRes?.data || {};
      const isDocTypeMatch =
        aiPayload?.data?.isDocumentTypeMatch === true ||
        aiPayload?.matched === true;
      const validDocument =
        typeof aiPayload?.validDocument === "boolean"
          ? aiPayload.validDocument
          : isDocTypeMatch;
      const detectedStudyLevel =
        aiPayload?.matchCheck?.fieldMatches?.study_level?.extracted ||
        aiPayload?.data?.extractedData?.study_level ||
        null;
      const detectedDocumentType =
        aiPayload?.data?.detectedDocumentType || null;
      const detectedSentence = aiPayload?.detection?.sentence || null;
      const detectedTypeNormalized = String(detectedDocumentType || "")
        .toLowerCase()
        .trim();
      const expectedTypeNormalized = String(expectedDocumentType).toLowerCase().trim();
      const isExpectedTypeDetected =
        detectedTypeNormalized !== "" &&
        (detectedTypeNormalized === expectedTypeNormalized ||
          detectedTypeNormalized.includes(expectedTypeNormalized));
      const isAiTypeMatch = aiPayload?.data?.isDocumentTypeMatch === true;
      const fieldMatches = aiPayload?.matchCheck?.fieldMatches || {};
      const mismatchedFields = Object.entries(fieldMatches)
        .filter(
          ([field, value]: any) =>
            field !== "study_level" &&
            value?.matched === false &&
            String(value?.expected ?? "").trim() !== "" &&
            String(value?.extracted ?? "").trim() !== "",
        )
        .map(([field]) => field);
      const isStudyLevelMatched =
        fieldMatches?.study_level?.matched !== false &&
        fieldMatches?.study_level?.expected !== undefined;

      if (!isAiTypeMatch || !isExpectedTypeDetected || !isStudyLevelMatched) {
        if (isAiTypeMatch && isExpectedTypeDetected && mismatchedFields.length > 0) {
          const message = buildFieldMismatchMessage({
            type,
            mismatchedFields,
          });
          setValidationState({
            status: "error",
            message,
          });
          toast.error(message);
          return;
        }
        const message = buildStudyLevelMismatchMessage({
          type,
          selectedStudyLevelLabel,
          detectedStudyLevel,
          detectedDocumentType,
          detectedSentence,
        });
        setValidationState({
          status: "error",
          message,
        });
        toast.error(message);
        return;
      }

      // AI may not extract every field; only enforce mismatch for fields that were
      // actually extracted (non-empty) and conflicted with existing non-empty values.
      if (!validDocument && mismatchedFields.length === 0) {
        // Keep going: no actionable conflict among extracted values.
      }
      if (mismatchedFields.length > 0) {
        const message = buildFieldMismatchMessage({
          type,
          mismatchedFields,
        });
        setValidationState({
          status: "error",
          message,
        });
        toast.error(message);
        return;
      }

      const extractedData = aiPayload?.data?.extractedData || {};
      const mappedExtracted = mapAiExtractedToEducationData(extractedData);
      const mergedEducationSnapshot = mergeEducationDataWithoutOverride(
        { ...(selectedEducation || {}), ...aiExtractedEducationData },
        mappedExtracted,
      );
      setAiExtractedEducationData((prev: any) =>
        mergeEducationDataWithoutOverride(
          {
            ...(selectedEducation || {}),
            ...(prev || {}),
          },
          mappedExtracted,
        ),
      );

      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", type);
      const res = await createMedia(fd).unwrap();
      const url = (res as { data?: { url?: string } })?.data?.url;

      if (url) {
        const nextMarksheet =
          type === "marksheet"
            ? url
            : mergedEducationSnapshot.marksheet ||
              uploadedFiles.marksheet ||
              selectedEducation?.marksheet ||
              "";
        const nextCertificate =
          type === "certificate"
            ? url
            : mergedEducationSnapshot.certificate ||
              uploadedFiles.certificate ||
              selectedEducation?.certificate ||
              "";

        const persistPayload: Record<string, any> = {
          studyLevelId: selectedStudyLevelId,
          instituteName: mergedEducationSnapshot.instituteName ?? "",
          country: mergedEducationSnapshot.country ?? "",
          startYear: mergedEducationSnapshot.startYear ?? null,
          endYear: mergedEducationSnapshot.endYear ?? null,
          outOfGrade:
            mergedEducationSnapshot.outOfGrade !== undefined &&
            mergedEducationSnapshot.outOfGrade !== null &&
            String(mergedEducationSnapshot.outOfGrade).trim() !== ""
              ? String(mergedEducationSnapshot.outOfGrade)
              : null,
          result: mergedEducationSnapshot.result ?? null,
          subject: mergedEducationSnapshot.subject ?? "",
          marksheet: nextMarksheet || "",
          certificate: nextCertificate || "",
        };

        setUploadedFiles({
          marksheet: nextMarksheet || "",
          certificate: nextCertificate || "",
        });
        setPendingFile(null);

        try {
          if (selectedEducation?.id) {
            await updateEducation({
              studentId,
              educationId: selectedEducation.id,
              body: persistPayload,
            }).unwrap();
          } else {
            await createEducation({
              studentId,
              body: persistPayload,
            }).unwrap();
          }
          await refetch();
          setValidationState({
            status: "success",
            message: `${type} validated and uploaded successfully. Extracted fields are auto-filled below.`,
          });
        } catch (persistErr: any) {
          toast.error(
            persistErr?.data?.message ||
              "Document passed AI checks but could not be saved automatically. Complete Academic Details and click Save.",
          );
          setValidationState({
            status: "error",
            message:
              "AI validation passed and your file is shown below. Use Save on Academic Details to sync your qualification, or try again.",
          });
          await refetch();
        }
      }
    } catch (err: any) {
      setValidationState({
        status: "error",
        message: "Validation failed. Please upload the correct document.",
      });
      toast.error(err?.data?.message || "File upload failed");
    }
  };
  const handleDelete = (field: UploadDocType) => {
    Modal.confirm({
      title: "Are you sure you want to delete this file?",
      content:
        "This action cannot be undone. You will need to upload the file again if needed.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        suppressUploadedFilesSyncRef.current = true;
        lastDeletedFieldRef.current = field;
        setPendingFile(null);
        setUploadedFiles((prev: any) => ({
          ...prev,
          [field]: "",
        }));
        setValidationState({ status: "idle", message: "" });
        setAiExtractedEducationData({});
        setPostDeleteClearInputs(true);
        setQualFormRemountKey((k) => k + 1);

        try {
          if (selectedEducation?.id) {
            await updateEducation({
              studentId,
              educationId: selectedEducation.id,
              body: { [field]: "" },
            }).unwrap();
          }

          await refetch();
          toast.success(
            `${field.charAt(0).toUpperCase() + field.slice(1)} removed successfully`,
          );
        } catch (error) {
          toast.error("Failed to remove file from server");
          void refetch();
          lastDeletedFieldRef.current = null;
          suppressUploadedFilesSyncRef.current = false;
          setPostDeleteClearInputs(false);
          setUploadedFiles({
            marksheet: selectedEducation?.marksheet || "",
            certificate: selectedEducation?.certificate || "",
          });
        }
      },
    });
  };

  const renderAcademicUploadSlot = (
    type: UploadDocType,
    sectionLabel: string,
    chooseLabel: string,
  ) => {
    const headerLabel =
      type === "marksheet"
        ? "Academic Marksheet Upload"
        : "Academic Certificate Upload";
    const uploaded =
      type === "marksheet" ? uploadedFiles.marksheet : uploadedFiles.certificate;
    const fullUrl = uploaded ? getApiImageUrl(uploaded) : "";
    const showPending = Boolean(pendingFile && activeField === type);

    if (uploaded) {
      return (
        <div className="space-y-2" style={{ width: "100%" }}>
          <label className="text-xs font-bold text-gray-500 uppercase italic">
            {headerLabel}
          </label>
          <div
            key={fullUrl || "uploaded"}
            className={`relative ${ACADEMIC_UPLOAD_AREA_CLASS} flex flex-col rounded-2xl border-2 border-dashed border-primary/30 bg-white shadow-sm overflow-hidden`}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50"
              onClick={() => handleDelete(type)}
              aria-label={`Delete ${type}`}
            >
              <FiTrash2 className="text-sm" />
              Delete
            </button>
            <div className="flex flex-1 flex-col min-h-0 pt-12 px-3 pb-2">
              <div className="flex flex-1 min-h-[140px] items-center justify-center rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                {fullUrl && !isPdfUrlString(fullUrl) ? (
                  <img
                    src={fullUrl}
                    alt={sectionLabel}
                    className="max-h-[180px] w-full object-contain"
                  />
                ) : fullUrl ? (
                  <iframe
                    title={`${sectionLabel} preview`}
                    src={fullUrl}
                    className="h-[180px] w-full border-0 bg-white"
                  />
                ) : null}
              </div>
              <div className="mt-2 shrink-0 border-t border-gray-100 pt-2 text-center">
                <p className="truncate text-xs font-semibold text-gray-700">
                  {fileLabelFromUrl(fullUrl, sectionLabel)}
                </p>
                <p className="text-[11px] font-medium text-green-700">Uploaded</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (showPending && pendingFile) {
      return (
        <div className="space-y-2" style={{ width: "100%" }}>
          <label className="text-xs font-bold text-gray-500 uppercase italic">
            {headerLabel}
          </label>
          <div
            key={`${pendingFile.name}-${pendingFile.size}-${pendingFile.lastModified}`}
            className={`relative ${ACADEMIC_UPLOAD_AREA_CLASS} flex flex-col rounded-2xl border-2 border-dashed border-primary/30 bg-white shadow-sm overflow-hidden`}
          >
            <button
              type="button"
              disabled={validationState.status === "processing"}
              className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50"
              onClick={() => {
                setPendingFile(null);
                setValidationState({ status: "idle", message: "" });
              }}
              aria-label="Remove selected file"
            >
              <FiTrash2 className="text-sm" />
              Delete
            </button>
            <div className="flex flex-1 flex-col min-h-0 pt-12 px-3 pb-2">
              <div className="flex flex-1 min-h-[140px] items-center justify-center rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                {pendingPreviewUrl && !isPdfFile(pendingFile) ? (
                  <img
                    src={pendingPreviewUrl}
                    alt={pendingFile.name}
                    className="max-h-[180px] w-full object-contain"
                  />
                ) : pendingPreviewUrl && isPdfFile(pendingFile) ? (
                  <iframe
                    title={`${sectionLabel} PDF preview`}
                    src={pendingPreviewUrl}
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
                  {pendingFile.name}
                </p>
                <p className="text-[11px] font-medium text-primary">
                  {formatFileSize(pendingFile.size)} · selected
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
              disabled={validationState.status === "processing"}
              onClick={() => {
                setPendingFile(null);
                setValidationState({ status: "idle", message: "" });
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
              disabled={validationState.status === "processing"}
              onClick={() => handleFileUpload(pendingFile, type)}
            >
              <FiUploadCloud />
              Upload
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2" style={{ width: "100%" }}>
        <label className="text-xs font-bold text-gray-500 uppercase italic">
          {headerLabel}
        </label>
        <div className={ACADEMIC_UPLOAD_AREA_CLASS}>
          <Uploader
            key={`academic-uploader-${type}-${uploadedFiles[type] || "none"}-${pendingFile ? pendingFile.lastModified : 0}`}
            label={chooseLabel}
            buttonLabel="Choose file"
            helperText="Supported formats: PDF, JPG, JPEG, JFIF, PNG, WEBP, GIF"
            accept={SUPPORTED_DOCUMENT_ACCEPT}
            disabled={validationState.status === "processing"}
            onChange={(f: any) => {
              const selectedFile = Array.isArray(f) ? f[0] : f;
              const actualFile = selectedFile?.originFileObj || selectedFile || null;
              if (!actualFile) return;
              if (!isSupportedDocumentFile(actualFile)) {
                toast.error(
                  "Unsupported file type. Allowed: JPG, JPEG, JFIF, PNG, WEBP, GIF, PDF.",
                );
                return;
              }
              setPendingFile(actualFile);
              setValidationState({ status: "idle", message: "" });
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* --- আপলোডার সেকশন --- */}
      <div className="p-6 border-b bg-gray-50/50">
        <p className="mb-4 text-sm text-gray-600">
          Each marksheet and certificate is checked with AI for document type and study level
          ({selectedStudyLevelLabel || "your selected level"}), then matched to your academic
          details where possible. This applies to every qualification group in this section.
        </p>
        <div className="">
          {activeField === "marksheet" &&
            renderAcademicUploadSlot("marksheet", "Marksheet", "Upload Marksheet")}
          {activeField === "certificate" &&
            renderAcademicUploadSlot(
              "certificate",
              "Certificate",
              "Upload Certificate",
            )}
        </div>
        {validationState.message && (
          <div
            className={`mt-3 rounded-md border px-3 py-2 text-sm ${
              validationState.status === "error"
                ? "border-red-200 bg-red-50 text-red-600"
                : validationState.status === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-primary/20 bg-primary/10 text-primary"
            }`}
          >
            {validationState.message}
          </div>
        )}
        {validationState.status !== "processing" && (
          <p className="mt-2 text-xs text-gray-500">
            You are uploading from <span className="font-semibold">{targetDocLabel}</span>{" "}
            section. Only this document type will be accepted.
          </p>
        )}
      </div>

      {/* --- আপনার QualificationForm এখানে ব্যবহার করা হলো --- */}
      <div className="p-4">
        <QualificationForm
          key={`qual-${selectedStudyLevelId}-${qualFormRemountKey}-${marksheetUrl || "m"}-${certificateUrl || "c"}-${noAcademicFilesForThisLevel ? "nf" : "f"}`}
          title="Academic Details"
          studyLevelId={selectedStudyLevelId}
          studentId={studentId}
          refetch={refetch}
          hideHeader={true}
          onSaveSuccess={onClose}
          educationData={qualificationEducationData}
        />
      </div>
    </div>
  );
};

export default ModalContent;
