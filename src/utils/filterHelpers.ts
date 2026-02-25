export interface FilterFormData {
  destination: string[];
  city: string[];
  studyLevel: string[];
  subject: string[];
  duration: string[];
  institution: string[];
  startYear: string[];
  startMonth?: string[];
  minFee: string;
  maxFee: string;
  sortBy?: string;
  sortOrder?: string;
}

function isEmptyFilterValue(value: string | string[]): boolean {
  if (Array.isArray(value)) {
    return value.length === 0 || value.every((v) => !v || v === "Any");
  }
  return !value || value === "";
}

export function hasActiveFilters(filterData: FilterFormData): boolean {
  return Object.values(filterData).some((value) => !isEmptyFilterValue(value));
}

export function calculateActiveFilterCount(filterData: FilterFormData): number {
  return Object.values(filterData).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.filter((v) => v && v !== "Any").length;
    }
    return count + (value ? 1 : 0);
  }, 0);
}

export function extractCountryNames(
  countriesResponse:
    | { data?: Array<{ name: string; isActive: boolean }> }
    | undefined
): string[] {
  if (!countriesResponse?.data) return [];
  return countriesResponse.data
    .filter((country) => country.isActive)
    .map((country) => country.name)
    .sort();
}

export function extractCityNames(
  citiesResponse:
    | {
        data?: Array<{
          name: string;
          isActive: boolean;
          country: { name: string };
        }>;
      }
    | undefined,
  selectedCountries?: string[]
): string[] {
  if (!citiesResponse?.data) return [];

  let cities = citiesResponse.data.filter((city) => city.isActive);
  if (selectedCountries && selectedCountries.length > 0) {
    cities = cities.filter((city) =>
      selectedCountries.includes(city.country.name)
    );
  }
  return cities.map((city) => city.name).sort();
}

export function extractSubjectNames(
  coursesResponse:
    | {
        data?: Array<{
          course: { name: string };
          university: { country: { name: string }; city: { name: string } };
        }>;
      }
    | undefined,
  selectedCountries?: string[],
  selectedCities?: string[]
): string[] {
  if (!coursesResponse?.data) return [];

  let courses = coursesResponse.data;
  if (selectedCountries?.length) {
    courses = courses.filter((c) =>
      selectedCountries.includes(c.university.country.name)
    );
  }
  if (selectedCities?.length) {
    courses = courses.filter((c) =>
      selectedCities.includes(c.university.city.name)
    );
  }
  return Array.from(new Set(courses.map((c) => c.course.name))).sort();
}

export function extractInstitutionNames(
  coursesResponse:
    | {
        data?: Array<{
          university: {
            name: string;
            country: { name: string };
            city: { name: string };
          };
        }>;
      }
    | undefined,
  selectedCountries?: string[],
  selectedCities?: string[]
): string[] {
  if (!coursesResponse?.data) return [];

  let courses = coursesResponse.data;
  if (selectedCountries?.length) {
    courses = courses.filter((c) =>
      selectedCountries.includes(c.university.country.name)
    );
  }
  if (selectedCities?.length) {
    courses = courses.filter((c) =>
      selectedCities.includes(c.university.city.name)
    );
  }
  return Array.from(new Set(courses.map((c) => c.university.name))).sort();
}
