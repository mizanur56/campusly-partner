import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const variantStyles = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline:
    "btn-base border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5",
  ghost:
    "btn-base bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5",
  danger: "btn-base bg-red-600 text-white hover:bg-red-700",
} as const;

const sizeStyles = {
  xs: "text-[11px] px-2 py-1",
  sm: "text-[13px] px-3.5 py-2",
  md: "", // uses btn-base default
  lg: "text-[15px] px-6 py-3",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

type ButtonAsButton = BaseProps & {
  as?: "button";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  to?: never;
};

type ButtonAsLink = BaseProps & {
  as: "link";
  to: string;
  type?: never;
  onClick?: never;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  const combined = [
    variantClass,
    sizeClass,
    "cursor-pointer disabled:cursor-not-allowed aria-disabled:cursor-not-allowed",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.as === "link" && "to" in props) {
    return (
      <Link to={props.to} className={combined} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  const { type = "button", onClick } = props as ButtonAsButton;
  return (
    <button type={type} className={combined} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
