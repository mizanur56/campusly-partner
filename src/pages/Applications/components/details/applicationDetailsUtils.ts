const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  APPLY: {
    label: "Active Application",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REVIEW: {
    label: "Under Review",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  PENDING_TRAVEL_LETTER: {
    label: "Pending Travel Letter",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  PENDING_OFFER_LETTER: {
    label: "Pending Offer Letter",
    className: "border-pink-200 bg-pink-50 text-pink-700",
  },
  SUCCESS: {
    label: "Enrolled",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  VISA_APPROVED: {
    label: "Visa Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  VISA_REJECTED: {
    label: "Visa Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const humanizeStatus = (status?: string) => {
  if (!status) return "Active Application";
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export const getApplicationStatusStyle = (status?: string) => {
  if (!status) {
    return {
      label: "Active Application",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }
  return (
    STATUS_STYLES[status] ?? {
      label: humanizeStatus(status),
      className: "border-neutral-200 bg-neutral-50 text-neutral-700",
    }
  );
};

export const STEP_DESCRIPTIONS: Record<string, string> = {
  admission:
    "Upload admission documents and complete your profile requirements.",
  apply: "Review application details, pay fees, and submit to the institution.",
  checklist:
    "Upload visa checklist documents including bank statements and sponsor letters.",
  "final-letter": "Upload your acceptance letter and payment receipts.",
  embassy: "Submit embassy appointment details and travel documents.",
  visa: "Upload your visa outcome documents.",
  enroll: "Complete enrollment and confirm your place at the institution.",
};

export const getCurrentStepInfo = (
  steps: Array<{ id: string; name: string; isCompleted: boolean }>,
) => {
  const firstIncomplete = steps.find((s) => !s.isCompleted);
  if (!firstIncomplete) {
    const last = steps[steps.length - 1];
    return {
      name: last?.name ?? "Complete",
      description: "All stages are complete. Review your application status.",
      allComplete: true,
    };
  }
  return {
    name: firstIncomplete.name,
    description:
      STEP_DESCRIPTIONS[firstIncomplete.id] ??
      "Complete the required actions for this stage.",
    allComplete: false,
  };
};
