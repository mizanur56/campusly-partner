/* eslint-disable react-hooks/exhaustive-deps */
import { Dropdown, Input, Modal, message } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { FaRegUser } from "react-icons/fa6";
import { FiMoreVertical } from "react-icons/fi";
import ExistingPartnerMeetingModal from "../../components/common/Modals/Meeting/ExistingPartnerMeetingModal";
import Step1MeetingModal from "../../components/common/Modals/Meeting/Step1Modal";
import Step2MeetingModal from "../../components/common/Modals/Meeting/Step2Modal";
import Step3MeetingModal from "../../components/common/Modals/Meeting/Step3Modal";
import { Button } from "../../components/ui/button";
import { config } from "../../config";
import {
  useBookMeetingMutation,
  useCancelMeetingMutation,
  useCompletePartnerMeetingForTestMutation,
  useGetMyMeetingsQuery,
} from "../../redux/features/onboardingForm/onboardingFormApi";
import { useGetPartnerProfileQuery } from "../../redux/features/profile/partnerProfileApi";

/**
 * Standalone meeting management page for partners.
 *
 * - Reuses the same booking flow + API endpoints as ContractPage, so partners
 *   in any onboarding stage (pre-approval through ACTIVE) can book / view /
 *   cancel a meeting with their assigned advisor.
 * - ContractPage is intentionally left untouched; this page mirrors the
 *   meeting card it renders, minus the contract / signature panels.
 */

/**
 * Join link unlocks exactly at the scheduled start time (matches ContractPage).
 * Kept at 0 so the join button does not unlock before the session begins.
 */
const PARTNER_JOIN_LEAD_MS = 0;
/** After start, join link stays valid until this offset (covers overrun past booked slot). */
const PARTNER_JOIN_WINDOW_AFTER_START_MS = 3 * 60 * 60 * 1000;
/** Hide "Starts in 0s" — omit countdown when within 1s of start. */
const SHOW_STARTS_IN_THRESHOLD_MS = 1000;

const SHOW_PARTNER_MEETING_TEST_BUTTON =
  import.meta.env.DEV ||
  import.meta.env.VITE_PARTNER_MEETING_TEST === "true";

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

