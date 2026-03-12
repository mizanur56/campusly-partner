import { Button } from "../../../components/ui/button";
import { toast } from "react-toastify";
import { usePatchStep4Mutation } from "../../../redux/features/onboardingForm/onboardingFormApi";
import type { Step4Payload } from "../../../redux/features/onboardingForm/onboardingFormApi";

const UPLOAD_ITEMS = [
  { label: "Your ID", key: "yourId" },
  { label: "Business registration certificate", key: "businessRegistrationCertificate" },
  { label: "Tax Certificate (Optional)", key: "taxCertificate" },
];

interface Props {
  apiStep: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function RegularComplianceStep({ apiStep, onPrev, onNext }: Props) {
  const [patchStep4, { isLoading: isSaving }] = usePatchStep4Mutation();

  const handleNext = async () => {
    try {
      await patchStep4({} as Step4Payload).unwrap();
      onNext();
    } catch (err: any) {
      const raw =
        err?.data?.message || (typeof err?.error === "string" ? err.error : "") || "";
      const message = String(raw);

      if (message.toLowerCase().includes("onboarding form already submitted")) {
        toast.info("Your onboarding form is already submitted.");
        return;
      }

      if (message) {
        toast.error(message);
      } else {
        toast.error("Failed to save compliance documents. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <Button type="button" variant="primary" size="sm">
        + Add Qualifications
      </Button>
      <div className="space-y-2">
        {UPLOAD_ITEMS.map((item) => (
          <div
            key={item.key}
            className="group flex cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white p-3 transition-colors hover:border-primary-500 dark:border-neutral-700 dark:bg-neutral-800/50"
          >
            <span className="text-sm font-normal text-neutral-800 dark:text-neutral-200">{item.label}</span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500 transition-colors group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-neutral-700 dark:group-hover:bg-primary-900/30">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-neutral-800">
        <Button type="button" variant="secondary" size="sm" onClick={onPrev}>
          ← Previous
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={handleNext} disabled={isSaving}>
          {isSaving ? "Saving…" : "Next →"}
        </Button>
      </div>
    </div>
  );
}
