import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import OnboardingFormLayout from "./OnboardingFormLayout";

const UPLOAD_ITEMS = [
  { label: "Your ID", key: "yourId" },
  { label: "Business registration certificate", key: "businessCert" },
  { label: "Tax Certificate (Optional)", key: "taxCert" },
];

export default function RegularCompliancePage() {
  return (
    <OnboardingFormLayout
      title="Regular Compliance"
      subtitle="Please upload your ID proof, which will be verified by our legal team"
    >
      <div className="space-y-4">
        <Button type="button" variant="primary" size="sm">
          + Add Qualifications
        </Button>
        <div className="space-y-3">
          {UPLOAD_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-white hover:border-primary-500 transition-colors cursor-pointer group"
            >
              <span className="text-neutral-800 font-medium text-base">
                {item.label}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <Button as="link" to="/onboarding/contact" variant="secondary" size="sm">
            ← Previous
          </Button>
          <Button as="link" to="/onboarding/declaration" variant="primary" size="sm">
            Next →
          </Button>
        </div>
      </div>
    </OnboardingFormLayout>
  );
}