export default function MeetingPage() {
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [existingMeetingModalOpen, setExistingMeetingModalOpen] =
    useState(false);
  const [partnerCancelModalOpen, setPartnerCancelModalOpen] = useState(false);
  const [partnerCancelReason, setPartnerCancelReason] = useState("");
  const [meetingStep, setMeetingStep] = useState<1 | 2 | 3>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
  const [selectedMeetingDate, setSelectedMeetingDate] = useState<string>("");
  const [selectedMeetingTime, setSelectedMeetingTime] = useState<string>("");

  const { data: partnerProfile, isLoading: isProfileLoading } =
    useGetPartnerProfileQuery(undefined);
  const advisor = partnerProfile?.advisor ?? null;
  const advisorPhotoUrl = advisor?.profile?.url
    ? advisor.profile.url.startsWith("http")
      ? advisor.profile.url
      : `${config.image_access_url}${advisor.profile.url}`
    : null;
  const availableSlots = partnerProfile?.advisorAvailableSlots || [];

  const [bookMeeting, { isLoading: isBookingMeeting }] =
    useBookMeetingMutation();
  const {
    data: meetings,
    isLoading: isMeetingsLoading,
    refetch: refetchMeetings,
  } = useGetMyMeetingsQuery();
  const [cancelMeeting, { isLoading: isCancelingMeeting }] =
    useCancelMeetingMutation();
  const [completeMeetingForTest, { isLoading: isCompletingMeetingTest }] =
    useCompletePartnerMeetingForTestMutation();

  const [liveNowMs, setLiveNowMs] = useState(() => Date.now());
  /**
   * DEV-only client-side fast-forward (in ms). Lets a tester "skip to session
   * start" so they can preview the live state without waiting. Real network
   * calls still hit the server with the actual clock; this only affects the
   * countdown UI + join-button enablement on this page.
   */
  const [liveTestOffsetMs, setLiveTestOffsetMs] = useState(0);
  const effectiveNowMs = liveNowMs + liveTestOffsetMs;

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
      msUntilStart: start - effectiveNowMs,
      msUntilUnlock: unlock - effectiveNowMs,
      msUntilSlotEnd: slotEnd - effectiveNowMs,
      msUntilLinkClose: linkClose - effectiveNowMs,
    };
  }, [upcomingMeeting, effectiveNowMs]);

  const canJoinPartnerMeeting = useMemo(() => {
    if (!upcomingMeeting || upcomingMeeting.status !== "SCHEDULED") return false;
    const t = partnerMeetingTimeline;
    if (!t) return false;
    return effectiveNowMs >= t.unlock && effectiveNowMs <= t.linkClose;
  }, [upcomingMeeting, effectiveNowMs, partnerMeetingTimeline]);

  const cardMeetingStartsInLabel = useMemo(() => {
    if (!partnerMeetingTimeline) return "";
    const ms = partnerMeetingTimeline.msUntilStart;
    if (ms <= SHOW_STARTS_IN_THRESHOLD_MS) return "";
    return formatPartnerCountdown(ms);
  }, [partnerMeetingTimeline]);

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

  /** Reset client fast-forward whenever the active meeting changes. */
  useEffect(() => {
    setLiveTestOffsetMs(0);
  }, [upcomingMeeting?.id]);

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

  const handleOpenMeetingModal = () => {
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

  const handleOpenPartnerCancelFromCard = () => {
    setPartnerCancelReason("");
    setPartnerCancelModalOpen(true);
  };

  const handleSubmitPartnerCancel = async () => {
    if (!upcomingMeeting) return;
    const reason = partnerCancelReason.trim();
    if (!reason) {
      message.warning("Please share a brief reason");
      return;
    }
    try {
      await runPartnerCancel(upcomingMeeting.id, reason);
      message.success("Meeting canceled");
      setPartnerCancelModalOpen(false);
      setPartnerCancelReason("");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to cancel meeting");
    }
  };

  const handleClosePartnerCancelModal = () => {
    setPartnerCancelModalOpen(false);
    setPartnerCancelReason("");
  };

  const handleCompleteMeetingForTest = async () => {
    if (!upcomingMeeting) return;
    try {
      await completeMeetingForTest(upcomingMeeting.id).unwrap();
      message.success("Meeting marked as completed (test)");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to complete meeting");
    }
  };

  const noAdvisor = !isProfileLoading && !advisor;

  return (
    <>
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-5">
          <h1 className="text-[22px] font-semibold text-[#20242A] dark:text-gray-100">
            Meeting
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Book a session with your onboarding advisor. Join opens at the
            scheduled start time.
          </p>
        </header>

        <section className="rounded-[16px] border border-primary-border bg-[#FFFFFF] dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-primary-border px-4 py-5 dark:border-gray-800 sm:px-5">
            <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#20242A] dark:text-gray-100">
              <FaRegUser aria-hidden className="h-5 w-5 text-[#20242A]" />
              {upcomingMeeting ? "Scheduled Meeting" : "Your Onboarding Manager"}
            </h2>
          </div>

          <div className="px-4 py-4 sm:px-5">
            {isMeetingsLoading || isProfileLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
                <div className="h-10 w-32 rounded-lg bg-gray-100 dark:bg-gray-800" />
              </div>
            ) : noAdvisor ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-6 text-center dark:border-amber-900/30 dark:bg-amber-950/20">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                  An advisor has not been assigned to you yet.
                </p>
                <p className="text-xs text-amber-800/80 dark:text-amber-400/90">
                  Please come back shortly — once an admin assigns your advisor
                  you will be able to book a meeting here.
                </p>
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
                        if (SHOW_PARTNER_MEETING_TEST_BUTTON) {
                          if (
                            (partnerMeetingTimeline?.msUntilStart ?? 0) > 0
                          ) {
                            items.push({
                              key: "skip",
                              label: "Test: skip to session start",
                              onClick: () => {
                                if (!partnerMeetingTimeline) return;
                                const jumpBy = Math.max(
                                  0,
                                  partnerMeetingTimeline.msUntilStart,
                                );
                                setLiveTestOffsetMs((prev) => prev + jumpBy);
                              },
                            });
                          }
                          items.push({
                            key: "finish",
                            label: isCompletingMeetingTest
                              ? "Finishing…"
                              : "Test: session finished",
                            disabled: isCompletingMeetingTest,
                            onClick: handleCompleteMeetingForTest,
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
                          alt={meetingManager?.name || "Onboarding Manager"}
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
                          Join window is open, but no meeting link is on file
                          yet. Please message your advisor or open this page
                          again shortly.
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
                    disabled={!advisor}
                    className="w-full"
                  >
                    {hasHadCompletedPartnerMeeting
                      ? "Book again"
                      : "Arrange meeting"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Booking flow modals */}
      <Step1MeetingModal
        open={isMeetingModalOpen && meetingStep === 1}
        onClose={() => setIsMeetingModalOpen(false)}
        slots={slotsForBooking}
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
        onClose={() => {
          setIsMeetingModalOpen(false);
          setMeetingStep(1);
          void refetchMeetings();
        }}
        date={selectedMeetingDate}
        time={selectedMeetingTime}
      />

      {/* Existing meeting view modal */}
      <ExistingPartnerMeetingModal
        open={existingMeetingModalOpen}
        meeting={upcomingMeeting ?? null}
        advisor={{
          name: meetingManager?.name ?? advisor?.name ?? "Onboarding Manager",
          email:
            meetingManager?.email ??
            advisor?.email ??
            "support@campustransfer.com",
          phone: meetingManager?.phone ?? advisor?.phone ?? null,
          photoUrl: meetingManager?.photoUrl ?? advisorPhotoUrl ?? null,
          meetingLink:
            meetingManager?.meetingLink ?? advisor?.meetingLink ?? null,
        }}
        onClose={() => setExistingMeetingModalOpen(false)}
        onCanceledOpenBooking={() => {
          setExistingMeetingModalOpen(false);
          openNewBookingAfterCancel();
        }}
        onCancelMeeting={runPartnerCancel}
        isCanceling={isCancelingMeeting}
      />

      {/* Cancel reason modal (from card-level cancel) */}
      <Modal
        open={partnerCancelModalOpen}
        onCancel={handleClosePartnerCancelModal}
        title="Cancel meeting"
        okText={isCancelingMeeting ? "Canceling..." : "Confirm cancel"}
        cancelText="Keep meeting"
        okButtonProps={{
          danger: true,
          loading: isCancelingMeeting,
          disabled: isCancelingMeeting || !partnerCancelReason.trim(),
        }}
        cancelButtonProps={{ disabled: isCancelingMeeting }}
        onOk={handleSubmitPartnerCancel}
        destroyOnClose
      >
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
          Please share a brief reason so your advisor knows what happened.
        </p>
        <Input.TextArea
          rows={4}
          value={partnerCancelReason}
          onChange={(e) => setPartnerCancelReason(e.target.value)}
          placeholder="Reason for cancelation"
          maxLength={500}
        />
      </Modal>
    </>
  );
}
