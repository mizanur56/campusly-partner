import { Button } from "../../../components/ui/button";

interface Props {
  rejectionReason?: string | null;
  onResubmit: () => void;
  isResubmitting: boolean;
  onBackHome: () => void;
}

export default function RejectedStep({
  rejectionReason,
  onResubmit,
  isResubmitting,
  onBackHome,
}: Props) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      {/* Rejection Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-lg dark:from-red-900/40 dark:to-red-800/40">
        <svg
          className="h-10 w-10 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      {/* Status Badge */}
      <span className="mb-4 inline-block rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700 shadow-sm dark:bg-red-900/30 dark:text-red-400">
        Application Rejected
      </span>

      {/* Description */}
      <p className="max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        Unfortunately, your application has been rejected. Please review the
        reason below and resubmit your application with the necessary
        corrections.
      </p>

      {/* Rejection Reason Box */}
      {rejectionReason && (
        <div className="mt-6 w-full max-w-lg rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800/50 dark:bg-red-900/20">
          <h4 className="mb-3 flex items-center justify-center text-sm font-bold uppercase tracking-wide text-red-800 dark:text-red-300">
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Reason for Rejection
          </h4>
          <p className="text-sm leading-relaxed text-red-700 dark:text-red-200">
            {rejectionReason}
          </p>
        </div>
      )}

      {/* Action Buttons - Centered, Stacked */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onResubmit}
          disabled={isResubmitting}
          className="min-w-[200px] rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold shadow-md transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-lg disabled:opacity-60"
        >
          {isResubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Resubmitting...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg
                className="mr-1.5 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Resubmit Application
            </span>
          )}
        </Button>

        <button
          type="button"
          onClick={onBackHome}
          className="text-sm font-medium text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-700 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
