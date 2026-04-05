import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Select, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import PageMeta from "../../components/common/Meta/PageMeta";
import AuthIllustration from "../../components/auth/AuthIllustration";
import { persistAuthLocalStorage } from "../../lib/authLocalStorage";
import { useRegisterMutation } from "../../redux/features/auth/authApi";
import { setUser } from "../../redux/features/auth/authSlice";
import { useAppDispatch } from "../../redux/features/hooks";
import { Button as UIButton } from "../../components/ui/button";

const { Link: AntLink } = Typography;

interface Step1Values {
  businessName: string;
  contactPersonName: string;
  businessEmail: string;
  country: string;
  howDidYouHear: string;
  agreeTerms: boolean;
}

interface Step2Values {
  password: string;
  confirmPassword: string;
}

const countryOptions = [
  { value: "bangladesh", label: "Bangladesh" },
  { value: "india", label: "India" },
  { value: "pakistan", label: "Pakistan" },
  { value: "germany", label: "Germany" },
  { value: "uk", label: "United Kingdom" },
  { value: "usa", label: "United States" },
  { value: "canada", label: "Canada" },
  { value: "australia", label: "Australia" },
];

const howDidYouHearOptions = [
  { value: "facebook", label: "Facebook" },
  { value: "google", label: "Google" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

const Register = () => {
  const [form] = Form.useForm<Step1Values & Step2Values>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerPartner, { isLoading }] = useRegisterMutation();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Values, setStep1Values] = useState<Step1Values | null>(null);

  const onStep1Finish = (values: Step1Values) => {
    setStep1Values(values);
    setStep(2);
  };

  const onStep2Finish = async (values: Step2Values) => {
    const step1 = step1Values!;
    try {
      const res = await registerPartner({
        businessName: step1.businessName,
        contactPersonName: step1.contactPersonName,
        businessEmail: step1.businessEmail,
        country: step1.country,
        howDidYouHearAboutUs: step1.howDidYouHear,
        password: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap();

      if (res?.data?.token && res?.data?.user) {
        const userData = { ...res.data.user, type: "user" as const };
        persistAuthLocalStorage(userData, res.data.token);
        dispatch(setUser({ user: userData, token: res.data.token }));
        toast.success("Registration successful! Welcome.");
        navigate("/", { replace: true });
      } else {
        toast.success("Registration successful! Please log in.");
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
      toast.error(
        err?.data?.errors ||
          err?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  const goBack = () => setStep(1);

  useEffect(() => {
    if (step === 1 && step1Values) {
      form.setFieldsValue(step1Values);
    }
  }, [step, step1Values, form]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-slate-50 px-4 sm:px-6">
      <PageMeta
        title="Partner Registration | Campus Transfer"
        description="Recruitment Partner Registration - Campus Transfer Partner Dashboard"
      />

      <div className="flex w-full max-w-[980px] flex-col overflow-hidden rounded-3xl lg:flex-row">
        <AuthIllustration />

        <div className="flex w-full lg:w-1/2 items-center justify-center py-8 sm:py-10 lg:py-12 lg:min-h-[520px]">
          <div className="w-full max-w-[563px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h1 className="mb-1 text-xl font-semibold text-neutral-900">
                  Partner Registration
                </h1>
                <p className="text-sm text-neutral-500">
                  {step === 1
                    ? "Enter your business details to get started"
                    : "Set your password to complete registration"}
                </p>
              </div>

              {step === 1 ? (
                <Form
                  form={form}
                  name="register-step1"
                  requiredMark={false}
                  onFinish={onStep1Finish}
                  layout="vertical"
                  size="large"
                  initialValues={{
                    country: "bangladesh",
                    howDidYouHear: "facebook",
                  }}
                >
                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-neutral-700">
                        Business Name
                      </span>
                    }
                    name="businessName"
                    rules={[
                      { required: true, message: "Please enter your business name!" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-neutral-400" />}
                      placeholder="Enter business name"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-neutral-700">
                        Contact Person Name
                      </span>
                    }
                    name="contactPersonName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter contact person name!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-neutral-400" />}
                      placeholder="Enter contact person name"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-neutral-700">
                        Business Email
                      </span>
                    }
                    name="businessEmail"
                    rules={[
                      { required: true, message: "Please enter business email!" },
                      { type: "email", message: "Please enter a valid email!" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className="text-neutral-400" />}
                      placeholder="Enter business email"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-neutral-700">
                        Country
                      </span>
                    }
                    name="country"
                    rules={[
                      { required: true, message: "Please select your country!" },
                    ]}
                  >
                    <Select
                      placeholder="Select country"
                      options={countryOptions}
                      className="rounded-lg w-full"
                      allowClear={false}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-neutral-700">
                        How did you hear about us
                      </span>
                    }
                    name="howDidYouHear"
                    rules={[
                      {
                        required: true,
                        message: "Please select an option!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select an option"
                      options={howDidYouHearOptions}
                      className="rounded-lg w-full"
                      allowClear={false}
                    />
                  </Form.Item>

                  <Form.Item
                    name="agreeTerms"
                    valuePropName="checked"
                    rules={[
                      {
                        required: true,
                        message: "You must agree to the Terms & Conditions",
                      },
                    ]}
                  >
                    <Checkbox className="text-sm text-neutral-600">
                      I agree to the{" "}
                      <AntLink
                        href="https://campustransfer.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 font-medium"
                      >
                        Terms & Conditions
                      </AntLink>{" "}
                      and{" "}
                      <AntLink
                        href="https://campustransfer.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 font-medium"
                      >
                        Privacy Policy
                      </AntLink>
                    </Checkbox>
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full h-10 rounded-lg font-semibold text-sm bg-primary-600 hover:bg-primary-700 border-0"
                  >
                    Next – Set Password
                  </Button>
                </Form>
              ) : (
                <Form
                  form={form}
                  name="register-step2"
                  requiredMark={false}
                  onFinish={onStep2Finish}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-neutral-700">
                        Password
                      </span>
                    }
                    name="password"
                    rules={[
                      { required: true, message: "Please enter your password!" },
                      { min: 6, message: "Password must be at least 6 characters!" },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-neutral-400" />}
                      placeholder="Enter password"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-neutral-700">
                        Confirm Password
                      </span>
                    }
                    name="confirmPassword"
                    dependencies={["password"]}
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
                      prefix={<LockOutlined className="text-neutral-400" />}
                      placeholder="Confirm password"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <div className="flex gap-3">
                    <UIButton
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      className="flex-1 h-10 text-sm font-semibold"
                    >
                      Back
                    </UIButton>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      className="flex-1 h-10 rounded-lg font-semibold text-sm bg-primary-600 hover:bg-primary-700 border-0"
                    >
                      Create Account
                    </Button>
                  </div>
                </Form>
              )}

              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    Login here
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

export default Register;
