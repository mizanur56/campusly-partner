import { useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";

const ONBOARDING_STEPS = [
  { id: "owner", label: "Owner Details", completed: true },
  { id: "director", label: "Director Details", completed: true },
  { id: "contact", label: "Main Contact Details", completed: false },
  { id: "compliance", label: "Regular Compliance", completed: false },
  { id: "declaration", label: "Declaration", completed: false },
  { id: "review", label: "Review Complete", completed: false },
];

const CONTRACT_STEPS = [
  { id: "view-sign", label: "View and Sign", completed: false },
  { id: "complete", label: "Complete", completed: false },
];

const Dashboard = () => {
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [contractOpen, setContractOpen] = useState(true);

  const onboardingCompleted = ONBOARDING_STEPS.filter((s) => s.completed).length;
  const contractCompleted = CONTRACT_STEPS.filter((s) => s.completed).length;

  return (
    <>
      <PageMeta
        title="Partner Portal Home | Campus Transfer"
        description="Welcome to the Campus Transfer partner portal."
      />

      <div className="min-h-[calc(100vh-4rem)] -mx-4 px-0 py-0 md:-mx-6 md:px-0 lg:-mx-8">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              Welcome to Campus Transfer
            </h1>
            <p className="mt-1 text-base text-gray-500">
              Complete these two steps to get access to the partner portal.
            </p>
          </div>

          {/* Onboarding Form card */}
          <div className="rounded-2xl border border-gray-200 bg-white  dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Onboarding Form
                </h2>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {onboardingCompleted} of {ONBOARDING_STEPS.length} steps completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/onboarding"
                  className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-base font-medium text-white transition-colors hover:bg-primary-700"
                >
                  Continue
                </Link>
                <button
                  type="button"
                  onClick={() => setOnboardingOpen(!onboardingOpen)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label={onboardingOpen ? "Collapse" : "Expand"}
                >
                  <svg className={`h-4 w-4 transition-transform ${!onboardingOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            {onboardingOpen && (
              <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-700">
                <ul className="space-y-2">
                  {ONBOARDING_STEPS.map((step) => (
                    <li key={step.id} className="flex items-center gap-3 text-base">
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${step.completed ? "bg-primary-600" : "border border-gray-200 bg-white dark:border-gray-600"}`}>
                        {step.completed && <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </span>
                      <span className={step.completed ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>{step.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Contract card */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Contract
                </h2>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {contractCompleted} of {CONTRACT_STEPS.length} steps completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-base font-medium text-white transition-colors hover:bg-primary-700"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => setContractOpen(!contractOpen)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label={contractOpen ? "Collapse" : "Expand"}
                >
                  <svg className={`h-4 w-4 transition-transform ${!contractOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            {contractOpen && (
              <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-700">
                <ul className="space-y-2">
                  {CONTRACT_STEPS.map((step) => (
                    <li key={step.id} className="flex items-center gap-3 text-base">
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${step.completed ? "bg-primary-600" : "border border-gray-200 bg-white dark:border-gray-600"}`}>
                        {step.completed && <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </span>
                      <span className={step.completed ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>{step.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
