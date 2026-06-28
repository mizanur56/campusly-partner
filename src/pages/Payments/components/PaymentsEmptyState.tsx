import type { ReactNode } from "react";

interface PaymentsEmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PaymentsEmptyState({
  icon,
  title,
  description,
  action,
}: PaymentsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 ring-1 ring-neutral-100 dark:bg-neutral-800/60 dark:text-neutral-500 dark:ring-neutral-800">
        {icon}
      </span>
      <h3 className="mt-5 text-base font-semibold text-neutral-800 dark:text-neutral-100">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
