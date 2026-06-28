import dayjs from "dayjs";
import type { EmployeeTask } from "./types";

export function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function isTaskOverdue(task: EmployeeTask): boolean {
  if (task.status !== "IN_PROGRESS" && task.status !== "SUBMITTED") return false;
  return dayjs(task.dueDate).isBefore(dayjs());
}

export function getTaskProgress(status: EmployeeTask["status"]): number {
  switch (status) {
    case "COMPLETED":
      return 100;
    case "SUBMITTED":
      return 85;
    case "IN_PROGRESS":
      return 45;
    case "CANCELLED":
      return 0;
    default:
      return 0;
  }
}

export function formatDueLabel(dueDate: string): string {
  const due = dayjs(dueDate);
  const today = dayjs().startOf("day");
  const diff = due.startOf("day").diff(today, "day");
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff <= 7) return `Due in ${diff}d`;
  return due.format("MMM D, YYYY");
}

export function deriveDepartment(task: EmployeeTask): string {
  const designation =
    (task.assignedTo as { designation?: { name?: string } } | undefined)
      ?.designation?.name ?? "";
  return designation || "General";
}

export function buildTaskSummary(stats: {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}): string {
  return [
    `## Task Management Summary`,
    ``,
    `**Overview** — ${stats.total} total tasks across your workspace.`,
    ``,
    `- **${stats.completed}** tasks completed (${stats.completionRate}% completion rate)`,
    `- **${stats.inProgress}** tasks currently in progress`,
    `- **${stats.overdue}** tasks overdue and need attention`,
    ``,
    stats.overdue > 0
      ? `> ⚠️ Priority: Review ${stats.overdue} overdue task${stats.overdue > 1 ? "s" : ""} to maintain team velocity.`
      : `> ✓ All active tasks are on schedule. Great team momentum!`,
  ].join("\n");
}

export function exportTasksToCsv(tasks: EmployeeTask[], filename: string): void {
  const headers = [
    "Title",
    "Priority",
    "Status",
    "Assigned To",
    "Assigned By",
    "Due Date",
    "Created",
  ];
  const rows = tasks.map((t) => [
    `"${(t.title || "").replace(/"/g, '""')}"`,
    t.priority,
    t.status,
    `"${t.assignedTo?.name || ""}"`,
    `"${t.assignedBy?.name || ""}"`,
    dayjs(t.dueDate).format("YYYY-MM-DD HH:mm"),
    dayjs(t.createdAt).format("YYYY-MM-DD HH:mm"),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
