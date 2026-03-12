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
import RejectedStep from "./steps/RejectedStep";
import VerifiedStep from "./steps/VerifiedStep";
import {
  useGetOnboardingStatusQuery,
  useResubmitOnboardingMutation,
} from "../../redux/features/onboardingForm/onboardingFormApi";

/** Step index: 0-4 = form steps, 5 = submitted, 6 = verified, 7 = rejected. API steps are 1–5. */
export type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStepIndex>(0);
  const navigate = useNavigate();
  const { data: status, refetch } = useGetOnboardingStatusQuery(undefined);
  const [resubmitOnboarding, { isLoading: isResubmitting }] =
    useResubmitOnboardingMutation();

  // Sync UI step with backend onboarding status
  useEffect(() => {
    if (!status) return;

    const backendStep = status.onboardingStep ?? 0;
    const workflowStatus = status.status;
    const isContractSignRejected =
      status.statusLabel === "Contract sign rejected";

    if (isContractSignRejected) {
      navigate("/contract", { replace: true });
      return;
    }

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
      // Show rejected step with rejection reason and resubmit option
      setStep(7);
      return;
    }
  }, [navigate, status]);

  const handleResubmit = async () => {
    try {
      await resubmitOnboarding().unwrap();
      // Refetch status to update UI to step 0
      await refetch();
    } catch (error) {
      console.error("Resubmit failed:", error);
    }
  };

  const title =
    step === 7 ? "Application Rejected" : (STEP_TITLES[step] ?? "Onboarding");
  const subtitle =
    step === 7
      ? "Your application has been rejected"
      : STEP_SUBTITLES[step] || status?.statusLabel || STEP_SUBTITLES[step];
  const stepperVariant =
    step === 5
      ? "submitted"
      : step === 6
        ? "verified"
        : step === 7
          ? "rejected"
          : "form";

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
      workflowStatus={status?.status}
      onStepChange={(index) => {
        const safeIndex = Math.min(Math.max(index, 0), 4);
        setStep(safeIndex as OnboardingStepIndex);
      }}
    >
      {step === 0 && <OwnerDetailsStep apiStep={1} onNext={goNext} />}
      {step === 1 && (
        <DirectorDetailsStep apiStep={2} onPrev={goPrev} onNext={goNext} />
      )}
      {step === 2 && (
        <MainContactDetailsStep apiStep={3} onPrev={goPrev} onNext={goNext} />
      )}
      {step === 3 && (
        <RegularComplianceStep apiStep={4} onPrev={goPrev} onNext={goNext} />
      )}
      {step === 4 && (
        <DeclarationStep apiStep={5} onPrev={goPrev} onSubmit={goSubmitted} />
      )}
      {step === 5 && (
        <SubmittedStep
          onBackHome={backHome}
          statusLabel={status?.statusLabel}
          workflowStatus={status?.status}
        />
      )}
      {step === 6 && <VerifiedStep onProceedToContract={proceedToContract} />}
      {step === 7 && (
        <RejectedStep
          rejectionReason={status?.rejectionReason}
          onResubmit={handleResubmit}
          isResubmitting={isResubmitting}
          onBackHome={backHome}
        />
      )}
    </OnboardingFormLayout>
  );
}
