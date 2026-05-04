import { useEffect } from "react";
import { LuClock4 } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { usePreviewMode } from "../../context/PreviewModeContext";
import {
  useGetOnboardingStatusQuery,
  useUnlockPortalAccessMutation,
} from "../../redux/features/onboardingForm/onboardingFormApi";

export default function ContractSignedPage() {
  const navigate = useNavigate();
  const { data: onboardingStatus } = useGetOnboardingStatusQuery();
  const [unlockPortalAccess, { isLoading: isUnlocking }] =
    useUnlockPortalAccessMutation();
  const { setPreviewMode } = usePreviewMode();

  useEffect(() => {
    if (
      onboardingStatus?.status === "AWAITING_PARTNER_SIGNATURE" ||
      onboardingStatus?.statusLabel === "Contract sign rejected"
    ) {
      navigate("/contract", { replace: true });
    }
  }, [navigate, onboardingStatus?.status, onboardingStatus?.statusLabel]);

  const status = onboardingStatus?.status;
  const isAwaitingFinalApproval = status === "AWAITING_ADMIN_APPROVAL";
  const isActive = status === "ACTIVE";
  const hasUnlockedPortal = !!onboardingStatus?.portalAccessUnlocked;

  const handleUnlockPortal = async () => {
    try {
      await unlockPortalAccess().unwrap();
      setPreviewMode("signed");
      navigate("/", { replace: true });
    } catch {
      // Silently fail; user can retry
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 py-2 dark:bg-gray-950/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 lg:flex-row lg:gap-10 md:px-6 md:py-10">
        {/* Left: Contract progress card */}
        <aside className="w-full shrink-0 lg:w-56 xl:w-64">
          <div className="rounded-[16px] border border-primary-border bg-white p-5 card-shadow dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-24">
            <h2 className="text-[20px] font-semibold text-[#20242A] dark:text-gray-200">
              Contract
            </h2>

            <nav className="relative mt-6" aria-label="Contract steps">
              <ol className="flex list-none flex-col p-0">
                {/* Step 1 */}
                <li className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className="relative z-[2] flex h-4 w-4 shrink-0 items-center justify-center">
                      <div className="flex items-center justify-center rounded-full bg-white dark:bg-gray-900">
                        <span
                          className="flex h-5 w-5 min-h-4 min-w-4 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                          style={{ backgroundColor: "#22C55E" }}
                          aria-hidden
                        >
                          <svg
                            className="h-2.5 w-2.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <span className="min-w-0 flex-1 text-[16px] leading-5 text-slate-600 dark:text-slate-400">
                      View and sign
                    </span>
                  </div>

                  {/* Connector (same structure as onboarding stepper) */}
                  <div className="flex w-4 shrink-0 justify-center">
                    <div
                      className="relative z-0 h-24 w-[2px] shrink-0 rounded-none -mt-2 -mb-2 sm:h-20"
                      style={{ backgroundColor: "#22C55E" }}
                      aria-hidden
                    />
                  </div>
                </li>

                {/* Step 2 */}
                <li className="flex flex-col">
                  <div className="flex items-center gap-1.5 -mt-2 sm:-mt-2.5">
                    <div className="relative z-[2] flex h-4 w-4 shrink-0 items-center justify-center">
                      <div className="flex items-center justify-center rounded-full bg-white dark:bg-gray-900">
                        {isActive ? (
                          <span
                            className="flex h-5 w-5 min-h-4 min-w-4 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                            style={{ backgroundColor: "#22C55E" }}
                            aria-hidden
                          >
                            <svg
                              className="h-2.5 w-2.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span
                            className="flex h-4 w-4 min-h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900"
                            aria-hidden
                          >
                            <LuClock4
                              aria-hidden
                              className="h-5 w-5 shrink-0 text-[#FFA500]"
                            />
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`min-w-0 flex-1 text-[16px] leading-5 ${
                        isActive
                          ? "text-slate-600 dark:text-slate-400"
                          : "text-[#FFA500] dark:text-amber-300"
                      }`}
                    >
                      {isActive ? "Approved" : "Under Review"}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </aside>

        {/* Right: Signed / awaiting approval content */}
        <main className="min-w-0 flex-1">
          <div className="overflow-hidden ">
            <div className="px-6 py-10 text-center sm:px-10 sm:py-14">
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-white sm:h-32 sm:w-32">
                {isActive ? (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 sm:h-32 sm:w-32">
                    <svg
                      className="h-16 w-16 text-emerald-600 sm:h-[4.5rem] sm:w-[4.5rem]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : (
                  <img
                    src="/clock-line.png"
                    alt="Under final review"
                    width={128}
                    height={128}
                    className="h-28 w-28 object-contain sm:h-32 sm:w-32"
                    decoding="async"
                  />
                )}
              </div>

              <h1 className="text-xl font-semibold text-[#20242A] dark:text-white sm:text-2xl">
                {isActive
                  ? "Contract Approved – Partnership Active"
                  : "Contract Signed – Awaiting Final Approval"}
              </h1>

              {!isActive && (
                <div className="mt-4 flex items-center justify-center">
                  <span className="inline-flex items-center rounded-full bg-[#FFF4E6] px-3 py-1 text-xs font-medium text-[#E88400] dark:bg-amber-950/25 dark:text-amber-300">
                    Under Final Review
                  </span>
                </div>
              )}

              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {isActive
                  ? "Your contract has been approved and your partner account is now active. Click below to unlock full access to all partner features."
                  : "Your contract has been successfully signed. Our team is now reviewing the details for final partnership activation. You'll receive an email once your dashboard access is approved."}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {isActive && !hasUnlockedPortal && (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="font-normal"
                    onClick={handleUnlockPortal}
                    disabled={isUnlocking}
                  >
                    {isUnlocking
                      ? "Enabling access..."
                      : "Get access to all features"}
                  </Button>
                )}

                <Button as="link" to="/" variant="primary" size="md">
                  Back to home
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
