import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaCircleCheck,
  FaEye,
  FaSquarePlus,
  FaTrashCan,
} from "react-icons/fa6";
import { Button } from "../../../components/ui/button";
import { toast } from "react-toastify";
import {
  useGetStepDataQuery,
  usePatchStep4Mutation,
} from "../../../redux/features/onboardingForm/onboardingFormApi";
import type {
  Step4Payload,
  CustomDocument,
} from "../../../redux/features/onboardingForm/onboardingFormApi";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";
import { config } from "../../../config";
import OnboardingFormSkeleton from "../OnboardingFormSkeleton";
import { OnboardingStepEditBar } from "../OnboardingStepEditBar";
import {
  getOnboardingStepPayload,
  step4HasPersistedData,
} from "../onboardingStepDataUtils";
import { useOnboardingFormEditMode } from "../useOnboardingFormEditMode";

/** Fixed document fields for step 4 */
const FIXED_UPLOAD_ITEMS: {
  label: string;
  key: keyof Omit<Step4Payload, "customDocuments">;
  required: boolean;
}[] = [
  { label: "Your ID", key: "yourId", required: true },
  {
    label: "Business Registration Certificate",
    key: "businessRegistrationCertificate",
    required: true,
  },
  {
    label: "Tax Certificate (Optional)",
    key: "taxCertificate",
    required: false,
  },
];

interface Props {
  apiStep: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function RegularComplianceStep({
  apiStep,
  onPrev,
  onNext,
}: Props) {
  const { data: stepData, isFetching } = useGetStepDataQuery(apiStep);
  const [patchStep4, { isLoading: isSaving }] = usePatchStep4Mutation();
  const [uploadFile, { isLoading: isUploading }] = useCreateMediaMutation();
  const payload = useMemo(
    () => getOnboardingStepPayload(stepData),
    [stepData],
  );
  const hasPersistedData = useMemo(() => step4HasPersistedData(payload), [payload]);
  const {
    formDisabled: readOnly,
    showEditControl,
    showSaveButton,
    isEditing,
    startEditing,
    cancelEditing,
  } = useOnboardingFormEditMode(hasPersistedData);

  useEffect(() => {
    if (readOnly) {
      setShowAddQualification(false);
      setNewQualificationLabel("");
    }
  }, [readOnly]);

  // State for fixed document fields
  const [documents, setDocuments] = useState<Record<string, string>>({
    yourId: "",
    businessRegistrationCertificate: "",
    taxCertificate: "",
  });

  // State for custom qualifications
  const [customDocuments, setCustomDocuments] = useState<CustomDocument[]>([]);

  // State for new qualification modal/input
  const [showAddQualification, setShowAddQualification] = useState(false);
  const [newQualificationLabel, setNewQualificationLabel] = useState("");

  // Track which field is currently uploading
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // File input refs for fixed fields
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  // File input ref for custom qualification
  const customFileInputRef = useRef<HTMLInputElement | null>(null);

  // Prefill from API data
  useEffect(() => {
    const payload = stepData?.data && (stepData.data as any).data;
    if (payload && typeof payload === "object") {
      setDocuments({
        yourId: payload.yourId || "",
        businessRegistrationCertificate:
          payload.businessRegistrationCertificate || "",
        taxCertificate: payload.taxCertificate || "",
      });
      if (Array.isArray(payload.customDocuments)) {
        setCustomDocuments(payload.customDocuments);
      }
    }
  }, [stepData]);

  const handleCancelEdit = () => {
    cancelEditing();
    setShowAddQualification(false);
    setNewQualificationLabel("");
    const raw = stepData?.data && (stepData.data as any).data;
    if (raw && typeof raw === "object") {
      setDocuments({
        yourId: raw.yourId || "",
        businessRegistrationCertificate:
          raw.businessRegistrationCertificate || "",
        taxCertificate: raw.taxCertificate || "",
      });
      setCustomDocuments(
        Array.isArray(raw.customDocuments) ? raw.customDocuments : [],
      );
    }
  };

  /** Get full URL for display/preview */
  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = config.image_access_url || "";
    return `${baseUrl}${path}`;
  };

  /** Handle file upload for a fixed field */
  const handleFixedFieldUpload = async (key: string, file: File) => {
    setUploadingField(key);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "document");

      const response = await uploadFile(formData).unwrap();
      const uploadedUrl = (response as any)?.data?.url || "";

