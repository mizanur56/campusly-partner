import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useGetOnboardingStatusQuery } from "../../redux/features/onboardingForm/onboardingFormApi";

export default function ContractSignedPage() {
  const navigate = useNavigate();
  const { data: onboardingStatus } = useGetOnboardingStatusQuery();

  useEffect(() => {
    if (
      onboardingStatus?.status === "AWAITING_PARTNER_SIGNATURE" ||
      (onboardingStatus?.status === "REJECTED" &&
        onboardingStatus?.statusLabel === "Contract sign rejected")
    ) {
      navigate("/contract", { replace: true });
    }
  }, [navigate, onboardingStatus?.status, onboardingStatus?.statusLabel]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 px-4 py-8 dark:bg-gray-950/30 md:px-6 md:py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center">
        <div className="mb-8 rounded-[24px] border border-neutral-100 bg-white px-8 py-10 card-shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning-50 text-warning-500 dark:bg-warning-900/20">
            <svg
              className="h-10 w-10"
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
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Contract Signed – Awaiting Final Approval
          </h1>
          <div className="mt-3 flex items-center justify-center">
            <span className="inline-flex items-center rounded-full bg-warning-50 px-3 py-1 text-xs font-medium text-warning-700 dark:bg-warning-900/20 dark:text-warning-400">
              Under final review
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Your contract has been successfully signed. Our team is now reviewing
            the details for final partnership activation. You&apos;ll receive an
            email once your dashboard access is approved.
          </p>
          <div className="mt-6 flex justify-center">
            <Button as="link" to="/" variant="primary" size="sm" className="font-normal">
              ← Back to home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

