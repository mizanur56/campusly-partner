import { Form, Checkbox, Tooltip } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import OnboardingFormLayout from "./OnboardingFormLayout";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

const SUBMIT_DISABLED_HINT = "Please accept all declarations to proceed";

export default function DeclarationPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const verifyInfo = Form.useWatch("verifyInfo", form);
  const allowData = Form.useWatch("allowData", form);
  const receiveUpdates = Form.useWatch("receiveUpdates", form);
  const allDeclarationsAccepted = Boolean(
    verifyInfo && allowData && receiveUpdates,
  );

  const onFinish = () => {
    if (!allDeclarationsAccepted) return;
    form.resetFields();
    navigate("/onboarding/submitted");
  };

  return (
    <OnboardingFormLayout
      title="Declaration"
      subtitle="I confirm that all the information provided in this application is true and accurate. I understand that submission of this form does not guarantee approval as an agent for Campus Transfer Ltd."
    >
      <div className="space-y-4 mb-6">
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
        <Form.Item name="verifyInfo" valuePropName="checked">
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
            I verify that all the information provided is accurate and
            legitimate. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <Form.Item name="allowData" valuePropName="checked">
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
            I agree to allow Campus Transfer to store and process my personal
            data in accordance with the Privacy Policy.{" "}
            <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <Form.Item name="receiveUpdates" valuePropName="checked">
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
            I agree to receive updates and communication from Campus Transfer
            via email or phone. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <div className="mt-8 flex justify-end gap-3">
          <Button
            as="link"
            to="/onboarding/compliance"
            variant="secondary"
            size="sm"
          >
            ← Previous
          </Button>
          <Tooltip
            title={allDeclarationsAccepted ? undefined : SUBMIT_DISABLED_HINT}
            placement="top"
          >
            <span
              className={
                allDeclarationsAccepted
                  ? "inline-flex"
                  : "inline-flex cursor-not-allowed"
              }
            >
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!allDeclarationsAccepted}
              >
                Submit
              </Button>
            </span>
          </Tooltip>
        </div>
      </Form>
    </OnboardingFormLayout>
  );
}
