import { Dropdown, Input, Modal, message } from "antd";
import type { MenuProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import {
  type PartnerMeetingItem,
  useCompletePartnerMeetingForTestMutation,
} from "../../../../redux/features/onboardingForm/onboardingFormApi";

/** Join link unlocks exactly at the scheduled start time (no pre-lead). */
const JOIN_LEAD_MS = 0;
const JOIN_WINDOW_AFTER_START_MS = 3 * 60 * 60 * 1000;

const SHOW_PARTNER_MEETING_TEST_BUTTON =
  import.meta.env.DEV ||
  import.meta.env.VITE_PARTNER_MEETING_TEST === "true";
/** Hide “Starts in 0s” / flicker within the last second before start. */
const START_HIDE_BELOW_MS = 1000;

function formatCountdown(ms: number): string {
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

export type ExistingMeetingAdvisorSummary = {
  name: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  meetingLink: string | null;
};

type Props = {
  open: boolean;
  meeting: PartnerMeetingItem | null;
  advisor: ExistingMeetingAdvisorSummary;
  onClose: () => void;
  /** After partner cancels successfully — parent opens new booking flow */
  onCanceledOpenBooking: () => void;
  onCancelMeeting: (meetingId: string, reason: string) => Promise<void>;
  isCanceling: boolean;
};

const ExistingPartnerMeetingModal: React.FC<Props> = ({
  open,
  meeting,
  advisor,
  onClose,
  onCanceledOpenBooking,
  onCancelMeeting,
  isCanceling,
}) => {
  const [now, setNow] = useState(() => Date.now());
  /**
   * DEV-only fast-forward: lets testers preview the live state without
   * waiting until the actual scheduled time. Only affects countdown UI +
   * join-button enablement; the test "end session" button still calls the
   * real server hook.
   */
  const [liveTestOffsetMs, setLiveTestOffsetMs] = useState(0);
  const effectiveNow = now + liveTestOffsetMs;
  const [cancelReason, setCancelReason] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [completeMeetingForTest, { isLoading: isCompletingMeetingTest }] =
    useCompletePartnerMeetingForTestMutation();

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setCancelReason("");
      setCancelModalOpen(false);
      setLiveTestOffsetMs(0);
    }
  }, [open]);

  useEffect(() => {
    setLiveTestOffsetMs(0);
  }, [meeting?.id]);

  const scheduledMs = meeting ? new Date(meeting.scheduledAt).getTime() : NaN;
  const slotMinsResolved = meeting
    ? Math.max(5, Math.min(Number(meeting.slotMinutes ?? 30) || 30, 24 * 60))
    : 30;
  const slotEndMs =
    meeting && Number.isFinite(scheduledMs)
      ? scheduledMs + slotMinsResolved * 60 * 1000
      : NaN;
  const joinUnlockMs = scheduledMs - JOIN_LEAD_MS;
  const joinCloseMs = scheduledMs + JOIN_WINDOW_AFTER_START_MS;

  const joinAllowed = useMemo(() => {
    if (!meeting || meeting.status !== "SCHEDULED" || !Number.isFinite(scheduledMs))
      return false;
    return effectiveNow >= joinUnlockMs && effectiveNow <= joinCloseMs;
  }, [meeting, effectiveNow, scheduledMs, joinUnlockMs, joinCloseMs]);

  const msUntilMeetingStart = scheduledMs - effectiveNow;
  const msUntilSlotEnd = Number.isFinite(slotEndMs)
    ? slotEndMs - effectiveNow
    : NaN;
  const msUntilLinkClose = joinCloseMs - effectiveNow;
  const canCancelBeforeStart =
    !!meeting &&
    meeting.status === "SCHEDULED" &&
    Number.isFinite(msUntilMeetingStart) &&
    msUntilMeetingStart > 0;

  const clockLabel = useMemo(
    () =>
      new Date(now).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    [now],
  );

  const meetingStartEndLabels = useMemo(() => {
    if (!meeting)
      return { dateLine: "", startTime: "", endTime: "" };
    const start = new Date(meeting.scheduledAt);
    const minsRaw = meeting.slotMinutes ?? 30;
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
  }, [meeting]);

  const handleConfirmCancel = useCallback(async () => {
    if (!meeting) return;
    const r = cancelReason.trim();
    if (r.length < 10) {
      message.warning("Please write a cancellation reason (at least 10 characters).");
      return;
    }
    try {
      await onCancelMeeting(meeting.id, r);
      message.success("Meeting canceled");
      setCancelModalOpen(false);
      onClose();
      onCanceledOpenBooking();
    } catch (e: any) {
      message.error(e?.data?.message || "Failed to cancel meeting");
    }
  }, [meeting, cancelReason, onCancelMeeting, onClose, onCanceledOpenBooking]);

  const link = advisor.meetingLink || meeting?.meetingLink || null;

  const handleTestCompleteMeeting = useCallback(async () => {
    if (!meeting) return;
    try {
      await completeMeetingForTest(meeting.id).unwrap();
      message.success(
        "Meeting marked completed (test). Close this dialog and use Book again on the contract page.",
      );
      onClose();
    } catch (e: any) {
      message.error(
        e?.data?.message ||
          "Test failed. Server needs development mode or PARTNER_MEETING_TEST_COMPLETE=1.",
      );
    }
  }, [meeting, completeMeetingForTest, onClose]);

  const overflowMenuItems = useMemo<MenuProps["items"]>(() => {
    if (!meeting) return [];
    const items: NonNullable<MenuProps["items"]> = [];
    if (canCancelBeforeStart) {
      items.push({
        key: "cancel",
        danger: true,
        label: isCanceling ? "Canceling..." : "Cancel meeting",
        disabled: isCanceling,
        onClick: () => setCancelModalOpen(true),
      });
    }
    if (SHOW_PARTNER_MEETING_TEST_BUTTON && meeting.status === "SCHEDULED") {
      if (msUntilMeetingStart > 0) {
        items.push({
          key: "skip",
          label: "Test: skip to session start",
          onClick: () => {
            const jumpBy = Math.max(0, msUntilMeetingStart);
            setLiveTestOffsetMs((prev) => prev + jumpBy);
          },
        });
      }
      items.push({
        key: "finish",
        label: isCompletingMeetingTest ? "Finishing…" : "Test: session finished",
        disabled: isCompletingMeetingTest,
        onClick: handleTestCompleteMeeting,
      });
    }
    return items;
  }, [
    meeting,
    canCancelBeforeStart,
    isCanceling,
    msUntilMeetingStart,
    isCompletingMeetingTest,
    handleTestCompleteMeeting,
  ]);

  const modalTitle = (
    <div className="flex items-center justify-between gap-3 pr-6">
      <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Your scheduled meeting
      </span>
      {overflowMenuItems && overflowMenuItems.length > 0 ? (
        <Dropdown
          menu={{ items: overflowMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button
            type="button"
            aria-label="Meeting actions"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <FiMoreVertical className="h-4 w-4" />
          </button>
        </Dropdown>
      ) : null}
    </div>
  );

  return (
    <>
      <Modal
        title={modalTitle}
        open={open && !!meeting}
        onCancel={onClose}
        footer={null}
        width={520}
        destroyOnHidden
      >
        {meeting && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-900">
              <span className="font-semibold">Live clock: </span>
              <span className="tabular-nums font-medium">{clockLabel}</span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/90 p-3 dark:border-gray-700 dark:bg-gray-900/50">
              <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                {meetingStartEndLabels.dateLine}
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">
                Starts
              </p>
              <p className="mt-1 text-base font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                {meetingStartEndLabels.startTime}
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Ends{" "}
                <span className="font-normal normal-case text-gray-500">
                  (end of meeting)
                </span>
              </p>
              <p className="mt-1 text-base tabular-nums text-gray-800 dark:text-gray-200">
                {meetingStartEndLabels.endTime}
              </p>
            </div>

            {joinAllowed && (
              <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-gray-900">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                  Join window active
                </p>
                {msUntilSlotEnd > 0 ? (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Auto-completes in{" "}
                    <span className="text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatCountdown(msUntilSlotEnd)}
                    </span>
                  </p>
                ) : msUntilLinkClose > 0 ? (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Meeting time ended — join link closes in{" "}
                    <span className="text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatCountdown(msUntilLinkClose)}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                    Join window is closing — tap Join below now.
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Link stays open for 3 hours after the scheduled start (even
                  after your meeting ends).
                </p>
              </div>
            )}

            {!joinAllowed &&
              msUntilMeetingStart > START_HIDE_BELOW_MS &&
              Number.isFinite(msUntilMeetingStart) && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Meeting starts in
                  </p>
                  <p className="text-lg font-semibold tabular-nums text-gray-900">
                    {formatCountdown(msUntilMeetingStart)}
                  </p>
                </div>
              )}


            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
              {advisor.photoUrl ? (
                <img
                  src={advisor.photoUrl}
                  alt={advisor.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                  {advisor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{advisor.name}</p>
                <p className="truncate text-xs text-gray-500">{advisor.email}</p>
              </div>
            </div>

            {meeting.note && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                <p className="font-semibold text-gray-800">Details</p>
                <p className="mt-1 whitespace-pre-line">{meeting.note}</p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {link ? (
                joinAllowed ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400/90 ring-offset-2 transition hover:from-emerald-500 hover:to-emerald-600 hover:shadow-emerald-500/50"
                  >
                    Join meeting — open link
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-500"
                  >
                    Join meeting
                  </button>
                )
              ) : (
                <span className="text-sm text-gray-500">
                  No join link on file yet.
                </span>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Cancel meeting"
        open={cancelModalOpen}
        onCancel={() => !isCanceling && setCancelModalOpen(false)}
        okText="Confirm cancel"
        okButtonProps={{ danger: true, loading: isCanceling }}
        onOk={handleConfirmCancel}
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
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default ExistingPartnerMeetingModal;
