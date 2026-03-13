import { useEffect, useState } from "react";
import PageMeta from "../../components/common/Meta/PageMeta";
import { Button } from "../../components/ui/button";
import { usePreviewMode } from "../../context/PreviewModeContext";
import SignedDashboardView from "./SignedDashboardView";
import { useGetOnboardingStatusQuery } from "../../redux/features/onboardingForm";

// Skeleton pulse animation component
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
  />
);

// Dashboard Skeleton Loader
const DashboardSkeleton = () => (
  <div className="min-h-[calc(100vh-4rem)] -mx-4 px-0 py-0 md:-mx-6 md:px-0 lg:-mx-8">
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header skeleton */}
      <header className="mb-10">
        <Skeleton className="h-8 w-72 sm:h-9" />
        <Skeleton className="mt-3 h-5 w-full max-w-lg" />
        {/* Progress summary skeleton */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="min-w-0 flex-1 rounded-xl border border-gray-200/80 bg-white p-4 card-shadow dark:border-gray-700/80 dark:bg-gray-900/50">
            <Skeleton className="h-3 w-20" />
            <div className="mt-2 flex items-baseline gap-2">
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
          </div>
          <div className="min-w-0 flex-1 rounded-xl border border-gray-200/80 bg-white p-4 card-shadow dark:border-gray-700/80 dark:bg-gray-900/50">
            <Skeleton className="h-3 w-16" />
            <div className="mt-2 flex items-baseline gap-2">
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
          </div>
        </div>
      </header>

      {/* Onboarding Form card skeleton */}
      <section className="rounded-2xl border border-gray-200/90 bg-white card-shadow dark:border-gray-700/90 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="min-w-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1 h-3 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/30">
          <ul className="space-y-0">
            {[...Array(6)].map((_, index) => (
              <li
                key={index}
                className={`flex items-center gap-3 py-3 ${
                  index > 0
                    ? "border-t border-gray-100 dark:border-gray-700/80"
                    : ""
                }`}
              >
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contract card skeleton */}
      <section className="mt-6 rounded-2xl border border-gray-200/90 bg-white card-shadow dark:border-gray-700/90 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="min-w-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-1 h-3 w-36" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/30">
          <ul className="space-y-0">
            {[...Array(2)].map((_, index) => (
              <li
                key={index}
                className={`flex items-center gap-3 py-3 ${
                  index > 0
                    ? "border-t border-gray-100 dark:border-gray-700/80"
                    : ""
                }`}
              >
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  </div>
);

const BASE_ONBOARDING_STEPS = [
  { id: "owner", label: "Owner Details" },
  { id: "director", label: "Director Details" },
  { id: "contact", label: "Main Contact Details" },
  { id: "compliance", label: "Regular Compliance" },
  { id: "declaration", label: "Declaration" },
  { id: "review", label: "Approved" },
];

const BASE_CONTRACT_STEPS = [
  { id: "view-sign", label: "View and Sign" },
  { id: "complete", label: "Approved" },
];

const Dashboard = () => {
  const { previewMode, setPreviewMode } = usePreviewMode();
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [contractOpen, setContractOpen] = useState(true);

  const { data: formStatus, isLoading } = useGetOnboardingStatusQuery();

  const onboardingTotal = BASE_ONBOARDING_STEPS.length;
  const contractTotal = BASE_CONTRACT_STEPS.length;

  // Backend: onboardingStep = number of completed onboarding steps (0–6).
  // So "completed" = onboardingStep (clamped to total steps).
  const rawOnboardingStep = formStatus?.onboardingStep ?? 0;
  const onboardingCompleted = Math.max(
    0,
    Math.min(onboardingTotal, rawOnboardingStep),
  );

  const ONBOARDING_STEPS = BASE_ONBOARDING_STEPS.map((step, index) => ({
    ...step,
    completed: index < onboardingCompleted,
  }));

  // Contract progress derived from overall status
  const status = formStatus?.status;
  const statusLabel = formStatus?.statusLabel;
  const isContractSignRejected = statusLabel === "Contract sign rejected";
  const contractRejectionReason = formStatus?.rejectionReason?.trim();

  // Check if application is rejected
  const isRejected = status === "REJECTED" && !isContractSignRejected;

  // Check if application is approved (contract uploaded means admin approved the application)
  const isApproved =
    status === "AWAITING_PARTNER_SIGNATURE" ||
    status === "AWAITING_ADMIN_APPROVAL" ||
    status === "ACTIVE";
  const hasUnlockedPortal =
    status === "ACTIVE" && !!formStatus?.portalAccessUnlocked;
  const canAccessContract = isApproved || isContractSignRejected;

  let contractCompleted = 0;
  if (isContractSignRejected) {
    // Keep contract flow visible and show rejection on the final contract step
    contractCompleted = contractTotal;
  } else if (status === "AWAITING_PARTNER_SIGNATURE") {
    // Partner needs to sign - View and Sign is active (step 1)
    contractCompleted = 0;
  } else if (status === "AWAITING_ADMIN_APPROVAL") {
    // Partner signed, waiting for admin - View and Sign completed, Complete is active
    contractCompleted = 1;
  } else if (status === "ACTIVE") {
    // All done
    contractCompleted = contractTotal;
  }

  // Decide preview mode ONLY after onboarding status has loaded,
  // so that login → loading → correct mode (onboarding vs signed) happens once.
  useEffect(() => {
    if (isLoading) return;

    if (hasUnlockedPortal && previewMode !== "signed") {
      setPreviewMode("signed");
    } else if (!hasUnlockedPortal && previewMode !== "onboarding") {
      setPreviewMode("onboarding");
    }
  }, [hasUnlockedPortal, isLoading, previewMode, setPreviewMode]);

  return (
    <>
      <PageMeta
        title="Partner Portal Home | Campus Transfer"
        description="Welcome to the Campus Transfer partner portal."
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : previewMode === "signed" || hasUnlockedPortal ? (
        <SignedDashboardView />
      ) : (
        <div className="min-h-[calc(100vh-4rem)] -mx-4 px-0 py-0 md:-mx-6 md:px-0 lg:-mx-8">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
            {/* Welcome — professional header */}
            <header className="mb-10">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Welcome to Campus Transfer
              </h1>
              <p className="mt-2 max-w-lg text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Complete onboarding and sign your contract to get full access to
                the partner portal.
              </p>
              {/* Progress summary */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="min-w-0 flex-1 rounded-xl border border-gray-200/80 bg-white p-4 card-shadow dark:border-gray-700/80 dark:bg-gray-900/50">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Onboarding
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {onboardingCompleted}
                      <span className="text-lg font-normal text-gray-400 dark:text-gray-500">
                        /{onboardingTotal}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-300"
                      style={{
                        width: `${(onboardingCompleted / onboardingTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-gray-200/80 bg-white p-4 card-shadow dark:border-gray-700/80 dark:bg-gray-900/50">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Contract
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {contractCompleted}
                      <span className="text-lg font-normal text-gray-400 dark:text-gray-500">
                        /{contractTotal}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-gray-400 dark:bg-gray-600 transition-all duration-300"
                      style={{
                        width: `${(contractCompleted / contractTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </header>

            {/* Onboarding Form card */}
            <section className="rounded-2xl border border-gray-200/90 bg-white card-shadow dark:border-gray-700/90 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
                    <svg
                      className="h-5 w-5 text-primary-600 dark:text-primary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      Onboarding Form
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {onboardingCompleted} of {ONBOARDING_STEPS.length} steps
                      completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    as="link"
                    to="/onboarding"
                    variant="primary"
                    size="sm"
                  >
                    Continue
                  </Button>
                  <button
                    type="button"
                    onClick={() => setOnboardingOpen(!onboardingOpen)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    aria-label={onboardingOpen ? "Collapse" : "Expand"}
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${!onboardingOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              {onboardingOpen && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/30">
                  <ul className="space-y-0">
                    {ONBOARDING_STEPS.map((step, index) => {
                      const isCompleted = step.completed;
                      const isActive =
                        !isCompleted && index === onboardingCompleted;
                      // Review Complete step (index 5) shows different states
                      const isReviewRejected =
                        step.id === "review" && isRejected;
                      const isReviewApproved =
                        step.id === "review" &&
                        (isApproved || isContractSignRejected);

                      return (
                        <li
                          key={step.id}
                          className={`flex items-center gap-3 py-3 ${
                            index > 0
                              ? "border-t border-gray-100 dark:border-gray-700/80"
                              : ""
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                              isReviewRejected
                                ? "bg-red-600 text-white"
                                : isReviewApproved
                                  ? "bg-green-600 text-white"
                                  : isCompleted
                                    ? "bg-primary-600 text-white"
                                    : isActive
                                      ? "border border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-400 dark:bg-primary-900/30"
                                      : "border border-gray-200 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                            }`}
                          >
                            {isReviewRejected ? (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : isReviewApproved || isCompleted ? (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </span>
                          <span
                            className={
                              isReviewRejected
                                ? "text-sm font-medium text-red-600 dark:text-red-400"
                                : isReviewApproved
                                  ? "text-sm font-medium text-green-600 dark:text-green-400"
                                  : isCompleted
                                    ? "text-sm font-medium text-gray-900 dark:text-white"
                                    : isActive
                                      ? "text-sm font-medium text-primary-700 dark:text-primary-300"
                                      : "text-sm text-gray-500 dark:text-gray-400"
                            }
                          >
                            {isReviewRejected
                              ? "Rejected"
                              : isReviewApproved
                                ? "Approved"
                                : step.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>

            {/* Contract card */}
            <section
              className={`mt-6 rounded-2xl border bg-white card-shadow dark:bg-gray-900 ${
                canAccessContract
                  ? "border-gray-200/90 dark:border-gray-700/90"
                  : "border-gray-200/50 opacity-60 dark:border-gray-700/50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      canAccessContract
                        ? "bg-primary-50 dark:bg-primary-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        canAccessContract
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      Contract
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {canAccessContract
                        ? `${contractCompleted} of ${contractTotal} steps completed`
                        : "Complete onboarding first"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canAccessContract ? (
                    <Button
                      as="link"
                      to="/contract"
                      variant="primary"
                      size="sm"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Locked
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => setContractOpen(!contractOpen)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    aria-label={contractOpen ? "Collapse" : "Expand"}
                    disabled={!canAccessContract}
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${!contractOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              {contractOpen && canAccessContract && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/30">
                  <ul className="space-y-0">
                    {BASE_CONTRACT_STEPS.map((step, index) => {
                      const isContractRejectedStep =
                        isContractSignRejected && step.id === "complete";
                      const isCompleted =
                        index < contractCompleted && !isContractRejectedStep;
                      const isActive =
                        !isCompleted &&
                        !isContractRejectedStep &&
                        index === contractCompleted;
                      return (
                        <li
                          key={step.id}
                          className={`flex items-center gap-3 py-3 ${
                            index > 0
                              ? "border-t border-gray-100 dark:border-gray-700/80"
                              : ""
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                              isContractRejectedStep
                                ? "bg-red-600 text-white"
                                : isCompleted
                                  ? "bg-primary-600 text-white"
                                  : isActive
                                    ? "border-2 border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-400 dark:bg-primary-900/30"
                                    : "border border-gray-200 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                            }`}
                          >
                            {isContractRejectedStep ? (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : isCompleted ? (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </span>
                          <span
                            className={
                              isContractRejectedStep
                                ? "text-sm font-medium text-red-600 dark:text-red-400"
                                : isCompleted
                                  ? "text-sm font-medium text-gray-900 dark:text-white"
                                  : isActive
                                    ? "text-sm font-semibold text-primary-700 dark:text-primary-300"
                                    : "text-sm text-gray-500 dark:text-gray-400"
                            }
                          >
                            {isContractRejectedStep ? "Rejected" : step.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {isContractSignRejected && contractRejectionReason && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                      Reason: {contractRejectionReason}
                    </div>
                  )}
                </div>
              )}
              {contractOpen && !canAccessContract && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/30">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Complete your onboarding and get approved to access the
                      contract.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
