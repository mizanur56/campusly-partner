import { DatePicker, InputNumber, Select, Switch, Button } from "antd";
import type { Dayjs } from "dayjs";
import { X } from "lucide-react";
import { IoFilterSharp } from "react-icons/io5";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const { RangePicker } = DatePicker;
const { Option } = Select;

export type FilterValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | [Dayjs | null, Dayjs | null]
  | [number | null, number | null];

export type FilterValues = Record<string, FilterValue>;

export type FilterOption = {
  label: ReactNode;
  value: string | number | boolean;
  searchLabel?: string;
};

type BaseField = {
  key: string;
  label: string;
  helperText?: string;
};

export type SelectFilterField = BaseField & {
  type: "select";
  placeholder?: string;
  options: FilterOption[];
  loading?: boolean;
  showSearch?: boolean;
  allowClear?: boolean;
  includeAllOption?: boolean;
  allLabel?: string;
};

export type DateRangeFilterField = BaseField & {
  type: "dateRange";
  format?: string;
};

export type NumberRangeFilterField = BaseField & {
  type: "numberRange";
  minPlaceholder?: string;
  maxPlaceholder?: string;
  min?: number;
  max?: number;
};

export type SwitchFilterField = BaseField & {
  type: "switch";
  checkedLabel?: string;
  uncheckedLabel?: string;
};

export type CustomFilterField = BaseField & {
  type: "custom";
  render: (value: FilterValue, setValue: (value: FilterValue) => void) => ReactNode;
};

export type FilterField =
  | SelectFilterField
  | DateRangeFilterField
  | NumberRangeFilterField
  | SwitchFilterField
  | CustomFilterField;

type AdminFilterDrawerProps<TValues extends FilterValues> = {
  title?: string;
  description?: string;
  fields: FilterField[];
  value: TValues;
  defaultValue: TValues;
  onApply: (value: TValues) => void;
  activeCount?: number;
  buttonLabel?: string;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide built-in trigger button when using external control. */
  hideTrigger?: boolean;
};

function isEmptyArrayItem(item: unknown): boolean {
  return item === null || item === undefined || item === "";
}

function isEmptyValue(value: FilterValue): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.every(isEmptyArrayItem);
  return false;
}

export function countActiveFilters(values: FilterValues): number {
  return (Object.values(values) as FilterValue[]).reduce<number>(
    (count, value) => count + (isEmptyValue(value) ? 0 : 1),
    0,
  );
}

