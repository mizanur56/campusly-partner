import { useEffect, useMemo, useState } from "react";
import { Input, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { config } from "../../config";
import { Button } from "../../components/ui/button";
import { SignaturePad } from "../../components/contract/SignaturePad";
import {
  useBookMeetingMutation,
  useGetAvailableMeetingSlotsQuery,
  useGetContractQuery,
  useCancelMeetingMutation,
  useGetOnboardingStatusQuery,
  useLazyGetOnboardingStatusQuery,
  useGetMyMeetingsQuery,
  useSignContractMutation,
} from "../../redux/features/onboardingForm/onboardingFormApi";
import { useCreateMediaMutation } from "../../redux/features/media/mediaApi";
import { useGetPartnerProfileQuery } from "../../redux/features/profile/partnerProfileApi";

export default function ContractPage() {
  const navigate = useNavigate();
  const [signatureImageDataUrl, setSignatureImageDataUrl] = useState<
    string | null
  >(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
  const [meetingNote, setMeetingNote] = useState("Contract discussion");
  const [selectedWeekday, setSelectedWeekday] = useState<number | null>(null);

  // Fetch contract document URL
  const { data: contractData, isLoading: isContractLoading } =
    useGetContractQuery();
  const { data: onboardingStatus, isLoading: isOnboardingStatusLoading } =
    useGetOnboardingStatusQuery();

  // Fetch partner profile for advisor info
  const { data: partnerProfile } = useGetPartnerProfileQuery();
  const advisor = partnerProfile?.advisor;
  const advisorPhotoUrl = advisor?.profile?.url
    ? advisor.profile.url.startsWith("http")
      ? advisor.profile.url
      : `${config.image_access_url}${advisor.profile.url}`
    : null;

  const dateRange = useMemo(() => {
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 14);

    return {
      from: formatDate(from),
      to: formatDate(to),
    };
  }, []);

  const {
    data: availableSlots,
    isFetching: isLoadingSlots,
    error: availableSlotsError,
  } = useGetAvailableMeetingSlotsQuery(
    { from: dateRange.from, to: dateRange.to },
    { skip: !isMeetingModalOpen },
  );

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

  // Build full PDF URL
  const contractPdfUrl = contractData?.contractDocumentUrl
    ? `${config.image_access_url}${contractData.contractDocumentUrl}`
    : null;

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
    setSelectedSlot(undefined);
    setMeetingNote("Contract discussion");
    setSelectedWeekday(null);
  };

  const handleBookMeeting = async () => {
    if (!selectedSlot) {
      message.warning("Please select an available slot");
      return;
    }

    try {
      await bookMeeting({
        scheduledAt: selectedSlot,
        note: meetingNote?.trim() || undefined,
      }).unwrap();
      message.success("Meeting arranged successfully");
      setIsMeetingModalOpen(false);
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to arrange meeting");
    }
  };

  const getTimeframe = (isoTime: string) => {
    const hour = new Date(isoTime).getHours();
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const groupedSlots = useMemo(() => {
    const groups: Record<
      string,
      {
        label: string;
        weekday: number;
        slots: { iso: string; time: string; timeframe: string }[];
      }
    > = {};

    (availableSlots || []).forEach((slot) => {
      const dateObj = new Date(slot.slot);
      const dateKey = slot.date;
      const time = dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      if (!groups[dateKey]) {
        groups[dateKey] = {
          label: dateObj.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          weekday: dateObj.getDay(),
          slots: [],
        };
      }

      groups[dateKey].slots.push({
        iso: slot.slot,
        time,
        timeframe: getTimeframe(slot.slot),
      });
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);
  }, [availableSlots]);

  const weekdaysWithSlots = useMemo(() => {
    return new Set(groupedSlots.map((group) => group.weekday));
  }, [groupedSlots]);

  const visibleGroupedSlots = useMemo(() => {
    if (selectedWeekday === null) return groupedSlots;
    return groupedSlots.filter((group) => group.weekday === selectedWeekday);
  }, [groupedSlots, selectedWeekday]);

  useEffect(() => {
    if (!groupedSlots.length) {
      return;
    }

    if (selectedWeekday === null) {
      setSelectedWeekday(groupedSlots[0].weekday);
    }
  }, [groupedSlots, selectedWeekday]);

  const selectedSlotSummary = useMemo(() => {
    if (!selectedSlot) return null;
    const dateObj = new Date(selectedSlot);
    return dateObj.toLocaleString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [selectedSlot]);

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
    return {
      name:
        upcomingMeeting.advisor?.name || advisor?.name || "Onboarding Manager",
      email:
        upcomingMeeting.advisor?.email ||
        advisor?.email ||
        "support@campustransfer.com",
      phone: advisor?.phone || null,
      meetingLink:
        upcomingMeeting.meetingLink ||
        upcomingMeeting.advisor?.meetingLink ||
        advisor?.meetingLink ||
        null,
    };
  }, [upcomingMeeting, advisor]);

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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 px-4 py-8 dark:bg-gray-950/30 md:px-6 md:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Left: Contract progress card */}
        <aside className="w-full shrink-0 lg:w-56 xl:w-64">
          <div className="lg:sticky lg:top-24 rounded-[24px] border border-neutral-100 bg-white p-5 card-shadow dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Contract
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {hasSigned ? "2" : "1"}/2 steps •{" "}
              <span className="font-medium text-primary-600 dark:text-primary-400">
                {hasSigned ? "Complete" : "View and Sign"}
              </span>
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    hasSigned
                      ? "bg-primary-600"
                      : "border-2 border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/30"
                  }`}
                >
                  {hasSigned ? (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      1
                    </span>
                  )}
                </span>
                <span
                  className={
                    hasSigned
                      ? "text-gray-600 dark:text-gray-300"
                      : "font-semibold text-primary-700 dark:text-primary-300"
                  }
                >
                  View and Sign
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    hasSigned
                      ? "border-2 border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/30"
                      : "border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
                  }`}
                >
                  {hasSigned ? (
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      2
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      2
                    </span>
                  )}
                </span>
                <span
                  className={
                    hasSigned
                      ? "font-semibold text-primary-700 dark:text-primary-300"
                      : "text-gray-500 dark:text-gray-400"
                  }
                >
                  Complete
                </span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right: Contract content */}
        <main className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
            {/* Header */}
            <header className="border-b border-gray-100 px-6 py-6 dark:border-gray-800 sm:px-8 sm:py-7">
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

            <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-7 divide-y divide-gray-100 dark:divide-gray-800">
              {/* Contract signature viewer */}
              <section className="pt-1 first:pt-0">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      Contract Document
                    </span>
                  </div>
                  {contractPdfUrl && (
                    <a
                      href={contractPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Button variant="primary" size="sm">
                        Download PDF
                      </Button>
                    </a>
                  )}
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
                    <div className="mx-auto h-[500px] max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      <iframe
                        src={`${contractPdfUrl}#toolbar=0&navpanes=0`}
                        className="h-full w-full"
                        title="Contract Document"
                      />
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
              <section className="pt-6">
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
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
                              {advisorPhotoUrl ? (
                                <img
                                  src={advisorPhotoUrl}
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
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {upcomingMeeting.note}
                              </p>
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
                      <div className="flex justify-start sm:justify-end">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleOpenMeetingModal}
                          disabled={!advisor}
                        >
                          Arrange meeting
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Digital signature card */}
              <section className="pt-6">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Digital Signature
                  </h2>
                  {hasSigned && (
                    <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-900/20 dark:text-success-400">
                      {isContractSignRejected ? "Needs re-sign" : "Signed"}
                    </span>
                  )}
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
                      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center dark:border-gray-700 dark:bg-gray-900/40">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            Ready to sign
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Add your digital signature to complete this
                            contract. Click the button and draw in the box.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-start">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowSignaturePad(true)}
                        >
                          Add your signature
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Signature
                          </p>
                          <div className="mt-2 flex items-center justify-center rounded-lg bg-white py-4 dark:bg-gray-950">
                            {signatureImageDataUrl && (
                              <img
                                src={signatureImageDataUrl}
                                alt="Your signature"
                                className="max-h-16 w-auto object-contain"
                              />
                            )}
                          </div>
                          {signedAt && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Signed on {signedAt}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button variant="secondary" size="sm" type="button">
                            View signed contract
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={handleUpdateSignature}
                          >
                            Update signature
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleSubmitSignedContract}
                            disabled={
                              isSigningContract || !signatureImageDataUrl
                            }
                          >
                            {isSigningContract
                              ? "Submitting..."
                              : isContractSignRejected
                                ? "Resubmit signed contract"
                                : "Submit signed contract"}
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

      <Modal
        title="Arrange Meeting"
        open={isMeetingModalOpen}
        onCancel={() => setIsMeetingModalOpen(false)}
        onOk={handleBookMeeting}
        okText="Book Meeting"
        confirmLoading={isBookingMeeting}
        okButtonProps={{
          disabled: !selectedSlot || isLoadingSlots,
          style: { fontWeight: 700 },
        }}
        cancelButtonProps={{ style: { fontWeight: 700 } }}
        width={760}
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Choose an available slot between {dateRange.from} and {dateRange.to}
            .
          </p>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Weekly Availability
            </label>
            <div className="flex flex-wrap gap-2">
              {weekdayLabels.map((day, idx) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setSelectedWeekday(idx);
                    setSelectedSlot(undefined);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedWeekday === idx
                      ? "border-[#237D3B] bg-[#237D3B] text-white"
                      : weekdaysWithSlots.has(idx)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Available Time Slots
            </label>

            {isLoadingSlots && (
              <p className="text-sm text-gray-500">
                Loading available meeting slots...
              </p>
            )}

            {!isLoadingSlots && visibleGroupedSlots.length > 0 && (
              <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
                {visibleGroupedSlots.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.slots.map((slot) => (
                        <button
                          key={slot.iso}
                          type="button"
                          onClick={() => setSelectedSlot(slot.iso)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            selectedSlot === slot.iso
                              ? "border-[#237D3B] bg-[#237D3B] text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:border-[#237D3B] hover:text-[#237D3B]"
                          }`}
                        >
                          {slot.time} • {slot.timeframe}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingSlots &&
              visibleGroupedSlots.length === 0 &&
              !availableSlotsError && (
                <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                  No meeting slots are available right now for this timeframe.
                  Please check again later. Admin can add new availability and
                  slots will appear here.
                </div>
              )}

            {availableSlotsError && (
              <p className="mt-2 text-xs text-red-600">
                {(availableSlotsError as any)?.data?.message ||
                  "Failed to load available slots"}
              </p>
            )}
          </div>

          {selectedSlotSummary && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Selected: {selectedSlotSummary}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Note
            </label>
            <Input.TextArea
              rows={3}
              value={meetingNote}
              onChange={(e) => setMeetingNote(e.target.value)}
              placeholder="Write a short meeting note"
              maxLength={500}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