      if (uploadedUrl) {
        setDocuments((prev) => ({ ...prev, [key]: uploadedUrl }));
      } else {
        toast.error("Upload failed - no URL returned");
      }
    } catch (err: any) {
      const message = err?.data?.message || "Failed to upload file";
      toast.error(message);
    } finally {
      setUploadingField(null);
    }
  };

  /** Handle file upload for custom qualification */
  const handleCustomUpload = async (file: File) => {
    if (!newQualificationLabel.trim()) {
      toast.error("Please enter a qualification label first");
      return;
    }

    setUploadingField("custom-new");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "certificate");

      const response = await uploadFile(formData).unwrap();
      const uploadedUrl = (response as any)?.data?.url || "";

      if (uploadedUrl) {
        setCustomDocuments((prev) => [
          ...prev,
          { label: newQualificationLabel.trim(), fileUrl: uploadedUrl },
        ]);
        setNewQualificationLabel("");
        setShowAddQualification(false);
      } else {
        toast.error("Upload failed - no URL returned");
      }
    } catch (err: any) {
      const message = err?.data?.message || "Failed to upload file";
      toast.error(message);
    } finally {
      setUploadingField(null);
    }
  };

  /** Remove a custom qualification */
  const removeCustomDocument = (index: number) => {
    setCustomDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  /** Remove a fixed document */
  const removeFixedDocument = (key: string) => {
    setDocuments((prev) => ({ ...prev, [key]: "" }));
  };

  /** Get filename from path */
  const getFileName = (path: string) => {
    if (!path) return "";
    const parts = path.split("/");
    return parts[parts.length - 1] || path;
  };

  const buildStep4Payload = (): Step4Payload => ({
    yourId: documents.yourId || undefined,
    businessRegistrationCertificate:
      documents.businessRegistrationCertificate || undefined,
    taxCertificate: documents.taxCertificate || undefined,
    customDocuments:
      customDocuments.length > 0 ? customDocuments : undefined,
  });

  const validateRequiredUploads = () => {
    const missingRequired = FIXED_UPLOAD_ITEMS.filter(
      (item) => item.required && !documents[item.key],
    );
    if (missingRequired.length > 0) {
      toast.error(
        `Please upload: ${missingRequired.map((m) => m.label).join(", ")}`,
      );
      return false;
    }
    return true;
  };

  const patchErrorToast = (err: unknown) => {
    const e = err as { data?: { message?: string }; error?: string };
    const raw =
      e?.data?.message || (typeof e?.error === "string" ? e.error : "") || "";
    const message = String(raw);
    if (message.toLowerCase().includes("onboarding form already submitted")) {
      toast.info("Your onboarding form is already submitted.");
      return;
    }
    if (message) toast.error(message);
    else toast.error("Failed to save compliance documents. Please try again.");
  };

  const handleSave = async () => {
    if (!validateRequiredUploads()) return;
    try {
      await patchStep4(buildStep4Payload()).unwrap();
      toast.success("Saved");
    } catch (err) {
      patchErrorToast(err);
    }
  };

  const handleNext = () => {
    onNext();
  };

  if (isFetching && !stepData) {
    return <OnboardingFormSkeleton rows={4} />;
  }

  const isProcessing = isSaving || isUploading;

  return (
    <div className="space-y-5">
      <div className="flex w-full flex-row flex-wrap items-center justify-end gap-2">
        <OnboardingStepEditBar
          show={showEditControl}
          isEditing={isEditing}
          onEdit={startEditing}
          onCancel={handleCancelEdit}
          className="mb-0"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setShowAddQualification(true)}
          disabled={readOnly || isProcessing}
        >
          + Add Qualifications
        </Button>
      </div>

      {/* Add Qualification Modal/Form */}
      {showAddQualification && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Add New Qualification
            </span>
            <button
              type="button"
              onClick={() => {
                setShowAddQualification(false);
                setNewQualificationLabel("");
              }}
              disabled={readOnly}
              className="text-neutral-500 hover:text-neutral-700 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder="Enter qualification label (e.g., ISO Certificate)"
            value={newQualificationLabel}
            onChange={(e) => setNewQualificationLabel(e.target.value)}
            disabled={readOnly}
            className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:disabled:bg-neutral-900"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowAddQualification(false);
                setNewQualificationLabel("");
              }}
              disabled={readOnly}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => customFileInputRef.current?.click()}
              disabled={
                readOnly ||
                !newQualificationLabel.trim() ||
                uploadingField === "custom-new"
              }
            >
              {uploadingField === "custom-new" ? "Uploading…" : "Select File"}
            </Button>
            <input
              ref={customFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              disabled={readOnly}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCustomUpload(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      )}

      {/* Other Qualifications List */}
      {customDocuments.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Other Qualifications
          </span>
          {customDocuments.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {doc.label}
                  </span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {getFileName(doc.fileUrl)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeCustomDocument(index)}
                disabled={readOnly}
                className="text-red-500 hover:text-red-700 disabled:opacity-40 dark:text-red-400 dark:hover:text-red-300"
                title="Remove"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Fixed Document Fields */}
      <div className="space-y-2">
       
        {FIXED_UPLOAD_ITEMS.map((item) => {
          const hasFile = !!documents[item.key];
          const isUploadingThis = uploadingField === item.key;

          return (
            <div
              key={item.key}
              className={`group flex items-center justify-between rounded-md border p-3 transition-colors ${
                hasFile
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-gray-200 bg-white hover:border-primary-500 dark:border-neutral-700 dark:bg-neutral-800/50"
              }`}
            >
              <div className="min-w-0">
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {item.label}
                  {item.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </span>
                {hasFile && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {getFileName(documents[item.key])}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {hasFile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => removeFixedDocument(item.key)}
                      disabled={readOnly}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                      title="Delete file"
                    >
                      <FaTrashCan className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = getFullUrl(documents[item.key]);
                        if (url) window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-primary-400 dark:hover:bg-primary-950/30"
                      title="View file"
                    >
                      <FaEye className="h-4 w-4" aria-hidden />
                    </button>
                    <span
                      className="flex h-6 w-6 items-center justify-center text-green-600 dark:text-green-400"
                      title="Uploaded"
                    >
                      <FaCircleCheck className="h-4 w-4" aria-hidden />
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[item.key]?.click()}
                    disabled={readOnly || isUploadingThis}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-gray-100 text-gray-500 transition-colors group-hover:bg-primary-100 group-hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-700 dark:group-hover:bg-primary-900/30"
                    title="Upload file"
                  >
                    {isUploadingThis ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </span>
                    ) : (
                      <FaSquarePlus
                        className="text-primary text-xl transition-transform hover:scale-110"
                        aria-hidden
                      />
                    )}
                  </button>
                )}
                <input
                  ref={(el) => {
                    fileInputRefs.current[item.key] = el;
                  }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  disabled={readOnly}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFixedFieldUpload(item.key, file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5 dark:border-neutral-800">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onPrev}
          disabled={isProcessing}
        >
          ← Previous
        </Button>
        {showSaveButton && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isProcessing}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleNext}
          disabled={isProcessing || showSaveButton}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
