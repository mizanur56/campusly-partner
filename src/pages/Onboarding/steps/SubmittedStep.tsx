import { Button } from "../../../components/ui/button";

interface Props {
  onBackHome: () => void;
  statusLabel?: string;
  workflowStatus?: string;
}

export default function SubmittedStep({
  onBackHome,
  statusLabel,
  workflowStatus,
}: Props) {
  // Show "Approved" when contract is uploaded (AWAITING_PARTNER_SIGNATURE or AWAITING_ADMIN_APPROVAL)
  const isApproved =
    workflowStatus === "AWAITING_PARTNER_SIGNATURE" ||
    workflowStatus === "AWAITING_ADMIN_APPROVAL";

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
          isApproved
            ? "bg-green-100 dark:bg-green-900/30"
            : "bg-warning-100 dark:bg-warning-900/30"
        }`}
      >
        {isApproved ? (
          <svg
            className="h-7 w-7 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="h-7 w-7 text-warning-600"
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
        )}
      </div>
      <span
        className={`mb-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
          isApproved
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
        }`}
      >
        {isApproved ? "Approved" : "Under Verification"}
      </span>
      <p className="max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {statusLabel ||
          (isApproved
            ? "Your application has been approved! Please proceed to review and sign your contract."
            : "Your information has been received. Our team is reviewing it. You'll be notified once verification is complete.")}
      </p>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onBackHome}
        className="mt-6"
      >
        <svg
          className="h-4 w-4"
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
      </Button>
    </div>
  );
}
