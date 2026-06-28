/**
 * Shared design tokens for the redesigned partner dashboard.
 * Campus Transfer brand palette + analytics accent ramp.
 */
export const RADIUS = 6;

export const brand = {
  green: "#237d3b",
  greenDark: "#19592a",
  greenLight: "#4f9762",
  greenSoft: "#e9f2eb",
} as const;

/** Accent ramp used across KPI cards, charts and badges. */
export const accents = {
  green: "#237d3b",
  teal: "#0d9488",
  blue: "#2563eb",
  violet: "#7c3aed",
  amber: "#f59e0b",
  rose: "#e11d48",
  slate: "#475569",
} as const;

export const statusColors = {
  SUCCESS: "#10b981",
  REVIEW: "#2563eb",
  APPLY: "#0ea5e9",
  PENDING_OFFER_LETTER: "#8b5cf6",
  PENDING_TRAVEL_LETTER: "#f59e0b",
  REJECTED: "#ef4444",
  DEFAULT: "#94a3b8",
} as const;

export function statusColor(status?: string): string {
  if (!status) return statusColors.DEFAULT;
  return (statusColors as Record<string, string>)[status] ?? statusColors.DEFAULT;
}

/** Pretty-print an UPPER_SNAKE status into Title Case. */
export function humanizeStatus(status?: string): string {
  if (!status) return "—";
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
