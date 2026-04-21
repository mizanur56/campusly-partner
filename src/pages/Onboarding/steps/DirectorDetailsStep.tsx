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
import { useGetStepDataQuery, usePatchStep2Mutation } from "../../../redux/features/onboardingForm/onboardingFormApi";
import type { Step2Payload } from "../../../redux/features/onboardingForm/onboardingFormApi";
import OnboardingFormSkeleton from "../OnboardingFormSkeleton";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

interface Props {
  apiStep: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function DirectorDetailsStep({ apiStep, onPrev, onNext }: Props) {
  const [form] = Form.useForm();
  const { data: stepData, isFetching } = useGetStepDataQuery(apiStep);
  const [patchStep2, { isLoading: isSaving }] = usePatchStep2Mutation();

  useEffect(() => {
    const payload =
      stepData?.data && (stepData.data as any).data;
    if (payload && typeof payload === "object") {
      const d = payload as Record<string, unknown>;
      const mobileDigits = String(d.mobileNumber ?? "").replace(/\D/g, "");
      form.setFieldsValue({
        fullName: d.fullName,
        whatsapp: d.whatsappNumber ?? d.whatsapp,
        email: d.email,
        mobileNumber: mobileDigits || PHONE_BD_INITIAL_VALUE,
      });
    }
  }, [stepData, form]);

  const handleNext = () => {
    form
      .validateFields()
      .then(async (values) => {
        const payload: Step2Payload = {
          fullName: values.fullName,
          whatsappNumber: values.whatsapp,
          email: values.email,
          mobileNumber: values.mobileNumber,
        };

        try {
          await patchStep2(payload).unwrap();
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
            toast.error("Failed to save owner/director details. Please try again.");
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
        <FormInput name="fullName" label="Full name" placeholder="Enter full name" rules={[{ required: true, message: "Required" }]} />
        <FormInput name="whatsapp" label="Whatsapp (If Applicable)" placeholder="Enter whatsapp number" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput name="email" label="Email" placeholder="Enter email" rules={[{ required: true, message: "Required", type: "email" }]} />
        <Form.Item
          name="mobileNumber"
          label="Mobile number"
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
      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onPrev}>
          ← Previous
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={handleNext} disabled={isSaving}>
          {isSaving ? "Saving…" : "Next →"}
        </Button>
      </div>
    </Form>
  );
}
