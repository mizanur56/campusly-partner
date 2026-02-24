import { Button } from "../../../components/ui/button";

interface Props {
  onProceedToContract: () => void;
}

export default function VerifiedStep({ onProceedToContract }: Props) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
        <svg className="h-7 w-7 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Your onboarding has been reviewed and approved.
      </p>
      <Button type="button" variant="primary" onClick={onProceedToContract}>
        Proceed to contract
      </Button>
    </div>
  );
}
