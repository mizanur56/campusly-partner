import { cn } from "../../lib/utils";

interface FilterChipsProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  allowMultiple?: boolean;
}

export function FilterChips({
  label,
  options,
  value,
  onChange,
  allowMultiple = false,
}: FilterChipsProps) {
  const handleClick = (option: string) => {
    if (allowMultiple) {
      if (value.includes(option)) {
        onChange(value.filter((v) => v !== option));
      } else {
        onChange([...value, option]);
      }
    } else {
      onChange([option]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleClick(option)}
              className={cn(
                "px-4 sm:px-[16px] py-[12px] sm:py-3 rounded-[50px] font-[400] text-[14px] transition-all duration-200 shrink-0",
                isSelected
                  ? "bg-[#E9F2EB] text-[#237D3B]"
                  : "bg-neutral-50 text-neutral-500 hover:bg-[#E5E7EB]"
              )}
            >
              <span className="whitespace-nowrap">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
