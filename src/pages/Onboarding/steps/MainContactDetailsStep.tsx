import { Form } from "antd";
import { Button } from "../../../components/ui/button";
import { FormInput, PhoneInput, phoneButtonStyle, phoneInputStyle } from "../sharedFormProps";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

interface Props {
  onPrev: () => void;
  onNext: () => void;
}

export default function MainContactDetailsStep({ onPrev, onNext }: Props) {
  const [form] = Form.useForm();

  const handleNext = () => {
    form.validateFields().then(() => onNext()).catch(() => {});
  };

  return (
    <Form form={form} layout="vertical" {...formItemLayout}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="fullName" label="Full Name" placeholder="Enter full name" rules={[{ required: true, message: "Required" }]} />
        <FormInput name="position" label="Position" placeholder="Enter position" rules={[{ required: true, message: "Required" }]} />
      </div>
      <FormInput name="email" label="Email" placeholder="Enter email" rules={[{ required: true, message: "Required", type: "email" }]} />
      <Form.Item name="telephoneNumber" label="Telephone Number" rules={[{ required: true, message: "Required" }]}>
        <PhoneInput country="de" inputStyle={phoneInputStyle} buttonStyle={phoneButtonStyle} />
      </Form.Item>
      <FormInput name="whatsapp" label="Whatsapp (If Applicable)" placeholder="Enter whatsapp number" />
      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onPrev}>
          ← Previous
        </Button>
        <Button type="button" variant="primary" size="lg" onClick={handleNext}>
          Next →
        </Button>
      </div>
    </Form>
  );
}
