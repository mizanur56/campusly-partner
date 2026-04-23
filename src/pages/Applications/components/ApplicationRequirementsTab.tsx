import { AdmissionStep } from "../ApplicationStep/Admission";
import { ApplyStep } from "../ApplicationStep/Apply";
import { ChecklistUploadStep } from "../ApplicationStep/ChecklistUpload";
import { FinalLetterStep } from "../ApplicationStep/FinalLetter";
import { EmbassySubmissionStep } from "../ApplicationStep/EmbassySubmission";
import { VisaOutcomeStep } from "../ApplicationStep/VisaOutcome";
import { EnrollStep } from "../ApplicationStep/Enroll";

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
        autoOpen={firstIncompleteId === "admission"}
      />
      <ApplyStep
        applicationApiData={applicationApiData}
        steps={steps}
        embedded
        autoOpen={firstIncompleteId === "apply"}
      />
      <ChecklistUploadStep
        applicationApiData={applicationApiData}
        embedded
        autoOpen={firstIncompleteId === "checklist"}
      />
      <FinalLetterStep
        applicationApiData={applicationApiData}
        embedded
        autoOpen={firstIncompleteId === "final-letter"}
      />
      <EmbassySubmissionStep
        applicationApiData={applicationApiData}
        embedded
        autoOpen={firstIncompleteId === "embassy"}
      />
      <VisaOutcomeStep
        applicationApiData={applicationApiData}
        embedded
        autoOpen={firstIncompleteId === "visa"}
      />
      <EnrollStep
        applicationApiData={applicationApiData}
        embedded
        autoOpen={firstIncompleteId === "enroll"}
      />
    </div>
  );
}

