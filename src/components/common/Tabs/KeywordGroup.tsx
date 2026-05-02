import React from "react";

export interface KeywordOption {
  value: string;
  label: string;
}

interface KeywordGroupProps {
  options: KeywordOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  className?: string;
  multiple?: boolean;
}

const KeywordGroup: React.FC<KeywordGroupProps> = ({
  options,
  value,
  onChange,
  className = "",
  multiple = false,
}) => {
  const shouldUseFlex1 = options.length <= 2;

  const handleClick = (optionValue: string) => {
    const currentValues = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? [value]
        : [];

    if (multiple) {
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      // For single select, always return array format
      if (currentValues.includes(optionValue)) {
        onChange([]); // Unselect
      } else {
        onChange([optionValue]); // Select
      }
    }
  };

  const isActive = (optionValue: string) => {
    const currentValues = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? [value]
        : [];
    return currentValues.includes(optionValue);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {options.map((option) => {
        const active = isActive(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option.value)}
            className={`px-4 py-2 rounded-full text-xs font-normal transition-all border shrink-0 ${
              shouldUseFlex1 ? "flex-1" : ""
            } ${
              active
                ? "bg-primary-100 text-primary-700 border-primary-200"
                : "bg-white text-gray-600 border-primary-border hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default KeywordGroup;
