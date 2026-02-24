import { STEP_LIST_FOR_STEPPER } from "./onboardingSteps";

type StepperVariant = "form" | "submitted" | "verified";

interface OnboardingStepperProps {
  currentStepIndex?: number;
  variant?: StepperVariant;
}

const STEP_COUNT = 5;

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
        : (variantProp ?? "form");
  const currentIndex =
    isControlled && currentStepIndex >= 0 && currentStepIndex <= 4
      ? currentStepIndex
      : -1;

  return (
    <aside
      className="w-full shrink-0 lg:w-60 xl:w-72 lg:self-start"
      aria-label="Application progress"
    >
      <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200/90 bg-white card-shadow dark:border-gray-700/90 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Progress
          </p>
          <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
            {variant === "verified"
              ? "All steps complete"
              : variant === "submitted"
                ? "Under review"
                : currentIndex >= 0
                  ? `Step ${currentIndex + 1} of ${STEP_COUNT}`
                  : "Step 1 of 5"}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{
                width: `${
                  variant === "verified"
                    ? 100
                    : variant === "submitted"
                      ? 100
                      : currentIndex >= 0
                        ? ((currentIndex + 1) / STEP_COUNT) * 100
                        : 20
                }%`,
              }}
              aria-hidden
            />
          </div>
        </div>
        <nav className="relative flex flex-col px-5 py-4" aria-label="Steps">
          {STEP_LIST_FOR_STEPPER.map((step, index) => {
            const isStepPath = step.path !== null;
            const isCompleted =
              variant === "verified" ||
              (variant === "submitted" && index < 5) ||
              (variant === "form" && currentIndex > index);
            const isActive =
              variant === "form" && currentIndex === index && isStepPath;
            const isUnderReview = variant === "submitted" && index === 5;
            const stepNumber = index + 1;
            const stepLabel = isUnderReview ? "Under review" : step.label;

            return (
              <div
                key={step.label + String(index)}
                className="relative z-10 flex items-start gap-3 py-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                  {isUnderReview ? (
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"
                      aria-hidden
                    >
                      <svg
                        className="h-4 w-4"
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
                    </span>
                  ) : isCompleted ? (
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm"
                      aria-hidden
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  ) : isActive ? (
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-500 bg-primary-50 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      aria-current="step"
                    >
                      {stepNumber}
                    </span>
                  ) : (
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-sm font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-500"
                      aria-hidden
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>
                <span
                  className={`pt-1.5 text-sm leading-snug ${
                    isActive
                      ? "font-semibold text-gray-900 dark:text-white"
                      : isUnderReview
                        ? "font-medium text-amber-700 dark:text-amber-400"
                        : isCompleted
                          ? "font-medium text-gray-600 dark:text-gray-300"
                          : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {stepLabel}
                </span>
              </div>
            );
          })}
          {variant === "verified" && (
            <div className="relative z-10 flex items-start gap-3 py-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm"
                aria-hidden
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="pt-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                Complete
              </span>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
