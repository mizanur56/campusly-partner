import { STEP_LIST_FOR_STEPPER } from "./onboardingSteps";

type StepperVariant = "form" | "submitted" | "verified";

interface OnboardingStepperProps {
  /** When provided, step is controlled by parent (single onboarding page). 0-5 = form steps, 6 = submitted, 7 = verified */
  currentStepIndex?: number;
  /** When currentStepIndex is not used, variant can be set by parent */
  variant?: StepperVariant;
}

export default function OnboardingStepper({
  currentStepIndex,
  variant: variantProp,
}: OnboardingStepperProps) {
  const isControlled = currentStepIndex !== undefined;
  const variant: StepperVariant =
    isControlled && currentStepIndex === 5
      ? "submitted"
      : isControlled && currentStepIndex === 6
        ? "verified"
        : variantProp ?? "form";
  const currentIndex =
    isControlled && currentStepIndex >= 0 && currentStepIndex <= 4
      ? currentStepIndex
      : -1;

  const completedCount =
    variant === "verified"
      ? 6
      : variant === "submitted"
        ? 5
        : currentIndex > 0
          ? currentIndex
          : 0;

  return (
    <div className="w-full shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:w-[260px]">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Steps
      </h2>
      <div className="relative flex flex-col pl-0.5">
        <div
          className="absolute left-[11px] top-5 bottom-5 w-px bg-gray-200 dark:bg-gray-700"
          style={{ height: "calc(100% - 40px)" }}
        />
        {completedCount > 0 && (
          <div
            className="absolute left-[11px] top-5 z-[1] w-px bg-primary-500"
            style={{
              height: `${completedCount * 40}px`,
              minHeight: "20px",
            }}
          />
        )}
        {STEP_LIST_FOR_STEPPER.map((step, index) => {
          const isStepPath = step.path !== null;
          const isCompleted =
            variant === "verified" ||
            (variant === "submitted" && index < 5) ||
            (variant === "form" && currentIndex > index);
          const isActive =
            variant === "form" && currentIndex === index && isStepPath;
          const isUnderReview = variant === "submitted" && index === 5;
          const stepLabel = isUnderReview ? "Under Review" : step.label;

          return (
            <div
              key={step.label + String(index)}
              className="relative z-10 flex items-center gap-3 py-1.5"
              style={{ minHeight: "36px" }}
            >
              <div className="shrink-0">
                {isUnderReview ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-warning-500">
                    <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : isCompleted ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary-500 bg-white" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-gray-200 bg-white dark:border-gray-600" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? "font-medium text-primary-600"
                    : isUnderReview
                      ? "font-medium text-warning-600"
                      : isCompleted
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {stepLabel}
              </span>
            </div>
          );
        })}
        {variant === "verified" && (
          <div className="relative z-10 flex items-center gap-3 py-1.5" style={{ minHeight: "36px" }}>
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Review Complete</span>
          </div>
        )}
      </div>
    </div>
  );
}
