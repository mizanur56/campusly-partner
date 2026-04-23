import { Form } from "antd";
import { Button } from "../../components/ui/button";
import OnboardingFormLayout from "./OnboardingFormLayout";
import {
  FormInput,
  PhoneInput,
  phoneButtonStyle,
  phoneInputGetValueFromEvent,
  phoneInputStyle,
  PHONE_BD_INITIAL_VALUE,
} from "./sharedFormProps";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

export default function DirectorDetailsPage() {
  const [form] = Form.useForm();

  return (
    <OnboardingFormLayout
      title="Directors Details"
      subtitle="Enter essential director information to get started."
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ mobileNumber: PHONE_BD_INITIAL_VALUE }}
        {...formItemLayout}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="fullName"
            label="Full name"
            placeholder="Enter full name"
            rules={[{ required: true, message: "Required" }]}
          />
          <FormInput
            name="whatsapp"
            label="Whatsapp (If Applicable)"
            placeholder="Enter whatsapp number"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="email"
            label="Email"
            placeholder="Enter email"
            rules={[{ required: true, message: "Required", type: "email" }]}
          />
          <Form.Item
            name="mobileNumber"
            label="Mobile number"
            rules={[{ required: true, message: "Required" }]}
            getValueFromEvent={phoneInputGetValueFromEvent}
          >
            <PhoneInput
              country="bd"
              disableCountryGuess
              inputStyle={phoneInputStyle}
              buttonStyle={phoneButtonStyle}
            />
          </Form.Item>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <Button as="link" to="/onboarding/owner" variant="secondary" size="sm">
            ← Previous
          </Button>
          <Button as="link" to="/onboarding/contact" variant="primary" size="sm">
            Next →
          </Button>
        </div>
      </Form>
    </OnboardingFormLayout>
  );
}
