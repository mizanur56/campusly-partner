import { Form, Checkbox } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import OnboardingFormLayout from "./OnboardingFormLayout";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

export default function DeclarationPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = () => {
    navigate("/onboarding/submitted");
  };

  return (
    <OnboardingFormLayout
      title="Declaration"
      subtitle=""
    >
      <div className="space-y-4 mb-6">
        <p className="text-neutral-600 text-base leading-relaxed">
          I confirm that all the information provided in this application is true
          and accurate. I understand that submission of this form does not
          guarantee approval as an agent for Campus Transfer Ltd.
        </p>
        <p className="text-neutral-900 font-semibold text-base leading-relaxed">
          Minor mistakes can cause a major delay in our partnership. Please take
          a moment to verify the information in each section before submitting.
        </p>
        <p className="text-neutral-500 text-sm">
          By proceeding, you agree to the{" "}
          <Link to="#" className="text-primary-600 hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link to="#" className="text-primary-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        {...formItemLayout}
      >
        <Form.Item
          name="verifyInfo"
          valuePropName="checked"
          rules={[{ required: true, message: "Required" }]}
        >
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
            I verify that all the information provided is accurate and
            legitimate. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="allowData"
          valuePropName="checked"
          rules={[{ required: true, message: "Required" }]}
        >
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
            I agree to allow Campus Transfer to store and process my personal
            data in accordance with the Privacy Policy.{" "}
            <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="receiveUpdates"
          valuePropName="checked"
          rules={[{ required: true, message: "Required" }]}
        >
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
            I agree to receive updates and communication from Campus Transfer
            via email or phone. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <div className="flex justify-end gap-3 mt-8">
          <Button as="link" to="/onboarding/compliance" variant="secondary" size="sm">
            ← Previous
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Submit
          </Button>
        </div>
      </Form>
    </OnboardingFormLayout>
  );
}
