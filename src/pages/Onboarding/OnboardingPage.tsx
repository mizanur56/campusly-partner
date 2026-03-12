import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFormLayout from "./OnboardingFormLayout";
import {
  ONBOARDING_FORM_STEP_COUNT,
  STEP_TITLES,
  STEP_SUBTITLES,
} from "./onboardingSteps";
import OwnerDetailsStep from "./steps/OwnerDetailsStep";
import DirectorDetailsStep from "./steps/DirectorDetailsStep";
import MainContactDetailsStep from "./steps/MainContactDetailsStep";
import RegularComplianceStep from "./steps/RegularComplianceStep";
import DeclarationStep from "./steps/DeclarationStep";
import SubmittedStep from "./steps/SubmittedStep";
import VerifiedStep from "./steps/VerifiedStep";
import { useGetOnboardingStatusQuery } from "../../redux/features/onboardingForm/onboardingFormApi";

/** Step index: 0-4 = form steps, 5 = submitted, 6 = verified. API steps are 1–5. */
export type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStepIndex>(0);
  const navigate = useNavigate();
  const { data: status } = useGetOnboardingStatusQuery(undefined);

  // Sync UI step with backend onboarding status
  useEffect(() => {
    if (!status) return;

    const backendStep = status.onboardingStep ?? 0;
    const workflowStatus = status.status;

    if (workflowStatus === "ONBOARDING_IN_PROGRESS") {
      // Treat backend step as "completed count" (1–5):
      // - completed = number of finished steps
      // - activeIndex = next step to fill (or last if all done)
      const completed = Math.max(
        0,
        Math.min(ONBOARDING_FORM_STEP_COUNT, backendStep),
      );
      const activeIndex =
        completed >= ONBOARDING_FORM_STEP_COUNT
          ? ONBOARDING_FORM_STEP_COUNT - 1
          : completed;
      setStep(activeIndex as OnboardingStepIndex);
      return;
    }

    if (
      workflowStatus === "AWAITING_CONTRACT_UPLOAD" ||
      workflowStatus === "AWAITING_PARTNER_SIGNATURE" ||
      workflowStatus === "AWAITING_ADMIN_APPROVAL"
    ) {
      // After submit but before final approval → "Under Review" tab
      setStep(5);
      return;
    }

    if (workflowStatus === "ACTIVE") {
      // Fully approved partner
      setStep(6);
      return;
    }

    if (workflowStatus === "REJECTED") {
      // Keep last known step so user can review data
      const safeStep =
        backendStep >= 0 && backendStep <= 4 ? backendStep : 0;
      setStep(safeStep as OnboardingStepIndex);
    }
  }, [status]);

  const title = STEP_TITLES[step] ?? "Onboarding";
  const subtitle =
    STEP_SUBTITLES[step] ||
    status?.statusLabel ||
    STEP_SUBTITLES[step];
  const stepperVariant = step === 5 ? "submitted" : step === 6 ? "verified" : "form";

  const goNext = () => {
    if (step < 4) {
      const next = (step + 1) as OnboardingStepIndex;
      setStep(next);
    }
  };
  const goPrev = () => {
    if (step > 0) {
      const prev = (step - 1) as OnboardingStepIndex;
      setStep(prev);
    }
  };
  const goSubmitted = () => {
    setStep(5);
  };
  const backHome = () => navigate("/");
  const proceedToContract = () => navigate("/");

  return (
    <OnboardingFormLayout
      title={title}
      subtitle={subtitle}
      currentStepIndex={step}
      stepperVariant={stepperVariant}
      onStepChange={(index) => {
        const safeIndex = Math.min(Math.max(index, 0), 4);
        setStep(safeIndex as OnboardingStepIndex);
      }}
    >
      {step === 0 && <OwnerDetailsStep apiStep={1} onNext={goNext} />}
      {step === 1 && <DirectorDetailsStep apiStep={2} onPrev={goPrev} onNext={goNext} />}
      {step === 2 && <MainContactDetailsStep apiStep={3} onPrev={goPrev} onNext={goNext} />}
      {step === 3 && <RegularComplianceStep apiStep={4} onPrev={goPrev} onNext={goNext} />}
      {step === 4 && <DeclarationStep apiStep={5} onPrev={goPrev} onSubmit={goSubmitted} />}
      {step === 5 && <SubmittedStep onBackHome={backHome} />}
      {step === 6 && <VerifiedStep onProceedToContract={proceedToContract} />}
    </OnboardingFormLayout>
  );
}
