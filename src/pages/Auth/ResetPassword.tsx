import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import { useResetPasswordMutation } from "../../redux/features/auth/authApi";

// Form input shape
interface ResetPasswordForm {
  otp: string;
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const [form] = Form.useForm<ResetPasswordForm>();

  const [changePassword, { isLoading }] = useResetPasswordMutation();

  const onFinish = async (values: ResetPasswordForm) => {
    const data = {
      password: values.password,
      confirmPassword: values.confirmPassword,
      otp: values.otp,
    };

    try {
      const res = await changePassword(data).unwrap();
      if (res.success) {
        toast.success("Password changed successfully");
        form.resetFields();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <PageMeta
        title="Reset Password | Campus Transfer - Next.js Partner Dashboard Template"
        description="Reset your account password by entering OTP and new password."
      />
      <div className="w-full max-w-md">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the OTP sent to your email and choose a new password.
          </p>
        </div>

        <Form
          form={form}
          name="reset-password"
          requiredMark={false}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="space-y-6"
        >
          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">OTP</span>
            }
            name="otp"
            rules={[{ required: true, message: "Please enter the OTP!" }]}
          >
            <Input placeholder="Enter OTP" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">
                New Password
              </span>
            }
            name="password"
            rules={[
              { required: true, message: "Please enter your new password!" },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter new password"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">
                Confirm Password
              </span>
            }
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Confirm new password"
            />
          </Form.Item>

          <Button
            loading={isLoading}
            type="primary"
            htmlType="submit"
            className="w-fit px-5!"
          >
            Reset Password
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
