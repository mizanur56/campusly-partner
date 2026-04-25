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

export default function OwnerDetailsPage() {
  const [form] = Form.useForm();

  const onFinish = (values: unknown) => {
    console.log("Owner details:", values);
  };

  return (
    <OnboardingFormLayout
      title="Owner Details"
      subtitle="Enter essential business information to get started."
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ mobileNumber: PHONE_BD_INITIAL_VALUE }}
        {...formItemLayout}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="registeredCompanyName"
            label="Registered Company Name"
            placeholder="Enter registered company name"
            rules={[{ required: true, message: "Required" }]}
          />
          <FormInput
            name="companyRegistrationNumber"
            label="Company Registration Number"
            placeholder="Enter registration number"
            rules={[{ required: true, message: "Required" }]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="countryOfRegistration"
            label="Country of Registration"
            placeholder="Select an item"
            rules={[{ required: true, message: "Required" }]}
          />
          <Form.Item
            name="mobileNumber"
            label="Mobile Number"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="email"
            label="Email"
            placeholder="Select an item"
          />
          <FormInput
            name="website"
            label="Website"
            placeholder="Enter website url"
          />
        </div>
        <FormInput
          name="companyAddress"
          label="Company Address"
          placeholder="Enter company address"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="facebook"
            label="Facebook"
            placeholder="Enter facebook url"
          />
          <FormInput
            name="instagram"
            label="Instagram"
            placeholder="Enter instagram url"
          />
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <Button className="cursor-pointer" as="link" to="/onboarding/director" variant="primary" size="sm">
            Next →
          </Button>
        </div>
      </Form>
    </OnboardingFormLayout>
  );
}
