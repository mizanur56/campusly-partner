
// Mock components for onboarding steps
import { Form, Button, theme, Avatar } from "antd";
import { useState } from "react";
import { UserOutlined, BellOutlined } from "@ant-design/icons";
import BaseFormInput from "../../components/common/Forms/FormInput";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

// Wrapper to make FormInput transparent
const FormInput = (props: any) => (
  <BaseFormInput className="!bg-transparent" {...props} />
);

// Common styles for transparent PhoneInput
const phoneInputStyle = {
  width: "100%",
  height: "40px",
  borderRadius: "6px",
  borderColor: "#d9d9d9",
  backgroundColor: "transparent",
};

const phoneButtonStyle = {
  borderTopLeftRadius: "6px",
  borderBottomLeftRadius: "6px",
  borderColor: "#d9d9d9",
  backgroundColor: "transparent",
};

// ------------ Steps Components ------------

const OwnerDetails = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          name="fullName"
          label="Full Name"
          placeholder="Enter full name"
          rules={[{ required: true, message: "Full name is required" }]}
        />
        <FormInput
          name="position"
          label="Position"
          placeholder="Enter position"
          rules={[{ required: true, message: "Position is required" }]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          name="email"
          label="Email"
          placeholder="Enter email"
          rules={[
            { required: true, message: "Email is required", type: "email" },
          ]}
        />
        <Form.Item
          name="telephoneNumber"
          label="Telephone Number"
          rules={[{ required: true, message: "Telephone number is required" }]}
        >
          <PhoneInput
            country={"de"}
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
          />
        </Form.Item>
      </div>
      <FormInput
        name="whatsapp"
        label="Whatsapp (If Applicable)"
        placeholder="Enter whatsapp number"
      />
    </div>
  );
};

const DirectorDetails = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          name="directorFullName"
          label="Full Name"
          placeholder="Enter full name"
          rules={[{ required: true, message: "Full name is required" }]}
        />
        <FormInput
          name="directorPosition"
          label="Position"
          placeholder="Enter position"
          rules={[{ required: true, message: "Position is required" }]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          name="directorEmail"
          label="Email"
          placeholder="Enter email"
          rules={[
            { required: true, message: "Email is required", type: "email" },
          ]}
        />
        <Form.Item
          name="directorTelephoneNumber"
          label="Telephone Number"
          rules={[{ required: true, message: "Telephone number is required" }]}
        >
          <PhoneInput
            country={"de"}
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
          />
        </Form.Item>
      </div>
    </div>
  );
};

const MainContactDetails = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          name="mainContactFullName"
          label="Full Name"
          placeholder="Enter full name"
          rules={[{ required: true, message: "Full name is required" }]}
        />
        <FormInput
          name="mainContactPosition"
          label="Position"
          placeholder="Enter position"
          rules={[{ required: true, message: "Position is required" }]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          name="mainContactEmail"
          label="Email"
          placeholder="Enter email"
          rules={[
            { required: true, message: "Email is required", type: "email" },
          ]}
        />
        <Form.Item
          name="mainContactTelephoneNumber"
          label="Telephone Number"
          rules={[{ required: true, message: "Telephone number is required" }]}
        >
          <PhoneInput
            country={"de"}
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
          />
        </Form.Item>
      </div>
    </div>
  );
};

const RegularCompliance = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          name="registeredCompanyName"
          label="Registered Company Name"
          placeholder="Enter registered company name"
          rules={[
            { required: true, message: "Registered Company Name is required" },
          ]}
        />
        <FormInput
          name="companyRegistrationNumber"
          label="Company Registration Number"
          placeholder="Enter registration number"
          rules={[
            { required: true, message: "Registration number is required" },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Implement Select for Country if needed, using text for now or mock select */}
        <FormInput
          name="countryOfRegistration"
          label="Country of Registration"
          placeholder="Select an Item" // Ideally this is a Select component
          rules={[{ required: true, message: "Country is required" }]}
        />
        <Form.Item
          name="mobileNumber"
          label="Mobile Number"
          rules={[{ required: true, message: "Mobile number is required" }]}
        >
          <PhoneInput
            country={"de"}
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          name="complianceEmail"
          label="Email"
          placeholder="Select an Item"
          // rules={[{ required: true, message: 'Email is required' }]}
        />
        <FormInput
          name="website"
          label="Website"
          placeholder="Enter website url"
          // rules={[{ required: true, message: 'Website is required' }]}
        />
      </div>

      <FormInput
        name="companyAddress"
        label="Company Address"
        placeholder="Enter company address"
        // Use TextArea if multiple lines needed
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput
          name="facebook"
          label="Facebook"
          placeholder="Enter facebook url"
        />
        <FormInput
          name="instagram"
          label="Instagram"
          placeholder="Enter instagram url"
        />
      </div>
    </div>
  );
};

