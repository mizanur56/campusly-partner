import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LuClock4 } from "react-icons/lu";
import { Button } from "../../components/ui/button";
import {
  useGetOnboardingStatusQuery,
  useUnlockPortalAccessMutation,
} from "../../redux/features/onboardingForm/onboardingFormApi";
import { usePreviewMode } from "../../context/PreviewModeContext";

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
          <div className="rounded-[16px] border border-[#C7CACF] bg-white p-5 card-shadow dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-24">
            <h2 className="text-[20px] font-semibold text-[#20242A] dark:text-gray-200">
              Contract
            </h2>

            <div className="relative mt-6">
              {/* Single continuous vertical rail */}
              <div
                aria-hidden
                className="absolute left-[11px] top-[14px] h-[92px] w-[2px] rounded-full bg-gray-300 dark:bg-gray-700"
              />
              <div
                aria-hidden
                className="absolute left-[11px] top-[14px] h-[46px] w-[2px] rounded-full bg-[#16A34A]"
              />

              <ul className="space-y-8">
                {/* Step 1 */}
                <li className="flex gap-4">
                  <div className="relative z-[2] flex w-6 justify-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A] text-white">
                      <svg
                        className="h-4 w-4"
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
                    </span>
                  </div>
                  <div className="pt-0.5">
                    <span className="text-[18px] font-medium text-gray-600 dark:text-gray-300">
                      View and sign
                    </span>
                  </div>
                </li>

                {/* Step 2 */}
                <li className="flex gap-4">
                  <div className="relative z-[2] flex w-6 justify-center">
                    {isActive ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A] text-white">
                        <svg
                          className="h-4 w-4"
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
                      </span>
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-gray-900">
                        <LuClock4
                          aria-hidden
                          className="h-6 w-6 text-[#FFA500]"
                        />
                      </span>
                    )}
                  </div>
                  <div className="pt-0.5">
                    <span
                      className={`text-[18px] font-medium ${
                        isActive
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-[#FFA500] dark:text-amber-300"
                      }`}
                    >
                      {isActive ? "Approved" : "Under Review"}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
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
