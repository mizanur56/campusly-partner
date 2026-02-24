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

export default function DirectorDetailsStep({ onPrev, onNext }: Props) {
  const [form] = Form.useForm();

  const handleNext = () => {
    form.validateFields().then(() => onNext()).catch(() => {});
  };

  return (
    <Form form={form} layout="vertical" {...formItemLayout}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="fullName" label="Full name" placeholder="Enter full name" rules={[{ required: true, message: "Required" }]} />
        <FormInput name="whatsapp" label="Whatsapp (If Applicable)" placeholder="Enter whatsapp number" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="email" label="Email" placeholder="Enter email" rules={[{ required: true, message: "Required", type: "email" }]} />
        <Form.Item name="mobileNumber" label="Mobile number" rules={[{ required: true, message: "Required" }]}>
          <PhoneInput country="de" inputStyle={phoneInputStyle} buttonStyle={phoneButtonStyle} />
        </Form.Item>
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onPrev}>
          ← Previous
        </Button>
        <Button type="button" variant="primary" onClick={onNext}>
          Next →
        </Button>
      </div>
    </Form>
  );
}
