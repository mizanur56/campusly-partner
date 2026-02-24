import BaseFormInput from "../../components/common/Forms/FormInput";
import { Form } from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export const FormInput = (props: React.ComponentProps<typeof BaseFormInput>) => (
  <BaseFormInput className="!bg-transparent" {...props} />
);

export const phoneInputStyle = {
  width: "100%",
  height: "40px",
  borderRadius: "6px",
  borderColor: "#d9d9d9",
  backgroundColor: "transparent",
};

export const phoneButtonStyle = {
  borderTopLeftRadius: "6px",
  borderBottomLeftRadius: "6px",
  borderColor: "#d9d9d9",
  backgroundColor: "transparent",
};

export { Form, PhoneInput };
