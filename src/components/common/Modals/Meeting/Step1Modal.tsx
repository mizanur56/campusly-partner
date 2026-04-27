import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Calendar, Skeleton } from "antd";
import { IoClose } from "react-icons/io5";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Button as PrimaryButton } from "../../../ui/button";

type SlotItem = { slot: string; date: string };
type AvailabilityTemplate = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes?: number;
};

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
    if (map.size > 0 || availabilityTemplates.length === 0) {
      return map;
    }

    const now = dayjs();
    for (let offset = 0; offset <= 60; offset += 1) {
      const date = now.add(offset, "day");
      const dateKey = date.format("YYYY-MM-DD");
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
  const nextAvailableDate = sortedAvailableDates[0];
  const hasAvailableDates = sortedAvailableDates.length > 0;

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
              className="mx-auto w-full rounded-lg border border-[#C7CACF] bg-[#FFFFFF] p-4 lg:mx-0 lg:w-[440px]"
              style={{ height: "376px" }}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-[#4B5563]">
                  Only dates with available slots are selectable
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
                  className="text-xs font-semibold text-[#237D3B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Jump to next available
                </button>
              </div>
              <Calendar
                fullscreen={false}
                value={currentMonth}
                onSelect={handleDateSelect}
                onPanelChange={(date) => setCurrentMonth(date)}
                disabledDate={(current) => {
                  const isPast = current.isBefore(dayjs().startOf("day"), "day");
                  if (isPast) return true;
                  if (isLoadingSlots) return true;
                  const key = current.format("YYYY-MM-DD");
                  return !availableSlotsByDate.has(key);
                }}
                className="custom-calendar"
                fullCellRender={(current) => {
                  const key = current.format("YYYY-MM-DD");
                  const isAvailable = availableSlotsByDate.has(key);
                  const isSelected = current.isSame(selectedDate, "day");
                  return (
                    <div
                      className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                        isSelected ? "bg-[#E9F2EB] text-[#237D3B] font-semibold" : ""
                      }`}
                    >
                      {current.date()}
                      {isAvailable && !isSelected ? (
                        <span className="absolute -bottom-0.5 h-1.5 w-1.5 rounded-full bg-[#237D3B]" />
                      ) : null}
                    </div>
                  );
                }}
                headerRender={({ value, onChange }) => {
                  const monthName = value.format("MMMM YYYY");
                  return (
                    <div
                      className="flex items-center justify-between border-none"
                      style={{ borderBottom: "none" }}
                    >
                      <div className="pb-3 text-[16px] font-semibold text-[#20242A]">
                        {monthName}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newValue = value.subtract(1, "month");
                            onChange(newValue);
                            setCurrentMonth(newValue);
                          }}
                          className="flex items-center justify-center rounded p-1 transition-colors hover:bg-gray-100"
                          type="button"
                        >
                          <LeftOutlined className="text-sm text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            const newValue = value.add(1, "month");
                            onChange(newValue);
                            setCurrentMonth(newValue);
                          }}
                          className="flex items-center justify-center rounded p-1 transition-colors hover:bg-gray-100"
                          type="button"
                        >
                          <RightOutlined className="text-sm text-gray-600" />
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
              <h3 className="text-[18px] font-semibold text-[#20242A]">
                Select Time
              </h3>
            </div>
            <div className="mx-auto flex h-[376px] w-full flex-col overflow-hidden rounded-lg border border-[#C7CACF] bg-[#FFFFFF] p-4 lg:mx-0 lg:w-[350px]">
              <p className="mb-4 shrink-0 text-[16px] font-semibold text-[#20242A]">
                Available Time Slots
              </p>
              {!isLoadingSlots && selectedDateTemplates.length > 0 ? (
                <div className="mb-3 rounded-md border border-[#E4E7EC] bg-[#F9FAFB] p-2 text-xs text-[#344054]">
                  {selectedDateTemplates.map((tpl, idx) => {
                    const start = dayjs(tpl.startTime, "HH:mm");
                    const end = dayjs(tpl.endTime, "HH:mm");
                    const duration = Math.max(0, end.diff(start, "minute"));
                    return (
                      <p key={`${tpl.dayOfWeek}-${tpl.startTime}-${idx}`}>
                        {start.format("hh:mm A")} - {end.format("hh:mm A")} | Total:{" "}
                        {duration} min
                      </p>
                    );
                  })}
                </div>
              ) : null}
              <div className="step1-time-slots grid flex-1 grid-cols-2 gap-3 overflow-y-auto">
                {isLoadingSlots ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={`slot-skeleton-${idx}`}
                      className="rounded-lg border border-[#C7CACF] px-3 py-2"
                    >
                      <Skeleton.Input active size="small" block />
                    </div>
                  ))
                ) : !hasAnyAvailableInSelectedDate ? (
                  <div className="col-span-2 rounded-lg border border-dashed border-[#C7CACF] bg-[#FAFAFA] p-3 text-center text-sm text-[#4B5563]">
                    No time slots available for this date.
                  </div>
                ) : (
                  slotsForSelectedDate.map(({ label, iso }) => {
                    return (
                    <button
                      key={iso}
                      onClick={() => handleTimeSelect(label, iso)}
                      className={`shrink-0 rounded-lg border px-4 py-3 transition-all lg:px-8 ${
                        selectedSlotIso === iso
                          ? "border-[#237D3B] bg-[#237D3B] text-white"
                          : "cursor-pointer border-[#C7CACF] bg-[#FFFFFF] text-[#20242A] hover:border-[#C7CACF]"
                      }`}
                    >
                      <span
                        className={`text-[14px] ${
                          selectedSlotIso === iso
                            ? "text-white"
                            : "text-[#20242A]"
                        }`}
                      >
                        {label}
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
