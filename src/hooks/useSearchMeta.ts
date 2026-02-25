import { useEffect } from "react";
import { useAppDispatch } from "../redux/features/hooks";
import { updateUnifiedMeta } from "../redux/features/search/searchMetaSlice";
import type { UnifiedSearchApiResponse } from "../types/search";
import type { ApiSearchParams } from "../utils/transformFiltersToApi";
import { extractSearchMetaFromResponse } from "../utils/searchResultsHelpers";

type TriggerSearchFunction = (params: {
  searchTerm: string;
  filters?: ApiSearchParams;
}) => { unwrap: () => Promise<UnifiedSearchApiResponse> };

type UseSearchMetaParams = {
  searchQuery: string;
  triggerSearch: TriggerSearchFunction;
  enabled?: boolean;
};

export function useSearchMeta({
  searchQuery,
  triggerSearch,
  enabled = true,
}: UseSearchMetaParams) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;

    const fetchMetaData = async () => {
      try {
        const result = await triggerSearch({
          searchTerm: searchQuery,
        }).unwrap();
        const meta = extractSearchMetaFromResponse(result?.data);
        if (meta) {
          dispatch(updateUnifiedMeta(meta));
        }
      } catch (error) {
        console.error("Error fetching meta data:", error);
      }
    };

    fetchMetaData();
  }, [searchQuery, triggerSearch, dispatch, enabled]);
}
