import { Form, Button, Checkbox } from "antd";
import { Link } from "react-router-dom";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

interface Props {
  onPrev: () => void;
  onSubmit: () => void;
}

export default function DeclarationStep({ onPrev, onSubmit }: Props) {
  const [form] = Form.useForm();

  return (
    <>
      <div className="mb-6 space-y-4">
        <p className="text-base leading-relaxed text-neutral-500">
          I confirm that all the information provided in this application is true and accurate. I understand that
          submission of this form does not guarantee approval as an agent for Campus Transfer Ltd.
        </p>
        <p className="text-base font-semibold leading-relaxed text-neutral-900">
          Minor mistakes can cause a major delay in our partnership. Please take a moment to verify the information in
          each section before submitting.
        </p>
        <p className="text-sm text-neutral-500">
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
      <Form form={form} layout="vertical" onFinish={onSubmit} {...formItemLayout}>
        <Form.Item name="verifyInfo" valuePropName="checked" rules={[{ required: true, message: "Required" }]}>
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
            I verify that all the information provided is accurate and legitimate. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <Form.Item name="allowData" valuePropName="checked" rules={[{ required: true, message: "Required" }]}>
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
            I agree to allow Campus Transfer to store and process my personal data in accordance with the Privacy
            Policy. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <Form.Item name="receiveUpdates" valuePropName="checked" rules={[{ required: true, message: "Required" }]}>
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
            I agree to receive updates and communication from Campus Transfer via email or phone.{" "}
            <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <div className="mt-8 flex justify-end gap-3">
          <Button
            size="large"
            className="border-primary-500 bg-primary-50 px-6 text-primary-600 hover:!border-primary-500 hover:!bg-primary-100 hover:!text-primary-700"
            onClick={onPrev}
          >
            ← Previous
          </Button>
          <Button type="primary" size="large" htmlType="submit" className="border-0 bg-primary-500 px-6 text-white hover:!bg-primary-600">
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
}
