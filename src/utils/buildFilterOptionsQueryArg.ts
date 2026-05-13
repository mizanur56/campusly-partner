import type { FilterOptionsResponse } from "../types/filterOptions";

export type GetFilterOptionsQueryArg = { countryIds: string[] };

/**
 * Map selected study destination (country name) to API filter-options `countryIds`.
 * Uses the unscoped filter-options payload so country ids stay stable while scoped queries load.
 */
export function buildFilterOptionsQueryArg(
  studyDestinationName: string | undefined,
  filterOptionsData: FilterOptionsResponse["data"] | undefined
): GetFilterOptionsQueryArg | undefined {
  const name = studyDestinationName?.trim();
  if (!name || !filterOptionsData?.countries?.length) return undefined;
  const needle = name.toLowerCase();
  const match = filterOptionsData.countries.find(
    (c) => c.name.trim().toLowerCase() === needle
  );
  return match?.id ? { countryIds: [match.id] } : undefined;
}