const Declaration = () => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-base font-medium text-gray-900">
        Minor mistakes can cause a major delay in our partnership. Please take a
        moment to verify the information in each section before submitting.
      </h3>

      <p className="text-sm text-gray-500">
        By proceeding, you agree to the{" "}
        <span className="text-green-600">Terms & Conditions</span> and{" "}
        <span className="text-green-600">Privacy Policy</span>
      </p>

      <div className="flex flex-col gap-4">
        {/* Mock Checkboxes using simple div/span for now or antd Checkbox */}
        {/* Antd Form.Item with Checkbox valuePropName="checked" */}
        <Form.Item
          name="verifyInfo"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Required")),
            },
          ]}
        >
          <div className="flex gap-2 items-start">
            <input type="checkbox" className="mt-1" />
            <span className="text-sm text-gray-700">
              I verify that all the information provided is accurate and
              legitimate. *
            </span>
          </div>
        </Form.Item>
        <Form.Item name="allowData" valuePropName="checked">
          <div className="flex gap-2 items-start">
            <input type="checkbox" className="mt-1" />
            <span className="text-sm text-gray-700">
              I agree to allow Campus Transfer to store and process my personal
              data in accordance with the Privacy Policy.*
            </span>
          </div>
        </Form.Item>
        <Form.Item name="receiveUpdates" valuePropName="checked">
          <div className="flex gap-2 items-start">
            <input type="checkbox" className="mt-1" />
            <span className="text-sm text-gray-700">
              I agree to receive updates and communication from Campus Transfer
              via email or phone. *
            </span>
          </div>
        </Form.Item>
      </div>
    </div>
  );
};

const Onboarding = () => {
  const { token } = theme.useToken();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("Onboarding Form");
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const steps = [
    {
      title: "Owner Details",
      content: <OwnerDetails />,
    },
    {
      title: "Director Details",
      content: <DirectorDetails />,
    },
    {
      title: "Main Contact Details",
      content: <MainContactDetails />,
    },
    {
      title: "Regular Compliance",
      content: <RegularCompliance />,
    },
    {
      title: "Declaration",
      content: <Declaration />,
    },
  ];

  const next = () => {
    form
      .validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch((err) => {
        console.log("Validation Failed:", err);
      });
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = (values: any) => {
    console.log("Form Finished:", values);
    navigate("/"); // Redirect to dashboard after finish
  };

  // Mock User Data
  const user = {
    name: "Sajeena Shahi",
    role: "Global Dreams",
    avatar: "https://i.pravatar.cc/150?u=sajeena", // Placeholder image
  };

  // Header Tabs Data
  const headerTabs = [
    "Onboarding Form",
    "Contract",
    "Students 6",
    "Application 6",
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top User Profile Section - Matching Image */}
      <div className="py-6">
        <div className="flex items-center gap-4 mb-8">
          <Avatar
            size={140}
            icon={<UserOutlined />}
            src={user.avatar}
            className="bg-gray-200"
          />
          <div>
            <h1 className="text-[220px] md:text-[24px] font-[600] text-neutral-900">
              {user.name}
            </h1>
            <p className="text-neutral-400 font-normal">{user.role}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-gray-200">
          {headerTabs.map((tab, index) => (
            <div
              key={index}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[17px] md:text-[18px] font-[500] cursor-pointer transition-colors relative
                            ${activeTab === tab ? "text-green-500" : "text-neutral-500 hover:text-gray-700"}
                        `}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-600"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "Onboarding Form" ? (
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          {/* Left Side: Steps (Custom Vertical Stepper Design matching image) */}
          <div className="w-full lg:w-[300px] bg-white p-6 rounded-xl border border-gray-200 h-fit">
            <h2 className="text-[19px] md:text-[20px] font-[600] text-neutral-900 mb-6">
              Onboarding Steps
            </h2>

            <div className="flex flex-col relative pl-2">
              {/* Vertical Line */}
              <div className="absolute left-[19px] top-3 h-[calc(100%-40px)] w-[2px] bg-gray-100 -z-0"></div>

              {steps.map((step, index) => {
                const isCompleted = currentStep > index;
                const isActive = currentStep === index;
                const isPending = currentStep < index;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 mb-[50px] last:mb-0 relative z-10"
                  >
                    {/* Icon */}
                    <div className="mt-0.5 bg-white">
                      {isCompleted || isActive ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <Check
                            className="text-white w-4 h-4"
                            strokeWidth={3}
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white"></div>
                      )}{" "}
                    </div>
                    {/* Title */}
                    <span
                      className={`text-[17px]  md:text-[18px] font-normal transition-colors ${isActive ? "text-green-500" : "text-gray-500"}`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="flex-1">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="[&_.ant-form-item-label_label]:!font-medium [&_.ant-form-item-label_label]:!text-[14px] [&_.ant-form-item]:mb-3"
            >
              <div className="mb-6">{steps[currentStep].content}</div>

              <div className="flex justify-end gap-3 mt-8">
                {currentStep > 0 && (
                  <Button
                    size="large"
                    className="px-8 border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => prev()}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button
                    size="large"
                    type="primary"
                    onClick={() => next()}
                    className="px-8 bg-green-600 hover:bg-green-700 shadow-none"
                  >
                    Next
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button
                    size="large"
                    type="primary"
                    htmlType="submit"
                    className="px-8 bg-green-600 hover:bg-green-700 shadow-none"
                  >
                    Approve
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
          <div className="bg-green-50 p-6 rounded-full mb-4">
            <BellOutlined style={{ fontSize: "48px", color: "#22c55e" }} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-500 text-lg max-w-md">
            This section is currently under development. Stay tuned for updates!
          </p>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
