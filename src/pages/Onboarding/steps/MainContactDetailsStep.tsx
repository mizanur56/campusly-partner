import { Form, Button } from "antd";
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
        <Button size="large" className="border-primary-500 bg-primary-50 px-6 text-primary-600 hover:!border-primary-500 hover:!bg-primary-100 hover:!text-primary-700" onClick={onPrev}>
          ← Previous
        </Button>
        <Button type="primary" size="large" className="border-0 bg-primary-500 px-6 text-white hover:!bg-primary-600" onClick={handleNext}>
          Next →
        </Button>
      </div>
    </Form>
  );
}
