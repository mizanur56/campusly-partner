import { ReactNode } from "react";
import OnboardingStepper from "./OnboardingStepper";
import { ONBOARDING_FORM_STEP_COUNT } from "./onboardingSteps";

interface OnboardingFormLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  /** 0-4 form steps, 5 submitted, 6 verified. When set, stepper uses this instead of route */
  currentStepIndex?: number;
  stepperVariant?: "form" | "submitted" | "verified";
}

export default function OnboardingFormLayout({
  children,
  title,
  subtitle,
  currentStepIndex,
  stepperVariant = "form",
}: OnboardingFormLayoutProps) {
  const showStepInHeader =
    currentStepIndex !== undefined &&
    currentStepIndex >= 0 &&
    currentStepIndex <= 4;
  const stepIndex = showStepInHeader ? currentStepIndex! : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 px-4 py-8 dark:bg-gray-950/30 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <OnboardingStepper
            currentStepIndex={currentStepIndex}
            variant={stepperVariant}
          />
          <main className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <header className="border-b border-gray-100 px-6 py-6 dark:border-gray-800 sm:px-8 sm:py-7">
                {showStepInHeader && (
                  <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stepperVariant === "form"
                      ? `Step ${stepIndex + 1} of ${ONBOARDING_FORM_STEP_COUNT}`
                      : stepperVariant === "submitted"
                        ? "Under review"
                        : "Complete"}
                  </p>
                )}
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
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
