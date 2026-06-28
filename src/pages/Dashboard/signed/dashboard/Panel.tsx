import { ReactNode } from "react";

type PanelProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  /** Accent color used for the icon chip. */
  accent?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Removes the default body padding (useful for full-bleed tables). */
  flush?: boolean;
};

/**
 * Premium SaaS surface used by every dashboard widget.
 * Subtle border, soft shadow, 6px radius, dark-mode aware.
 */
export default function Panel({
  title,
  subtitle,
  icon,
  accent = "#237d3b",
  action,
  children,
  className = "",
  bodyClassName = "",
  flush = false,
}: PanelProps) {
  return (
    <section
      className={`group relative flex flex-col rounded-[6px] border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)] dark:border-white/10 dark:bg-neutral-900 ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3.5 dark:border-white/5">
          <div className="flex min-w-0 items-center gap-3">
            {icon ? (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px]"
                style={{ backgroundColor: `${accent}14`, color: accent }}
              >
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              {title ? (
                <h3 className="truncate text-[15px] font-semibold leading-tight text-neutral-900 dark:text-white">
                  {title}
                </h3>
              ) : null}
              {subtitle ? (
                <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      )}
      <div className={`${flush ? "" : "p-4"} flex-1 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
