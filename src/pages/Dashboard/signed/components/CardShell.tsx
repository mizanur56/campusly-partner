import { ReactNode } from "react";

export default function CardShell({
  title,
  titleIcon,
  right,
  children,
  className = "",
  contentClassName = "",
}: {
  title: string;
  titleIcon?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      className={`rounded-[20px] border border-[#C7CACF] bg-white p-5  dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {titleIcon ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              {titleIcon}
            </span>
          ) : null}
          <h2 className="min-w-0 truncate text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className={`mt-4 ${contentClassName}`}>{children}</div>
    </section>
  );
}

