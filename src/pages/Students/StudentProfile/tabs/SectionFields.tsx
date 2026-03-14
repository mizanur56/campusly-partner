import { LoadingOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Input, Select, Spin } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaTimes } from "react-icons/fa";

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
  const [editPassingYear, setEditPassingYear] = useState(
    passingYear ? passingYear.replace(/\//g, "-") : ""
  );

  useEffect(() => {
    setEditQualification(qualification);
    setEditPassingYear(passingYear ? passingYear.replace(/\//g, "-") : "");
  }, [qualification, passingYear]);

  const handleCancel = () => {
    setEditQualification(qualification);
    setEditPassingYear(passingYear ? passingYear.replace(/\//g, "-") : "");
    setIsEditing(false);
  };

  const handleSave = () => {
    const formattedYear = editPassingYear.replace(/-/g, "/");
    onSave(editQualification, formattedYear);
    setIsEditing(false);
  };

  return (
    <Card
      title={<span className="font-semibold text-[20px]">Last Qualification</span>}
      extra={
        editable ? (
        <Button type="text" onClick={() => (isEditing ? handleCancel() : setIsEditing(true))} className="p-0 group">
          {isEditing ? (
            <FaTimes style={{ color: "#EF4444", fontSize: 22 }} />
          ) : (
            <img
              src="/images/icons/edit.png"
              alt="Edit"
              className="w-[22px] h-[22px] transition-all group-hover:opacity-70"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1000%) hue-rotate(120deg)",
              }}
            />
          )}
        </Button>
      ) : null}
      bordered
      className="rounded-lg shadow-none"
      style={{ borderColor: "#C7CACF", boxShadow: "none" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField
          label="Qualification"
          value={editQualification}
          type="select"
          options={qualificationOptions}
          isEditable={isEditing}
          onChange={(val) => setEditQualification(val)}
        />
        <InfoField
          label="Passing Year"
          value={editPassingYear}
          type="date"
          isEditable={editable && isEditing}
          onChange={(val) => setEditPassingYear(val)}
        />
      </div>
      {isEditing && (
        <div className="mt-6">
          <PrimaryButton text="Save Changes" onClick={handleSave} />
        </div>
      )}
    </Card>
  );
};

interface InfoFieldProps {
  label: string;
  value: string;
  type?: "text" | "select" | "date" | "email";
  options?: { label: string; value: string }[];
  onSave?: (newValue: string) => void;
  onChange?: (newValue: string) => void;
  isLoading?: boolean;
  isEditable?: boolean;
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
}) => {
  const [editValue, setEditValue] = useState(value);
  const [dateValue, setDateValue] = useState(
    type === "date" && value ? dayjs(value, "DD-MM-YYYY") : null
  );

  useEffect(() => {
    setEditValue(value);
    if (type === "date" && value) setDateValue(dayjs(value, "DD-MM-YYYY"));
  }, [value, type]);

  const handleSave = async () => {
    const finalValue = type === "date" && dateValue ? dateValue.format("DD-MM-YYYY") : editValue;
    await onSave?.(finalValue);
  };

  return (
    <div>
      <p className="text-[14px] font-medium text-[#20242A] mb-1">{label}</p>
      {type === "select" ? (
        <Select
          value={editValue}
          disabled={!isEditable || isLoading}
          onChange={(val) => {
            setEditValue(val);
            if (isEditable) onChange?.(val);
          }}
          className="w-full"
          onBlur={isEditable && onSave ? handleSave : undefined}
          size="large"
        >
          {options?.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      ) : type === "date" ? (
        <DatePicker
          value={dateValue}
          disabled={!isEditable || isLoading}
          onChange={(d) => {
            setDateValue(d);
            if (isEditable && d) onChange?.(d.format("DD-MM-YYYY"));
            if (isEditable && onSave) handleSave();
          }}
          format="DD-MM-YYYY"
          className="w-full"
          size="large"
        />
      ) : (
        <Input
          value={editValue}
          disabled={!isEditable || isLoading}
          onChange={(e) => {
            setEditValue(e.target.value);
            if (isEditable) onChange?.(e.target.value);
          }}
          onBlur={isEditable && onSave ? handleSave : undefined}
          size="large"
        />
      )}
      {isLoading && (
        <Spin className="mt-1" indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
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
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  value,
  onSave,
  onChange,
  isLoading = false,
  isEditable = false,
}) => {
  const [editValue, setEditValue] = useState(value.replace(/^\+/, ""));

  useEffect(() => {
    setEditValue(value.replace(/^\+/, ""));
  }, [value]);

  return (
    <div>
      <p className="text-[14px] font-medium text-[#20242A] mb-1">{label}</p>
      <PhoneInput
        country="bd"
        value={editValue}
        disabled={!isEditable || isLoading}
        onChange={(val) => {
          setEditValue(val);
          const formattedValue = `+${val}`;
          if (isEditable) {
            onChange?.(formattedValue);
            if (onSave) onSave(formattedValue);
          }
        }}
        inputStyle={{ width: "100%", height: 40 }}
        size="large"
      />
      {isLoading && (
        <Spin className="mt-1" indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
      )}
    </div>
  );
};
