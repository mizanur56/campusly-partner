/**
 * Types for GET /search/filter-options API response.
 * Used by the filter panel (StudyPreferenceFilters) to show options and send filter by ID.
 */
export interface FilterOptionCity {
  id: string;
  name: string;
  priority: number;
}

export interface FilterOptionCountry {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
  imageUrl: string;
  priority: number;
  cities: FilterOptionCity[];
}

export interface FilterOptionStudyLevel {
  id: string;
  name: string;
  description: string;
  priority: number;
}

export interface FilterOptionUniversity {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
  cityId: string;
  cityName: string;
  logoUrl: string;
}

export interface FilterOptionCourse {
  id: string;
  name: string;
  imageUrl: string;
}

export interface FilterRanges {
  duration: { min: number; max: number };
  fee: { min: number; max: number };
}

export interface FilterOptionsSummary {
  totalCountries: number;
  totalCities: number;
  totalUniversities: number;
  totalCourses: number;
  totalStudyLevels: number;
}

export interface FilterOptionsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    countries: FilterOptionCountry[];
    studyLevels: FilterOptionStudyLevel[];
    universities: FilterOptionUniversity[];
    courses: FilterOptionCourse[];
    ranges: FilterRanges;
    summary: FilterOptionsSummary;
  };
}
