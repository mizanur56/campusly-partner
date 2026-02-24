import { Form } from "antd";
import { Button } from "../../../components/ui/button";
import { FormInput, PhoneInput, phoneButtonStyle, phoneInputStyle } from "../sharedFormProps";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

interface Props {
  onNext: () => void;
}

export default function OwnerDetailsStep({ onNext }: Props) {
  const [form] = Form.useForm();

  const handleNext = () => {
    form.validateFields().then(() => {
      onNext();
    }).catch(() => {});
  };

  return (
    <Form form={form} layout="vertical" {...formItemLayout}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="registeredCompanyName" label="Registered Company Name" placeholder="Enter registered company name" rules={[{ required: true, message: "Required" }]} />
        <FormInput name="companyRegistrationNumber" label="Company Registration Number" placeholder="Enter registration number" rules={[{ required: true, message: "Required" }]} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="countryOfRegistration" label="Country of Registration" placeholder="Select an item" rules={[{ required: true, message: "Required" }]} />
        <Form.Item name="mobileNumber" label="Mobile Number" rules={[{ required: true, message: "Required" }]}>
          <PhoneInput country="de" inputStyle={phoneInputStyle} buttonStyle={phoneButtonStyle} />
        </Form.Item>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="email" label="Email" placeholder="Select an item" />
        <FormInput name="website" label="Website" placeholder="Enter website url" />
      </div>
      <FormInput name="companyAddress" label="Company Address" placeholder="Enter company address" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="facebook" label="Facebook" placeholder="Enter facebook url" />
        <FormInput name="instagram" label="Instagram" placeholder="Enter instagram url" />
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="primary" size="lg" onClick={handleNext}>
          Next →
        </Button>
      </div>
    </Form>
  );
}
