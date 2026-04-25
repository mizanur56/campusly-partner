import { AdmissionStep } from "../ApplicationStep/Admission";
import { ApplyStep } from "../ApplicationStep/Apply";
import { ChecklistUploadStep } from "../ApplicationStep/ChecklistUpload";
import { FinalLetterStep } from "../ApplicationStep/FinalLetter";
import { EmbassySubmissionStep } from "../ApplicationStep/EmbassySubmission";
import { VisaOutcomeStep } from "../ApplicationStep/VisaOutcome";
import { EnrollStep } from "../ApplicationStep/Enroll";

/** Previous journey step must be completed before this stage can expand (embedded tab). */
function isStageUnlocked(
  steps: Array<{ id: string; isCompleted: boolean }>,
  stepId: string,
) {
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx <= 0) return true;
  return Boolean(steps[idx - 1]?.isCompleted);
}

export default function ApplicationRequirementsTab({
  applicationApiData,
  steps,
}: {
  applicationApiData: any;
  steps: Array<{ id: string; isCompleted: boolean }>;
}) {
  const firstIncompleteId = steps.find((s) => !s.isCompleted)?.id ?? null;

  return (
    <div className="space-y-6">
      <AdmissionStep
        applicationApiData={applicationApiData}
        steps={steps}
        embedded
        stageUnlocked={isStageUnlocked(steps, "admission")}
        autoOpen={firstIncompleteId === "admission"}
      />
      <ApplyStep
        applicationApiData={applicationApiData}
        steps={steps}
        embedded
        stageUnlocked={isStageUnlocked(steps, "apply")}
        autoOpen={firstIncompleteId === "apply"}
      />
      <ChecklistUploadStep
        applicationApiData={applicationApiData}
        embedded
        stageUnlocked={isStageUnlocked(steps, "checklist")}
        autoOpen={firstIncompleteId === "checklist"}
      />
      <FinalLetterStep
        applicationApiData={applicationApiData}
        embedded
        stageUnlocked={isStageUnlocked(steps, "final-letter")}
        autoOpen={firstIncompleteId === "final-letter"}
      />
      <EmbassySubmissionStep
        applicationApiData={applicationApiData}
        embedded
        stageUnlocked={isStageUnlocked(steps, "embassy")}
        autoOpen={firstIncompleteId === "embassy"}
      />
      <VisaOutcomeStep
        applicationApiData={applicationApiData}
        embedded
        stageUnlocked={isStageUnlocked(steps, "visa")}
        autoOpen={firstIncompleteId === "visa"}
      />
      <EnrollStep
        applicationApiData={applicationApiData}
        embedded
        stageUnlocked={isStageUnlocked(steps, "enroll")}
        autoOpen={firstIncompleteId === "enroll"}
      />
    </div>
  );
}

