import { ReactNode } from "react";
import OnboardingStepper from "./OnboardingStepper";

interface OnboardingFormLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  /** 0-4 form steps, 5 submitted, 6 verified, 7 rejected. When set, stepper uses this instead of route */
  currentStepIndex?: number;
  stepperVariant?: "form" | "submitted" | "verified" | "rejected";
  /** Optional: workflow status to determine if approved */
  workflowStatus?: string;
}

export default function OnboardingFormLayout({
  children,
  title,
  subtitle,
  currentStepIndex,
  stepperVariant = "form",
  workflowStatus,
}: OnboardingFormLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-2 py-4">
      <div className="mx-auto max-w-6xl ">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <OnboardingStepper
            currentStepIndex={currentStepIndex}
            variant={stepperVariant}
            workflowStatus={workflowStatus}
          />
          <main className="min-w-0 flex-1">
            <div className="overflow-hidden">
              {(title.trim() || subtitle?.trim()) && (
                <header className="border-b border-primary-border pb-4 dark:border-gray-800 dark:bg-gray-900 ">
                  {title.trim() ? (
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                      {title}
                    </h1>
                  ) : null}
                  {subtitle?.trim() ? (
                    <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                      {subtitle}
                    </p>
                  ) : null}
                </header>
              )}
              {/* Card body — constrained width for form readability */}
              <div className=" py-6  sm:py-7 [&_.ant-input]:h-10 [&_.ant-input]:rounded-lg [&_.ant-input]:border-gray-200 [&_.ant-input-affix-wrapper]:rounded-lg [&_.ant-input-affix-wrapper]:border-gray-200 dark:[&_.ant-input]:border-gray-600 dark:[&_.ant-input-affix-wrapper]:border-gray-600">
                <div className="max-w-2xl">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
