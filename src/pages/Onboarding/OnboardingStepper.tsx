import { CiClock2 } from "react-icons/ci";
import { STEP_LIST_FOR_STEPPER } from "./onboardingSteps";
type StepperVariant = "form" | "submitted" | "verified" | "rejected";

interface OnboardingStepperProps {
  currentStepIndex?: number;
  variant?: StepperVariant;
  workflowStatus?: string;
}

/** Mint / emerald — completed segments & active ring */
const GREEN = "#22C55E";
const LINE_GRAY = "#E5E7EB";
const PENDING_RING = "#CBD5E1";
/** Under review — outlined ring + icon (matches SubmittedStep accent) */
const REVIEW_ORANGE = "#FFA500";
const LABEL_CLASS =
  "text-sm leading-snug text-slate-600 dark:text-slate-400";

export default function OnboardingStepper({
  currentStepIndex,
  variant: variantProp,
  workflowStatus,
}: OnboardingStepperProps) {
  const isControlled = currentStepIndex !== undefined;
  const variant: StepperVariant =
    isControlled && currentStepIndex === 5
      ? "submitted"
      : isControlled && currentStepIndex === 6
        ? "verified"
        : isControlled && currentStepIndex === 7
          ? "rejected"
          : (variantProp ?? "form");
  const currentIndex =
    isControlled && currentStepIndex >= 0 && currentStepIndex <= 4
      ? currentStepIndex
      : -1;

  const isApproved =
    workflowStatus === "AWAITING_PARTNER_SIGNATURE" ||
    workflowStatus === "AWAITING_ADMIN_APPROVAL";
  const isContractStage = isApproved || workflowStatus === "ACTIVE";

  const steps = STEP_LIST_FOR_STEPPER;
  const lastIndex = steps.length - 1;

  return (
    <aside
      className="w-full shrink-0 lg:w-50 xl:w-64 lg:self-start"
      aria-label="Application progress"
    >
      <div className="sticky top-24 overflow-hidden rounded-[16px] border border-[#C7CACF] bg-white dark:border-gray-700/90 dark:bg-gray-900 py-3">
        <h2 className="px-5 pt-3 text-[18px] font-semibold text-[#20242A] dark:text-white">
          Onboarding Steps
        </h2>
        <nav className="relative px-5 py-5" aria-label="Steps">
          <ol className="flex list-none flex-col p-0">
            {steps.map((step, index) => {
              const isStepPath = step.path !== null;
              const isCompleted =
                variant === "verified" ||
                (variant === "submitted" && index < 5) ||
                (variant === "rejected" && index < 5) ||
                (variant === "form" && currentIndex > index);
              const isCurrentFormStep =
                variant === "form" &&
                currentIndex === index &&
                isStepPath &&
                index <= 4;

              const isUnderReview = variant === "submitted" && index === 5;
              const isReviewApproved = isUnderReview && isApproved;
              const isRejected = variant === "rejected" && index === 5;

              const stepLabel = isReviewApproved
                ? "Review Complete"
                : isUnderReview
                  ? isContractStage
                    ? "Review Completes"
                    : "Under Review"
                  : isRejected
                    ? "Rejected"
                    : step.label;

              const isUnderReviewPending =
                isUnderReview && !isReviewApproved && !isContractStage;

              /** Segment below this row is green once this step is completed (check). */
              const connectorGreen = isCompleted && !isRejected;

              const showConnector = index < lastIndex;

              return (
                <li key={`${step.label}-${index}`} className="flex flex-col">
                  {/* Row 1: icon + label share one baseline / vertical center */}
                  <div
                    className={`flex items-center gap-1.5 ${
                      index > 0 ? "-mt-2 sm:-mt-2.5" : ""
                    }`}
                  >
                    <div className="relative z-[2] flex h-4 w-4 shrink-0 items-center justify-center">
                      <div className="flex items-center justify-center rounded-full bg-white dark:bg-gray-900">
                        <StepIcon
                          isRejected={isRejected}
                          isUnderReview={isUnderReview}
                          isReviewApproved={isReviewApproved}
                          isCompleted={
                            isCompleted && !isRejected && !isUnderReview
                          }
                          isCurrentFormStep={isCurrentFormStep}
                        />
                      </div>
                    </div>
                    <span className={`min-w-0 text-[16px] text-[#4B5563] flex-1 leading-5 ${LABEL_CLASS}`}>
                      {stepLabel}
                    </span>
                  </div>
                  {/* Row 2: connector only under icon column */}
                  {showConnector && (
                    <div className="flex w-4 shrink-0 justify-center">
                      <div
                        className="relative z-0 h-24 w-[2px] shrink-0 rounded-none -mt-2 -mb-2 sm:h-20"
                        style={{
                          backgroundColor: connectorGreen ? GREEN : LINE_GRAY,
                        }}
                        aria-hidden
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </aside>
  );
}

function StepIcon({
  isRejected,
  isUnderReview,
  isReviewApproved,
  isCompleted,
  isCurrentFormStep,
}: {
  isRejected: boolean;
  isUnderReview: boolean;
  isReviewApproved: boolean;
  isCompleted: boolean;
  isCurrentFormStep: boolean;
}) {
  const size = "h-4 w-4 min-h-4 min-w-4";

  if (isRejected) {
    return (
      <span
        className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-sm`}
        aria-hidden
      >
        <svg
          className="h-2.5 w-2.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </span>
    );
  }

  if (isUnderReview) {
    if (isReviewApproved) {
      return (
        <span
          className={`flex ${size} shrink-0 items-center justify-center rounded-full text-white shadow-sm`}
          style={{ backgroundColor: GREEN }}
          aria-hidden
        >
          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    }

    return (
      <span
        className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900`}
        
        aria-hidden
      >
        <CiClock2
          className="h-5 w-5 shrink-0"
          style={{ color: REVIEW_ORANGE }}
          aria-hidden
        />
      </span>
    );
  }

  if (isCompleted) {
    return (
      <span
        className={`flex ${size} shrink-0 items-center justify-center rounded-full text-white shadow-sm`}
        style={{ backgroundColor: GREEN }}
        aria-hidden
      >
        <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  if (isCurrentFormStep) {
    return (
      <span
        className={`box-border flex ${size} shrink-0 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-900`}
        style={{ borderColor: GREEN }}
        aria-current="step"
      />
    );
  }

  return (
    <span
      className={`box-border flex ${size} shrink-0 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-900`}
      style={{ borderColor: PENDING_RING }}
      aria-hidden
    />
  );
}
