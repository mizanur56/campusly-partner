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
    <div className="min-h-[calc(100vh-4rem)] -mx-4 md:-mx-6 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:gap-8">
        <OnboardingStepper currentStepIndex={currentStepIndex} variant={stepperVariant} />
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6 sm:py-6">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6 [&_.ant-input]:h-10 [&_.ant-input]:rounded-md [&_.ant-input]:border-gray-200 [&_.ant-input-affix-wrapper]:rounded-md [&_.ant-input-affix-wrapper]:border-gray-200 dark:[&_.ant-input]:border-gray-600 dark:[&_.ant-input-affix-wrapper]:border-gray-600">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
