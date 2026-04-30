import type { ReactNode } from "react";

export type PageCardProps = {
  children: ReactNode;
  className?: string;
  /**
   * Most list pages use `3xl` (24px), matching the app shell.
   * Use `lg` where older screens still use `rounded-lg` for the same border card.
   */
  rounded?: "3xl" | "lg";
  /** Default `p-6`. Set to `false` for nested composition only. */
  padded?: boolean;
};

/**
 * White bordered surface for list and form sections — one place for
 * `bg-white`, border, padding, and radius (replaces repeated inline divs).
 */
export default function PageCard({
  children,
  className = "",
  rounded = "3xl",
  padded = true,
}: PageCardProps) {
  const radius = rounded === "3xl" ? "rounded-3xl" : "rounded-lg";
  const padding = padded ? "p-6" : "";
  return (
    <div
      className={`bg-white border border-[#C7CACF] ${radius} ${padding} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
