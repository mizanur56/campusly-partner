import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface SelectProps {
  label: string;
  placeholder?: string;
  selected?: string[];
  helperText?: string;
  options?: string[];
  onChange?: (selected: string[]) => void;
  className?: string;
}

export default function Select({
  label,
  placeholder = "Select an Item",
  selected: controlledSelected,
  helperText,
  options = [],
  onChange,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isControlled = controlledSelected !== undefined;
  const selected = isControlled ? controlledSelected : internalSelected;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchValue("");
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleToggle = (value: string) => {
    const newSelection = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    if (!isControlled) setInternalSelected(newSelection);
    onChange?.(newSelection);
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelection = selected.filter((item) => item !== value);
    if (!isControlled) setInternalSelected(newSelection);
    onChange?.(newSelection);
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm transition-all",
            open
              ? "border-primary-500 ring-2 ring-primary-500/20"
              : "hover:border-neutral-300",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
            className,
          )}
        >
          <div className="flex flex-1 flex-wrap gap-1.5 items-center min-h-[20px] overflow-hidden">
            {selected.length > 0 ? (
              selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-3 py-1 text-sm font-normal text-neutral-500"
                >
                  {item}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(item, e)}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors leading-none text-base"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-neutral-400 text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-neutral-400 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1.5 w-full rounded-lg border border-neutral-200 bg-white shadow-lg"
            >
              <div className="p-2 border-b border-primary-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search..."
                    className="h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-sm placeholder:text-neutral-400 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 focus:bg-white outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="max-h-[200px] overflow-y-auto p-1">
                {filteredOptions.length === 0 ? (
                  <div className="py-6 text-center text-sm text-neutral-500">
                    No results found
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleToggle(option)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                          isSelected
                            ? "bg-primary-50 text-primary-700"
                            : "text-neutral-700 hover:bg-neutral-50",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                            isSelected
                              ? "border-primary-500 bg-primary-500"
                              : "border-neutral-300",
                          )}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="flex-1 text-left">{option}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {helperText && <p className="text-xs text-neutral-500">{helperText}</p>}
    </div>
  );
}
