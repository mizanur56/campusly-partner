import React from "react";
import { Switch } from "antd";

interface FormToggleProps {
  checked?: boolean; // Optional initial state
  defaultChecked?: boolean; // Default value if uncontrolled
  onChange?: (checked: boolean) => void; // Callback when toggled
  disabled?: boolean; // Optional disable toggle
  size?: "small" | "default"; // Size of toggle
  label?: string; // Optional label beside toggle
  className?: string; // Custom class for styling
  loading?:any
}

const SwitchStatus2: React.FC<FormToggleProps> = ({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  size = "default",
  label,
  className = "",
  loading
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Switch
        checked={checked}
        checkedChildren="Active"
        unCheckedChildren="Inactive"
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        size={size}
        loading={loading}
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </div>
  );
};

export default SwitchStatus2;
