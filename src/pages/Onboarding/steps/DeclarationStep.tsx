import { Form, Checkbox } from "antd";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";

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
      <div className="mb-5 space-y-3">
        <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          I confirm that all the information provided is true and accurate. Submission does not guarantee approval as an agent for Campus Transfer Ltd.
        </p>
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          Please verify each section before submitting to avoid delays.
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          By proceeding, you agree to the{" "}
          <Link to="#" className="text-primary-600 hover:underline">Terms &amp; Conditions</Link> and{" "}
          <Link to="#" className="text-primary-600 hover:underline">Privacy Policy</Link>.
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
        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-5 dark:border-neutral-800">
          <Button type="button" variant="secondary" onClick={onPrev}>
            ← Previous
          </Button>
          <Button type="submit" variant="primary">Submit</Button>
        </div>
      </Form>
    </>
  );
}
