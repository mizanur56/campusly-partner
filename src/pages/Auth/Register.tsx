import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Select, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/Meta/PageMeta";
import AuthIllustration from "../../components/auth/AuthIllustration";
import { persistAuthLocalStorage } from "../../lib/authLocalStorage";
import { useRegisterMutation } from "../../redux/features/auth/authApi";
import { setUser } from "../../redux/features/auth/authSlice";
import { useAppDispatch } from "../../redux/features/hooks";
import {
  getPortalRoleMismatchMessage,
  isPartnerPortalSession,
} from "../../lib/portalRouting";
import { setPostRegistrationWelcomeSession } from "../../lib/registrationWelcomeSession";
import { useGetCountriesQuery } from "../../redux/features/countries/countriesApi";

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
  agreePasswordTerms: boolean;
}

const passwordStrengthRules = [
  { required: true, message: "Please enter your password!" },
  { min: 8, message: "Password must be at least 8 characters." },
  {
    pattern: /[a-z]/,
    message: "Include at least one lowercase letter.",
  },
  {
    pattern: /[A-Z]/,
    message: "Include at least one uppercase letter.",
  },
  {
    pattern: /\d/,
    message: "Include at least one number.",
  },
  {
    pattern: /[^A-Za-z0-9]/,
    message: "Include at least one symbol.",
  },
];

// const countryOptions = [
//   { value: "bangladesh", label: "Bangladesh" },
//   { value: "india", label: "India" },
//   { value: "pakistan", label: "Pakistan" },
//   { value: "germany", label: "Germany" },
//   { value: "uk", label: "United Kingdom" },
//   { value: "usa", label: "United States" },
//   { value: "canada", label: "Canada" },
//   { value: "australia", label: "Australia" },
// ];

