/** Shared Programs Schools filter shape — sidebar + search views */
export interface FilterState {
  /** Country display name — used for search API mapping */
  studyDestination: string;
  /** Resolved when user picks from list — drives scoped filter-options */
  studyDestinationCountryId?: string;
  studyLevel: string[];
  startYear: string[];
  startMonth: string[];
  subjects: string[];
  duration: string[];
  institution: string;
  feeRange: {
    min: number;
    max: number;
  };
}

export function createDefaultFilterState(): FilterState {
  return {
    studyDestination: "",
    studyDestinationCountryId: undefined,
    studyLevel: [],
    startYear: [],
    startMonth: [],
    subjects: [],
    duration: [],
    institution: "",
    feeRange: {
      min: 0,
      max: 100000,
    },
  };
}
