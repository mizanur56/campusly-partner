import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
// import { useLocation, useNavigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import { useLoginMutation } from "../../redux/features/auth/authApi";
import { setUser } from "../../redux/features/auth/authSlice";
import { useAppDispatch } from "../../redux/features/hooks";

const { Link } = Typography;

// Define form input shape
interface LoginFormValues {
  email: string;
  password: string;
}

// loading function
const Login = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const location = useLocation();
  const navigate = useNavigate();

  // Prefer redirect query param (e.g. /login?redirect=%2Fproducts%2F123)
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get("redirect");

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    (redirectParam ? decodeURIComponent(redirectParam) : "/");

  const onFinish = async (values: LoginFormValues) => {
    const data = {
      email: values.email,
      password: values.password,
    };

    try {
      const res = await login(data).unwrap();

      if (res) {
        localStorage.setItem("token", res?.data?.token);
        // Determine user type based on role
        const userFromResponse = res?.data?.user;
        const userType =
          userFromResponse?.role === "EMPLOYEE" ? "employee" : "user";

        const userData = {
          ...userFromResponse,
          type: userType,
        };
        dispatch(setUser({ user: userData, token: res?.data?.token }));
        navigate(from, { replace: true });
        toast.success("Login successful!");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.errors ||
          err?.data?.message ||
          "Something went wrong. Please try again later."
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <PageMeta
        title="React.js SignIn Dashboard | Campus Transfer - Next.js Partner Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for Campus Transfer - React.js Tailwind CSS Partner Dashboard Template"
      />
      <div className="w-full max-w-md">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in!
          </p>
        </div>

        <Form
          form={form}
          name="login"
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

          <Form.Item
            label={
              <span className="text-sm font-medium text-gray-700">
                Password
              </span>
            }
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="w-fit px-5!"
          >
            Sign in
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;
