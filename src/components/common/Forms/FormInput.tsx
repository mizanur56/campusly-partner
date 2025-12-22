import { Form, Input } from "antd";
import { Rule } from "antd/es/form";
import { InputProps } from "antd/es/input";

interface FormInputProps extends InputProps {
  name: string;
  label?: string;
  rules?: Rule[];
  placeholder?: string;
  fieldError?: Record<string, string>;
  setFieldError?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const FormInput = ({
  name,
  label,
  rules,
  placeholder,
  fieldError = {},
  setFieldError = () => {},
  size = "large",
  ...rest
}: FormInputProps) => {
  const errorMessage = fieldError[name];
  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      help={errorMessage}
      validateStatus={errorMessage ? "error" : undefined}
    >
      <Input
        size={size}
        placeholder={placeholder}
        onChange={() => setFieldError?.((prev) => ({ ...prev, [name]: "" }))}
        {...rest}
      />
    </Form.Item>
  );
};

export default FormInput;
