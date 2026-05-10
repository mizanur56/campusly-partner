import type { FilterFormData } from "./filterHelpers";

export const STUDY_LEVELS = ["Any", "Undergraduate", "Postgraduate"];

export const DURATIONS = [
  "Less than 1 year",
  "1 - 2 years",
  "2 - 3 years",
  "3 - 4 years",
  "4 - 5 years",
  "More than 5 years",
];

/**
 * Start-year filter options for Programs & Schools: "Any" plus four years
 * starting from the current calendar year (e.g. 2026–2029 when current is 2026).
 */
export function buildStartYearFilterOptions(): string[] {
  const current = new Date().getFullYear();
  return ["Any", ...Array.from({ length: 4 }, (_, i) => String(current + i))];
}

export const START_YEARS = buildStartYearFilterOptions();

export const FEE_MIN = 0;
export const FEE_MAX = 100000;
export const FEE_STEP = 1000;

export const DEFAULT_FILTER_VALUES: FilterFormData = {
  destination: [],
  city: [],
  studyLevel: ["Any"],
  subject: [],
  duration: [],
  institution: [],
  startYear: ["Any"],
  minFee: "",
  maxFee: "",
};

export const MAX_SELECTIONS = {
  city: 5,
  subject: 5,
  institution: 5,
};
