import { Check, PartyPopper } from "lucide-react";
import { FaCircleXmark } from "react-icons/fa6";

export type JourneyStep = {
  id: string;
  name: string;
  isCompleted: boolean;
};

type ApplicationProgressPanelProps = {
  steps: JourneyStep[];
  isRejected?: boolean;
  rejectionReason?: string;
};

const ApplicationProgressPanel = ({
  steps,
  isRejected = false,
  rejectionReason,
}: ApplicationProgressPanelProps) => {
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent =
    steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const firstIncompleteIndex = steps.findIndex((s) => !s.isCompleted);
  const currentIndex =
    firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex;

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-neutral-900">
        Application Progress
      </h3>

      <div className="relative mt-6">
        <div
          className={`absolute left-[20px] top-3 bottom-3 w-0.5 ${
            isRejected ? "bg-red-200" : "bg-neutral-200"
          }`}
        />

        <div className="space-y-1">
          {isRejected && (
            <div className="relative z-10 mb-4 flex items-start gap-3 rounded-md border border-red-100 bg-red-50 p-3">
              <FaCircleXmark className="mt-0.5 shrink-0 text-red-500" size={18} />
              <div>
                <p className="text-xs font-semibold text-red-700">
                  Application Rejected
                </p>
                {rejectionReason && (
                  <p className="mt-1 text-xs leading-relaxed text-red-600">
                    {rejectionReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {steps.map((step, index) => {
            const isCurrent = index === currentIndex && !step.isCompleted;
            const isUpcoming = !step.isCompleted && index > currentIndex;

            return (
              <div
                key={step.id}
                className={`relative z-10 flex items-center justify-between gap-3 rounded-md px-2 py-3 transition ${
                  isCurrent ? "bg-primary-50" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative z-20 shrink-0 bg-white">
                    {step.isCompleted ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-600 bg-primary-50 text-xs font-bold text-primary-600 shadow-sm">
                        {index + 1}
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-400">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <span
                    className={`truncate text-sm font-medium ${
                      step.isCompleted
                        ? "text-neutral-700"
                        : isCurrent
                          ? "text-neutral-900"
                          : "text-neutral-400"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>

                <span
                  className={`shrink-0 text-[11px] font-semibold ${
                    step.isCompleted
                      ? "text-emerald-600"
                      : isCurrent
                        ? "text-primary-600"
                        : isUpcoming
                          ? "text-neutral-400"
                          : "text-neutral-400"
                  }`}
                >
                  {step.isCompleted
                    ? "Completed"
                    : isCurrent
                      ? "Current Stage"
                      : "Upcoming"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-md border border-neutral-100 bg-neutral-50/80 p-4">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <PartyPopper size={16} className="text-primary-600" />
          <span>
            <span className="font-semibold text-neutral-900">{completedCount}</span>{" "}
            of <span className="font-semibold text-neutral-900">{steps.length}</span>{" "}
            steps completed
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-neutral-600">
            {progressPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApplicationProgressPanel;
