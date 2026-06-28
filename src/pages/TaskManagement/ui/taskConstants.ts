import type { EmployeeTaskPriority, EmployeeTaskStatus } from "./types";

export const PRIORITY_OPTIONS: EmployeeTaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export const STATUS_OPTIONS: EmployeeTaskStatus[] = [
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export const PRIORITY_CONFIG: Record<
  EmployeeTaskPriority,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  LOW: {
    label: "Low",
    color: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-50 dark:bg-slate-800/60",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
  },
  MEDIUM: {
    label: "Medium",
    color: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    dot: "bg-sky-500",
  },
  HIGH: {
    label: "High",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  URGENT: {
    label: "Urgent",
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
  },
};

export const STATUS_CONFIG: Record<
  EmployeeTaskStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
  },
  SUBMITTED: {
    label: "Submitted",
    color: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
  },
};

export type TaskViewMode = "kanban" | "list" | "calendar" | "timeline";

export const VIEW_MODES: { key: TaskViewMode; label: string }[] = [
  { key: "kanban", label: "Board" },
  { key: "list", label: "List" },
  { key: "calendar", label: "Calendar" },
  { key: "timeline", label: "Timeline" },
];
