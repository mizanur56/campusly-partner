import { Link } from "react-router-dom";
import OnboardingFormLayout from "./OnboardingFormLayout";

export default function OnboardingSubmittedPage() {
  return (
    <OnboardingFormLayout
      title="Onboarding Form Submitted"
      stepperVariant="submitted"
    >
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-20 h-20 rounded-full bg-warning-100 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-warning-600"
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
        <span className="inline-block px-3 py-1 rounded-full bg-warning-100 text-warning-700 text-base font-medium mb-4">
          Under Verification
        </span>
        <p className="text-neutral-500 text-base max-w-md leading-relaxed">
          Your information has been received. Our team is currently reviewing
          it. You&apos;ll be notified once verification is complete.
        </p>
        <Link to="/" className="mt-8">
          <button
            type="button"
            className="btn-primary"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </Link>
      </div>
    </OnboardingFormLayout>
  );
}
