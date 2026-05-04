import { Checkbox, Form } from "antd";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../../../components/ui/button";
import type { Step5Payload } from "../../../redux/features/onboardingForm/onboardingFormApi";
import {
  useGetStepDataQuery,
  usePatchStep5Mutation,
  useSubmitOnboardingMutation,
} from "../../../redux/features/onboardingForm/onboardingFormApi";
import OnboardingFormSkeleton from "../OnboardingFormSkeleton";
import { OnboardingStepEditBar } from "../OnboardingStepEditBar";
import {
  getOnboardingStepPayload,
  step5HasPersistedData,
} from "../onboardingStepDataUtils";
import { useOnboardingFormEditMode } from "../useOnboardingFormEditMode";

const formItemLayout = {
  className:
    "[&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[15px] [&_.ant-form-item]:mb-4",
};

interface Props {
  apiStep: number;
  onPrev: () => void;
  onSubmit: () => void;
}

export default function DeclarationStep({ apiStep, onPrev, onSubmit }: Props) {
  const [form] = Form.useForm();
  const { data: stepData, isFetching } = useGetStepDataQuery(apiStep);
  const [patchStep5, { isLoading: isPatching }] = usePatchStep5Mutation();
  const [submitOnboarding, { isLoading: isSubmitting }] =
    useSubmitOnboardingMutation();
  const payload = useMemo(() => getOnboardingStepPayload(stepData), [stepData]);
  const hasPersistedData = useMemo(
    () => step5HasPersistedData(payload),
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
      form.setFieldsValue({
        verifyInfo: d.verifyInformation,
        allowData: d.agreePrivacyPolicy,
        receiveUpdates: d.agreeCommunicationUpdates,
      });
    }
  }, [stepData, form]);

  const handleCancelEdit = () => {
    cancelEditing();
    const raw = stepData?.data && (stepData.data as any).data;
    if (raw && typeof raw === "object") {
      const d = raw as Record<string, unknown>;
      form.setFieldsValue({
        verifyInfo: d.verifyInformation,
        allowData: d.agreePrivacyPolicy,
        receiveUpdates: d.agreeCommunicationUpdates,
      });
    }
  };

  const buildPayload = (values: {
    verifyInfo: boolean;
    allowData: boolean;
    receiveUpdates: boolean;
  }): Step5Payload => ({
    verifyInformation: values.verifyInfo,
    agreePrivacyPolicy: values.allowData,
    agreeCommunicationUpdates: values.receiveUpdates,
  });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await patchStep5(buildPayload(values)).unwrap();
      toast.success("Saved");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; error?: string };
      const message =
        e?.data?.message || (typeof e?.error === "string" ? e.error : "") || "";
      if (message) toast.error(message);
      else toast.error("Failed to save declaration. Please try again.");
    }
  };

  /** Submit application (declaration must be saved first — Submit stays disabled until then). */
  const handleFinalSubmit = async () => {
    try {
      await form.validateFields();
      await submitOnboarding().unwrap();
      onSubmit();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; error?: string };
      const message =
        e?.data?.message || (typeof e?.error === "string" ? e.error : "") || "";

      if (message.toLowerCase().includes("onboarding form already submitted")) {
        toast.info("Your onboarding form is already submitted.");
        onSubmit();
        return;
      }

      if (message) {
        toast.error(message);
      } else {
        toast.error("Failed to submit onboarding form. Please try again.");
      }
    }
  };

  if (isFetching && !stepData) {
    return <OnboardingFormSkeleton rows={2} />;
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-[16px] font-medium text-[#20242A] dark:text-white">
            Minor mistakes can cause a major delay in our partnership. Please
            take a moment to verify the information in each section before
            submitting.
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            By proceeding, you agree to the{" "}
            <Link to="#" className="text-primary-600 hover:underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link to="#" className="text-primary-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="shrink-0 sm:ml-4">
          <OnboardingStepEditBar
            show={showEditControl}
            isEditing={isEditing}
            onEdit={startEditing}
            onCancel={handleCancelEdit}
            className="mb-0 w-full sm:w-auto"
          />
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        disabled={formDisabled}
        {...formItemLayout}
      >
        <Form.Item
          name="verifyInfo"
          valuePropName="checked"
          rules={[{ required: true, message: "Required" }]}
        >
          <Checkbox
            disabled={formDisabled}
            className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500"
          >
            I verify that all the information provided is accurate and
            legitimate. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="allowData"
          valuePropName="checked"
          rules={[{ required: true, message: "Required" }]}
        >
          <Checkbox
            disabled={formDisabled}
            className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500"
          >
            I agree to allow Campus Transfer to store and process my personal
            data in accordance with the Privacy Policy.{" "}
            <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="receiveUpdates"
          valuePropName="checked"
          rules={[{ required: true, message: "Required" }]}
        >
          <Checkbox
            disabled={formDisabled}
            className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500"
          >
            I agree to receive updates and communication from Campus Transfer
            via email or phone. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-primary-border pt-5 dark:border-neutral-800">
          <Button type="button" variant="secondary" size="sm" onClick={onPrev}>
            ← Previous
          </Button>
          {showSaveButton && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSave}
              disabled={isPatching || isSubmitting}
            >
              {isPatching ? "Saving…" : "Save"}
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleFinalSubmit}
            disabled={isPatching || isSubmitting || showSaveButton}
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </Form>
    </>
  );
}
