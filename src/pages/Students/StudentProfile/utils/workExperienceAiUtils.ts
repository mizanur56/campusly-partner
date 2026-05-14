import type { BackgroundDocument } from "../../../../components/ProfileTab/type";

/** AI extraction keys (snake_case) — server vision prompt uses these. */
export const WORK_EXPERIENCE_AI_FIELDS = [
  "company_name",
  "designation",
  "start_date",
  "end_date",
] as const;

export const WORK_EXPERIENCE_EXPECTED_TYPE = "work_experience_certificate";

function pickExtracted(
  extracted: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const k of keys) {
    const v = extracted[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return null;
}

/**
 * Map AI `extractedData` to form field ids using Background document field labels.
 */
export function mapWorkExperienceExtractedToFormValues(
  document: BackgroundDocument,
  extracted: Record<string, unknown>,
): Record<string, string> {
  const company = pickExtracted(extracted, [
    "company_name",
    "company",
    "employer",
    "organization",
  ]);
  const designation = pickExtracted(extracted, [
    "designation",
    "job_title",
    "position",
    "role",
  ]);
  const start = pickExtracted(extracted, [
    "start_date",
    "employment_start_date",
    "from_date",
  ]);
  const end = pickExtracted(extracted, [
    "end_date",
    "employment_end_date",
    "to_date",
  ]);
  const duration = pickExtracted(extracted, ["duration", "tenure"]);

  const out: Record<string, string> = {};
  for (const field of document.fields) {
    const n = field.name.toLowerCase();
    let val: string | null = null;
    if (n.includes("company") || n.includes("employer")) val = company;
    else if (
      n.includes("designation") ||
      n.includes("position") ||
      n.includes("title") ||
      n.includes("role")
    )
      val = designation;
    else if (n.includes("start")) val = start;
    else if (n.includes("end")) val = end;
    else if (n.includes("duration")) val = duration;
    if (val) out[field.id] = val;
  }
  return out;
}

export function buildWorkExperienceFieldPayload(
  document: BackgroundDocument,
  formValues: Record<string, unknown>,
  formatDate: (v: unknown) => string,
): { fieldId: string; result: string }[] {
  return document.fields.map((field) => {
    const raw = formValues[field.id];
    const isDate = field.name.toLowerCase().includes("date");
    return {
      fieldId: field.id,
      result: isDate ? formatDate(raw) : String(raw ?? "").trim(),
    };
  });
}
