import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { isPartnerPortalUnlocked } from "../lib/partnerPortalAccess";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useGetOnboardingStatusQuery } from "../redux/features/onboardingForm";
import ProfileSettings from "../pages/Settings/ProfileSettings";

/**
 * Partner owners may open profile/settings only after onboarding is ACTIVE and
 * admin has unlocked portal access. Team members are always allowed.
 */
export default function ProfileSettingsRoute() {
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";
  const { data: onboardingStatus, isLoading } = useGetOnboardingStatusQuery();
  const hasUnlockedPortal = isPartnerPortalUnlocked(onboardingStatus);

  if (isTeamMember) {
    return <ProfileSettings />;
  }

  if (isLoading) {
    return null;
  }

  if (!hasUnlockedPortal) {
    return <Navigate to="/onboarding" replace />;
  }

  return <ProfileSettings />;
}
