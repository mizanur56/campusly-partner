import type { ReactNode } from "react";

export type StatAccent = "green" | "amber" | "blue" | "violet" | "rose";

const ACCENTS: Record<StatAccent, { icon: string; blob: string }> = {
  green: {
    icon: "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300",
    blob: "bg-primary-500",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    blob: "bg-amber-400",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
    blob: "bg-blue-400",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    blob: "bg-violet-400",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    blob: "bg-rose-400",
  },
};

interface PaymentStatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: ReactNode;
  accent?: StatAccent;
  highlight?: boolean;
}

export default function PaymentStatCard({
  label,
  value,
  sub,
  icon,
  accent = "green",
  highlight = false,
}: PaymentStatCardProps) {
  const tone = ACCENTS[accent];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900 ${
        highlight
          ? "ring-primary-200 dark:ring-primary-500/30"
          : "ring-neutral-100 dark:ring-neutral-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.7rem] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-neutral-900 dark:text-white">
            {value}
          </p>
          {sub ? (
            <p className="mt-1 text-xs font-medium text-neutral-400 dark:text-neutral-500">
              {sub}
            </p>
          ) : null}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
        >
          {icon}
        </span>
      </div>
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.07] blur-2xl ${tone.blob}`}
        aria-hidden
      />
    </div>
  );
}
