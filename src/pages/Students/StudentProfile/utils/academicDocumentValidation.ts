export type UploadDocType = "marksheet" | "certificate";

export type ValidationState = {
  status: "idle" | "processing" | "success" | "error";
  message: string;
};

const BASE_ACADEMIC_DOC_FIELDS: Record<UploadDocType, string[]> = {
  marksheet: [
    "study_level",
    "institute_name",
    "country",
    "subject_group",
    "result",
    "out_of_grade",
    "start_date",
    "end_date",
  ],
  certificate: [
    "study_level",
    "institute_name",
    "country",
    "subject_group",
    "start_date",
    "end_date",
  ],
};

type StudyLevelFieldOverride = Partial<Record<UploadDocType, string[]>>;

const DOCTORAL_STYLE_CERTIFICATE_FIELDS = [
  "study_level",
  "institute_name",
  "country",
  "subject_group",
  "research_title",
  "award_date",
  "start_date",
  "end_date",
];

/**
 * Keep this config extensible: add new study-level specific extraction keys here.
 * Match is keyword-based against the study level label.
 */
const STUDY_LEVEL_FIELD_OVERRIDES: Record<string, StudyLevelFieldOverride> = {
  phd: {
    certificate: DOCTORAL_STYLE_CERTIFICATE_FIELDS,
  },
  doctoral: {
    certificate: DOCTORAL_STYLE_CERTIFICATE_FIELDS,
  },
  mphil: {
    certificate: DOCTORAL_STYLE_CERTIFICATE_FIELDS,
  },
  postgraduate: {
    certificate: DOCTORAL_STYLE_CERTIFICATE_FIELDS,
  },
  masters: {
    certificate: DOCTORAL_STYLE_CERTIFICATE_FIELDS,
  },
  master: {
    certificate: DOCTORAL_STYLE_CERTIFICATE_FIELDS,
  },
};

export const getAcademicDocFields = (
  type: UploadDocType,
  studyLevelLabel?: string,
) => {
  const normalizedLabel = String(studyLevelLabel || "").toLowerCase();
  const override = Object.entries(STUDY_LEVEL_FIELD_OVERRIDES).find(([keyword]) =>
    normalizedLabel.includes(keyword),
  )?.[1];

  const resolved = override?.[type] || BASE_ACADEMIC_DOC_FIELDS[type];
  return Array.from(new Set(resolved));
};

export const toBase64WithoutPrefix = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      const base64 = value.includes(",") ? value.split(",")[1] : value;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export const buildStudyLevelMismatchMessage = (input: {
  type: UploadDocType;
  selectedStudyLevelLabel?: string;
  detectedStudyLevel?: string | null;
  detectedDocumentType?: string | null;
  detectedSentence?: string | null;
}) => {
  const expectedLevel =
    input.selectedStudyLevelLabel && String(input.selectedStudyLevelLabel).trim()
      ? String(input.selectedStudyLevelLabel).trim()
      : "this study level";
  const detectedTypeText =
    input.detectedDocumentType && String(input.detectedDocumentType).trim()
      ? String(input.detectedDocumentType).trim()
      : "unknown document type";
  const detectedLevelText =
    input.detectedStudyLevel && String(input.detectedStudyLevel).trim()
      ? String(input.detectedStudyLevel).trim()
      : "unknown study level";

  const firstSentence =
    input.detectedSentence && String(input.detectedSentence).trim()
      ? String(input.detectedSentence).trim()
      : `Detected "${detectedTypeText}" for "${detectedLevelText}".`;
  return `${firstSentence} Required: "${input.type}" for "${expectedLevel}". Please upload the correct document.`;
};

const firstAvailable = (source: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return null;
};

export const mapAiExtractedToEducationData = (
  extractedData: Record<string, any>,
) => {
  return {
    instituteName: firstAvailable(extractedData, [
      "institute_name",
      "institute",
      "school_name",
      "college_name",
    ]),
    country: firstAvailable(extractedData, ["country"]),
    startYear: firstAvailable(extractedData, ["start_date", "start_year"]),
    endYear: firstAvailable(extractedData, ["end_date", "end_year"]),
    subject: firstAvailable(extractedData, [
      "subject_group",
      "subject",
      "group",
    ]),
    outOfGrade: firstAvailable(extractedData, ["out_of_grade", "grade_scale"]),
    result: firstAvailable(extractedData, ["result", "grade", "cgpa"]),
  };
};

const normalizeComparable = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const hasValue = (value: unknown) => normalizeComparable(value) !== "";

export const buildMatchSourceFromEducationData = (
  educationData: Record<string, any> | null | undefined,
  allowedFields?: string[],
) => {
  if (!educationData) {
    return { matchSource: {}, matchFields: [] as string[] };
  }

  const candidate: Record<string, any> = {
    institute_name: educationData.instituteName,
    country: educationData.country,
    start_date: educationData.startYear,
    end_date: educationData.endYear,
    subject_group: educationData.subject,
    out_of_grade: educationData.outOfGrade,
    result: educationData.result,
  };

  const matchSource: Record<string, any> = {};
  const allowed = new Set((allowedFields || []).map((field) => field.trim()));
  Object.entries(candidate).forEach(([key, value]) => {
    if (allowed.size > 0 && !allowed.has(key)) return;
    if (hasValue(value)) matchSource[key] = value;
  });

  return { matchSource, matchFields: Object.keys(matchSource) };
};

export const buildFieldMismatchMessage = (input: {
  type: UploadDocType;
  mismatchedFields: string[];
}) => {
  const pretty = input.mismatchedFields
    .map((field) => field.replace(/_/g, " "))
    .join(", ");
  return `Data not matched for this ${input.type}: ${pretty}. Please upload the correct document.`;
};

export const mergeEducationDataWithoutOverride = (
  currentData: Record<string, any>,
  extractedData: Record<string, any>,
) => {
  const merged = { ...(currentData || {}) };
  Object.entries(extractedData || {}).forEach(([key, value]) => {
    // Never clear/replace existing values with empty extracted values.
    if (!hasValue(value)) return;
    // Keep user's existing form value if already filled.
    if (hasValue(merged[key])) return;
    merged[key] = value;
  });
  return merged;
};

