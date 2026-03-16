import { ReactNode } from "react";
import OnboardingStepper from "./OnboardingStepper";
import { ONBOARDING_FORM_STEP_COUNT } from "./onboardingSteps";

interface OnboardingFormLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  /** 0-4 form steps, 5 submitted, 6 verified, 7 rejected. When set, stepper uses this instead of route */
  currentStepIndex?: number;
  stepperVariant?: "form" | "submitted" | "verified" | "rejected";
  /** Optional: when provided, enables clicking steps 0–4 in sidebar to switch form tab */
  onStepChange?: (index: number) => void;
  /** Optional: workflow status to determine if approved */
  workflowStatus?: string;
}

export default function OnboardingFormLayout({
  children,
  title,
  subtitle,
  currentStepIndex,
  stepperVariant = "form",
  onStepChange,
  workflowStatus,
}: OnboardingFormLayoutProps) {
  const showStepInHeader =
    currentStepIndex !== undefined &&
    currentStepIndex >= 0 &&
    currentStepIndex <= 4;
  const stepIndex = showStepInHeader ? currentStepIndex! : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <OnboardingStepper
            currentStepIndex={currentStepIndex}
            variant={stepperVariant}
            onStepSelect={onStepChange}
            workflowStatus={workflowStatus}
          />
          <main className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-700/90 dark:bg-gray-900">
              <header className="border-b border-gray-100 bg-white px-6 py-5 dark:border-gray-800 dark:bg-gray-900 sm:px-8 sm:py-6">
                {showStepInHeader && (
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {stepperVariant === "form"
                      ? `Step ${stepIndex + 1} of ${ONBOARDING_FORM_STEP_COUNT}`
                      : stepperVariant === "submitted"
                        ? workflowStatus === "AWAITING_PARTNER_SIGNATURE" ||
                          workflowStatus === "AWAITING_ADMIN_APPROVAL"
                          ? "Approved"
                          : "Under review"
                        : stepperVariant === "rejected"
                          ? "Action required"
                          : "Complete"}
                  </p>
                )}
                <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </header>
              {/* Card body — constrained width for form readability */}
              <div className="px-6 py-6 sm:px-8 sm:py-7 [&_.ant-input]:h-10 [&_.ant-input]:rounded-lg [&_.ant-input]:border-gray-200 [&_.ant-input-affix-wrapper]:rounded-lg [&_.ant-input-affix-wrapper]:border-gray-200 dark:[&_.ant-input]:border-gray-600 dark:[&_.ant-input-affix-wrapper]:border-gray-600">
                <div className="max-w-2xl">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
