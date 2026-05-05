<<<<<<< HEAD
import { Form, Checkbox, Tooltip } from "antd";
import { useEffect } from "react";
=======
import { Checkbox, Form } from "antd";
import { useEffect, useMemo } from "react";
>>>>>>> 75831e938a2995d50fa48f3b42ef767bde2a9925
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../../../components/ui/button";
<<<<<<< HEAD
import { toast } from "react-toastify";
=======
import type { Step5Payload } from "../../../redux/features/onboardingForm/onboardingFormApi";
>>>>>>> 75831e938a2995d50fa48f3b42ef767bde2a9925
import {
  useGetStepDataQuery,
  usePatchStep5Mutation,
  useSubmitOnboardingMutation,
} from "../../../redux/features/onboardingForm/onboardingFormApi";
<<<<<<< HEAD
import type { Step5Payload } from "../../../redux/features/onboardingForm/onboardingFormApi";
import OnboardingFormSkeleton from "../OnboardingFormSkeleton";
=======
import OnboardingFormSkeleton from "../OnboardingFormSkeleton";
import { OnboardingStepEditBar } from "../OnboardingStepEditBar";
import {
  getOnboardingStepPayload,
  step5HasPersistedData,
} from "../onboardingStepDataUtils";
import { useOnboardingFormEditMode } from "../useOnboardingFormEditMode";
>>>>>>> 75831e938a2995d50fa48f3b42ef767bde2a9925

const SUBMIT_DISABLED_HINT = "Please accept all declarations to proceed";

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
<<<<<<< HEAD

  const verifyInfo = Form.useWatch("verifyInfo", form);
  const allowData = Form.useWatch("allowData", form);
  const receiveUpdates = Form.useWatch("receiveUpdates", form);
  const allDeclarationsAccepted = Boolean(
    verifyInfo && allowData && receiveUpdates,
  );
=======
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
>>>>>>> 75831e938a2995d50fa48f3b42ef767bde2a9925

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

  const handleFinalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: Step5Payload = {
        verifyInformation: values.verifyInfo,
        agreePrivacyPolicy: values.allowData,
        agreeCommunicationUpdates: values.receiveUpdates,
      };
      await patchStep5(payload).unwrap();
      await submitOnboarding().unwrap();
      onSubmit();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; error?: string };
      const message =
        e?.data?.message ||
        (typeof e?.error === "string" ? e.error : "") ||
        "";

      if (message.toLowerCase().includes("onboarding form already submitted")) {
        toast.info("Your onboarding form is already submitted.");
        onSubmit();
        return;
      }

      if (message) toast.error(message);
      else toast.error("Failed to submit onboarding form. Please try again.");
    }
  };

  if (isFetching && !stepData) {
    return <OnboardingFormSkeleton rows={2} />;
  }

  const isBusy = isPatching || isSubmitting;

  return (
    <>
<<<<<<< HEAD
      <div className="mb-4 space-y-3">
        <p className="text-[16px] font-medium text-[#20242A] dark:text-white">
          Minor mistakes can cause a major delay in our partnership. Please take
          a moment to verify the information in each section before submitting.
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
      <Form form={form} layout="vertical" {...formItemLayout}>
        <Form.Item name="verifyInfo" valuePropName="checked">
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
=======
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
>>>>>>> 75831e938a2995d50fa48f3b42ef767bde2a9925
            I verify that all the information provided is accurate and
            legitimate. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
<<<<<<< HEAD
        <Form.Item name="allowData" valuePropName="checked">
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
=======
        <Form.Item
          name="allowData"
          valuePropName="checked"
          rules={[{ required: true, message: "Required" }]}
        >
          <Checkbox
            disabled={formDisabled}
            className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500"
          >
>>>>>>> 75831e938a2995d50fa48f3b42ef767bde2a9925
            I agree to allow Campus Transfer to store and process my personal
            data in accordance with the Privacy Policy.{" "}
            <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
<<<<<<< HEAD
        <Form.Item name="receiveUpdates" valuePropName="checked">
          <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500">
=======
        <Form.Item
          name="receiveUpdates"
          valuePropName="checked"
          rules={[{ required: true, message: "Required" }]}
        >
          <Checkbox
            disabled={formDisabled}
            className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary-500"
          >
>>>>>>> 75831e938a2995d50fa48f3b42ef767bde2a9925
            I agree to receive updates and communication from Campus Transfer
            via email or phone. <span className="text-red-500">*</span>
          </Checkbox>
        </Form.Item>
<<<<<<< HEAD
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5 dark:border-neutral-800">
=======
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
>>>>>>> 75831e938a2995d50fa48f3b42ef767bde2a9925
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onPrev}
            disabled={isBusy}
          >
            ← Previous
          </Button>
          <Tooltip
            title={allDeclarationsAccepted ? undefined : SUBMIT_DISABLED_HINT}
            placement="top"
          >
            <span
              className={
                allDeclarationsAccepted
                  ? "inline-flex"
                  : "inline-flex cursor-not-allowed"
              }
            >
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={!allDeclarationsAccepted || isBusy}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            </span>
          </Tooltip>
        </div>
      </Form>
    </>
  );
}
