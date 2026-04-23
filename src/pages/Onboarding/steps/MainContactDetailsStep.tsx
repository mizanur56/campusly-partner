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
import { useGetStepDataQuery, usePatchStep3Mutation } from "../../../redux/features/onboardingForm/onboardingFormApi";
import type { Step3Payload } from "../../../redux/features/onboardingForm/onboardingFormApi";
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

export default function MainContactDetailsStep({ apiStep, onPrev, onNext }: Props) {
  const [form] = Form.useForm();
  const { data: stepData, isFetching } = useGetStepDataQuery(apiStep);
  const [patchStep3, { isLoading: isSaving }] = usePatchStep3Mutation();

  useEffect(() => {
    const payload =
      stepData?.data && (stepData.data as any).data;
    if (payload && typeof payload === "object") {
      const d = payload as Record<string, unknown>;
      form.setFieldsValue({
        fullName: d.fullName,
        position: d.position,
        email: d.email,
        telephoneNumber:
          d.telephoneNumber != null && String(d.telephoneNumber).trim() !== ""
            ? String(d.telephoneNumber)
            : PHONE_BD_INITIAL_VALUE,
        whatsapp: d.whatsappNumber ?? d.whatsapp,
      });
    }
  }, [stepData, form]);

  const handleNext = () => {
    form
      .validateFields()
      .then(async (values) => {
        const payload: Step3Payload = {
          fullName: values.fullName,
          position: values.position,
          email: values.email,
          telephoneNumber: values.telephoneNumber,
          whatsappNumber: values.whatsapp,
        };

        try {
          await patchStep3(payload).unwrap();
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
            toast.error("Failed to save main contact details. Please try again.");
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
      initialValues={{ telephoneNumber: PHONE_BD_INITIAL_VALUE }}
      {...formItemLayout}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&_.ant-form-item]:min-w-0">
        <FormInput name="fullName" label="Full Name" placeholder="Enter full name" rules={[{ required: true, message: "Required" }]} />
        <FormInput name="position" label="Position" placeholder="Enter position" rules={[{ required: true, message: "Required" }]} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&_.ant-form-item]:min-w-0">
        <FormInput name="email" label="Email" placeholder="Enter email" rules={[{ required: true, message: "Required", type: "email" }]} />
        <Form.Item
          name="telephoneNumber"
          label="Telephone Number"
          rules={[{ required: true, message: "Required" }]}
          getValueFromEvent={phoneInputGetValueFromEvent}
        >
          <PhoneInput
            country="bd"
            disableCountryGuess
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
            containerStyle={{ width: "100%", minWidth: 0 }}
          />
        </Form.Item>
      </div>
      <FormInput name="whatsapp" label="Whatsapp (If Applicable)" placeholder="Enter whatsapp number" />
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
