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

export const START_YEARS = ["Any", "2025", "2026", "2027", "2028"];

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
