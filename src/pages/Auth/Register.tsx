import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Select, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import AuthIllustration from "../../components/auth/AuthIllustration";
import { useRegisterMutation } from "../../redux/features/auth/authApi";

const { Link: AntLink } = Typography;

interface RegisterFormValues {
  businessName: string;
  contactPersonName: string;
  businessEmail: string;
  primaryContactNumber: string;
  country: string;
  howDidYouHear: string;
  agreeTerms: boolean;
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
  const [form] = Form.useForm<RegisterFormValues>();
  const navigate = useNavigate();
  const [registerPartner, { isLoading }] = useRegisterMutation();

  const onFinish = async (values: RegisterFormValues) => {
    try {
      await registerPartner({
        businessName: values.businessName,
        contactPersonName: values.contactPersonName,
        businessEmail: values.businessEmail,
        primaryContactNumber: values.primaryContactNumber,
        country: values.country,
        howDidYouHear: values.howDidYouHear,
      }).unwrap();
      toast.success("Registration successful! Please check your email.");
      navigate("/login");
    } catch (err: any) {
      toast.error(
        err?.data?.errors ||
          err?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row mx-auto max-w-[950px] px-4 sm:px-6 lg:px-0 bg-white">
      <PageMeta
        title="Partner Registration | Campus Transfer"
        description="Recruitment Partner Registration - Campus Transfer Partner Dashboard"
      />
      <AuthIllustration />

      <div className="w-full lg:w-1/2 flex items-center justify-center pt-2 pb-8 sm:pt-4 sm:pb-12 lg:min-h-screen">
        <div className="w-full max-w-[563px] px-4 sm:px-6 lg:px-0">
          <div className="flex gap-6 mb-4 border-b border-neutral-200">
            <a
              href="https://campustransfer.com/auth/register"
              target="_blank"
              rel="noopener noreferrer"
              className="pb-3 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Student
            </a>
            <span className="pb-3 text-sm font-medium text-neutral-900 border-b-2 border-primary-600">
              Recruitment Partner
            </span>
          </div>
          <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 sm:p-5 md:p-6">
            <div className="mb-4 sm:mb-5">
              <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 mb-1">
                Partner Registration
              </h1>
              <p className="text-sm text-neutral-600">
                Start your educational journey
              </p>
            </div>

            <Form
              form={form}
              name="register"
              requiredMark={false}
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="space-y-6"
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
                    Primary Contact Number
                  </span>
                }
                name="primaryContactNumber"
                rules={[
                  {
                    required: true,
                    message: "Please enter primary contact number!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-neutral-400" />}
                  placeholder="Enter primary contact number"
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
                loading={isLoading}
                className="w-full h-10 rounded-lg font-semibold bg-primary-600 hover:bg-primary-700 border-0"
              >
                Create Account
              </Button>
            </Form>

            <div className="mt-4 sm:mt-5 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 font-medium hover:text-primary-700 hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
