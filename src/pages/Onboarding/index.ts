/**
 * Onboarding – single entry for copy-paste to other projects.
 * Export everything from this folder so you can:
 * - Copy the whole `Onboarding` folder elsewhere and improve design
 * - Import from one place: e.g. import { OnboardingPage } from "@/pages/Onboarding"
 */

export { default as OnboardingPage } from "./OnboardingPage";
export { default as OnboardingFormLayout } from "./OnboardingFormLayout";
export { default as OnboardingStepper } from "./OnboardingStepper";
export * from "./onboardingSteps";
export { FormInput, PhoneInput, phoneInputStyle, phoneButtonStyle } from "./sharedFormProps";

export { default as OwnerDetailsStep } from "./steps/OwnerDetailsStep";
export { default as DirectorDetailsStep } from "./steps/DirectorDetailsStep";
export { default as MainContactDetailsStep } from "./steps/MainContactDetailsStep";
export { default as RegularComplianceStep } from "./steps/RegularComplianceStep";
export { default as DeclarationStep } from "./steps/DeclarationStep";
export { default as SubmittedStep } from "./steps/SubmittedStep";
export { default as VerifiedStep } from "./steps/VerifiedStep";
