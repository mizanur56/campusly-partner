import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type {
  PartnerTaskDetail,
  PartnerTaskListItem,
} from "../../../redux/features/tasks/partnerTasksApi";

dayjs.extend(customParseFormat);

export type EmployeeTaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type EmployeeTaskStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED"
  | "CANCELLED";

/**
 * Normalized task shape shared by all Task Management UI components.
 * Mirrors the admin `EmployeeTask` model so the admin UI can be reused
 * verbatim while the partner portal keeps its own API + data structure.
 */
export interface EmployeeTask {
  id: string;
  title: string;
  description?: string | null;
  priority: EmployeeTaskPriority;
  status: EmployeeTaskStatus;
  dueDate: string;
  assignedByUserId: string;
  assignedToUserId: string;
  submissionNote?: string | null;
  reviewNote?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedBy?: { id: string; name: string; email: string };
  assignedTo?: { id: string; name: string; email: string };
}

const VALID_PRIORITIES: EmployeeTaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];
const VALID_STATUSES: EmployeeTaskStatus[] = [
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
  "CANCELLED",
];

function safePriority(value?: string | null): EmployeeTaskPriority {
  return value && VALID_PRIORITIES.includes(value as EmployeeTaskPriority)
    ? (value as EmployeeTaskPriority)
    : "MEDIUM";
}

function safeStatus(value?: string | null): EmployeeTaskStatus {
  return value && VALID_STATUSES.includes(value as EmployeeTaskStatus)
    ? (value as EmployeeTaskStatus)
    : "IN_PROGRESS";
}

/** Combine a date-only string + a time string ("hh:mm A") into an ISO datetime. */
export function combinePartnerDue(
  rawDate?: string | null,
  rawTime?: string | null,
): string {
  if (!rawDate) return "";
  const dateStr =
    typeof rawDate === "string"
      ? rawDate.length >= 10
        ? rawDate.slice(0, 10)
        : rawDate
      : dayjs(rawDate).format("YYYY-MM-DD");

  if (rawTime && String(rawTime).trim()) {
    const parsed = dayjs(
      `${dateStr} ${String(rawTime).trim()}`,
      ["YYYY-MM-DD h:mm A", "YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm"],
      true,
    );
    if (parsed.isValid()) return parsed.toISOString();
  }

  const d = dayjs(rawDate);
  return d.isValid() ? d.toISOString() : "";
}

/** Map a partner list row into the normalized EmployeeTask shape. */
export function normalizePartnerTask(row: PartnerTaskListItem): EmployeeTask {
  return {
    id: row.id,
    title: row.task_title,
    description: null,
    priority: safePriority(row.priority),
    status: safeStatus(row.status),
    dueDate: combinePartnerDue(row.dueDate, row.dueTime),
    assignedByUserId: "",
    assignedToUserId: "",
    createdAt: row.created_date_time,
    updatedAt: row.created_date_time,
    assignedTo: {
      id: "",
      name: row.assigned_member_name || "",
      email: row.assigned_member_email || "",
    },
    assignedBy: {
      id: "",
      name: row.created_by_name || "",
      email: row.created_by_email || "",
    },
  };
}

/** Enrich a normalized task with detail-endpoint fields (description, notes, etc.). */
export function enrichWithDetail(
  base: EmployeeTask,
  detail: PartnerTaskDetail,
): EmployeeTask {
  return {
    ...base,
    title: detail.task_title ?? base.title,
    description: detail.task_description ?? base.description,
    priority: safePriority(detail.priority ?? base.priority),
    status: safeStatus(detail.status ?? base.status),
    dueDate: combinePartnerDue(detail.due_date, detail.due_time) || base.dueDate,
    submissionNote: detail.submissionNote ?? null,
    reviewNote: detail.reviewNote ?? null,
    createdAt: detail.createdAt ?? base.createdAt,
    updatedAt: detail.updatedAt ?? base.updatedAt,
    assignedTo: detail.assignedTo
      ? {
          id: detail.assignedTo.id ?? "",
          name: detail.assignedTo.name ?? base.assignedTo?.name ?? "",
          email: detail.assignedTo.email ?? base.assignedTo?.email ?? "",
        }
      : base.assignedTo,
    assignedBy: {
      id: base.assignedBy?.id ?? "",
      name: detail.created_by ?? base.assignedBy?.name ?? "",
      email: base.assignedBy?.email ?? "",
    },
  };
}
