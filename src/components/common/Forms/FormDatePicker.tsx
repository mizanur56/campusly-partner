import { DatePicker, Form } from "antd";
import { DatePickerProps } from "antd/es/date-picker";
import { Rule } from "antd/es/form";
import InputError from "./InputError";

interface FormDatePickerProps extends DatePickerProps {
  name: string;
  label?: string;
  rules?: Rule[];
  placeholder?: string;
  fieldError?: Record<string, string>;
  setFieldError?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const FormDatePicker = ({
  name,
  label,
  rules,
  placeholder,
  fieldError = {},
  setFieldError = () => {},
  ...rest
}: FormDatePickerProps) => {
  return (
    <Form.Item name={name} label={label} rules={rules}>
      <DatePicker
        size="large"
        style={{ width: "100%" }}
        format="YYYY-MM-DD"
        placeholder={placeholder}
        onChange={() => setFieldError?.((prev) => ({ ...prev, [name]: "" }))}
        {...rest}
      />
      {fieldError?.[name] ? <InputError>{fieldError[name]}</InputError> : null}
    </Form.Item>
  );
};

export default FormDatePicker;
