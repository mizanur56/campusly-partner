import { Link } from "react-router-dom";
import OnboardingFormLayout from "./OnboardingFormLayout";

export default function OnboardingVerifiedPage() {
  return (
    <OnboardingFormLayout
      title="Onboarding Form Verified"
      subtitle="Your onboarding information has been reviewed and approved."
      stepperVariant="verified"
    >
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-primary-600"
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
        <p className="text-neutral-500 text-base max-w-md leading-relaxed mb-8">
          Your onboarding information has been reviewed and approved.
        </p>
        <Link to="/contract/signed">
          <button
            type="button"
            className="btn-primary"
          >
            Proceed to contract
          </button>
        </Link>
      </div>
    </OnboardingFormLayout>
  );
}
