import clsx from "clsx";
import { ReactNode } from "react";
import { TASK_RADIUS } from "./taskStyles";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const GlassCard = ({
  children,
  className,
  padding = "md",
  hover = false,
}: GlassCardProps) => (
  <div
    className={clsx(
      `${TASK_RADIUS} border border-white/60 bg-white/75 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl`,
      "dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
      hover &&
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(15,23,42,0.1)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)]",
      paddingMap[padding],
      className,
    )}
  >
    {children}
  </div>
);

export default GlassCard;
