import {
  CalendarOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Calendar, Modal, Skeleton } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { Button as PrimaryButton } from "../../../ui/button";

type SlotItem = {
  slot: string;
  date: string;
  slotMinutes?: number;
  status?: "OPEN" | "BOOKED";
};
type AvailabilityTemplate = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes?: number;
};

const WEEKDAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

const SYNTHETIC_SLOT_DAYS_AHEAD = 366;

function isLocalCalendarDayBeforeToday(cell: Dayjs): boolean {
  return cell.format("YYYY-MM-DD") < dayjs().format("YYYY-MM-DD");
}

/** Local calendar key — always YYYY-MM-DD */
function toLocalDateKey(input: string | undefined | null): string {
  if (input == null || !String(input).trim()) return "";
  const d = dayjs(input);
  return d.isValid() ? d.format("YYYY-MM-DD") : "";
}

function prunePastAndDedupeSlotsByDate(
  map: Map<
    string,
    { iso: string; label: string; endLabel: string; status: "OPEN" | "BOOKED" }[]
  >,
  wall: Dayjs,
): Map<
  string,
  { iso: string; label: string; endLabel: string; status: "OPEN" | "BOOKED" }[]
> {
  const out = new Map<
    string,
    { iso: string; label: string; endLabel: string; status: "OPEN" | "BOOKED" }[]
  >();
  for (const [key, arr] of map.entries()) {
    const seen = new Set<string>();
    const next = arr.filter((s) => {
      // Match server behavior exactly: if slot start is before "now" by seconds, it's past.
      if (dayjs(s.iso).isBefore(wall)) return false;
      if (seen.has(s.iso)) return false;
      seen.add(s.iso);
      return true;
    });
    if (next.length > 0) out.set(key, next);
  }
  return out;
}

/** Build local datetime on a calendar day for availability templates */
function parseAvailabilityBoundary(dateKey: string, timeStr: string): Dayjs {
  const raw = (timeStr || "").trim();
  if (!raw) return dayjs(new Date(NaN));
  const twoParts = raw.split(":").length === 2;
  const withSecs =
    twoParts && !/^\d{2}:\d{2}:\d{2}$/.test(raw) ? `${raw}:00` : raw;
  let d = dayjs(`${dateKey} ${withSecs}`, "YYYY-MM-DD HH:mm:ss", true);
  if (!d.isValid()) d = dayjs(`${dateKey} ${raw}`, "YYYY-MM-DD HH:mm", true);
  if (!d.isValid()) d = dayjs(`${dateKey}T${withSecs}`);
  if (!d.isValid()) d = dayjs(`${dateKey}T${raw}`);
  return d;
}

/** Match server: if end ≤ start on same day, treat end as PM (+12h) when that fixes the window */
function resolveTemplateWindow(
  dateKey: string,
  startTime: string,
  endTime: string,
): { start: Dayjs; end: Dayjs } | null {
  const start = parseAvailabilityBoundary(dateKey, startTime);
  let end = parseAvailabilityBoundary(dateKey, endTime);
  if (!start.isValid() || !end.isValid()) return null;
  if (end.isAfter(start)) return { start, end };
  const endPm = end.add(12, "hour");
  if (endPm.isAfter(start) && endPm.isSame(end, "day")) {
    return { start, end: endPm };
  }
  return null;
}

interface Step1ModalProps {
  open: boolean;
  onClose: () => void;
  slots: SlotItem[];
  availabilityTemplates?: AvailabilityTemplate[];
  isLoadingSlots?: boolean;
  onNext: (date: string, time: string, slotIso: string) => void;
}

