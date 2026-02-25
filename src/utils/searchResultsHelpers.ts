import type { SearchTabItem } from "../data/searchResultsTypes";
import type { SearchMetaState } from "../redux/features/search/searchMetaSlice";

export function getUniversityKey(university: {
  id?: string;
  slug?: string;
  name: string;
}): string {
  return university.id || university.slug || university.name;
}

export const SEARCH_RESULTS_GRID_CLASSES =
  "grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3";

export const ALL_RESULTS_CONTAINER_CLASSES = "";

export const SECTION_SPACING_CLASSES = "mb-5 pt-5 md:pt-5 md:mb-2 lg:mb-2";

export function buildSearchTabs(
  metaData: SearchMetaState,
  _activeTab?: string
): SearchTabItem[] {
  const coursesCount = metaData.courses ?? 0;
  const universitiesCount = metaData.universities ?? 0;
  const resultsCount = coursesCount + universitiesCount;

  return [
    { id: "results", label: "Results", count: resultsCount, isPrimary: true },
    { id: "courses", label: "Courses", count: coursesCount },
    { id: "universities", label: "Universities", count: universitiesCount },
  ];
}

export function extractSearchMetaFromResponse(results: {
  courses?: { meta?: { total?: number } };
  universities?: { meta?: { total?: number } };
  articles?: { meta?: { total?: number } };
}): { courses: number; universities: number; totalArticles?: number } | null {
  if (!results?.courses || !results?.universities) return null;
  return {
    courses: results.courses.meta?.total ?? 0,
    universities: results.universities.meta?.total ?? 0,
    totalArticles: results.articles?.meta?.total ?? 0,
  };
}
