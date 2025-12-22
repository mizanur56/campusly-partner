import { Form, Select } from "antd";
import { Rule } from "antd/es/form";
import { SelectProps } from "antd/es/select";
import InputError from "./InputError";

interface FormSelectProps extends SelectProps<any> {
  name: string;
  label?: string;
  rules?: Rule[];
  placeholder?: string;
  fieldError?: Record<string, string>;
  setFieldError?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const FormSelect = ({
  name,
  label,
  rules,
  placeholder,
  allowClear = true,
  fieldError = {},
  setFieldError = () => {},
  ...rest
}: FormSelectProps) => {
  return (
    <Form.Item name={name} label={label} rules={rules}>
      <Select
        size="large"
        placeholder={placeholder}
        allowClear={allowClear}
        onChange={() => setFieldError?.((prev) => ({ ...prev, [name]: "" }))}
        {...rest}
      />
      {fieldError?.[name] ? <InputError>{fieldError[name]}</InputError> : null}
    </Form.Item>
  );
};
export default FormSelect;
