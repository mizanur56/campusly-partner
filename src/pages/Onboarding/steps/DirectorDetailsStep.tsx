import { Form } from "antd";
import { useEffect, useMemo } from "react";
import { Button } from "../../../components/ui/button";
import { OnboardingStepEditBar } from "../OnboardingStepEditBar";
import {
  getOnboardingStepPayload,
  step2HasPersistedData,
} from "../onboardingStepDataUtils";
import { useOnboardingFormEditMode } from "../useOnboardingFormEditMode";
import {
  FormInput,
  PhoneInput,
  phoneButtonStyle,
  phoneInputGetValueFromEvent,
  phoneInputStyle,
  phoneNumberValidator,
  PHONE_BD_INITIAL_VALUE,
} from "../sharedFormProps";
import { toast } from "react-toastify";
import {
  useGetStepDataQuery,
  usePatchStep2Mutation,
} from "../../../redux/features/onboardingForm/onboardingFormApi";
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

export default function DirectorDetailsStep({
  apiStep,
  onPrev,
  onNext,
}: Props) {
  const [form] = Form.useForm();
  const { data: stepData, isFetching } = useGetStepDataQuery(apiStep);
  const [patchStep2, { isLoading: isSaving }] = usePatchStep2Mutation();
  const payload = useMemo(() => getOnboardingStepPayload(stepData), [stepData]);
  const hasPersistedData = useMemo(
    () => step2HasPersistedData(payload),
    [payload],
  );
  const {
    formDisabled,
    showEditControl,
    showSaveButton,
    isEditing,
    startEditing,
    cancelEditing,
  } = useOnboardingFormEditMode(hasPersistedData);

  useEffect(() => {
    const payload = stepData?.data && (stepData.data as any).data;
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

  const handleCancelEdit = () => {
    cancelEditing();
    const raw = stepData?.data && (stepData.data as any).data;
    if (raw && typeof raw === "object") {
      const d = raw as Record<string, unknown>;
      const mobileDigits = String(d.mobileNumber ?? "").replace(/\D/g, "");
      form.setFieldsValue({
        fullName: d.fullName,
        whatsapp: d.whatsappNumber ?? d.whatsapp,
        email: d.email,
        mobileNumber: mobileDigits || PHONE_BD_INITIAL_VALUE,
      });
    }
  };

  const patchErrorToast = (err: unknown) => {
    const e = err as { data?: { message?: string }; error?: string };
    const raw =
      e?.data?.message || (typeof e?.error === "string" ? e.error : "") || "";
    const message = String(raw);
    if (message.toLowerCase().includes("onboarding form already submitted")) {
      toast.info("Your onboarding form is already submitted.");
      return;
    }
    if (message) toast.error(message);
    else
      toast.error("Failed to save owner/director details. Please try again.");
  };

  const handleSave = () => {
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
          toast.success("Saved");
          cancelEditing();
        } catch (err) {
          patchErrorToast(err);
        }
      })
      .catch(() => {});
  };

  const handleNext = () => {
    form.validateFields().then(() => onNext()).catch(() => {});
  };

  if (isFetching && !stepData) {
    return <OnboardingFormSkeleton rows={3} />;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      disabled={formDisabled}
      initialValues={{ mobileNumber: PHONE_BD_INITIAL_VALUE }}
      {...formItemLayout}
    >
      <OnboardingStepEditBar
        show={showEditControl}
        isEditing={isEditing}
        onEdit={startEditing}
        onCancel={handleCancelEdit}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          name="fullName"
          label="Full name"
          placeholder="Enter full name"
          rules={[{ required: true, message: "Required" }]}
          disabled={formDisabled}
        />
        <FormInput
          name="whatsapp"
          label="Whatsapp (If Applicable)"
          placeholder="Enter whatsapp number"
          disabled={formDisabled}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          name="email"
          label="Email"
          placeholder="Enter email"
          rules={[{ required: true, message: "Required", type: "email" }]}
          disabled={formDisabled}
        />
        <Form.Item
          name="mobileNumber"
          label="Mobile number"
          rules={[{ required: true, message: "Required" }, { validator: phoneNumberValidator }]}
          getValueFromEvent={phoneInputGetValueFromEvent}
        >
          <PhoneInput
            country="bd"
            disableCountryGuess
            disabled={formDisabled}
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
          />
        </Form.Item>
      </div>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onPrev}
          disabled={isSaving}
        >
          ← Previous
        </Button>
        {showSaveButton && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleNext}
          disabled={isSaving || showSaveButton}
        >
          Next →
        </Button>
      </div>
    </Form>
  );
}
