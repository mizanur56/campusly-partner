/* eslint-disable react-hooks/exhaustive-deps */
import { Dropdown, Input, Modal, message } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { LuNotebookPen, LuPenTool } from "react-icons/lu";
import {
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiMoreVertical,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ExistingPartnerMeetingModal from "../../components/common/Modals/Meeting/ExistingPartnerMeetingModal";
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

/**
 * Join link becomes usable exactly at the scheduled start time (no pre-lead).
 * Set to 0 so the join button does not unlock before the session begins.
 */
const PARTNER_JOIN_LEAD_MS = 0;
/** After start, join link stays valid until this offset (covers overrun past booked slot). */
const PARTNER_JOIN_WINDOW_AFTER_START_MS = 3 * 60 * 60 * 1000;
/** Hide “Starts in 0s” — omit countdown when within 1s of start. */
const SHOW_STARTS_IN_THRESHOLD_MS = 1000;

function formatPartnerCountdown(ms: number): string {
  if (ms <= 0) return "0s";
  const s = Math.ceil(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m ${sec}s`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/** Full date line + start/end times (end = slot end from slotMinutes, default 30). */
function formatPartnerMeetingStartEndLabels(
  scheduledAtIso: string,
  slotMinutes?: number | null,
): {
  dateLine: string;
  startTime: string;
  endTime: string;
} {
  const start = new Date(scheduledAtIso);
  const minsRaw = slotMinutes ?? 30;
  const mins = Math.max(5, Math.min(Number(minsRaw) || 30, 24 * 60));
  const end = new Date(start.getTime() + mins * 60 * 1000);
  const dateLine = start.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const startTime = start.toLocaleTimeString("en-US", timeOpts);
  let endTime = end.toLocaleTimeString("en-US", timeOpts);
  if (start.toDateString() !== end.toDateString()) {
    endTime = `${endTime} · next day`;
  }
  return { dateLine, startTime, endTime };
}

export default function ContractPage() {
  const navigate = useNavigate();
  const [signatureImageDataUrl, setSignatureImageDataUrl] = useState<
    string | null
  >(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [existingMeetingModalOpen, setExistingMeetingModalOpen] =
    useState(false);
  const [partnerCancelModalOpen, setPartnerCancelModalOpen] = useState(false);
  const [partnerCancelReason, setPartnerCancelReason] = useState("");
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
  const {
    data: partnerProfile,
    refetch: refetchPartnerProfile,
    isLoading: isPartnerProfileLoading,
  } = useGetPartnerProfileQuery();
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
  const isLoadingSlots =
    isPartnerProfileLoading && !partnerProfile;

  const [bookMeeting, { isLoading: isBookingMeeting }] =
    useBookMeetingMutation();
  const [signContract, { isLoading: isSigningContract }] =
    useSignContractMutation();
  const [createMedia] = useCreateMediaMutation();
  const [fetchOnboardingStatus] = useLazyGetOnboardingStatusQuery();
  const { data: meetings, isLoading: isMeetingsLoading, refetch: refetchMeetings } =
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
    setPdfZoom(100);
    setNumPages(null);
  }, [contractPdfUrl]);

  useEffect(() => {
    if (!contractPdfUrl) return;
    const ext = contractPdfUrl
      .split("#")[0]
      ?.split("?")[0]
      ?.split(".")
      .pop()
      ?.toLowerCase();
    if (ext !== "pdf") return;
    let cancelled = false;
    import("pdfjs-dist")
      .then(async ({ getDocument, GlobalWorkerOptions }) => {
        GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const pdf = await getDocument(contractPdfUrl).promise;
        if (!cancelled) setNumPages(pdf.numPages);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [contractPdfUrl]);

  const contractKnownTotalPages = useMemo(() => {
    const raw =
      (contractData as any)?.totalPages ??
      (contractData as any)?.pageCount ??
      (contractData as any)?.pages;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [contractData]);

  const totalPages = numPages ?? contractKnownTotalPages ?? null;
  const canGoPrev = pdfPage > 1;
  const canGoNext = totalPages != null ? pdfPage < totalPages : false;

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
    void refetchMeetings();
    void refetchPartnerProfile();
    if (upcomingMeeting) {
      setExistingMeetingModalOpen(true);
      return;
    }
    setIsMeetingModalOpen(true);
    setMeetingStep(1);
    setSelectedSlot(undefined);
    setSelectedMeetingDate("");
    setSelectedMeetingTime("");
  };

  const openNewBookingAfterCancel = () => {
    void refetchMeetings();
    void refetchPartnerProfile();
    setIsMeetingModalOpen(true);
    setMeetingStep(1);
    setSelectedSlot(undefined);
    setSelectedMeetingDate("");
    setSelectedMeetingTime("");
  };

  const runPartnerCancel = async (meetingId: string, reason: string) => {
    await cancelMeeting({ meetingId, reason }).unwrap();
  };

  const handleStep1Next = (date: string, time: string, slotIso: string) => {
    setSelectedMeetingDate(date);
    setSelectedMeetingTime(time);
    setSelectedSlot(slotIso);
    setMeetingStep(2);
  };

  const handleStep2Next = async (additionalInfo: string) => {
    if (!selectedSlot) {
      message.warning("Please select an available time");
      return;
    }

    try {
      await bookMeeting({
        scheduledAt: selectedSlot,
        note: additionalInfo?.trim() || undefined,
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
        slotMinutes: slot.slotMinutes,
        status: slot.status,
      })),
    [availableSlots],
  );

  const [liveNowMs, setLiveNowMs] = useState(() => Date.now());

  const upcomingMeeting = useMemo(() => {
    return (meetings || [])
      .filter((meeting) => meeting.status === "SCHEDULED")
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )[0];
  }, [meetings]);

  const hasHadCompletedPartnerMeeting = useMemo(
    () => (meetings || []).some((m) => m.status === "COMPLETED"),
    [meetings],
  );

  /** Pick up auto-complete on server shortly after the booked slot ends. */
  useEffect(() => {
    const hasSched = (meetings || []).some((m) => m.status === "SCHEDULED");
    if (!hasSched) return;
    const id = window.setInterval(() => {
      void refetchMeetings();
    }, 20000);
    return () => clearInterval(id);
  }, [meetings, refetchMeetings]);

  useEffect(() => {
    if (!upcomingMeeting) return;
    const id = window.setInterval(() => setLiveNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [upcomingMeeting]);

  const partnerMeetingTimeline = useMemo(() => {
    if (!upcomingMeeting) return null;
    const start = new Date(upcomingMeeting.scheduledAt).getTime();
    const unlock = start - PARTNER_JOIN_LEAD_MS;
    const linkClose = start + PARTNER_JOIN_WINDOW_AFTER_START_MS;
    const minsRaw = upcomingMeeting.slotMinutes ?? 30;
    const slotMins = Math.max(5, Math.min(Number(minsRaw) || 30, 24 * 60));
    const slotEnd = start + slotMins * 60 * 1000;
    return {
      start,
      unlock,
      linkClose,
      slotEnd,
      msUntilStart: start - liveNowMs,
      msUntilUnlock: unlock - liveNowMs,
      msUntilSlotEnd: slotEnd - liveNowMs,
      msUntilLinkClose: linkClose - liveNowMs,
    };
  }, [upcomingMeeting, liveNowMs]);

  const canJoinPartnerMeeting = useMemo(() => {
    if (!upcomingMeeting || upcomingMeeting.status !== "SCHEDULED") return false;
    const t = partnerMeetingTimeline;
    if (!t) return false;
    return liveNowMs >= t.unlock && liveNowMs <= t.linkClose;
  }, [upcomingMeeting, liveNowMs, partnerMeetingTimeline]);

  const cardMeetingStartsInLabel = useMemo(() => {
    if (!partnerMeetingTimeline) return "";
    const ms = partnerMeetingTimeline.msUntilStart;
    if (ms <= SHOW_STARTS_IN_THRESHOLD_MS) return "";
    return formatPartnerCountdown(ms);
  }, [partnerMeetingTimeline]);

  /**
   * While join is allowed (session start ≤ now ≤ start + 3h):
   *   - Before booked end → "Auto-completes in …" (server will auto-mark
   *     completed when the meeting time elapses).
   *   - After booked end, link still open → "Join link closes in …".
   */
  const cardJoinWindowCountdown = useMemo(() => {
    if (!partnerMeetingTimeline || !canJoinPartnerMeeting) return null;
    const { msUntilSlotEnd, msUntilLinkClose } = partnerMeetingTimeline;
    if (msUntilSlotEnd > 0) {
      return {
        title: "Auto-completes in",
        text: formatPartnerCountdown(msUntilSlotEnd),
      };
    }
    if (msUntilLinkClose > 0) {
      return {
        title: "Join link closes in",
        text: formatPartnerCountdown(msUntilLinkClose),
      };
    }
    return null;
  }, [partnerMeetingTimeline, canJoinPartnerMeeting]);

  const showPartnerMeetingCountdownRow = useMemo(() => {
    if (canJoinPartnerMeeting) return true;
    return !!cardMeetingStartsInLabel;
  }, [canJoinPartnerMeeting, cardMeetingStartsInLabel]);

  const upcomingMeetingSummary = useMemo(() => {
    if (!upcomingMeeting) return null;
    return formatPartnerMeetingStartEndLabels(
      upcomingMeeting.scheduledAt,
      upcomingMeeting.slotMinutes,
    );
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
      meetingLink: (() => {
        const raw =
          upcomingMeeting.meetingLink ||
          meetingAdvisor?.meetingLink ||
          advisor?.meetingLink ||
          "";
        const t = typeof raw === "string" ? raw.trim() : "";
        return t || null;
      })(),
    };
  }, [upcomingMeeting, advisor, advisorPhotoUrl]);

  const handleOpenPartnerCancelFromCard = () => {
    if (!upcomingMeeting) return;
    setPartnerCancelReason("");
    setPartnerCancelModalOpen(true);
  };

  const handleConfirmPartnerCancelFromCard = async () => {
    if (!upcomingMeeting) return;
    const r = partnerCancelReason.trim();
    if (r.length < 10) {
      message.warning("Please write a cancellation reason (at least 10 characters).");
      return;
    }
    try {
      await runPartnerCancel(upcomingMeeting.id, r);
      message.success("Meeting canceled");
      setPartnerCancelModalOpen(false);
      openNewBookingAfterCancel();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to cancel meeting");
    }
  };

  const handleDownload = async () => {
    if (!contractPdfUrl) return;
    try {
      const res = await fetch(contractPdfUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract.${contractFileExt || "pdf"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(contractPdfUrl, "_blank");
    }
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
                          className={`inline-flex h-4 w-4 items-center justify-center  ${
                            !canGoPrev
                              ? "cursor-not-allowed opacity-50"
                              : "hover:opacity-80"
                          }`}
                          aria-label="Previous page"
                        >
                          <FiChevronLeft aria-hidden className="h-4 w-4" />
                        </button>
                        <span className="text-[#20242A] dark:text-gray-200">
                          {totalPages
                            ? `Page ${pdfPage} of ${totalPages}`
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
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleDownload}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FiDownload aria-hidden className="h-4 w-4" />
                          {isContractPdf ? "Download PDF" : "Download file"}
                        </span>
                      </Button>
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
                    <div className="mx-auto h-[500px] max-w-full overflow-hidden rounded-xl border border-primary-border bg-white dark:border-gray-700 dark:bg-gray-900">
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
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                Scheduled
                              </span>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Meeting with your onboarding manager
                              </span>
                            </div>
                            {(() => {
                              const items: MenuProps["items"] = [];
                              const canCancel =
                                (partnerMeetingTimeline?.msUntilStart ?? 1) > 0;
                              if (canCancel) {
                                items.push({
                                  key: "cancel",
                                  danger: true,
                                  label: isCancelingMeeting
                                    ? "Canceling..."
                                    : "Cancel meeting",
                                  disabled: isCancelingMeeting,
                                  onClick: handleOpenPartnerCancelFromCard,
                                });
                              }
                              if (items.length === 0) return null;
                              return (
                                <Dropdown
                                  menu={{ items }}
                                  trigger={["click"]}
                                  placement="bottomRight"
                                >
                                  <button
                                    type="button"
                                    aria-label="Meeting actions"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white/70 text-gray-600 transition-colors hover:bg-white hover:text-gray-900 dark:border-emerald-900/40 dark:bg-gray-900/30 dark:text-gray-300"
                                  >
                                    <FiMoreVertical className="h-4 w-4" />
                                  </button>
                                </Dropdown>
                              );
                            })()}
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
                            <div className="rounded-xl border border-emerald-200/80 bg-white/90 px-3 py-2.5 dark:border-emerald-900/40 dark:bg-gray-900/40">
                              <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                                {upcomingMeetingSummary.dateLine}
                              </p>
                              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">
                                Starts
                              </p>
                              <p className="mt-0.5 text-base font-semibold tabular-nums text-gray-900 dark:text-white">
                                {upcomingMeetingSummary.startTime}
                              </p>
                              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Ends{" "}
                                <span className="font-normal normal-case text-gray-400">
                                  (end of meeting)
                                </span>
                              </p>
                              <p className="mt-0.5 text-base tabular-nums text-gray-800 dark:text-gray-200">
                                {upcomingMeetingSummary.endTime}
                              </p>
                            </div>
                            {showPartnerMeetingCountdownRow && (
                              <p className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                                {canJoinPartnerMeeting ? (
                                  cardJoinWindowCountdown ? (
                                    <>
                                      <span className="mr-1 font-medium text-emerald-700 dark:text-emerald-400">
                                        Meeting started ·
                                      </span>
                                      {cardJoinWindowCountdown.title}{" "}
                                      <span className="font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
                                        {cardJoinWindowCountdown.text}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                      Join link is closing — tap Join now
                                    </span>
                                  )
                                ) : cardMeetingStartsInLabel ? (
                                  <>
                                    Meeting starts in{" "}
                                    <span className="font-semibold text-primary-600">
                                      {cardMeetingStartsInLabel}
                                    </span>
                                  </>
                                ) : null}
                              </p>
                            )}
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
                            {canJoinPartnerMeeting ? (
                              meetingManager?.meetingLink ? (
                                <a
                                  href={meetingManager.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/35 ring-2 ring-emerald-400/80 ring-offset-2 ring-offset-white transition hover:from-emerald-500 hover:to-emerald-600 hover:shadow-xl dark:ring-offset-gray-900"
                                >
                                  Join meeting — open link
                                </a>
                              ) : (
                                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                  Join window is open, but no meeting link is on
                                  file yet. Please message your advisor or open
                                  this page again shortly.
                                </span>
                              )
                            ) : null}
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
                          disabled={!upcomingMeeting && !advisor}
                          className="w-full"
                        >
                          {upcomingMeeting
                            ? "View meeting"
                            : hasHadCompletedPartnerMeeting
                              ? "Book again"
                              : "Arrange meeting"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Digital signature card */}
              <section className="rounded-[16px] border border-primary-border bg-[#FFFFFF] dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-primary-border px-4 py-4 dark:border-gray-800 sm:px-5">
                  <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#20242A] dark:text-gray-100">
                    <span className="inline-flex h-6 w-6 items-center justify-center text-[#20242A] dark:text-gray-200">
                      <LuNotebookPen aria-hidden className="h-5 w-5" />
                    </span>
                    Digital Signature
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      hasSigned
                        ? "bg-[#E6F8EF] text-[#00B561] dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-[#FFF4E6] text-[#E88400] dark:bg-amber-950/25 dark:text-amber-300"
                    }`}
                  >
                    {hasSigned
                      ? isContractSignRejected
                        ? "Needs re-sign"
                        : "Signed"
                      : "Awaiting signature"}
                  </span>
                </div>

                <div className="px-4 py-5 sm:px-5 sm:py-6">
                  {showSignaturePad ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Draw your signature below
                      </p>
                      <SignaturePad
                        height={180}
                        onSave={handleSaveSignature}
                        onCancel={() => setShowSignaturePad(false)}
                      />
                    </div>
                  ) : !hasSigned ? (
                    <div className="flex flex-col items-center gap-6 py-4">
                      {/* Steps */}
                      <div className="flex w-full max-w-sm flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                            1
                          </span>
                          <p className="pt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            Review the contract document above carefully.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                            2
                          </span>
                          <p className="pt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            Click the button below to draw and save your
                            signature.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                            3
                          </span>
                          <p className="pt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            Submit the signed contract for admin approval.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowSignaturePad(true)}
                        className="group flex w-full max-w-sm flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/50 px-6 py-8 transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-primary-700 dark:bg-primary-950/10 dark:hover:border-primary-500 dark:hover:bg-primary-950/20"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 group-hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-300">
                          <LuPenTool aria-hidden className="h-6 w-6" />
                        </span>
                        <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                          Click to sign
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Draw your signature using mouse or touch
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Signature preview */}
                      <div className="rounded-2xl border border-primary-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/30">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                            Your Signature
                          </span>
                          <button
                            type="button"
                            onClick={handleUpdateSignature}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            Redraw
                          </button>
                        </div>
                        <div className="flex min-h-[80px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900">
                          {signatureImageDataUrl && (
                            <img
                              src={signatureImageDataUrl}
                              alt="Your signature"
                              className="max-h-20 w-auto object-contain"
                            />
                          )}
                        </div>
                        {signedAt && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                            <FiCalendar aria-hidden className="h-3.5 w-3.5" />
                            <span>Signed on {signedAt}</span>
                          </div>
                        )}
                      </div>

                      {/* Submit */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          By submitting, you confirm you have read and agreed to
                          the contract.
                        </p>
                        <Button
                          type="button"
                          variant="primary"
                          size="md"
                          onClick={handleSubmitSignedContract}
                          disabled={isSigningContract || !signatureImageDataUrl}
                          className="shrink-0"
                        >
                          <span className="inline-flex items-center justify-center gap-2">
                            <FiCheck aria-hidden className="h-4 w-4" />
                            {isSigningContract
                              ? "Submitting..."
                              : isContractSignRejected
                                ? "Resubmit Contract"
                                : "Submit Signed Contract"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <ExistingPartnerMeetingModal
        open={existingMeetingModalOpen && !!upcomingMeeting}
        meeting={upcomingMeeting}
        advisor={{
          name: meetingManager?.name || advisor?.name || "Onboarding Manager",
          email:
            meetingManager?.email ||
            advisor?.email ||
            "support@campustransfer.com",
          phone: meetingManager?.phone ?? advisor?.phone ?? null,
          photoUrl: meetingManager?.photoUrl ?? advisorPhotoUrl ?? null,
          meetingLink: meetingManager?.meetingLink ?? null,
        }}
        onClose={() => setExistingMeetingModalOpen(false)}
        onCanceledOpenBooking={() => {
          setExistingMeetingModalOpen(false);
          openNewBookingAfterCancel();
        }}
        onCancelMeeting={(meetingId, reason) =>
          cancelMeeting({ meetingId, reason }).unwrap()
        }
        isCanceling={isCancelingMeeting}
      />

      <Modal
        title="Cancel meeting"
        open={partnerCancelModalOpen}
        onCancel={() =>
          !isCancelingMeeting && setPartnerCancelModalOpen(false)
        }
        okText="Confirm cancel"
        okButtonProps={{ danger: true, loading: isCancelingMeeting }}
        onOk={handleConfirmPartnerCancelFromCard}
        destroyOnHidden
      >
        <p className="mb-2 text-sm text-gray-600">
          Your advisor will be notified with this reason.
        </p>
        <Input.TextArea
          rows={4}
          maxLength={2000}
          showCount
          placeholder="Why are you canceling? (min. 10 characters)"
          value={partnerCancelReason}
          onChange={(e) => setPartnerCancelReason(e.target.value)}
        />
      </Modal>

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
