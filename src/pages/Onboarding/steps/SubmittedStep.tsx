import { Link } from "react-router-dom";

interface Props {
  onBackHome: () => void;
}

export default function SubmittedStep({ onBackHome }: Props) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning-100">
        <svg
          className="h-10 w-10 text-warning-600"
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
      <span className="mb-4 inline-block rounded-full bg-warning-100 px-3 py-1 text-base font-medium text-warning-700">
        Under Verification
      </span>
      <p className="max-w-md text-base leading-relaxed text-neutral-500">
        Your information has been received. Our team is currently reviewing it. You&apos;ll be notified once
        verification is complete.
      </p>
      <button
        type="button"
        onClick={onBackHome}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>
    </div>
  );
}
