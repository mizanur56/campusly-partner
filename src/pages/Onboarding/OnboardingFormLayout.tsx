import { ReactNode } from "react";
import OnboardingStepper from "./OnboardingStepper";

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
  return (
    <div className="min-h-[calc(100vh-4rem)] -mx-4 md:-mx-6 px-4 py-8 md:px-6 dark:bg-neutral-900/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <OnboardingStepper currentStepIndex={currentStepIndex} variant={stepperVariant} />
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <div className="border-b border-neutral-100 p-6 sm:p-8 dark:border-neutral-800">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-base text-neutral-500 dark:text-neutral-400">{subtitle}</p>
              )}
            </div>
            <div className="p-6 sm:p-8 [&_.ant-input]:h-11 [&_.ant-input]:rounded-lg [&_.ant-input]:border-neutral-100 [&_.ant-input-affix-wrapper]:rounded-lg [&_.ant-input-affix-wrapper]:border-neutral-100 dark:[&_.ant-input]:border-neutral-600 dark:[&_.ant-input-affix-wrapper]:border-neutral-600">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
