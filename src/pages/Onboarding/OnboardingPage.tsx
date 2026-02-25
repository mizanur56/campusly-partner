import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFormLayout from "./OnboardingFormLayout";
import { STEP_TITLES, STEP_SUBTITLES } from "./onboardingSteps";
import OwnerDetailsStep from "./steps/OwnerDetailsStep";
import DirectorDetailsStep from "./steps/DirectorDetailsStep";
import MainContactDetailsStep from "./steps/MainContactDetailsStep";
import RegularComplianceStep from "./steps/RegularComplianceStep";
import DeclarationStep from "./steps/DeclarationStep";
import SubmittedStep from "./steps/SubmittedStep";
import VerifiedStep from "./steps/VerifiedStep";

/** Step index: 0-4 = form steps, 5 = submitted, 6 = verified */
export type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStepIndex>(0);
  const navigate = useNavigate();

  const title = STEP_TITLES[step] ?? "Onboarding";
  const subtitle = STEP_SUBTITLES[step];
  const stepperVariant = step === 5 ? "submitted" : step === 6 ? "verified" : "form";

  const goNext = () => {
    if (step < 4) setStep((s) => (s + 1) as OnboardingStepIndex);
  };
  const goPrev = () => {
    if (step > 0) setStep((s) => (s - 1) as OnboardingStepIndex);
  };
  const goSubmitted = () => setStep(5);
  const goVerified = () => setStep(6);
  const backHome = () => navigate("/");
  const proceedToContract = () => navigate("/");

  return (
    <OnboardingFormLayout
      title={title}
      subtitle={subtitle}
      currentStepIndex={step}
      stepperVariant={stepperVariant}
    >
      {step === 0 && <OwnerDetailsStep onNext={goNext} />}
      {step === 1 && <DirectorDetailsStep onPrev={goPrev} onNext={goNext} />}
      {step === 2 && <MainContactDetailsStep onPrev={goPrev} onNext={goNext} />}
      {step === 3 && <RegularComplianceStep onPrev={goPrev} onNext={goNext} />}
      {step === 4 && <DeclarationStep onPrev={goPrev} onSubmit={goSubmitted} />}
      {step === 5 && <SubmittedStep onBackHome={backHome} />}
      {step === 6 && <VerifiedStep onProceedToContract={proceedToContract} />}
    </OnboardingFormLayout>
  );
}
