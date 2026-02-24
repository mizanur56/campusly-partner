import { Form } from "antd";
import { Button } from "../../components/ui/button";
import OnboardingFormLayout from "./OnboardingFormLayout";
import { FormInput, PhoneInput, phoneInputStyle, phoneButtonStyle } from "./sharedFormProps";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

export default function MainContactDetailsPage() {
  const [form] = Form.useForm();

  return (
    <OnboardingFormLayout
      title="Main Contact Details"
      subtitle="Enter essential director information to get started."
    >
      <Form form={form} layout="vertical" {...formItemLayout}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="fullName"
            label="Full Name"
            placeholder="Enter full name"
            rules={[{ required: true, message: "Required" }]}
          />
          <FormInput
            name="position"
            label="Position"
            placeholder="Enter position"
            rules={[{ required: true, message: "Required" }]}
          />
        </div>
        <FormInput
          name="email"
          label="Email"
          placeholder="Enter email"
          rules={[{ required: true, message: "Required", type: "email" }]}
        />
        <Form.Item
          name="telephoneNumber"
          label="Telephone Number"
          rules={[{ required: true, message: "Required" }]}
        >
          <PhoneInput
            country="de"
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
          />
        </Form.Item>
        <FormInput
          name="whatsapp"
          label="Whatsapp (If Applicable)"
          placeholder="Enter whatsapp number"
        />
        <div className="flex justify-end gap-3 mt-8">
          <Button as="link" to="/onboarding/director" variant="secondary" size="sm">
            ← Previous
          </Button>
          <Button as="link" to="/onboarding/compliance" variant="primary" size="sm">
            Next →
          </Button>
        </div>
      </Form>
    </OnboardingFormLayout>
  );
}
