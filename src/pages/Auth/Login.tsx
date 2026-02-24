import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import PageMeta from "../../components/common/Meta/PageMeta";
import AuthIllustration from "../../components/auth/AuthIllustration";
import SocialLoginButtons from "../../components/auth/SocialLoginButtons";
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

  // Tab transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState<"student" | "partner">(
    location.pathname.includes("/student") ? "student" : "partner", // Default partner
  );

  useEffect(() => {
    // Only update if path includes student, otherwise keep partner as default
    if (location.pathname.includes("/student")) {
      setActiveTab("student");
    } else {
      setActiveTab("partner");
    }
    setIsTransitioning(false);
  }, [location.pathname]);

  const handleTabChange = (tab: "student" | "partner", path: string) => {
    if (tab === activeTab) return;

    if (tab === "student") {
      // Student tab - show coming soon toast
      toast.info("Student login coming soon!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }

    // Partner tab - navigate
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(path);
    }, 150);
  };

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
          "Something went wrong. Please try again later.",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row mx-auto max-w-[950px] px-4 sm:px-6 lg:px-0 bg-white">
      <PageMeta
        title={
          activeTab === "partner"
            ? "Partner Sign In | Campus Transfer"
            : "Student Sign In | Campus Transfer"
        }
        description="Login to your Campus Transfer account"
      />
      <AuthIllustration />

      <div className="w-full lg:w-1/2 flex items-center justify-center pt-2 pb-8 sm:pt-4 sm:pb-12 lg:min-h-screen">
        <div className="w-full max-w-[563px] px-4 sm:px-6 lg:px-0">
          {/* Professional Tabs with Coming Soon */}
          <div className="flex mb-6 border-b border-neutral-200">
            <div className="relative">
              <button
                onClick={() => handleTabChange("student", "/student/login")}
                className={cn(
                  "relative py-3 px-6 text-sm font-medium transition-all duration-200",
                  activeTab === "student"
                    ? "text-primary-600"
                    : "text-neutral-400 cursor-not-allowed",
                )}
                disabled={activeTab !== "student"}
              >
                Student
                {activeTab === "student" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                )}
              </button>
              {activeTab !== "student" && (
                <span className="absolute -top-2 -right-2 bg-amber-100 text-amber-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </div>

            <button
              onClick={() => handleTabChange("partner", "/partner/login")}
              className={cn(
                "relative py-3 px-6 text-sm font-medium transition-all duration-200",
                activeTab === "partner"
                  ? "text-primary-600"
                  : "text-neutral-500 hover:text-neutral-700",
              )}
            >
              Recruitment Partner
              {activeTab === "partner" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
              )}
            </button>
          </div>

          {/* Content with fade transition */}
          <div
            className={cn(
              "transition-all duration-200",
              isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100",
            )}
          >
            {/* Card with SidebarCards inspired styling */}
            <div className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h1 className="text-xl font-semibold text-neutral-900 mb-1">
                  {activeTab === "partner"
                    ? "Recruitment Partner Login"
                    : "Student Login"}
                </h1>
                <p className="text-sm text-neutral-500">
                  {activeTab === "partner"
                    ? "Access your partner dashboard and manage your students"
                    : "Student portal is coming soon"}
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
                    className={cn(
                      "rounded-lg hover:border-primary-400 transition-colors",
                      activeTab === "student" && "bg-neutral-50",
                    )}
                    disabled={activeTab === "student"}
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
                    { required: true, message: "Please input your password!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-neutral-400" />}
                    placeholder="Enter your password"
                    className={cn(
                      "rounded-lg hover:border-primary-400 transition-colors",
                      activeTab === "student" && "bg-neutral-50",
                    )}
                    disabled={activeTab === "student"}
                  />
                </Form.Item>

                <div className="flex justify-end mb-4">
                  <Link
                    to={activeTab === "partner" ? "/forgot-password" : "#"}
                    className={cn(
                      "text-sm transition-colors",
                      activeTab === "partner"
                        ? "text-primary-600 hover:text-primary-700"
                        : "text-neutral-300 pointer-events-none",
                    )}
                  >
                    Forgot Password?
                  </Link>
                </div>

                {activeTab === "partner" ? (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    className="w-full h-9 rounded-lg font-normal text-sm bg-primary-600 hover:bg-primary-700 border-0 shadow-sm"
                  >
                    Login to Partner Dashboard
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full h-10 rounded-lg font-medium bg-neutral-100 text-neutral-400 border-0 cursor-not-allowed"
                  >
                    Student Login - Coming Soon
                  </Button>
                )}
              </Form>

              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-500">
                  Don't have an account?{" "}
                  {activeTab === "partner" ? (
                    <Link
                      to="/partner/register"
                      className="text-primary-600 font-medium hover:text-primary-700"
                    >
                      Register as Partner
                    </Link>
                  ) : (
                    <span className="text-neutral-400">Coming Soon</span>
                  )}
                </p>
              </div>

              {activeTab === "partner" && <SocialLoginButtons />}
            </div>
          </div>

          {/* Simple note for student tab */}
          {activeTab === "student" && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-700">
                🎓 Student portal is under development. Please check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
