/**
 * Partner student profile: same gate as Apply Now tab in StudentProfile —
 * background (cv + SOP) and upload-documents fields complete.
 */
export function isPartnerStudentProfileApplyNowUnlocked(
  profile: unknown,
): boolean {
  const p = profile as Record<string, unknown> | null | undefined;
  if (!p) return false;
  const backgroundCompleted = Boolean(p.cv && p.statementOfPurpose);
  const documentsCompleted = Boolean(
    p.imageId && p.passportNo && p.cv && p.statementOfPurpose,
  );
  return backgroundCompleted && documentsCompleted;
}

/**
 * Full profile completion for partner flows (matches StudentProfile tab completion:
 * general, education, background, upload documents).
 */
export function isPartnerStudentProfileComplete(profile: unknown): boolean {
  const p = profile as Record<string, unknown> | null | undefined;
  if (!p) return false;
  const u = p.user as Record<string, unknown> | undefined;
  const generalCompleted = Boolean(
    (p.firstName || u?.name) &&
      (p.email || u?.email) &&
      p.phone &&
      p.lastEducationId &&
      p.lastEducationPassingYear,
  );
  const educations = p.educations as unknown[] | undefined;
  const educationCompleted = Array.isArray(educations) && educations.length > 0;
  const backgroundCompleted = Boolean(p.cv && p.statementOfPurpose);
  const documentsCompleted = Boolean(
    p.imageId && p.passportNo && p.cv && p.statementOfPurpose,
  );
  return (
    generalCompleted &&
    educationCompleted &&
    backgroundCompleted &&
    documentsCompleted
  );
}