const Step1Modal: React.FC<Step1ModalProps> = ({
  open,
  onClose,
  slots,
  availabilityTemplates = [],
  isLoadingSlots = false,
  onNext,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSlotIso, setSelectedSlotIso] = useState<string>("");
  /** Refreshed while modal is open so same-day slots that just passed become unavailable. */
  const [slotUiNowMs, setSlotUiNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    setSlotUiNowMs(Date.now());
    const id = window.setInterval(() => setSlotUiNowMs(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, [open]);

  const isSlotStartInPast = useCallback(
    // Match server validation (no minute rounding): current-minute started slots are treated as past.
    (iso: string) => dayjs(iso).isBefore(dayjs(slotUiNowMs)),
    [slotUiNowMs],
  );

  useEffect(() => {
    if (!open || !selectedSlotIso) return;
    if (isSlotStartInPast(selectedSlotIso)) {
      setSelectedTime("");
      setSelectedSlotIso("");
    }
  }, [open, selectedSlotIso, slotUiNowMs, isSlotStartInPast]);

  const availableSlotsByDate = useMemo(() => {
    const map = new Map<
      string,
      { iso: string; label: string; endLabel: string; status: "OPEN" | "BOOKED" }[]
    >();
    const wall = dayjs(slotUiNowMs);
    const pushSlot = (
      dateKey: string,
      slotObj: {
        iso: string;
        label: string;
        endLabel: string;
        status: "OPEN" | "BOOKED";
      },
    ) => {
      if (!dateKey) return;
      if (dayjs(slotObj.iso).isBefore(wall)) return;
      const arr = map.get(dateKey) || [];
      arr.push(slotObj);
      map.set(dateKey, arr);
    };
    slots.forEach((slotItem) => {
      const start = dayjs(slotItem.slot);
      const minsRaw = slotItem.slotMinutes ?? 30;
      const slotMins = Math.max(5, Math.min(Number(minsRaw) || 30, 24 * 60));
      const end = start.add(slotMins, "minute");
      const slotObj = {
        iso: slotItem.slot,
        label: start.format("hh:mm A"),
        endLabel: end.format("hh:mm A"),
        status: slotItem.status === "BOOKED" ? "BOOKED" : "OPEN",
      };
      const fromApiDate = toLocalDateKey(slotItem.date);
      const fromIso = toLocalDateKey(slotItem.slot);
      const keys = new Set<string>();
      if (fromApiDate) keys.add(fromApiDate);
      if (fromIso) keys.add(fromIso);
      if (keys.size === 0) return;
      keys.forEach((k) => pushSlot(k, slotObj));
    });
    if (availabilityTemplates.length === 0) {
      return prunePastAndDedupeSlotsByDate(map, wall);
    }

    const now = wall;
    for (let offset = 0; offset <= SYNTHETIC_SLOT_DAYS_AHEAD; offset += 1) {
      const date = now.add(offset, "day");
      const dateKey = date.format("YYYY-MM-DD");
      if (map.has(dateKey)) continue;

      const weekday = date.day();
      const dayTemplates = availabilityTemplates.filter(
        (tpl) => Number(tpl.dayOfWeek) === weekday,
      );

      dayTemplates.forEach((tpl) => {
        const win = resolveTemplateWindow(
          dateKey,
          tpl.startTime,
          tpl.endTime,
        );
        if (!win) return;
        const { start, end } = win;

        const totalMinutes = end.diff(start, "minute");
        const step = Math.max(1, Math.min(tpl.slotMinutes || 30, totalMinutes));
        for (let m = 0; m + step <= totalMinutes; m += step) {
          const slot = start.add(m, "minute");
          if (slot.isBefore(now)) continue;
          const arr = map.get(dateKey) || [];
          arr.push({
            iso: slot.toISOString(),
            label: slot.format("hh:mm A"),
            endLabel: slot.add(step, "minute").format("hh:mm A"),
            status: "OPEN" as const,
          });
          map.set(dateKey, arr);
        }
      });
    }

    return prunePastAndDedupeSlotsByDate(map, wall);
  }, [slots, availabilityTemplates, slotUiNowMs]);

  const selectedDateKey = selectedDate.format("YYYY-MM-DD");
  const slotsForSelectedDate = availableSlotsByDate.get(selectedDateKey) || [];
  const hasAnyAvailableInSelectedDate = slotsForSelectedDate.length > 0;
  const sortedAvailableDates = useMemo(
    () => Array.from(availableSlotsByDate.keys()).sort(),
    [availableSlotsByDate],
  );
  const nextAvailableDate = sortedAvailableDates[0];
  const hasAvailableDates = sortedAvailableDates.length > 0;

  const weekdaysWithBookableSlots = useMemo(() => {
    const s = new Set<number>();
    const today = dayjs().startOf("day");
    availableSlotsByDate.forEach((slots, key) => {
      if (!slots.length) return;
      const d = dayjs(key);
      if (d.isBefore(today, "day")) return;
      s.add(d.day());
    });
    return s;
  }, [availableSlotsByDate]);

  const jumpToWeekday = (weekday: number) => {
    const today = dayjs().startOf("day");
    for (let i = 0; i <= 120; i += 1) {
      const d = today.add(i, "day");
      if (d.day() !== weekday) continue;
      const key = d.format("YYYY-MM-DD");
      const daySlots = availableSlotsByDate.get(key);
      if (daySlots && daySlots.length > 0) {
        setSelectedDate(d);
        setSelectedTime("");
        setSelectedSlotIso("");
        return;
      }
    }
  };

  /**
   * When the modal (re)opens, always reset to today so the user clearly sees the
   * current date. If today has no slots they can click "Next opening →" or any
   * highlighted day in the calendar to navigate forward. We intentionally do NOT
   * auto-jump away from today: doing so confuses users (e.g. weekly-only advisors
   * make the calendar jump 7 days ahead with no obvious reason).
   */
  useEffect(() => {
    if (!open) return;
    setSelectedDate(dayjs().startOf("day"));
    setSelectedTime("");
    setSelectedSlotIso("");
  }, [open]);

  const handleDateSelect = (date: Dayjs) => {
    const d = dayjs(date).startOf("day");
    setSelectedDate(d);
    setSelectedTime("");
    setSelectedSlotIso("");
  };

  const handleTimeSelect = (time: string, iso: string) => {
    setSelectedTime(time);
    setSelectedSlotIso(iso);
  };

  const handleNext = () => {
    if (selectedDate && selectedTime && selectedSlotIso) {
      onNext(selectedDate.format("YYYY-MM-DD"), selectedTime, selectedSlotIso);
    }
  };

  const handleClose = () => {
    setSelectedDate(dayjs());
    setSelectedTime("");
    setSelectedSlotIso("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width="95%"
      style={{ maxWidth: "850px" }}
      closable={false}
      className="book-session-modal"
      styles={{ content: { padding: "24px", borderRadius: "12px" } }}
    >
      <div className="space-y-4 px-2 sm:px-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#20242A]">Book session</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <IoClose size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col justify-between gap-3 lg:flex-row">
          <div className="w-full space-y-4 lg:w-auto">
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-[#237D3B]" />
              <h3 className="text-base font-semibold text-[#20242A]">Date</h3>
            </div>
            <div
              className="mx-auto w-full rounded-xl border border-primary-border bg-[#FFFFFF] p-4 shadow-sm lg:mx-0 lg:w-[440px]"
              style={{ minHeight: "376px" }}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#237D3B]/15 bg-[#F3FAF5] px-3 py-2.5">
                <CalendarOutlined className="shrink-0 text-lg text-[#237D3B]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight text-[#20242A]">
                    {selectedDate.format("dddd · D MMM YYYY")}
                  </p>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={!hasAvailableDates || isLoadingSlots}
                  onClick={() => {
                    if (!nextAvailableDate) return;
                    const d = dayjs(nextAvailableDate, "YYYY-MM-DD");
                    setSelectedDate(d);
                    setSelectedTime("");
                    setSelectedSlotIso("");
                  }}
                  className="shrink-0 rounded-md bg-[#237D3B]/10 px-2 py-1 text-xs font-semibold text-[#237D3B] transition-colors hover:bg-[#237D3B]/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next opening →
                </button>
              </div>
              {!isLoadingSlots ? (
                <div className="mb-3 rounded-xl border border-[#E4E7EC] bg-linear-to-b from-[#FAFBFC] to-[#F4F6F8] p-3 shadow-inner">
                  <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#64748B]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#237D3B]" />
                      Open
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {WEEKDAY_LABELS.map((label, weekday) => {
                      const hasBook = weekdaysWithBookableSlots.has(weekday);
                      const isSel = selectedDate.day() === weekday;
                      const idle = !hasBook;
                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={idle}
                          onClick={() => jumpToWeekday(weekday)}
                          title={hasBook ? "Jump to next day with openings" : "—"}
                          className={`flex min-h-[48px] flex-col items-center justify-center rounded-lg border px-0.5 py-1.5 text-[10px] font-semibold leading-tight shadow-sm transition-colors ${
                            idle
                              ? "cursor-not-allowed border-transparent bg-[#F3F4F6] text-[#CBD5E1]"
                              : isSel
                                ? "border-[#237D3B] bg-[#237D3B] text-white shadow-sm"
                                : "border-[#B7D4C0] bg-[#E9F2EB] text-[#1B5E2A] hover:bg-[#DDF0E3]"
                          }`}
                        >
                          <span>{label}</span>
                          {hasBook ? (
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-90" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <Calendar
                fullscreen={false}
                value={selectedDate}
                onSelect={handleDateSelect}
                disabledDate={(current) => {
                  const isPast = isLocalCalendarDayBeforeToday(current);
                  if (isPast) return true;
                  if (isLoadingSlots && availableSlotsByDate.size === 0)
                    return true;
                  // Always allow today to be selected so the user can see it
                  // (even if it currently has no openings). The right pane
                  // shows a clear "No slots this day" message in that case.
                  const isToday = dayjs(current).isSame(dayjs(), "day");
                  if (isToday) return false;
                  const key = dayjs(current).startOf("day").format("YYYY-MM-DD");
                  return !availableSlotsByDate.has(key);
                }}
                className="book-session-cal custom-calendar"
                fullCellRender={(current) => {
                  const key = dayjs(current).startOf("day").format("YYYY-MM-DD");
                  const isPast = isLocalCalendarDayBeforeToday(current);
                  const isToday = dayjs(current).isSame(dayjs(), "day");
                  const loadingBlock =
                    isLoadingSlots && availableSlotsByDate.size === 0;
                  const hasSlots =
                    availableSlotsByDate.has(key) && !isPast && !loadingBlock;
                  // Today stays clickable even with zero openings.
                  const isDisabled = isToday
                    ? false
                    : isPast || loadingBlock || !availableSlotsByDate.has(key);
                  const isSelected = dayjs(current).isSame(
                    selectedDate.startOf("day"),
                    "day",
                  );
                  return (
                    <div
                      className={`pointer-events-none relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                        isDisabled
                          ? "cursor-not-allowed text-[#CBD5E1]"
                          : isSelected
                            ? "bg-[#237D3B] font-semibold text-white shadow-sm"
                            : "font-semibold text-[#1F2937]"
                      }`}
                    >
                      <span className={isDisabled ? "opacity-45" : undefined}>
                        {current.date()}
                      </span>
                      {hasSlots && !isSelected ? (
                        <span className="absolute -bottom-0.5 h-1.5 w-1.5 rounded-full bg-[#237D3B]" />
                      ) : null}
                      {hasSlots && isSelected ? (
                        <span className="absolute -bottom-0.5 h-1.5 w-1.5 rounded-full bg-white/90" />
                      ) : null}
                    </div>
                  );
                }}
                headerRender={({ value: panelMonth, onChange }) => {
                  const canPrev = panelMonth
                    .startOf("month")
                    .isAfter(dayjs().startOf("month"));
                  return (
                    <div
                      className="flex items-center justify-between border-none pb-3"
                      style={{ borderBottom: "none" }}
                    >
                      <div className="text-[16px] font-semibold text-[#20242A]">
                        {panelMonth.format("MMMM YYYY")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label="Previous month"
                          disabled={!canPrev}
                          onClick={(e) => {
                            e.preventDefault();
                            onChange(panelMonth.subtract(1, "month"));
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[#374151] shadow-sm transition-colors ${
                            canPrev
                              ? "border-[#E5E7EB] bg-white hover:border-[#237D3B]/40 hover:bg-[#F3FAF5] hover:text-[#237D3B]"
                              : "cursor-not-allowed border-transparent bg-[#F3F4F6] text-[#CBD5E1]"
                          }`}
                        >
                          <LeftOutlined className="text-base" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next month"
                          onClick={(e) => {
                            e.preventDefault();
                            onChange(panelMonth.add(1, "month"));
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-colors hover:border-[#237D3B]/40 hover:bg-[#F3FAF5] hover:text-[#237D3B]"
                        >
                          <RightOutlined className="text-base" />
                        </button>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>

          <div className="w-full space-y-4 lg:w-auto">
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-[#237D3B]" />
              <h3 className="text-base font-semibold text-[#20242A]">Time</h3>
            </div>
            <div className="mx-auto flex h-[376px] w-full flex-col overflow-hidden rounded-xl border border-primary-border bg-[#FFFFFF] p-4 shadow-sm lg:mx-0 lg:w-[350px]">
              <div className="mb-3 shrink-0 border-b border-[#F0F2F5] pb-3">
                <p className="text-[16px] font-semibold text-[#20242A]">
                  {selectedDate.format("ddd D MMM")}
                  {hasAnyAvailableInSelectedDate ? (
                    <span className="ml-2 text-sm font-normal text-[#237D3B]">
                      ({slotsForSelectedDate.length} available time
                      {slotsForSelectedDate.length === 1 ? "" : "s"})
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="step1-time-slots grid flex-1 grid-cols-2 gap-2.5 overflow-y-auto">
                {isLoadingSlots ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={`slot-skeleton-${idx}`}
                      className="rounded-lg border border-primary-border px-3 py-2"
                    >
                      <Skeleton.Input active size="small" block />
                    </div>
                  ))
                ) : !hasAnyAvailableInSelectedDate ? (
                  <div className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAFBFC] p-4 text-center">
                    <p className="text-sm font-medium text-[#475569]">
                      No available times on this day
                    </p>
                    {selectedDate.isSame(dayjs(), "day") ? (
                      <p className="text-xs text-[#64748B]">
                        Today&apos;s times have all passed or are already
                        booked.
                      </p>
                    ) : null}
                    {nextAvailableDate &&
                    !selectedDate.isSame(
                      dayjs(nextAvailableDate, "YYYY-MM-DD"),
                      "day",
                    ) ? (
                      <button
                        type="button"
                        onClick={() => {
                          const d = dayjs(nextAvailableDate, "YYYY-MM-DD");
                          setSelectedDate(d);
                          setSelectedTime("");
                          setSelectedSlotIso("");
                        }}
                        className="rounded-md bg-[#237D3B]/10 px-3 py-1 text-xs font-semibold text-[#237D3B] transition-colors hover:bg-[#237D3B]/15"
                      >
                        Jump to next opening (
                        {dayjs(nextAvailableDate, "YYYY-MM-DD").format(
                          "ddd D MMM",
                        )}
                        )
                      </button>
                    ) : null}
                  </div>
                ) : (
                  slotsForSelectedDate.map(({ label, endLabel, iso, status }) => {
                    const booked = status === "BOOKED";
                    const past = isSlotStartInPast(iso);
                    const blocked = booked || past;
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={blocked}
                        onClick={() => {
                          if (!blocked) handleTimeSelect(label, iso);
                        }}
                        className={`group flex shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-3 transition-all lg:px-6 ${
                          past
                            ? "cursor-not-allowed border-slate-200/90 bg-slate-50 text-slate-400"
                            : booked
                              ? "cursor-not-allowed border-amber-200/90 bg-linear-to-b from-amber-50/90 to-amber-50/50"
                              : selectedSlotIso === iso
                                ? "border-[#237D3B] bg-[#237D3B] text-white shadow-md ring-2 ring-[#237D3B]/25"
                                : "cursor-pointer border-primary-border bg-white text-[#20242A] hover:border-[#237D3B]/40 hover:bg-[#F8FCF9] hover:shadow-sm"
                        }`}
                      >
                        <span
                          className={`text-[15px] font-semibold tabular-nums tracking-tight ${
                            past
                              ? "text-slate-500"
                              : booked
                                ? "text-[#92400e]"
                                : selectedSlotIso === iso
                                  ? "text-white"
                                  : "text-[#111827]"
                          }`}
                        >
                          Start {label}
                        </span>
                        <span
                          className={`mt-1 text-[11px] font-medium tabular-nums ${
                            past
                              ? "text-slate-500"
                              : booked
                                ? "text-[#92400e]"
                                : selectedSlotIso === iso
                                  ? "text-white/90"
                                  : "text-[#4B5563]"
                          }`}
                        >
                          End {endLabel}
                        </span>
                        {past ? (
                          <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Past
                          </span>
                        ) : booked ? (
                          <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-amber-800/90">
                            Booked
                          </span>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleClose}
            size="large"
            className="border-[#237D3B] px-6 py-2 text-[#237D3B] hover:bg-green-50"
          >
            Cancel
          </Button>
          <PrimaryButton
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={!selectedDate || !selectedTime || !selectedSlotIso}
            className="px-6 py-2"
          >
            Continue
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default Step1Modal;
