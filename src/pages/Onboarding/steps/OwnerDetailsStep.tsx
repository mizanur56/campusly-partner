import { Form } from "antd";
import { useEffect } from "react";
import { Button } from "../../../components/ui/button";
import {
  FormInput,
  PhoneInput,
  phoneButtonStyle,
  phoneInputGetValueFromEvent,
  phoneInputStyle,
  PHONE_BD_INITIAL_VALUE,
} from "../sharedFormProps";
import { toast } from "react-toastify";
import { useGetStepDataQuery, usePatchStep1Mutation } from "../../../redux/features/onboardingForm/onboardingFormApi";
import type { Step1Payload } from "../../../redux/features/onboardingForm/onboardingFormApi";
import OnboardingFormSkeleton from "../OnboardingFormSkeleton";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

interface Props {
  apiStep: number;
  onNext: () => void;
}

export default function OwnerDetailsStep({ apiStep, onNext }: Props) {
  const [form] = Form.useForm();
  const { data: stepData, isFetching } = useGetStepDataQuery(apiStep);
  const [patchStep1, { isLoading: isSaving }] = usePatchStep1Mutation();

  useEffect(() => {
    // API shape: { success, status, message, data: { step, currentStep, status, data: { ...fields } } }
    const payload = stepData?.data && (stepData.data as any).data;
    if (payload && typeof payload === "object") {
      const next = { ...payload } as Partial<Step1Payload> & { mobileNumber?: string };
      const digits = String(next.mobileNumber ?? "").replace(/\D/g, "");
      if (!digits) {
        next.mobileNumber = PHONE_BD_INITIAL_VALUE;
      }
      form.setFieldsValue(next as Partial<Step1Payload>);
    }
  }, [stepData, form]);

  const handleNext = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          await patchStep1(values as Step1Payload).unwrap();
          onNext();
        } catch (err: any) {
          const raw =
            err?.data?.message ||
            (typeof err?.error === "string" ? err.error : "") ||
            "";
          const message = String(raw);

          if (
            message.toLowerCase().includes("onboarding form already submitted")
          ) {
            toast.info("Your onboarding form is already submitted.");
            return;
          }

          if (message) {
            toast.error(message);
          } else {
            toast.error("Failed to save company details. Please try again.");
          }
        }
      })
      .catch(() => {});
  };

  if (isFetching && !stepData) {
    return <OnboardingFormSkeleton rows={3} />;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ mobileNumber: PHONE_BD_INITIAL_VALUE }}
      {...formItemLayout}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="registeredCompanyName" label="Registered Company Name" placeholder="Enter registered company name" rules={[{ required: true, message: "Required" }]} />
        <FormInput name="companyRegistrationNumber" label="Company Registration Number" placeholder="Enter registration number" rules={[{ required: true, message: "Required" }]} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="countryOfRegistration" label="Country of Registration" placeholder="Select an item" rules={[{ required: true, message: "Required" }]} />
        <Form.Item
          name="mobileNumber"
          label="Mobile Number"
          rules={[{ required: true, message: "Required" }]}
          getValueFromEvent={phoneInputGetValueFromEvent}
        >
          <PhoneInput
            country="bd"
            disableCountryGuess
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
          />
        </Form.Item>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="email" label="Email" placeholder="Select an item" />
        <FormInput name="website" label="Website" placeholder="Enter website url" />
      </div>
      <FormInput name="companyAddress" label="Company Address" placeholder="Enter company address" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="facebook" label="Facebook" placeholder="Enter facebook url" />
        <FormInput name="instagram" label="Instagram" placeholder="Enter instagram url" />
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="primary" size="sm" onClick={handleNext} disabled={isSaving}>
          {isSaving ? "Saving…" : "Next →"}
        </Button>
      </div>
    </Form>
  );
}
