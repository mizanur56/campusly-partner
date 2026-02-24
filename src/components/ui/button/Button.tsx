import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const variantStyles = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost:
    "btn-base bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5",
  danger: "btn-base bg-red-600 text-white hover:bg-red-700",
} as const;

const sizeStyles = {
  sm: "text-xs px-2.5 py-1.5",
  md: "", // uses btn-base default
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
  const combined = [variantClass, sizeClass, className].filter(Boolean).join(" ");

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
