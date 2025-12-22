import { Form } from "antd";
import { Rule } from "antd/es/form";
import { TextAreaProps } from "antd/es/input";
import InputError from "./InputError";
import RichTextEditor from "./RichTextEditor";

interface FormTextareaProps extends Omit<TextAreaProps, "value"> {
  name: string;
  label?: string;
  value?: string;
  rules?: Rule[];
  placeholder?: string;
  fieldError?: Record<string, string>;
  setFieldError?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const FormRichTextEditor = ({
  name,
  label,
  rules,
  placeholder,
  fieldError = {},
  setFieldError = () => {},
  value,
  ...rest
}: FormTextareaProps) => {
  return (
    <Form.Item name={name} label={label} rules={rules}>
      <RichTextEditor
        value={
          value !== undefined && value !== null ? String(value) : undefined
        }
        placeholder={placeholder}
        onChange={() => setFieldError?.((prev) => ({ ...prev, [name]: "" }))}
        {...rest}
      />
      {fieldError?.[name] && <InputError>{fieldError[name]}</InputError>}
    </Form.Item>
  );
};

export default FormRichTextEditor;
