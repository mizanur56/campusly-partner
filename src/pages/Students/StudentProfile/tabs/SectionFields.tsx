import { LoadingOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Input, Select, Spin } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
import { disableFutureYears } from "../../../../utils/profileDateValidation";

const { Option } = Select;

interface QualificationSectionProps {
  qualification: string;
  passingYear: string;
  qualificationOptions?: { label: string; value: string }[];
  onSave: (qualification: string, passingYear: string) => void;
  editable?: boolean;
}

export const QualificationSection: React.FC<QualificationSectionProps> = ({
  qualification,
  passingYear,
  qualificationOptions = [],
  onSave,
  editable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editQualification, setEditQualification] = useState(qualification);
  const [editPassingYear, setEditPassingYear] = useState(passingYear ?? "");
  const [fieldErrors, setFieldErrors] = useState<{
    qualification?: string;
    passingYear?: string;
  }>({});

  useEffect(() => {
    setEditQualification(qualification);
    setEditPassingYear(passingYear ?? "");
  }, [qualification, passingYear]);

  const handleCancel = () => {
    setEditQualification(qualification);
    setEditPassingYear(passingYear ?? "");
    setFieldErrors({});
    setIsEditing(false);
  };

  const handleSave = () => {
    const next: { qualification?: string; passingYear?: string } = {};
    if (!editQualification?.trim()) {
      next.qualification = "Qualification is required";
    }
    if (!editPassingYear?.trim()) {
      next.passingYear = "Passing year is required";
    } else if (Number(editPassingYear) > dayjs().year()) {
      next.passingYear = "Passing year cannot be in the future";
    }
    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    onSave(editQualification, editPassingYear);
    setIsEditing(false);
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[20px]">Last Qualification</span>
        </div>
      }
      extra={
        editable ? (
          <Button
            type="text"
            onClick={() => {
              if (isEditing) {
                handleCancel();
              } else {
                setIsEditing(true);
              }
            }}
            className="p-0 group"
          >
            {isEditing ? (
              <FaTimes
                className="text-red-500 hover:text-red-600 transition-colors"
                style={{ fontSize: 20 }}
                aria-label="Close"
              />
            ) : (
              <FaPencilAlt
                className="text-[#237D3B] hover:opacity-80 transition-opacity"
                style={{ fontSize: 18 }}
                aria-label="Edit"
              />
            )}
          </Button>
        ) : null
      }
      bordered={true}
      className="rounded-lg shadow-none"
      style={{ borderColor: "#C7CACF", boxShadow: "none" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField
          label="Qualification"
          value={editQualification}
          type="select"
          options={qualificationOptions}
          isEditable={editable && isEditing}
          required
          error={fieldErrors.qualification}
          onChange={(val) => {
            setEditQualification(val);
            setFieldErrors((prev) => {
              if (!prev.qualification) return prev;
              const rest = { ...prev };
              delete rest.qualification;
              return rest;
            });
          }}
        />
        <InfoField
          label="Passing Year"
          value={editPassingYear}
          type="year"
          isEditable={editable && isEditing}
          required
          error={fieldErrors.passingYear}
          onChange={(val) => {
            setEditPassingYear(val);
            setFieldErrors((prev) => {
              if (!prev.passingYear) return prev;
              const rest = { ...prev };
              delete rest.passingYear;
              return rest;
            });
          }}
        />
      </div>
      {isEditing && (
        <div className=" mt-6">
          <PrimaryButton text="Save Changes" onClick={handleSave} />
        </div>
      )}
    </Card>
  );
};

interface InfoFieldProps {
  label: string;
  value: string;
  type?: "text" | "select" | "date" | "year" | "email";
  options?: { label: string; value: string }[];
  onSave?: (newValue: string) => void;
  onChange?: (newValue: string) => void;
  isLoading?: boolean;
  isEditable?: boolean;
  required?: boolean;
  error?: string;
}

export const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  type = "text",
  options,
  onSave,
  onChange,
  isLoading = false,
  isEditable = false,
  required = false,
  error,
}) => {
  const [editValue, setEditValue] = useState(value);
  const [dateValue, setDateValue] = useState(
    type === "date"
      ? value
        ? dayjs(value, "DD-MM-YYYY")
        : null
      : type === "year"
        ? value
          ? dayjs(value, "YYYY")
          : null
        : null,
  );

  useEffect(() => {
    setEditValue(value);
    if (type === "date" && value) setDateValue(dayjs(value, "DD-MM-YYYY"));
    else if (type === "year" && value) setDateValue(dayjs(value, "YYYY"));
    else if (type === "date" || type === "year") setDateValue(null);
  }, [value, type]);

  const handleSave = async () => {
    const finalValue =
      type === "date" && dateValue
        ? dateValue.format("DD-MM-YYYY")
        : type === "year" && dateValue
          ? dateValue.format("YYYY")
          : editValue;
    await onSave?.(finalValue);
  };

  return (
    <div>
      <p className="text-[14px] font-medium text-[#20242A] mb-1">
        {label}
        {required ? (
          <span className="text-red-500" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </p>
      {type === "select" ? (
        <Select
          value={editValue}
          disabled={!isEditable || isLoading}
          onChange={(val) => {
            setEditValue(val);
            if (isEditable) onChange?.(val);
          }}
          className="w-full"
          status={error ? "error" : undefined}
          onBlur={isEditable && onSave ? handleSave : undefined}
          // size="large"
        >
          {options?.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      ) : type === "date" || type === "year" ? (
        <DatePicker
          value={dateValue}
          disabled={!isEditable || isLoading}
          disabledDate={type === "year" ? disableFutureYears : undefined}
          onChange={(d) => {
            setDateValue(d);
            if (isEditable && d)
              onChange?.(d.format(type === "year" ? "YYYY" : "DD-MM-YYYY"));
            if (isEditable && onSave) handleSave();
          }}
          picker={type === "year" ? "year" : undefined}
          format={type === "year" ? "YYYY" : "DD-MM-YYYY"}
          className="w-full"
          status={error ? "error" : undefined}
          size="large"
        />
      ) : (
        <Input
          type={type === "email" ? "email" : "text"}
          value={editValue}
          disabled={!isEditable || isLoading}
          onChange={(e) => {
            setEditValue(e.target.value);
            if (isEditable) onChange?.(e.target.value);
          }}
          onBlur={isEditable && onSave ? handleSave : undefined}
          status={error ? "error" : undefined}
          size="large"
        />
      )}
      {error ? (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      {isLoading && (
        <Spin
          className="mt-1"
          indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />}
        />
      )}
    </div>
  );
};

interface PhoneFieldProps {
  label: string;
  value: string;
  onSave?: (newValue: string) => void;
  onChange?: (newValue: string) => void;
  isLoading?: boolean;
  isEditable?: boolean;
  required?: boolean;
  error?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  value,
  onSave,
  onChange,
  isLoading = false,
  isEditable = false,
  required = false,
  error,
}) => {
  const [editValue, setEditValue] = useState(value.replace(/^\+/, ""));

  useEffect(() => {
    setEditValue(value.replace(/^\+/, ""));
  }, [value]);

  return (
    <div>
      <p className="text-[14px] font-medium text-[#20242A] mb-1">
        {label}
        {required ? (
          <span className="text-red-500" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </p>
      <PhoneInput
        country="bd"
        value={editValue}
        disabled={!isEditable || isLoading}
        enableSearch
        searchPlaceholder="Search countries..."
        disableSearchIcon
        onChange={(val) => {
          setEditValue(val);
          const formattedValue = `+${val}`;
          if (isEditable) {
            onChange?.(formattedValue);
            if (onSave) onSave(formattedValue);
          }
        }}
        inputStyle={{
          width: "100%",
          height: 40,
          borderRadius: 10,
          padding: "24px 50px",
          ...(error ? { borderColor: "#ff4d4f" } : {}),
        }}
        size="large"
      />
      {error ? (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      {isLoading && (
        <Spin
          className="mt-1"
          indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />}
        />
      )}
    </div>
  );
};
