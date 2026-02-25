/** Step index: 0-4 = form steps, 5 = submitted, 6 = verified */
export const ONBOARDING_FORM_STEP_COUNT = 5;

export const STEP_LIST_FOR_STEPPER = [
  { path: "/onboarding/owner", label: "Owner Details" },
  { path: "/onboarding/director", label: "Director Details" },
  { path: "/onboarding/contact", label: "Main Contact Details" },
  { path: "/onboarding/compliance", label: "Regular Compliance" },
  { path: "/onboarding/declaration", label: "Declaration" },
  { path: null, label: "Under Review" },
];

export const STEP_TITLES: Record<number, string> = {
  0: "Owner Details",
  1: "Directors Details",
  2: "Main Contact Details",
  3: "Regular Compliance",
  4: "Declaration",
  5: "Onboarding Form Submitted",
  6: "Onboarding Form Verified",
};

export const STEP_SUBTITLES: Record<number, string> = {
  0: "Enter essential business information to get started.",
  1: "Enter essential director information to get started.",
  2: "Enter essential director information to get started.",
  3: "Please upload your ID proof, which will be verified by our legal team",
  4: "",
  5: "",
  6: "Your onboarding information has been reviewed and approved.",
};
