/** Partner: Upload Documents tab helpers (kept in-repo for independent deploys). */

export type DocumentTemplateBrief = { id: string; name?: string };

export function documentsFromCategoryPayload(
  payload: unknown,
): DocumentTemplateBrief[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  const inner = (payload as { data?: unknown }).data;
  return Array.isArray(inner) ? inner : [];
}

export function resolvePassportDocumentTemplateId(
  passportCategoryPayload: unknown,
  identityCategoryPayload: unknown,
): string | undefined {
  const fromPassportSlug =
    documentsFromCategoryPayload(passportCategoryPayload);
  const fromIdentitySlug =
    documentsFromCategoryPayload(identityCategoryPayload);
  if (fromPassportSlug.length === 1) return fromPassportSlug[0]?.id;
  const inPassportSlug = fromPassportSlug.find((d) =>
    /\bpassport\b/i.test(String(d.name ?? "")),
  );
  if (inPassportSlug) return inPassportSlug.id;
  const inIdentity = fromIdentitySlug.find((d) =>
    /\bpassport\b/i.test(String(d.name ?? "")),
  );
  return inIdentity?.id;
}

export type PersonalDocumentsUploadRow = {
  id: string;
  name: string;
  status: "pending" | "submitted";
  category: string;
  documentId?: string;
};

export function buildPersonalDocumentsUploadRows(input: {
  imageId?: string | null | undefined;
  cv?: string | null | undefined;
  passportTemplateId?: string | undefined;
  studentDocuments?:
    | { documentId?: string | null | undefined }[]
    | null
    | undefined;
}): PersonalDocumentsUploadRow[] {
  const rows: PersonalDocumentsUploadRow[] = [
    {
      id: "photo",
      name: "Photo",
      status: input.imageId ? "submitted" : "pending",
      category: "profile",
    },
  ];
  const tid = input.passportTemplateId;
  if (tid) {
    const submitted = !!(input.studentDocuments ?? []).some(
      (d) => d.documentId === tid,
    );
    rows.push({
      id: tid,
      documentId: tid,
      name: "Passport",
      status: submitted ? "submitted" : "pending",
      category: "document",
    });
  }
  rows.push({
    id: "resume",
    name: "Resume",
    status: input.cv ? "submitted" : "pending",
    category: "cv",
  });
  return rows;
}
