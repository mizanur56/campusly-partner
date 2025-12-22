import { MailOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import { useForgotPasswordMutation } from "../../redux/features/auth/authApi";
const { Link } = Typography;

// Define form input shape

const ForgetPassword = () => {
  const [form] = Form.useForm();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const navigate = useNavigate();

  const onFinish = async ({ email }: { email: string }) => {
    try {
      const res = await forgotPassword({ email }).unwrap();
      if (res.success) {
        toast.success(res.message || "Reset code sent to your email!");
        navigate(`/reset-password?phone=${email}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset code!");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <PageMeta
        title="Forget Password | Campus Transfer - Next.js Partner Dashboard Template"
        description="Enter your email to receive password reset instructions."
      />
      <div className="w-full max-w-md">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Forget Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email address and we will send you a link to reset your
            password.
          </p>
        </div>

        <Form
          form={form}
          name="forget-password"
          requiredMark={false}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="space-y-6"
        >
          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">
                Email address
              </span>
            }
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Enter your email"
            />
          </Form.Item>

          <div className="flex items-center justify-between">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Sign in ?
            </Link>
          </div>

          <Button
            loading={isLoading}
            type="primary"
            htmlType="submit"
            className="w-fit px-5!"
          >
            Submit
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ForgetPassword;
