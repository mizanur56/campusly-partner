import { Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { LuNotebookPen, LuPenTool } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

import {
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import Step1MeetingModal from "../../components/common/Modals/Meeting/Step1Modal";
import Step2MeetingModal from "../../components/common/Modals/Meeting/Step2Modal";
import Step3MeetingModal from "../../components/common/Modals/Meeting/Step3Modal";
import { SignaturePad } from "../../components/contract/SignaturePad";
import { Button } from "../../components/ui/button";
import { config } from "../../config";
import { useCreateMediaMutation } from "../../redux/features/media/mediaApi";
import {
  useBookMeetingMutation,
  useCancelMeetingMutation,
  useGetContractQuery,
  useGetMyMeetingsQuery,
  useGetOnboardingStatusQuery,
  useLazyGetOnboardingStatusQuery,
  useSignContractMutation,
} from "../../redux/features/onboardingForm/onboardingFormApi";
import { useGetPartnerProfileQuery } from "../../redux/features/profile/partnerProfileApi";

export default function ContractPage() {
  const navigate = useNavigate();
  const [signatureImageDataUrl, setSignatureImageDataUrl] = useState<
    string | null
  >(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(60);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingStep, setMeetingStep] = useState<1 | 2 | 3>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
  const [selectedMeetingDate, setSelectedMeetingDate] = useState<string>("");
  const [selectedMeetingTime, setSelectedMeetingTime] = useState<string>("");

  // Fetch contract document URL
  const { data: contractData, isLoading: isContractLoading } =
    useGetContractQuery();
  const { data: onboardingStatus, isLoading: isOnboardingStatusLoading } =
    useGetOnboardingStatusQuery();

  // Fetch partner profile for advisor info
  const { data: partnerProfile } = useGetPartnerProfileQuery();
  const onboardingAdvisor = (onboardingStatus?.advisor ?? null) as {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    meetingLink?: string | null;
    profile?: { id?: string; url?: string | null } | null;
  } | null;
  const advisor = onboardingAdvisor ?? partnerProfile?.advisor ?? null;
  const advisorPhotoUrl = advisor?.profile?.url
    ? advisor.profile.url.startsWith("http")
      ? advisor.profile.url
      : `${config.image_access_url}${advisor.profile.url}`
    : null;

  const availableSlots = partnerProfile?.advisorAvailableSlots || [];
  const isLoadingSlots = false;

  const [bookMeeting, { isLoading: isBookingMeeting }] =
    useBookMeetingMutation();
  const [signContract, { isLoading: isSigningContract }] =
    useSignContractMutation();
  const [createMedia] = useCreateMediaMutation();
  const [fetchOnboardingStatus] = useLazyGetOnboardingStatusQuery();
  const { data: meetings, isLoading: isMeetingsLoading } =
    useGetMyMeetingsQuery();
  const [cancelMeeting, { isLoading: isCancelingMeeting }] =
    useCancelMeetingMutation();

  // Build contract document URL (pdf/image).
  const contractPdfUrl = useMemo(() => {
    const raw = contractData?.contractDocumentUrl;
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

    const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
    const base = (config.image_access_url ?? "").replace(/\/+$/, "");
    if (!base) return normalizedPath;

    const baseEndsWithUploads = /\/uploads$/i.test(base);
    const pathStartsWithUploads = /^\/uploads\//i.test(normalizedPath);
    const dedupedPath =
      baseEndsWithUploads && pathStartsWithUploads
        ? normalizedPath.replace(/^\/uploads/i, "")
        : normalizedPath;

    return `${base}${dedupedPath}`;
  }, [contractData?.contractDocumentUrl]);

  useEffect(() => {
    setPdfPage(1);
    setPdfZoom(80);
  }, [contractPdfUrl]);

  const contractKnownTotalPages = useMemo(() => {
    const raw =
      (contractData as any)?.totalPages ??
      (contractData as any)?.pageCount ??
      (contractData as any)?.pages;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [contractData]);

  const canGoPrev = pdfPage > 1;
  const canGoNext = contractKnownTotalPages
    ? pdfPage < contractKnownTotalPages
    : true;

  const contractFileExt = useMemo(() => {
    if (!contractPdfUrl) return null;
    const clean = contractPdfUrl.split("#")[0]?.split("?")[0] ?? contractPdfUrl;
    const ext = clean.split(".").pop()?.toLowerCase();
    return ext ?? null;
  }, [contractPdfUrl]);

  const isContractPdf = contractFileExt === "pdf";
  const isContractImage = contractFileExt
    ? ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(contractFileExt)
    : false;

  const hasSigned = !!signatureImageDataUrl;
  const isContractSignRejected =
    onboardingStatus?.statusLabel === "Contract sign rejected";
  const contractRejectionReason = onboardingStatus?.rejectionReason?.trim();

  useEffect(() => {
    if (
      onboardingStatus?.status === "AWAITING_ADMIN_APPROVAL" ||
      onboardingStatus?.status === "ACTIVE"
    ) {
      navigate("/contract/signed", { replace: true });
    }
  }, [navigate, onboardingStatus?.status]);

  const handleSaveSignature = (dataUrl: string) => {
    setSignatureImageDataUrl(dataUrl);
    setSignedAt(
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
    setShowSignaturePad(false);
  };

  const handleUpdateSignature = () => {
    setSignatureImageDataUrl(null);
    setSignedAt(null);
    setShowSignaturePad(true);
  };

  const handleSubmitSignedContract = async () => {
    if (!signatureImageDataUrl) {
      message.warning("Please draw and save your signature first");
      return;
    }

    try {
      const signatureBlob = await fetch(signatureImageDataUrl).then((res) =>
        res.blob(),
      );

      const formData = new FormData();
      formData.append(
        "file",
        new File([signatureBlob], `partner-signature-${Date.now()}.png`, {
          type: "image/png",
        }),
      );
      formData.append("category", "document");

      const mediaResponse = await createMedia(formData).unwrap();
      const uploadedSignatureUrl = `${config.image_access_url}${
        mediaResponse.data.url.startsWith("/")
          ? mediaResponse.data.url
          : `/${mediaResponse.data.url}`
      }`;

      await signContract({ signatureUrl: uploadedSignatureUrl }).unwrap();

      const statusResponse = await fetchOnboardingStatus().unwrap();

      message.success("Signed contract submitted successfully");

      if (
        statusResponse?.status === "AWAITING_ADMIN_APPROVAL" ||
        statusResponse?.status === "ACTIVE"
      ) {
        navigate("/contract/signed");
        return;
      }

      if (statusResponse?.status === "AWAITING_PARTNER_SIGNATURE") {
        message.info(
          statusResponse?.statusLabel || "Contract ready for signature",
        );
      }
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to submit signed contract");
    }
  };

  const handleOpenMeetingModal = () => {
    setIsMeetingModalOpen(true);
    setMeetingStep(1);
    setSelectedSlot(undefined);
    setSelectedMeetingDate("");
    setSelectedMeetingTime("");
  };

  const handleStep1Next = (date: string, time: string, slotIso: string) => {
    setSelectedMeetingDate(date);
    setSelectedMeetingTime(time);
    setSelectedSlot(slotIso);
    setMeetingStep(2);
  };

  const handleStep2Next = async (
    preferences: string[],
    additionalInfo: string,
  ) => {
    if (!selectedSlot) {
      message.warning("Please select an available slot");
      return;
    }

    try {
      await bookMeeting({
        scheduledAt: selectedSlot,
        note: additionalInfo?.trim()
          ? `Preferences: ${preferences.join(", ") || "N/A"}\n\nTell us more: ${additionalInfo.trim()}`
          : `Preferences: ${preferences.join(", ") || "N/A"}`,
      }).unwrap();
      message.success("Meeting arranged successfully");
      setMeetingStep(3);
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to arrange meeting");
    }
  };

  const slotsForBooking = useMemo(
    () =>
      (availableSlots || []).map((slot) => ({
        slot: slot.slot,
        date: slot.date,
      })),
    [availableSlots],
  );

  const upcomingMeeting = useMemo(() => {
    return (meetings || [])
      .filter(
        (meeting) =>
          meeting.status === "SCHEDULED" &&
          new Date(meeting.scheduledAt).getTime() > Date.now(),
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )[0];
  }, [meetings]);

  const upcomingMeetingSummary = useMemo(() => {
    if (!upcomingMeeting) return null;
    const meetingDate = new Date(upcomingMeeting.scheduledAt);
    return {
      date: meetingDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: meetingDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  }, [upcomingMeeting]);

  const meetingManager = useMemo(() => {
    if (!upcomingMeeting) return null;
    const meetingAdvisor = (upcomingMeeting.advisor ?? null) as {
      id?: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      meetingLink?: string | null;
      profile?: { id?: string; url?: string | null } | null;
    } | null;
    const meetingAdvisorPhotoUrl = meetingAdvisor?.profile?.url
      ? meetingAdvisor.profile.url.startsWith("http")
        ? meetingAdvisor.profile.url
        : `${config.image_access_url}${meetingAdvisor.profile.url}`
      : null;
    return {
      name: meetingAdvisor?.name || advisor?.name || "Onboarding Manager",
      email:
        meetingAdvisor?.email || advisor?.email || "support@campustransfer.com",
      phone: meetingAdvisor?.phone || advisor?.phone || null,
      photoUrl: meetingAdvisorPhotoUrl || advisorPhotoUrl || null,
      meetingLink:
        upcomingMeeting.meetingLink ||
        meetingAdvisor?.meetingLink ||
        advisor?.meetingLink ||
        null,
    };
  }, [upcomingMeeting, advisor, advisorPhotoUrl]);

  const handleCancelMeeting = () => {
    if (!upcomingMeeting) return;

    Modal.confirm({
      title: "Cancel meeting?",
      content:
        "This will cancel your scheduled meeting with the onboarding manager.",
      okText: "Cancel Meeting",
      cancelText: "Keep Meeting",
      okButtonProps: {
        danger: true,
        style: { fontWeight: 700 },
      },
      cancelButtonProps: { style: { fontWeight: 700 } },
      onOk: async () => {
        try {
          await cancelMeeting(upcomingMeeting.id).unwrap();
          message.success("Meeting canceled successfully");
        } catch (error: any) {
          message.error(error?.data?.message || "Failed to cancel meeting");
        }
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 py-2 dark:bg-gray-950/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Left: Contract progress card */}
        <aside className="w-full shrink-0 lg:w-56 xl:w-64">
          <div className="lg:sticky lg:top-24 rounded-[16px] border border-primary-border bg-[#FFFFFF] p-5 card-shadow dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-[18px] font-semibold text-[#20242A] dark:text-gray-200">
              Contract
            </h2>

            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    hasSigned
                      ? "bg-primary-600 text-white"
                      : "border-2 border-primary-500 bg-white dark:border-primary-400 dark:bg-gray-900"
                  }`}
                >
                  {hasSigned ? (
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : null}
                </span>
                <span className={"text-gray-600 dark:text-gray-300"}>
                  View and sign
                </span>
              </li>
              {hasSigned && (
                <li className="flex items-center gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary-500 bg-white dark:border-primary-400 dark:bg-gray-900">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full bg-primary-500"
                    />
                  </span>
                  <span className="font-semibold text-primary-700 dark:text-primary-300">
                    Complete
                  </span>
                </li>
              )}
            </ul>
          </div>
        </aside>

        {/* Right: Contract content */}
        <main className="min-w-0 flex-1">
          <div className="">
            {/* Header */}
            <header className="border-b border-primary-border dark:border-gray-800 pb-5">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                Partnership Contract
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please review and complete the following steps to finalize your
                partnership.
              </p>
              {isContractSignRejected && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                  <p className="font-semibold">
                    Your previous contract signature was rejected.
                  </p>
                  <p className="mt-1">
                    Please review the feedback below, update your signature if
                    needed, and submit the signed contract again.
                  </p>
                  {contractRejectionReason && (
                    <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-medium text-red-700 dark:bg-gray-900/40 dark:text-red-200">
                      Reason: {contractRejectionReason}
                    </p>
                  )}
                </div>
              )}
              {isOnboardingStatusLoading ? (
                <div className="mt-3 h-5 w-56 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              ) : onboardingStatus?.statusLabel ? (
                <div
                  className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    isContractSignRejected
                      ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300"
                      : "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                  }`}
                >
                  {onboardingStatus.statusLabel}
                </div>
              ) : null}
            </header>

            <div className="space-y-8  mt-5  divide-y divide-gray-100 dark:divide-gray-800">
              {/* Contract signature viewer */}
              <section className="rounded-[16px] border border-primary-border bg-[#FFFFFF] dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-3 border-b border-primary-border px-4 py-3 dark:border-gray-800 sm:px-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-100 text-[#20242A] dark:bg-gray-800 dark:text-gray-200">
                      <FaRegFileAlt aria-hidden className="h-5 w-5" />
                    </span>
                    <span className="truncate text-[18px] font-semibold text-[#20242A] dark:text-gray-100">
                      Contract Signature
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {contractPdfUrl && isContractPdf && (
                      <div className="hidden items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:flex">
                        <button
                          type="button"
                          disabled={pdfZoom <= 50}
                          onClick={() =>
                            setPdfZoom((z) => Math.max(50, z - 25))
                          }
                          className={`inline-flex h-7 w-7 items-center justify-center bg-white text-[#20242A] dark:border-gray-700 dark:bg-gray-900 ${
                            pdfZoom <= 50
                              ? "cursor-not-allowed opacity-50"
                              : "hover:opacity-80"
                          }`}
                          aria-label="Zoom out"
                        >
                          <FiZoomOut aria-hidden className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pdfZoom >= 200}
                          onClick={() =>
                            setPdfZoom((z) => Math.min(200, z + 25))
                          }
                          className={`inline-flex h-7 w-7 items-center justify-center bg-white text-[#20242A] dark:border-gray-700 dark:bg-gray-900 ${
                            pdfZoom >= 200
                              ? "cursor-not-allowed opacity-50"
                              : "hover:opacity-80"
                          }`}
                          aria-label="Zoom in"
                        >
                          <FiZoomIn aria-hidden className="h-4 w-4" />
                        </button>
                        <span
                          className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700"
                          aria-hidden
                        />
                        <button
                          type="button"
                          disabled={!canGoPrev}
                          onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary-border bg-white text-[#20242A] dark:border-gray-700 dark:bg-gray-900 ${
                            !canGoPrev
                              ? "cursor-not-allowed opacity-50"
                              : "hover:opacity-80"
                          }`}
                          aria-label="Previous page"
                        >
                          <FiChevronLeft aria-hidden className="h-4 w-4" />
                        </button>
                        <span className="text-[#20242A] dark:text-gray-200">
                          {contractKnownTotalPages
                            ? `Page ${pdfPage} of ${contractKnownTotalPages}`
                            : `Page ${pdfPage}`}
                        </span>
                        <button
                          type="button"
                          disabled={!canGoNext}
                          onClick={() => setPdfPage((p) => p + 1)}
                          className={`inline-flex h-7 w-7 items-center justify-center bg-white text-[#20242A] dark:border-gray-700 dark:bg-gray-900 ${
                            !canGoNext
                              ? "cursor-not-allowed opacity-50"
                              : "hover:opacity-80"
                          }`}
                          aria-label="Next page"
                        >
                          <FiChevronRight aria-hidden className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {contractPdfUrl && (
                      <a
                        href={contractPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Button variant="primary" size="md">
                          <span className="inline-flex items-center gap-2">
                            <FiDownload aria-hidden className="h-4 w-4" />
                            {isContractPdf ? "Download PDF" : "Download file"}
                          </span>
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 dark:bg-gray-950 sm:px-5 sm:py-5">
                  {isContractLoading ? (
                    <div className="mx-auto h-[500px] max-w-full rounded-xl border border-dashed border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Loading contract...
                        </p>
                      </div>
                    </div>
                  ) : contractPdfUrl ? (
                    <div className="mx-auto h-[500px] max-w-full overflow-hidden rounded-xl border border-primary-border bg-white  dark:border-gray-700 dark:bg-gray-900">
                      {isContractPdf ? (
                        <iframe
                          key={`${contractPdfUrl}-${pdfPage}-${pdfZoom}`}
                          src={`${contractPdfUrl}#toolbar=0&navpanes=0&page=${pdfPage}&zoom=${pdfZoom}`}
                          className="h-full w-full"
                          title="Contract Document"
                        />
                      ) : isContractImage ? (
                        <img
                          src={contractPdfUrl}
                          alt="Contract Document"
                          className="h-full w-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <iframe
                          src={contractPdfUrl}
                          className="h-full w-full"
                          title="Contract Document"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="mx-auto h-[500px] max-w-full rounded-xl border border-dashed border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          Contract preview
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Contract document is not available yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Onboarding manager / meeting card */}
              <section className=" rounded-[16px] border border-primary-border bg-[#FFFFFF] dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-primary-border px-4 py-5 dark:border-gray-800 sm:px-5">
                  <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#20242A] dark:text-gray-100">
                    <FaRegUser aria-hidden className="h-5 w-5 text-[#20242A]" />
                    {upcomingMeeting
                      ? "Scheduled Meeting"
                      : "Your Onboarding Manager"}
                  </h2>
                </div>
                <div className="px-4 py-4 sm:px-5">
                  {isMeetingsLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
                      <div className="h-10 w-32 rounded-lg bg-gray-100 dark:bg-gray-800" />
                    </div>
                  ) : upcomingMeeting && upcomingMeetingSummary ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                Scheduled
                              </span>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Meeting with your onboarding manager
                              </span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/80 p-3 dark:border-white/10 dark:bg-gray-900/30">
                              {meetingManager?.photoUrl ? (
                                <img
                                  src={meetingManager.photoUrl}
                                  alt={
                                    meetingManager?.name || "Onboarding Manager"
                                  }
                                  className="h-11 w-11 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                  {(meetingManager?.name || "OM")
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 space-y-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {meetingManager?.name}
                                </p>
                                <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                                  {meetingManager?.email}
                                </p>
                                {meetingManager?.phone && (
                                  <p className="text-xs text-gray-600 dark:text-gray-300">
                                    {meetingManager.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {upcomingMeetingSummary.date}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {upcomingMeetingSummary.time}
                            </p>
                            {upcomingMeeting.note && (
                              <div className="rounded-xl border border-primary-border bg-white/70 p-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                  Meeting details
                                </p>
                                <p className="mt-1 whitespace-pre-line">
                                  {upcomingMeeting.note}
                                </p>
                              </div>
                            )}
                            {meetingManager?.meetingLink && (
                              <a
                                href={meetingManager.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                              >
                                Meeting link
                              </a>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={handleCancelMeeting}
                              disabled={isCancelingMeeting}
                              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isCancelingMeeting
                                ? "Canceling..."
                                : "Cancel Meeting"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-200">
                            {advisorPhotoUrl ? (
                              <img
                                src={advisorPhotoUrl}
                                alt={advisor?.name || "Campus Transfer"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <>
                                {advisor?.name
                                  ? advisor.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()
                                  : "CT"}
                              </>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {advisor?.name || "Campus Transfer"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {advisor?.email || "support@campustransfer.com"}
                            </p>
                            {advisor?.phone && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {advisor.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleOpenMeetingModal}
                          disabled={!advisor}
                          className="w-full"
                        >
                          Arrange meeting
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Digital signature card */}
              <section className="rounded-[16px] border border-primary-border bg-[#FFFFFF] dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-primary-border px-4 py-5 dark:border-gray-800 sm:px-5">
                  <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#20242A] dark:text-gray-100">
                    <span className="inline-flex h-6 w-6 items-center justify-center text-[#20242A] dark:text-gray-200">
                      <LuNotebookPen
                        aria-hidden
                        className="h-5 w-5 text-[#20242A]"
                      />
                    </span>
                    Digital Signature
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      hasSigned
                        ? " bg-[#E6F8EF] text-[#00B561] dark:bg-success-900/20 dark:text-success-400"
                        : "bg-[#FFF4E6] text-[#E88400] dark:bg-amber-950/25 dark:text-amber-300"
                    }`}
                  >
                    {hasSigned
                      ? isContractSignRejected
                        ? "Needs re-sign"
                        : "Signed"
                      : "Not signed"}
                  </span>
                </div>
                <div className="px-4 py-4 sm:px-5 sm:py-5">
                  {showSignaturePad ? (
                    <SignaturePad
                      height={180}
                      onSave={handleSaveSignature}
                      onCancel={() => setShowSignaturePad(false)}
                    />
                  ) : !hasSigned ? (
                    <>
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/20">
                        <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center text-gray-600 dark:text-gray-200">
                          <LuPenTool aria-hidden className="h-7 w-7" />
                        </div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          Ready to Sign
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                          Please add your digital signature to complete this
                          contract.
                        </p>
                        <div className="mt-6 flex justify-center">
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => setShowSignaturePad(true)}
                          >
                            <span className="inline-flex items-center gap-2">
                              <LuPenTool aria-hidden className="h-4 w-4" />
                              Add your signature
                            </span>
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              Signature:
                            </p>
                            <div className="mt-3 rounded-2xl border border-primary-border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                              <div className="flex items-center justify-center rounded-xl bg-gray-50 py-6 dark:bg-gray-950/30">
                                {signatureImageDataUrl && (
                                  <img
                                    src={signatureImageDataUrl}
                                    alt="Your signature"
                                    className="max-h-20 w-auto object-contain"
                                  />
                                )}
                              </div>
                            </div>
                            {signedAt && (
                              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <FiCalendar aria-hidden className="h-4 w-4" />
                                <span>Signed on {signedAt}</span>
                              </div>
                            )}
                          </div>

                          <div className="sm:pl-6">
                            <Button
                              variant="secondary"
                              size="md"
                              type="button"
                              onClick={handleUpdateSignature}
                              className="w-full border border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-200 sm:w-56"
                            >
                              Update Signature
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                          <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={handleSubmitSignedContract}
                            disabled={
                              isSigningContract || !signatureImageDataUrl
                            }
                            className="w-full sm:w-72"
                          >
                            <span className="inline-flex items-center justify-center gap-2">
                              <FiCheck aria-hidden className="h-4 w-4" />
                              {isSigningContract
                                ? "Submitting..."
                                : isContractSignRejected
                                  ? "Resubmit Signed Contract"
                                  : "Submit Signed Contract"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <Step1MeetingModal
        open={isMeetingModalOpen && meetingStep === 1}
        onClose={() => setIsMeetingModalOpen(false)}
        slots={slotsForBooking}
        availabilityTemplates={partnerProfile?.advisorAvailability || []}
        isLoadingSlots={isLoadingSlots}
        onNext={handleStep1Next}
      />
      <Step2MeetingModal
        open={isMeetingModalOpen && meetingStep === 2}
        onClose={() => setIsMeetingModalOpen(false)}
        onBack={() => setMeetingStep(1)}
        onNext={handleStep2Next}
        isLoading={isBookingMeeting}
      />
      <Step3MeetingModal
        open={isMeetingModalOpen && meetingStep === 3}
        onClose={() => setIsMeetingModalOpen(false)}
        date={selectedMeetingDate}
        time={selectedMeetingTime}
      />
    </div>
  );
}
