import { Form } from "antd";
import { useEffect, useMemo } from "react";
import { Button } from "../../../components/ui/button";
import { OnboardingStepEditBar } from "../OnboardingStepEditBar";
import {
  getOnboardingStepPayload,
  step3HasPersistedData,
} from "../onboardingStepDataUtils";
import { useOnboardingFormEditMode } from "../useOnboardingFormEditMode";
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
  const payload = useMemo(
    () => getOnboardingStepPayload(stepData),
    [stepData],
  );
  const hasPersistedData = useMemo(() => step3HasPersistedData(payload), [payload]);
  const {
    formDisabled,
    showEditControl,
    showSaveButton,
    isEditing,
    startEditing,
    cancelEditing,
  } = useOnboardingFormEditMode(hasPersistedData);

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

  const handleCancelEdit = () => {
    cancelEditing();
    const raw = stepData?.data && (stepData.data as any).data;
    if (raw && typeof raw === "object") {
      const d = raw as Record<string, unknown>;
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
    else toast.error("Failed to save main contact details. Please try again.");
  };

  const handleSave = () => {
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
          toast.success("Saved");
        } catch (err) {
          patchErrorToast(err);
        }
      })
      .catch(() => {});
  };

  const handleNext = () => {
    onNext();
  };

  if (isFetching && !stepData) {
    return <OnboardingFormSkeleton rows={3} />;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      disabled={formDisabled}
      initialValues={{ telephoneNumber: PHONE_BD_INITIAL_VALUE }}
      {...formItemLayout}
    >
      <OnboardingStepEditBar
        show={showEditControl}
        isEditing={isEditing}
        onEdit={startEditing}
        onCancel={handleCancelEdit}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&_.ant-form-item]:min-w-0">
        <FormInput name="fullName" label="Full Name" placeholder="Enter full name" rules={[{ required: true, message: "Required" }]} disabled={formDisabled} />
        <FormInput name="position" label="Position" placeholder="Enter position" rules={[{ required: true, message: "Required" }]} disabled={formDisabled} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&_.ant-form-item]:min-w-0">
        <FormInput name="email" label="Email" placeholder="Enter email" rules={[{ required: true, message: "Required", type: "email" }]} disabled={formDisabled} />
        <Form.Item
          name="telephoneNumber"
          label="Telephone Number"
          rules={[{ required: true, message: "Required" }]}
          getValueFromEvent={phoneInputGetValueFromEvent}
        >
          <PhoneInput
            country="bd"
            disableCountryGuess
            disabled={formDisabled}
            inputStyle={phoneInputStyle}
            buttonStyle={phoneButtonStyle}
            containerStyle={{ width: "100%", minWidth: 0 }}
          />
        </Form.Item>
      </div>
      <FormInput name="whatsapp" label="Whatsapp (If Applicable)" placeholder="Enter whatsapp number" disabled={formDisabled} />
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onPrev} disabled={isSaving}>
          ← Previous
        </Button>
        {showSaveButton && (
          <Button type="button" variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
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
