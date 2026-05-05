import type { FilterFormData } from "./filterHelpers";

type CountriesResponse = {
  data?: Array<{ id: string; name: string; isActive?: boolean }>;
};

type CitiesResponse = {
  data?: Array<{
    id: string;
    name: string;
    isActive?: boolean;
    country: { name: string };
  }>;
};

type CoursesResponse = {
  data?: Array<{ id: string; name: string }>;
};

type UniversitiesResponse = {
  data?: Array<{ id: string; name: string }>;
};

type StudyLevelsResponse = {
  data?: Array<{ id: string; name: string; description?: string | null; isActive?: boolean }>;
};

export interface ApiSearchParams {
  searchTerm?: string;
  countryIds?: string[];
  cityIds?: string[];
  universityIds?: string[];
  courseIds?: string[];
  studyLevelIds?: string[];
  durationMin?: number;
  durationMax?: number;
  feeMin?: number;
  feeMax?: number;
  startYear?: number;
  startMonth?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

function parseDuration(duration: string): { min?: number; max?: number } {
  const lower = duration.toLowerCase();
  if (lower.includes("less than 1 year")) return { max: 0.9 };
  if (lower.includes("more than 5 years")) return { min: 5.1 };
  const rangeMatch = duration.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }
  const singleMatch = duration.match(/(\d+)/);
  if (singleMatch) {
    const num = Number(singleMatch[1]);
    return { min: num, max: num };
  }
  return {};
}

function getMonthNumber(monthName: string): number | undefined {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const index = months.indexOf(monthName.toLowerCase());
  return index !== -1 ? index + 1 : undefined;
}

export function transformFiltersToApi(
  filterData: FilterFormData,
  searchTerm: string,
  countriesResponse?: CountriesResponse,
  citiesResponse?: CitiesResponse,
  coursesResponse?: CoursesResponse,
  studyLevelsResponse?: StudyLevelsResponse,
  universitiesResponse?: UniversitiesResponse,
  page: number = 1,
  limit: number = 20,
): ApiSearchParams {
  const params: ApiSearchParams = {
    page,
    limit,
    sortBy: filterData.sortBy,
    sortOrder: filterData.sortOrder,
  };

  if (searchTerm?.trim()) params.searchTerm = searchTerm.trim();

  if (filterData.destination?.length > 0 && countriesResponse?.data) {
    const countryMap = new Map(
      countriesResponse.data
        .filter((c) => c.isActive)
        .map((c) => [c.name, c.id]),
    );
    const countryIds = filterData.destination
      .map((name) => countryMap.get(name))
      .filter((id): id is string => !!id);
    if (countryIds.length > 0) params.countryIds = countryIds;
  }

  if (filterData.city?.length > 0 && citiesResponse?.data) {
    const cityMap = new Map(
      citiesResponse.data.filter((c) => c.isActive).map((c) => [c.name, c.id]),
    );
    const cityIds = filterData.city
      .map((name) => cityMap.get(name))
      .filter((id): id is string => !!id);
    if (cityIds.length > 0) params.cityIds = cityIds;
  }

  if (filterData.institution?.length > 0 && universitiesResponse?.data) {
    const universityMap = new Map(
      universitiesResponse.data.map((u) => [u.name, u.id]),
    );
    const universityIds = filterData.institution
      .map((name) => universityMap.get(name))
      .filter((id): id is string => !!id);
    if (universityIds.length > 0) params.universityIds = universityIds;
  }

  if (filterData.subject?.length > 0 && coursesResponse?.data) {
    const courseMap = new Map(
      coursesResponse.data.map((c) => [c.name, c.id]),
    );
    const courseIds = filterData.subject
      .map((name) => courseMap.get(name))
      .filter((id): id is string => !!id);
    if (courseIds.length > 0) params.courseIds = courseIds;
  }

  if (filterData.studyLevel?.length > 0 && studyLevelsResponse?.data) {
    const filteredLevels = filterData.studyLevel.filter((l) => l !== "Any");
    if (filteredLevels.length > 0) {
      // Create case-insensitive study level map - index by both name and description
      // because FilterState.studyLevel stores description values ("Postgraduate", "Undergraduate")
      const studyLevelMap = new Map<string, string>();
      studyLevelsResponse.data
        .filter((sl) => sl.isActive !== false)
        .forEach((sl) => {
          if (sl.name) studyLevelMap.set(sl.name.toLowerCase(), sl.id);
          if (sl.description) studyLevelMap.set(sl.description.toLowerCase(), sl.id);
        });

      const studyLevelIds = filteredLevels
        .map((name) => studyLevelMap.get(name.toLowerCase()))
        .filter((id): id is string => !!id);
      if (studyLevelIds.length > 0) params.studyLevelIds = studyLevelIds;
    }
  }

  if (filterData.duration?.length > 0) {
    const durations = filterData.duration.map(parseDuration);
    const allMins = durations
      .map((d) => d.min)
      .filter((n): n is number => n !== undefined);
    const allMaxs = durations
      .map((d) => d.max)
      .filter((n): n is number => n !== undefined);
    if (allMins.length > 0) params.durationMin = Math.min(...allMins);
    if (allMaxs.length > 0) params.durationMax = Math.max(...allMaxs);
  }

  if (filterData.minFee?.trim()) {
    const minFee = Number(filterData.minFee);
    if (!isNaN(minFee) && minFee >= 0) params.feeMin = minFee;
  }
  if (filterData.maxFee?.trim()) {
    const maxFee = Number(filterData.maxFee);
    if (!isNaN(maxFee) && maxFee >= 0) params.feeMax = maxFee;
  }

  if (filterData.startYear?.length > 0) {
    const filteredYears = filterData.startYear.filter((y) => y !== "Any");
    if (filteredYears.length > 0) {
      const year = Number(filteredYears[0]);
      if (!isNaN(year)) params.startYear = year;
    }
  }

  if (filterData.startMonth?.length) {
    const filteredMonths = filterData.startMonth.filter((m) => m !== "Any");
    if (filteredMonths.length > 0) {
      const monthNum = getMonthNumber(filteredMonths[0]);
      if (monthNum) params.startMonth = monthNum;
    }
  }

  return params;
}

export function buildSearchQueryString(params: ApiSearchParams): string {
  const queryParams = new URLSearchParams();
  if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm);
  if (params.countryIds?.length)
    queryParams.append("countryIds", params.countryIds.join(","));
  if (params.cityIds?.length)
    queryParams.append("cityIds", params.cityIds.join(","));
  if (params.universityIds?.length)
    queryParams.append("universityIds", params.universityIds.join(","));
  if (params.courseIds?.length)
    queryParams.append("courseIds", params.courseIds.join(","));
  if (params.studyLevelIds?.length)
    queryParams.append("studyLevelIds", params.studyLevelIds.join(","));
  if (params.durationMin !== undefined)
    queryParams.append("durationMin", params.durationMin.toString());
  if (params.durationMax !== undefined)
    queryParams.append("durationMax", params.durationMax.toString());
  if (params.feeMin !== undefined)
    queryParams.append("feeMin", params.feeMin.toString());
  if (params.feeMax !== undefined)
    queryParams.append("feeMax", params.feeMax.toString());
  if (params.startYear !== undefined)
    queryParams.append("startYear", params.startYear.toString());
  if (params.startMonth !== undefined)
    queryParams.append("startMonth", params.startMonth.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.page !== undefined)
    queryParams.append("page", params.page.toString());
  if (params.limit !== undefined)
    queryParams.append("limit", params.limit.toString());
  return queryParams.toString();
}
