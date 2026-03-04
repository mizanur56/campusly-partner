import React from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";

interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "small" | "middle" | "large";
  icon?: React.ReactNode;
  className?: string;
  to?: string;
  htmlType?: "button" | "submit" | "reset";
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  size = "large",
  icon,
  className = "",
  to,
  htmlType = "button",
}) => {
  const buttonClasses = `bg-[#237D3B] hover:bg-[#19592A] border-[#237D3B] hover:border-[#19592A] font-semibold text-[16px] text-[#E7E7E7] px-8 py-3 rounded-lg ${className}`;

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: "none" }}>
        <Button type="primary" size={size} onClick={onClick} disabled={disabled} loading={loading} icon={icon} className={buttonClasses}>
          {text}
        </Button>
      </Link>
    );
  }

  return (
    <Button type="primary" size={size} onClick={onClick} disabled={disabled} loading={loading} icon={icon} htmlType={htmlType} className={buttonClasses}>
      {text}
    </Button>
  );
};

export default PrimaryButton;
