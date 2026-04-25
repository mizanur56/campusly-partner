import type { OnboardingStatusResponse } from "../redux/features/onboardingForm/onboardingFormApi";

/** Same rule as Sidebar: full portal only after ACTIVE + admin unlock. */
export function isPartnerPortalUnlocked(
  status: OnboardingStatusResponse | undefined,
): boolean {
  return status?.status === "ACTIVE" && !!status?.portalAccessUnlocked;
}

/**
 * Routes a partner owner may use before portal unlock (onboarding, contract, home).
 * All other URLs should redirect — blocks deep links like /applications.
 */
export function isPathAllowedBeforePartnerPortalUnlock(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/") return true;
  if (p.startsWith("/onboarding")) return true;
  if (p.startsWith("/contract")) return true;
  if (p === "/change-password") return true;
  return false;
}
