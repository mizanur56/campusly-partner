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

export default function MainContactDetailsPage() {
  const [form] = Form.useForm();

  return (
    <OnboardingFormLayout
      title="Main Contact Details"
      subtitle="Enter essential director information to get started."
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ telephoneNumber: PHONE_BD_INITIAL_VALUE }}
        {...formItemLayout}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&_.ant-form-item]:min-w-0">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&_.ant-form-item]:min-w-0">
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
            getValueFromEvent={phoneInputGetValueFromEvent}
          >
            <PhoneInput
              country="bd"
              disableCountryGuess
              inputStyle={phoneInputStyle}
              buttonStyle={phoneButtonStyle}
              containerStyle={{ width: "100%", minWidth: 0 }}
            />
          </Form.Item>
        </div>

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
