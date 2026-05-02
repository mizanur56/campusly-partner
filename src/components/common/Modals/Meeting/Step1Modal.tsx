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
import { useGetMyMeetingsQuery } from "../../../../redux/features/onboardingForm/onboardingFormApi";
import { Button as PrimaryButton } from "../../../ui/button";

type SlotItem = { slot: string; date: string };
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

function slotMinuteKey(iso: string): string {
  return dayjs(iso).format("YYYY-MM-DD HH:mm");
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
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

  const { data: partnerMeetings = [] } = useGetMyMeetingsQuery(undefined, {
    skip: !open,
  });

  const bookedSlotMinuteKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const m of partnerMeetings) {
      if (m.status !== "SCHEDULED") continue;
      if (!m.scheduledAt) continue;
      keys.add(slotMinuteKey(m.scheduledAt));
    }
    return keys;
  }, [partnerMeetings]);

  const isSlotAlreadyBooked = useCallback(
    (iso: string) => bookedSlotMinuteKeys.has(slotMinuteKey(iso)),
    [bookedSlotMinuteKeys],
  );

  const availableSlotsByDate = useMemo(() => {
    const map = new Map<string, { iso: string; label: string }[]>();
    slots.forEach((slotItem) => {
      const dateKey = slotItem.date;
      const localDateKey = dayjs(slotItem.slot).format("YYYY-MM-DD");
      const slotObj = {
        iso: slotItem.slot,
        label: dayjs(slotItem.slot).format("hh:mm A"),
      };
      const arr = map.get(dateKey) || [];
      arr.push(slotObj);
      map.set(dateKey, arr);
      if (localDateKey !== dateKey) {
        const localArr = map.get(localDateKey) || [];
        localArr.push(slotObj);
        map.set(localDateKey, localArr);
      }
    });
    if (availabilityTemplates.length === 0) {
      return map;
    }

    const now = dayjs();
    for (let offset = 0; offset <= SYNTHETIC_SLOT_DAYS_AHEAD; offset += 1) {
      const date = now.add(offset, "day");
      const dateKey = date.format("YYYY-MM-DD");
      if (map.has(dateKey)) continue;

      const weekday = date.day();
      const dayTemplates = availabilityTemplates.filter(
        (tpl) => tpl.dayOfWeek === weekday,
      );

      dayTemplates.forEach((tpl) => {
        const start = dayjs(`${dateKey} ${tpl.startTime}`, "YYYY-MM-DD HH:mm");
        const end = dayjs(`${dateKey} ${tpl.endTime}`, "YYYY-MM-DD HH:mm");
        if (!start.isValid() || !end.isValid() || !start.isBefore(end)) return;

        const totalMinutes = end.diff(start, "minute");
        const step = Math.max(1, Math.min(tpl.slotMinutes || 30, totalMinutes));
        for (let m = 0; m + step <= totalMinutes; m += step) {
          const slot = start.add(m, "minute");
          if (slot.isBefore(now)) continue;
          const arr = map.get(dateKey) || [];
          arr.push({
            iso: slot.toISOString(),
            label: slot.format("hh:mm A"),
          });
          map.set(dateKey, arr);
        }
      });
    }

    return map;
  }, [slots, availabilityTemplates]);

  const selectedDateTemplates = useMemo(() => {
    const weekday = selectedDate.day();
    return availabilityTemplates.filter((tpl) => tpl.dayOfWeek === weekday);
  }, [availabilityTemplates, selectedDate]);

  const selectedDateKey = selectedDate.format("YYYY-MM-DD");
  const slotsForSelectedDate = availableSlotsByDate.get(selectedDateKey) || [];
  const hasAnyAvailableInSelectedDate = slotsForSelectedDate.length > 0;
  const sortedAvailableDates = useMemo(
    () => Array.from(availableSlotsByDate.keys()).sort(),
    [availableSlotsByDate],
  );
  const canGoPrevMonth = currentMonth
    .startOf("month")
    .isAfter(dayjs().startOf("month"));
  const nextAvailableDate = sortedAvailableDates[0];
  const hasAvailableDates = sortedAvailableDates.length > 0;

  const weekdaysWithRecurringRule = useMemo(() => {
    const s = new Set<number>();
    availabilityTemplates.forEach((t) => s.add(t.dayOfWeek));
    return s;
  }, [availabilityTemplates]);

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
      const slots = availableSlotsByDate.get(key);
      if (slots && slots.length > 0) {
        setSelectedDate(d);
        setCurrentMonth(d);
        setSelectedTime("");
        setSelectedSlotIso("");
        return;
      }
    }
    for (let i = 0; i <= 120; i += 1) {
      const d = today.add(i, "day");
      if (d.day() === weekday) {
        setSelectedDate(d);
        setCurrentMonth(d);
        setSelectedTime("");
        setSelectedSlotIso("");
        return;
      }
    }
  };

  useEffect(() => {
    if (!open || isLoadingSlots || availableSlotsByDate.size === 0) return;
    if (hasAnyAvailableInSelectedDate) return;
    const keys = Array.from(availableSlotsByDate.keys()).sort();
    const firstKey = keys[0];
    if (firstKey) {
      setSelectedDate(dayjs(firstKey, "YYYY-MM-DD"));
      setCurrentMonth(dayjs(firstKey, "YYYY-MM-DD"));
      setSelectedTime("");
      setSelectedSlotIso("");
    }
  }, [
    open,
    isLoadingSlots,
    availableSlotsByDate,
    hasAnyAvailableInSelectedDate,
  ]);

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setCurrentMonth(date);
    setSelectedTime("");
    setSelectedSlotIso("");
  };

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    setCurrentMonth((m) => m.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth((m) => m.add(1, "month"));
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
          <h2 className="text-[20px] font-semibold text-[#20242A]">
            Book a session
          </h2>
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
              <h3 className="text-[18px] font-semibold text-[#20242A]">
                Select Date
              </h3>
            </div>
            <div
              className="mx-auto w-full rounded-xl border border-primary-border bg-[#FFFFFF] p-4 shadow-sm lg:mx-0 lg:w-[440px]"
              style={{ minHeight: "376px" }}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#237D3B]/15 bg-[#F3FAF5] px-3 py-2.5">
                <CalendarOutlined className="shrink-0 text-lg text-[#237D3B]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Selected date
                  </p>
                  <p className="truncate text-sm font-semibold leading-tight text-[#20242A]">
                    {selectedDate.format("dddd · D MMM YYYY")}
                  </p>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs leading-snug text-[#4B5563]">
                  Grey numbers = not bookable. Bold/dark dates with a green dot
                  = openings (only those days are clickable).
                </p>
                <button
                  type="button"
                  disabled={!hasAvailableDates || isLoadingSlots}
                  onClick={() => {
                    if (!nextAvailableDate) return;
                    const d = dayjs(nextAvailableDate, "YYYY-MM-DD");
                    setSelectedDate(d);
                    setCurrentMonth(d);
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
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#374151]">
                      Weekly pattern
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-[#64748B]">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#237D3B]" />
                        Opening
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {WEEKDAY_LABELS.map((label, weekday) => {
                      const hasRule = weekdaysWithRecurringRule.has(weekday);
                      const hasBook = weekdaysWithBookableSlots.has(weekday);
                      const isSel = selectedDate.day() === weekday;
                      const idle = !hasRule && !hasBook;
                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={idle}
                          onClick={() => jumpToWeekday(weekday)}
                          title={
                            hasBook
                              ? "Has bookable slots"
                              : hasRule
                                ? "Weekly hours set — open calendar if no times"
                                : "No weekly slot"
                          }
                          className={`flex min-h-[48px] flex-col items-center justify-center rounded-lg border px-0.5 py-1.5 text-[10px] font-semibold leading-tight shadow-sm transition-colors ${
                            idle
                              ? "cursor-not-allowed border-transparent bg-[#F3F4F6] text-[#CBD5E1]"
                              : hasBook
                                ? isSel
                                  ? "border-[#237D3B] bg-[#237D3B] text-white shadow-sm"
                                  : "border-[#B7D4C0] bg-[#E9F2EB] text-[#1B5E2A] hover:bg-[#DDF0E3]"
                                : hasRule
                                  ? isSel
                                    ? "border-amber-400 bg-amber-100 text-amber-950"
                                    : "border-dashed border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                                  : ""
                          }`}
                        >
                          <span>{label}</span>
                          {hasBook ? (
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-90" />
                          ) : hasRule ? (
                            <span className="mt-0.5 text-[8px] font-normal opacity-80">
                              hrs
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2.5 text-[10px] leading-relaxed text-[#6B7280]">
                    Tap a weekday to match the calendar. Use ← → above the grid
                    to change month.
                  </p>
                </div>
              ) : null}
              <Calendar
                fullscreen={false}
                value={currentMonth}
                onSelect={handleDateSelect}
                onPanelChange={(date) => {
                  setCurrentMonth(date);
                }}
                disabledDate={(current) => {
                  const isPast = isLocalCalendarDayBeforeToday(current);
                  if (isPast) return true;
                  if (isLoadingSlots && availableSlotsByDate.size === 0)
                    return true;
                  const key = current.format("YYYY-MM-DD");
                  return !availableSlotsByDate.has(key);
                }}
                className="book-session-cal custom-calendar"
                fullCellRender={(current) => {
                  const key = current.format("YYYY-MM-DD");
                  const isPast = isLocalCalendarDayBeforeToday(current);
                  const loadingBlock =
                    isLoadingSlots && availableSlotsByDate.size === 0;
                  const hasSlots =
                    availableSlotsByDate.has(key) && !isPast && !loadingBlock;
                  const isDisabled =
                    isPast || loadingBlock || !availableSlotsByDate.has(key);
                  const isSelected = current.isSame(selectedDate, "day");
                  return (
                    <div
                      className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
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
                headerRender={() => (
                  <div
                    className="flex items-center justify-between border-none pb-3"
                    style={{ borderBottom: "none" }}
                  >
                    <div className="text-[16px] font-semibold text-[#20242A]">
                      {currentMonth.format("MMMM YYYY")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Previous month"
                        disabled={!canGoPrevMonth}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePrevMonth();
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[#374151] shadow-sm transition-colors ${
                          canGoPrevMonth
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
                          handleNextMonth();
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-colors hover:border-[#237D3B]/40 hover:bg-[#F3FAF5] hover:text-[#237D3B]"
                      >
                        <RightOutlined className="text-base" />
                      </button>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="w-full space-y-4 lg:w-auto">
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-[#237D3B]" />
              <h3 className="text-[18px] font-semibold text-[#20242A]">
                Select Time
              </h3>
            </div>
            <div className="mx-auto flex h-[376px] w-full flex-col overflow-hidden rounded-xl border border-primary-border bg-[#FFFFFF] p-4 shadow-sm lg:mx-0 lg:w-[350px]">
              <div className="mb-3 shrink-0 border-b border-[#F0F2F5] pb-3">
                <p className="text-[16px] font-semibold text-[#20242A]">
                  Available time slots
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  For{" "}
                  <span className="font-semibold text-[#20242A]">
                    {selectedDate.format("ddd D MMM")}
                  </span>
                  {hasAnyAvailableInSelectedDate ? (
                    <span className="text-[#237D3B]">
                      {" "}
                      · {slotsForSelectedDate.length} opening
                      {slotsForSelectedDate.length === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </p>
              </div>
              {!isLoadingSlots && selectedDateTemplates.length > 0 ? (
                <div className="mb-3 shrink-0 space-y-2 rounded-lg border border-[#E8ECF1] bg-[#FAFBFC] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
                    Weekly window (same day each week)
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedDateTemplates.map((tpl, idx) => {
                      const start = dayjs(tpl.startTime, "HH:mm");
                      const end = dayjs(tpl.endTime, "HH:mm");
                      const duration = Math.max(0, end.diff(start, "minute"));
                      const step = tpl.slotMinutes ?? 30;
                      return (
                        <div
                          key={`${tpl.dayOfWeek}-${tpl.startTime}-${idx}`}
                          className="flex flex-wrap items-center gap-2 text-xs"
                        >
                          <span className="inline-flex items-center rounded-md border border-primary-border bg-white px-2 py-1 font-semibold tabular-nums text-[#20242A]">
                            {start.format("h:mm A")} – {end.format("h:mm A")}
                          </span>
                          <span className="rounded-md bg-[#E9F2EB] px-2 py-0.5 text-[11px] font-medium text-[#1B5E2A]">
                            {duration} min window
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            · {step} min slots
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
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
                  <div className="col-span-2 rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAFBFC] p-4 text-center">
                    <p className="text-sm font-medium text-[#475569]">
                      No openings this day
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      Pick another date in the calendar or use the week row
                      above.
                    </p>
                  </div>
                ) : (
                  slotsForSelectedDate.map(({ label, iso }) => {
                    const booked = isSlotAlreadyBooked(iso);
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={booked}
                        onClick={() => {
                          if (!booked) handleTimeSelect(label, iso);
                        }}
                        className={`group flex shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-3 transition-all lg:px-6 ${
                          booked
                            ? "cursor-not-allowed border-amber-200/90 bg-linear-to-b from-amber-50/90 to-amber-50/50"
                            : selectedSlotIso === iso
                              ? "border-[#237D3B] bg-[#237D3B] text-white shadow-md ring-2 ring-[#237D3B]/25"
                              : "cursor-pointer border-primary-border bg-white text-[#20242A] hover:border-[#237D3B]/40 hover:bg-[#F8FCF9] hover:shadow-sm"
                        }`}
                      >
                        <span
                          className={`text-[15px] font-semibold tabular-nums tracking-tight ${
                            booked
                              ? "text-[#92400e]"
                              : selectedSlotIso === iso
                                ? "text-white"
                                : "text-[#111827]"
                          }`}
                        >
                          {label}
                        </span>
                        <span
                          className={`mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] ${
                            booked
                              ? "text-amber-800/90"
                              : selectedSlotIso === iso
                                ? "text-white/85"
                                : "text-[#94A3B8] group-hover:text-[#237D3B]"
                          }`}
                        >
                          {booked ? "Booked" : "Slot"}
                        </span>
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
