import { ArrowRight, BellRing } from "lucide-react";

type ApplicationNextStepBannerProps = {
  stepName: string;
  stepDescription: string;
  onContinue: () => void;
  hidden?: boolean;
};

const ApplicationNextStepBanner = ({
  stepName,
  stepDescription,
  onContinue,
  hidden = false,
}: ApplicationNextStepBannerProps) => {
  if (hidden) return null;

  return (
    <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/60 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <BellRing size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900">
              Your Next Step
            </p>
            <p className="mt-0.5 text-sm text-neutral-600">
              <span className="font-medium text-neutral-800">{stepName}</span>
              {" — "}
              {stepDescription}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:w-auto"
        >
          Continue Current Stage
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ApplicationNextStepBanner;