const howDidYouHearOptions = [
  { value: "facebook", label: "Facebook" },
  { value: "google", label: "Google" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

const Register = () => {
  const { data: countriesData } = useGetCountriesQuery({ page: 1, limit: 1000 });
  const [form] = Form.useForm<Step1Values & Step2Values>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerPartner, { isLoading }] = useRegisterMutation();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Values, setStep1Values] = useState<Step1Values | null>(null);

  // console.log(countriesData);
  // const countriesData = countries;
  const countryOptions = React.useMemo(
    () =>
      (countriesData?.data ?? []).map((c: { id: string; name: string }) => ({
        label: c.name,
        value: c.name, // send country name from modal
      })),
    [countriesData?.data],
  );
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

      console.log(res);

      if (res?.data?.token && res?.data?.user) {
        const userData = { ...res.data.user, type: "user" as const };
        if (!isPartnerPortalSession(userData)) {
          toast.error(getPortalRoleMismatchMessage(userData.role));
          return;
        }
        persistAuthLocalStorage(userData, res.data.token);
        setPostRegistrationWelcomeSession(step1.contactPersonName);
        dispatch(setUser({ user: userData, token: res.data.token }));
        toast.success("Registration successful! Welcome.");
        // Use SPA navigation (no full reload) so redux auth state is preserved.
        navigate("/register/welcome", {
          replace: true,
          state: { name: step1.contactPersonName },
        });
        return;
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
    if (step === 2) {
      form.setFieldsValue({
        password: "",
        confirmPassword: "",
        agreePasswordTerms: false,
      });
    }
  }, [step, step1Values, form]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 ${
        step === 1
          ? "bg-gradient-to-br from-primary-50 via-white to-slate-50"
          : ""
      }`}
    >
      <PageMeta
        title="Partner Registration | Campus Transfer"
        description="Recruitment Partner Registration - Campus Transfer Partner Dashboard"
      />

      <div
        className={`flex w-full ${
          step === 1
            ? "max-w-[980px] flex-col overflow-hidden rounded-3xl lg:flex-row"
            : "max-w-lg flex-col"
        }`}
      >
        {step === 1 && <AuthIllustration />}

        <div
          className={`flex w-full items-center justify-center py-8 sm:py-10 lg:py-12 lg:min-h-[520px] ${
            step === 1 ? "lg:w-1/2" : ""
          }`}
        >
          <div
            className={`w-full px-4 sm:px-6 lg:px-8 ${
              step === 1 ? "max-w-[563px]" : "max-w-lg"
            }`}
          >
            <div
              className={`flex flex-col p-6 ${
                step === 1 ? "rounded-3xl bg-[#FFFFFF] border border-[#C7CACF]" : ""
              }`}
            >
              {step === 1 ? (
                <div className="mb-5">
                  <h1 className="mb-1 text-xl font-semibold text-neutral-900">
                    Partner Registration
                  </h1>
                  <p className="text-sm text-neutral-500">
                    Enter your business details to get started
                  </p>
                </div>
              ) : (
                <div className="mb-6 text-left">
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[26px]">
                    Hi {step1Values?.contactPersonName?.trim() || "there"}, please
                    set your password
                  </h1>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                    Create a secure password for your Campus Transfer account. Your
                    secure password should meet the following criteria:
                  </p>
                  <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[14px] font-medium leading-normal text-[#20242A]">
                    <li>Minimum of 8 characters</li>
                    <li>Mix of upper and lowercase letters</li>
                    <li>At least one number</li>
                    <li>At least one symbol</li>
                  </ul>
                  <button
                    type="button"
                    onClick={goBack}
                    className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    ← Back to details
                  </button>
                </div>
              )}

              {step === 1 ? (
                <Form
                  form={form}
                  name="register-step1"
                  requiredMark={false}
                  onFinish={onStep1Finish}
                  layout="vertical"
                  size="large"
                  initialValues={{
                    country: "Bangladesh",
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

                  {/* <Form.Item
            name="primaryContactNumber"
            label="Primary Contact Number"
            rules={[{ required: true, message: "Required" }]}
            getValueFromEvent={phoneInputGetValueFromEvent}
          >
            <PhoneInput
              country="bd"
              disableCountryGuess
              inputStyle={phoneInputStyle}
              buttonStyle={phoneButtonStyle}
            />
          </Form.Item> */}

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
                    className="w-full h-10 text-[#E7E7E7] rounded-lg font-semibold text-[16px] bg-primary-600 hover:bg-primary-700 border-0"
                  >
                    Create Account
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
                  initialValues={{ agreePasswordTerms: false }}
                >
                  <Form.Item
                    label={
                      <span className="text-sm font-semibold text-neutral-800">
                        Email
                      </span>
                    }
                  >
                    <Input
                      readOnly
                      value={step1Values?.businessEmail ?? ""}
                      className="rounded-lg border-neutral-200 text-neutral-800"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-semibold text-neutral-800">
                        Enter New Password
                      </span>
                    }
                    name="password"
                    rules={passwordStrengthRules}
                  >
                    <Input.Password
                      placeholder="Enter new password"
                      className="rounded-lg border-neutral-200 bg-white"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-semibold text-neutral-800">
                        Confirm New Password
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
                      placeholder="Confirm new password"
                      className="rounded-lg border-neutral-200"
                    />
                  </Form.Item>

                  <Form.Item
                    name="agreePasswordTerms"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(
                                  "Please agree to the Terms & Conditions and Privacy Policy",
                                ),
                              ),
                      },
                    ]}
                  >
                    <Checkbox className="text-sm text-neutral-700">
                      I agree to the{" "}
                      <AntLink
                        href="https://campustransfer.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="!text-primary-600 font-semibold hover:!text-primary-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms & Conditions
                      </AntLink>{" "}
                      and{" "}
                      <AntLink
                        href="https://campustransfer.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="!text-primary-600 font-semibold hover:!text-primary-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </AntLink>
                    </Checkbox>
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    className="mt-2 h-12 w-full rounded-lg border-0 bg-[#2d7d46] text-base font-semibold text-white hover:!bg-[#256d3c]"
                  >
                    Save and login
                  </Button>
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
