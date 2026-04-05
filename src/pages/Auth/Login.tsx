import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import AuthIllustration from "../../components/auth/AuthIllustration";
import { Button } from "../../components/ui/button";
import { persistAuthLocalStorage } from "../../lib/authLocalStorage";
import { useLoginMutation } from "../../redux/features/auth/authApi";
import { setUser } from "../../redux/features/auth/authSlice";
import { useAppDispatch } from "../../redux/features/hooks";
import { cn } from "../../utils/utils";

interface LoginFormValues {
  email: string;
  password: string;
}

const Login = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const location = useLocation();
  const navigate = useNavigate();

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
        const userFromResponse = res?.data?.user;
        const userType =
          userFromResponse?.role === "EMPLOYEE" ? "employee" : "user";
        const userData = {
          ...userFromResponse,
          type: userType,
        };
        const accessToken = res?.data?.token;
        persistAuthLocalStorage(userData, accessToken);
        dispatch(setUser({ user: userData, token: accessToken }));
        const isTeamMember = userFromResponse?.role === "PARTNER_TEAM_MEMBER";
        const targetPath = isTeamMember ? "/my-tasks" : from;
        navigate(targetPath, { replace: true });
        toast.success("Login successful!");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.errors ||
          err?.data?.message ||
          "Something went wrong. Please try again later.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-slate-50 px-4 sm:px-6">
      <PageMeta
        title="Partner Sign In | Campus Transfer"
        description="Login to your Campus Transfer partner account"
      />

      <div className="flex w-full max-w-[980px] flex-col overflow-hidden rounded-3xl lg:flex-row">
        <AuthIllustration />

        <div className="flex w-full lg:w-1/2 items-center justify-center py-8 sm:py-10 lg:py-12 lg:min-h-[520px]">
          <div className="w-full max-w-[563px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h1 className="mb-1 text-xl font-semibold text-neutral-900">
                  Recruitment Partner Login
                </h1>
                <p className="text-sm text-neutral-500">
                  Access your partner dashboard and manage your students
                </p>
              </div>

              <Form
                form={form}
                name="login"
                requiredMark={false}
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  label={
                    <span className="text-sm font-medium text-neutral-700">
                      Email
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-neutral-400" />}
                    placeholder="Enter your email"
                    className="rounded-lg hover:border-primary-400 transition-colors"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-sm font-medium text-neutral-700">
                      Password
                    </span>
                  }
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please input your password!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-neutral-400" />}
                    placeholder="Enter your password"
                    className="rounded-lg hover:border-primary-400 transition-colors"
                  />
                </Form.Item>

                <div className="mb-4 flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full h-10 text-sm font-semibold"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Form>

              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-500">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    Register as Partner
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