export default function AdminFilterDrawer<TValues extends FilterValues>({
  title = "Filters",
  description,
  fields,
  value,
  defaultValue,
  onApply,
  activeCount,
  buttonLabel = "Filter",
  open: openProp,
  onOpenChange,
  hideTrigger = false,
}: AdminFilterDrawerProps<TValues>) {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = openProp ?? isOpenInternal;
  const setIsOpen = (next: boolean) => {
    if (openProp === undefined) setIsOpenInternal(next);
    onOpenChange?.(next);
  };
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [draftValue, setDraftValue] = useState<TValues>(value);

  useEffect(() => {
    if (!isOpen) setDraftValue(value);
  }, [isOpen, value]);

  const resolvedActiveCount = useMemo(
    () => activeCount ?? countActiveFilters(value),
    [activeCount, value],
  );

  const openDrawer = () => {
    setDraftValue(value);
    setIsOpen(true);
    window.requestAnimationFrame(() => setIsPanelVisible(true));
  };

  useEffect(() => {
    if (openProp === undefined) return;
    if (openProp) {
      setDraftValue(value);
      window.requestAnimationFrame(() => setIsPanelVisible(true));
    } else {
      setIsPanelVisible(false);
    }
  }, [openProp, value]);

  const closeDrawer = () => {
    setIsPanelVisible(false);
    window.setTimeout(() => setIsOpen(false), 260);
  };

  const updateDraftValue = (key: string, nextValue: FilterValue) => {
    setDraftValue((previous) => ({
      ...previous,
      [key]: nextValue,
    }));
  };

  const resetDraft = () => {
    setDraftValue(defaultValue);
  };

  const applyDraft = () => {
    onApply(draftValue);
    closeDrawer();
  };

  const renderField = (field: FilterField) => {
    const fieldValue = draftValue[field.key];

    if (field.type === "select") {
      return (
        <Select
          placeholder={field.loading ? "Loading..." : field.placeholder}
          value={isEmptyValue(fieldValue) ? undefined : fieldValue}
          onChange={(nextValue) => updateDraftValue(field.key, nextValue)}
          className="w-full"
          showSearch={field.showSearch}
          allowClear={field.allowClear ?? true}
          optionFilterProp="label"
          loading={field.loading}
        >
          {field.includeAllOption && (
            <Option value="" label={field.allLabel ?? "All"}>
              {field.allLabel ?? "All"}
            </Option>
          )}
          {field.options.map((option) => (
            <Option
              key={String(option.value)}
              value={option.value}
              label={option.searchLabel ?? String(option.label)}
            >
              {option.label}
            </Option>
          ))}
        </Select>
      );
    }

    if (field.type === "dateRange") {
      return (
        <RangePicker
          value={(fieldValue as [Dayjs | null, Dayjs | null] | undefined) ?? null}
          onChange={(dates) => updateDraftValue(field.key, dates)}
          className="w-full"
          format={field.format ?? "YYYY-MM-DD"}
          allowClear
        />
      );
    }

    if (field.type === "numberRange") {
      const rangeValue = (fieldValue as [number | null, number | null] | undefined) ?? [
        null,
        null,
      ];

      return (
        <div className="grid grid-cols-2 gap-3">
          <InputNumber
            value={rangeValue[0]}
            min={field.min}
            max={field.max}
            placeholder={field.minPlaceholder ?? "Min"}
            className="w-full"
            onChange={(nextValue) =>
              updateDraftValue(field.key, [nextValue, rangeValue[1]])
            }
          />
          <InputNumber
            value={rangeValue[1]}
            min={field.min}
            max={field.max}
            placeholder={field.maxPlaceholder ?? "Max"}
            className="w-full"
            onChange={(nextValue) =>
              updateDraftValue(field.key, [rangeValue[0], nextValue])
            }
          />
        </div>
      );
    }

    if (field.type === "switch") {
      return (
        <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2">
          <span className="text-sm text-gray-600">
            {fieldValue ? field.checkedLabel ?? "Enabled" : field.uncheckedLabel ?? "Disabled"}
          </span>
          <Switch
            checked={Boolean(fieldValue)}
            onChange={(checked) => updateDraftValue(field.key, checked)}
          />
        </div>
      );
    }

    return field.render(fieldValue, (nextValue) =>
      updateDraftValue(field.key, nextValue),
    );
  };

  return (
    <>
      {!hideTrigger && (
      <Button
        icon={<IoFilterSharp size={16} />}
        className="relative"
        style={{
          padding: "10px",
          fontSize: "18px",
          fontWeight: 600,
          color: "#4B5563",
          height: "auto",
        }}
        onClick={openDrawer}
      >
        {buttonLabel}
        {resolvedActiveCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#237D3B] text-xs text-white">
            {resolvedActiveCount}
          </span>
        )}
      </Button>
      )}

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[1000]">
            <button
              type="button"
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${
                isPanelVisible ? "opacity-100" : "opacity-0"
              }`}
              aria-label="Close filters"
              onClick={closeDrawer}
            />
            <aside
              className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-hidden rounded-l-[24px] bg-white shadow-2xl transition-transform duration-300 ease-out ${
                isPanelVisible ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                  {description && (
                    <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-5">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      {renderField(field)}
                      {field.helperText && (
                        <p className="mt-1 text-xs text-gray-500">
                          {field.helperText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-[#E5E7EB] bg-gray-50 p-4">
                <button
                  type="button"
                  onClick={resetDraft}
                  className="h-10 flex-1 rounded-lg border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-white"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={applyDraft}
                  className="h-10 flex-1 rounded-lg bg-[#237D3B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1e6b32]"
                >
                  Show results
                </button>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
