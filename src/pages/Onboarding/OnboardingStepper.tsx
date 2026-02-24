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
        : currentIndex >= 0
          ? currentIndex
          : 0;

  return (
    <aside
      className="w-full shrink-0 lg:w-56 xl:w-64"
      aria-label="Application progress"
    >
      <div className="sticky top-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          Progress
        </p>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          {variant === "verified"
            ? "Step 5 of 5"
            : variant === "submitted"
              ? "Under review"
              : currentIndex >= 0
                ? `Step ${currentIndex + 1} of ${STEP_COUNT}`
                : "Step 1 of 5"}
        </p>
        <nav className="relative flex flex-col" aria-label="Steps">
          {/* Connector line (background) */}
          <div
            className="absolute left-[15px] top-6 w-px bg-gray-200 dark:bg-gray-700"
            style={{ height: "calc(100% - 24px)" }}
            aria-hidden
          />
          {/* Connector line (progress) */}
          {completedCount > 0 && (
            <div
              className="absolute left-[15px] top-6 z-[1] w-px bg-primary-500 transition-all duration-300"
              style={{
                height: `calc(${Math.min(completedCount, STEP_COUNT)} * (36px + 8px) - 8px)`,
              }}
              aria-hidden
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
            const stepNumber = index + 1;
            const stepLabel = isUnderReview ? "Under review" : step.label;

            return (
              <div
                key={step.label + String(index)}
                className="relative z-10 flex items-start gap-3 py-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {isUnderReview ? (
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-500 text-white"
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
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white"
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
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-600 bg-white text-sm font-semibold text-primary-600 dark:bg-gray-900"
                      aria-current="step"
                    >
                      {stepNumber}
                    </span>
                  ) : (
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-sm text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-500"
                      aria-hidden
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>
                <span
                  className={`pt-1 text-sm leading-tight ${
                    isActive
                      ? "font-medium text-gray-900 dark:text-white"
                      : isUnderReview
                        ? "font-medium text-warning-700 dark:text-warning-400"
                        : isCompleted
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {stepLabel}
                </span>
              </div>
            );
          })}
          {variant === "verified" && (
            <div className="relative z-10 flex items-start gap-3 py-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white"
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
              <span className="pt-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                Complete
              </span>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
