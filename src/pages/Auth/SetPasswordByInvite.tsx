import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import { useSetPasswordByInvitationMutation } from "../../redux/features/auth/authApi";

interface SetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function SetPasswordByInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [form] = Form.useForm<SetPasswordForm>();
  const [setPassword, { isLoading }] = useSetPasswordByInvitationMutation();

  const onFinish = async (values: SetPasswordForm) => {
    if (!token) {
      toast.error("Invalid or expired link. Please request a new invitation.");
      return;
    }
    try {
      await setPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      toast.success("Password set successfully. You can now log in.");
      form.resetFields();
      window.location.href = "/login";
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to set password. The link may have expired.";
      toast.error(msg);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <PageMeta
          title="Set Password | Campus Transfer Partner"
          description="Set your password using the invitation link."
        />
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Invalid or missing link
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            This set-password link is invalid or has expired. Ask your team admin to
            resend the invitation from Team Members.
          </p>
          <Link to="/login">
            <Button type="primary" block>
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <PageMeta
        title="Set Password | Campus Transfer Partner"
        description="Set your password to join the partner team."
      />
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">
            Set your password
          </h1>
          <p className="text-sm text-gray-600">
            You were invited to the partner team. Choose a password to activate your
            account.
          </p>
        </div>

        <Form
          form={form}
          name="set-password"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="newPassword"
            label="New password"
            rules={[
              { required: true, message: "Enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="New password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Confirm password"
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              className="h-10"
            >
              Set password & continue
            </Button>
          </Form.Item>
        </Form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
