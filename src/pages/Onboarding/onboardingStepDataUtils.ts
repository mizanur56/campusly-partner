/** Unwrap nested API shape: response.data.data or response.data */
export function getOnboardingStepPayload(
  stepData: unknown,
): Record<string, unknown> | null {
  if (!stepData || typeof stepData !== "object") return null;
  const root = (stepData as { data?: unknown }).data;
  if (!root || typeof root !== "object" || Array.isArray(root)) return null;
  const layer = root as { data?: unknown };
  const inner = layer.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return root as Record<string, unknown>;
}

// export function step1HasPersistedData(
//   payload: Record<string, unknown> | null,
// ): boolean {
//   if (!payload) return false;
//   return String(payload.registeredCompanyName ?? "").trim().length > 0;
// }
export function step1HasPersistedData(
  payload: Record<string, unknown> | null,
): boolean {
  if (!payload) return false;

  const hasCompanyName =
    String(payload.registeredCompanyName ?? "").trim().length > 0;
  const hasRegistrationNumber =
    String(payload.companyRegistrationNumber ?? "").trim().length > 0;
  const hasCountry =
    String(payload.countryOfRegistration ?? "").trim().length > 0;
  const hasMobile =
    String(payload.mobileNumber ?? "").replace(/\D/g, "").length > 0;

  return hasCompanyName && hasRegistrationNumber && hasCountry && hasMobile;
}

export function step2HasPersistedData(
  payload: Record<string, unknown> | null,
): boolean {
  if (!payload) return false;
  const hasFullName = String(payload.fullName ?? "").trim().length > 0;
  const hasEmail = String(payload.email ?? "").trim().length > 0;
  const hasMobile = String(payload.mobileNumber ?? "").replace(/\D/g, "").length > 0;
  return hasFullName && hasEmail && hasMobile;
}

export function step3HasPersistedData(
  payload: Record<string, unknown> | null,
): boolean {
  if (!payload) return false;
  const hasFullName = String(payload.fullName ?? "").trim().length > 0;
  const hasPosition = String(payload.position ?? "").trim().length > 0;
  const hasEmail = String(payload.email ?? "").trim().length > 0;
  const hasTelephone =
    String(payload.telephoneNumber ?? "").replace(/\D/g, "").length > 0;
  return hasFullName && hasPosition && hasEmail && hasTelephone;
}

export function step4HasPersistedData(
  payload: Record<string, unknown> | null,
): boolean {
  if (!payload) return false;
  const id = String(payload.yourId ?? "").trim();
  const brc = String(payload.businessRegistrationCertificate ?? "").trim();
  return id.length > 0 && brc.length > 0;
}

export function step5HasPersistedData(
  payload: Record<string, unknown> | null,
): boolean {
  if (!payload) return false;
  return Boolean(
    payload.verifyInformation &&
      payload.agreePrivacyPolicy &&
      payload.agreeCommunicationUpdates,
  );
}
