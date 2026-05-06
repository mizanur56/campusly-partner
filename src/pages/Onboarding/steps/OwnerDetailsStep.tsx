import { Form } from "antd";
import { useEffect, useMemo } from "react";
import { Button } from "../../../components/ui/button";
import { OnboardingStepEditBar } from "../OnboardingStepEditBar";
import {
  getOnboardingStepPayload,
  step1HasPersistedData,
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
  usePatchStep1Mutation,
} from "../../../redux/features/onboardingForm/onboardingFormApi";
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
  const payload = useMemo(() => getOnboardingStepPayload(stepData), [stepData]);
  const hasPersistedData = useMemo(
    () => step1HasPersistedData(payload),
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
    const raw = stepData?.data && (stepData.data as any).data;
    if (raw && typeof raw === "object") {
      const next = { ...raw } as Partial<Step1Payload> & {
        mobileNumber?: string;
      };
      const digits = String(next.mobileNumber ?? "").replace(/\D/g, "");
      if (!digits) {
        next.mobileNumber = PHONE_BD_INITIAL_VALUE;
      }
      form.setFieldsValue(next as Partial<Step1Payload>);
    }
  }, [stepData, form]);

  const handleCancelEdit = () => {
    cancelEditing();
    const raw = stepData?.data && (stepData.data as any).data;
    if (raw && typeof raw === "object") {
      const next = { ...raw } as Partial<Step1Payload> & {
        mobileNumber?: string;
      };
      const digits = String(next.mobileNumber ?? "").replace(/\D/g, "");
      if (!digits) {
        next.mobileNumber = PHONE_BD_INITIAL_VALUE;
      }
      form.setFieldsValue(next as Partial<Step1Payload>);
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
    else toast.error("Failed to save company details. Please try again.");
  };

  const handleSave = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          await patchStep1(values as Step1Payload).unwrap();
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
          name="registeredCompanyName"
          label="Registered Company Name"
          placeholder="Enter registered company name"
          rules={[{ required: true, message: "Required" }]}
          disabled={formDisabled}
        />
        <FormInput
          name="companyRegistrationNumber"
          label="Company Registration Number"
          placeholder="Enter registration number"
          rules={[{ required: true, message: "Required" }]}
          disabled={formDisabled}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          name="countryOfRegistration"
          label="Country of Registration"
          placeholder="Select an item"
          rules={[{ required: true, message: "Required" }]}
          disabled={formDisabled}
        />
        <Form.Item
          name="mobileNumber"
          label="Mobile Number"
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          name="email"
          label="Email"
          placeholder="Select an item"
          disabled={formDisabled}
        />
        <FormInput
          name="website"
          label="Website"
          placeholder="Enter website url"
          disabled={formDisabled}
        />
      </div>
      <FormInput
        name="companyAddress"
        label="Company Address"
        placeholder="Enter company address"
        disabled={formDisabled}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          name="facebook"
          label="Facebook"
          placeholder="Enter facebook url"
          disabled={formDisabled}
        />
        <FormInput
          name="instagram"
          label="Instagram"
          placeholder="Enter instagram url"
          disabled={formDisabled}
        />
      </div>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
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
