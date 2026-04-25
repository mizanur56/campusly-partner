import type {
  PartnerDashboardResponse,
  PartnerProfileResponse,
} from "../redux/features/profile/partnerProfileApi";

/** Staff User id (cuid) for POST /chat/conversations — prefer `advisor.userId`, then support panel. */
export function resolveStaffUserIdForChat(
  profile: PartnerProfileResponse | undefined,
  dashboard: PartnerDashboardResponse | undefined,
): string | null {
  const advisor = profile?.advisor;
  if (advisor) {
    if (advisor.userId) return advisor.userId;
    if (advisor.id) return advisor.id;
  }
  const first = dashboard?.supportPanel?.[0];
  if (first) {
    if (first.userId) return first.userId;
    if (first.id) return first.id;
  }
  return null;
}
