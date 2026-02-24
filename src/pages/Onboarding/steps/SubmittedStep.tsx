import { Button } from "../../../components/ui/button";

interface Props {
  onBackHome: () => void;
}

export default function SubmittedStep({ onBackHome }: Props) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-900/30">
        <svg className="h-7 w-7 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <span className="mb-3 inline-block rounded-full bg-warning-100 px-2.5 py-1 text-xs font-medium text-warning-700 dark:bg-warning-900/30 dark:text-warning-400">
        Under Verification
      </span>
      <p className="max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Your information has been received. Our team is reviewing it. You&apos;ll be notified once verification is complete.
      </p>
      <Button type="button" variant="primary" onClick={onBackHome} className="mt-6">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Button>
    </div>
  );
}
