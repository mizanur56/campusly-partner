import dayjs, { Dayjs } from "dayjs";
import type { Rule } from "antd/es/form";

export const disableFutureDates = (current: Dayjs) =>
  Boolean(current && current.isAfter(dayjs(), "day"));

export const disableStartDate =
  (endDate?: Dayjs | null) => (current: Dayjs) => {
    if (!current) return false;
    if (disableFutureDates(current)) return true;
    if (endDate && current.isAfter(endDate, "day")) return true;
    return false;
  };

export const disableEndDate =
  (startDate?: Dayjs | null) => (current: Dayjs) => {
    if (!current) return false;
    if (disableFutureDates(current)) return true;
    if (startDate && current.isBefore(startDate, "day")) return true;
    return false;
  };

export const disableFutureYears = (current: Dayjs) =>
  Boolean(current && current.year() > dayjs().year());

export const disableStartYear =
  (endYear?: Dayjs | null) => (current: Dayjs) => {
    if (!current) return false;
    if (disableFutureYears(current)) return true;
    if (endYear && current.year() > endYear.year()) return true;
    return false;
  };

export const disableEndYear =
  (startYear?: Dayjs | null) => (current: Dayjs) => {
    if (!current) return false;
    if (disableFutureYears(current)) return true;
    if (startYear && current.year() < startYear.year()) return true;
    return false;
  };

export const startDateRules = (getEndDate?: () => Dayjs | null | undefined): Rule[] => [
  { required: true, message: "Start date is required" },
  {
    validator: (_rule, value: Dayjs) => {
      if (!value) return Promise.resolve();
      if (value.isAfter(dayjs(), "day")) {
        return Promise.reject(new Error("Start date cannot be in the future"));
      }
      const endDate = getEndDate?.();
      if (endDate && value.isAfter(endDate, "day")) {
        return Promise.reject(new Error("Start date cannot be after end date"));
      }
      return Promise.resolve();
    },
  },
];

export const endDateRules = (getStartDate?: () => Dayjs | null | undefined): Rule[] => [
  { required: true, message: "End date is required" },
  {
    validator: (_rule, value: Dayjs) => {
      if (!value) return Promise.resolve();
      if (value.isAfter(dayjs(), "day")) {
        return Promise.reject(new Error("End date cannot be in the future"));
      }
      const startDate = getStartDate?.();
      if (startDate && value.isBefore(startDate, "day")) {
        return Promise.reject(new Error("End date cannot be before start date"));
      }
      return Promise.resolve();
    },
  },
];

export const passingYearRules = (): Rule[] => [
  { required: true, message: "Passing year is required" },
  {
    validator: (_rule, value: Dayjs | string) => {
      if (!value) return Promise.resolve();
      const year = dayjs.isDayjs(value) ? value.year() : Number(value);
      if (Number.isNaN(year)) {
        return Promise.reject(new Error("Please enter a valid year"));
      }
      if (year > dayjs().year()) {
        return Promise.reject(new Error("Passing year cannot be in the future"));
      }
      return Promise.resolve();
    },
  },
];
