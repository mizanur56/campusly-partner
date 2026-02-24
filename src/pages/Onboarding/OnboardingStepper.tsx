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
    <div className="w-full shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900 lg:w-[320px]">
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
        Onboarding Steps
      </h2>
      <div className="relative flex flex-col pl-1">
        <div
          className="absolute left-5 top-6 bottom-6 w-[2px] rounded-full bg-neutral-100"
          style={{ height: "calc(100% - 48px)" }}
        />
        {completedCount > 0 && (
          <div
            className="absolute left-5 top-6 z-[1] w-[2px] rounded-full bg-primary-500"
            style={{
              height: `${completedCount * 48}px`,
              minHeight: "24px",
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
              className="relative z-10 flex items-center gap-4 py-2"
              style={{ minHeight: "44px" }}
            >
              <div className="shrink-0 bg-white">
                {isUnderReview ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning-500 ring-4 ring-white">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                ) : isCompleted ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 ring-4 ring-white">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="h-6 w-6 rounded-full border-2 border-primary-500 bg-white ring-4 ring-white" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-neutral-200 bg-white ring-4 ring-white" />
                )}
              </div>
              <span
                className={`text-lg font-normal ${
                  isActive
                    ? "font-medium text-primary-600"
                    : isUnderReview
                      ? "font-medium text-warning-600"
                      : isCompleted
                        ? "text-neutral-700"
                        : "text-neutral-500"
                }`}
              >
                {stepLabel}
              </span>
            </div>
          );
        })}
        {variant === "verified" && (
          <div
            className="relative z-10 flex items-center gap-4 py-2"
            style={{ minHeight: "44px" }}
          >
            <div className="shrink-0 bg-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 ring-4 ring-white">
                <svg
                  className="h-4 w-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <span className="text-lg font-normal text-neutral-700">
              Review Complete
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
