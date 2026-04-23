import { FaSquarePlus } from "react-icons/fa6";
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
        <div className="flex w-full flex-row justify-end">
          <Button type="button" variant="primary" size="sm">
            + Add Qualifications
          </Button>
        </div>
        <div className="space-y-3">
          {UPLOAD_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-white hover:border-primary-500 transition-colors cursor-pointer group"
            >
              <span className="text-neutral-800 font-medium text-base">
                {item.label}
              </span>
              <FaSquarePlus
                className="h-8 w-8 shrink-0 rounded-full text-primary-600 p-1.5 transition-colors group-hover:text-primary-700"
                aria-hidden
              />
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
