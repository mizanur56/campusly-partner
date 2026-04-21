import { Button } from "../../../components/ui/button";
import { FaCheckCircle } from "react-icons/fa";

interface Props {
  onBackHome: () => void;
  workflowStatus?: string;
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function SubmittedStep({ onBackHome, workflowStatus }: Props) {
  const isApproved =
    workflowStatus === "AWAITING_PARTNER_SIGNATURE" ||
    workflowStatus === "AWAITING_ADMIN_APPROVAL";

  const verificationDescription =
    "Your information has been received. Our team is currently reviewing it. You'll be notified once verification is complete.";
  const approvedDescription =
    "Your application has been approved! Please proceed to review and sign your contract.";

  return (
    <div className="flex flex-col items-center px-2 py-6 text-center sm:py-10">
      {/* Large hero icon */}
      <div className="mb-6">
        {isApproved ? (
          <div className="flex h-36 w-36 items-center justify-center">
            <FaCheckCircle
              aria-hidden
              className="h-full w-full text-green-600 "
            />
          </div>
        ) : (
          <img
            src="/clock-line.png"
            alt="Pending verification"
            width={128}
            height={128}
            className="h-28 w-28 object-contain sm:h-32 sm:w-32"
            decoding="async"
          />
        )}
      </div>


      {
        isApproved ? (
          <h2 className="mb-6 max-w-lg text-2xl font-bold tracking-tight text-[#20242A] dark:text-white sm:mb-8 sm:text-3xl">
            Onboarding Form Verified
          </h2>
        ) : (
          <h2 className="mb-6 max-w-lg text-2xl font-bold tracking-tight text-[#20242A] dark:text-white sm:mb-8 sm:text-3xl">
            Onboarding Form Submitted
          </h2>
        )
      }


      {/* Status pill with inline icon */}
      {!isApproved && (
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#FFF4E5] px-4 py-2 text-sm font-semibold text-[#FFA500] dark:bg-amber-950/40 dark:text-amber-400 sm:mb-8">
          <ClockIcon className="h-4 w-4 shrink-0" />
          Under Verification
        </span>
      )}

      <p className="max-w-xl text-base leading-relaxed text-[#6B7280] dark:text-neutral-400">
        {isApproved ? approvedDescription : verificationDescription}
      </p>

     <div className="mt-6">
     {
        isApproved ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onBackHome}
          >
            Proceed to contract
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onBackHome}
          >
            Back to Home
          </Button>
        )
      }
     </div>


    </div>
  );
}
