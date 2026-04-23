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

/** Digits-only value so flag +880 show with `country="bd"` (react-phone-input-2 + Ant Form). */
export const PHONE_BD_INITIAL_VALUE = "880";

/** Use on Form.Item wrapping PhoneInput — onChange passes value as 1st arg, not event.target.value. */
export const phoneInputGetValueFromEvent = (value: unknown) =>
  value === undefined || value === null ? "" : String(value);

export { Form, PhoneInput };
