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
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
    }
  };

  const isActive = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      return currentValues.includes(optionValue);
    }
    return value === optionValue;
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
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              shouldUseFlex1 ? "flex-1" : ""
            } ${
              active
                ? "bg-primary-50 text-primary-700"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
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
