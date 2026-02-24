interface Props {
  onProceedToContract: () => void;
}

export default function VerifiedStep({ onProceedToContract }: Props) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
        <svg className="h-12 w-12 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <p className="mb-8 max-w-md text-base leading-relaxed text-neutral-500">
        Your onboarding information has been reviewed and approved.
      </p>
      <button
        type="button"
        onClick={onProceedToContract}
        className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600"
      >
        Proceed to contract
      </button>
    </div>
  );
}
