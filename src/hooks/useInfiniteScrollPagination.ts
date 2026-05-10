import { useState, useEffect, useRef, useCallback, RefObject } from "react";

export type PaginationMeta = {
  total: number;
  totalPages: number;
};

type FetchFunction<T> = (
  page: number
) => Promise<{ data: T[]; meta: PaginationMeta } | undefined>;

type UseInfiniteScrollPaginationOptions<T> = {
  searchQuery: string;
  fetchFn: FetchFunction<T>;
  limit: number;
  enabled?: boolean;
  filtersKey?: string;
};

type UseInfiniteScrollPaginationReturn<T> = {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
  reset: () => void;
};

export function useInfiniteScrollPagination<T>({
  searchQuery,
  fetchFn,
  limit: _limit,
  enabled = true,
  filtersKey,
}: UseInfiniteScrollPaginationOptions<T>): UseInfiniteScrollPaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(false);
    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  const fetchFnRef = useRef(fetchFn);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const fetchData = useCallback(
    async (currentPage: number, append: boolean = false) => {
      if (!enabled) {
        reset();
        return;
      }

      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await fetchFnRef.current(currentPage);

        if (result?.data && result?.meta) {
          const transformedData = result.data;

          if (append) {
            setData((prev) => [...prev, ...transformedData]);
          } else {
            setData(transformedData);
          }

          setPage(currentPage);
          setHasMore(
            transformedData.length < result.meta.total &&
              currentPage < result.meta.totalPages
          );
        } else {
          if (!append) {
            reset();
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (!append) {
          reset();
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    [enabled, reset]
  );

  /** Sync latest strings without widening the “initial load” effect deps */
  const prevFiltersKeyRef = useRef<string | undefined>(undefined);
  const prevSearchQueryRef = useRef<string>(searchQuery);
  const hasMountedRef = useRef(false);
  /** After remount or `enabled` false→true, run exactly one page-1 fetch */
  const pendingInitialFetchRef = useRef(true);

  const searchQueryLiveRef = useRef(searchQuery);
  const filtersKeyLiveRef = useRef(filtersKey);
  searchQueryLiveRef.current = searchQuery;
  filtersKeyLiveRef.current = filtersKey;

  // First load only — NOT on fetchFn identity change (that duplicated filtersKey refetches).
  // Tab switch = component remount → pendingInitialFetchRef is true again.
  useEffect(() => {
    if (!enabled) {
      pendingInitialFetchRef.current = true;
      hasMountedRef.current = false;
      reset();
      return;
    }

    if (!pendingInitialFetchRef.current) {
      return;
    }

    pendingInitialFetchRef.current = false;
    hasMountedRef.current = true;
    prevSearchQueryRef.current = searchQueryLiveRef.current;
    prevFiltersKeyRef.current = filtersKeyLiveRef.current;

    fetchData(1, false);
  }, [enabled, fetchData, reset]);

  // Handle filtersKey changes
  useEffect(() => {
    if (
      filtersKey !== prevFiltersKeyRef.current &&
      enabled &&
      hasMountedRef.current
    ) {
      prevFiltersKeyRef.current = filtersKey;

      setData([]);
      setPage(1);
      setHasMore(false);
      setIsLoading(false);
      setIsLoadingMore(false);
      isLoadingRef.current = false;

      const refetch = async () => {
        if (isLoadingRef.current) {
          return;
        }

        isLoadingRef.current = true;
        try {
          setIsLoading(true);
          const result = await fetchFnRef.current(1);
          if (result?.data && result?.meta) {
            setData(result.data);
            setPage(1);
            setHasMore(
              result.data.length < result.meta.total &&
                1 < result.meta.totalPages
            );
          } else {
            setData([]);
            setHasMore(false);
          }
        } catch (error) {
          console.error("Error refetching with filters:", error);
          setData([]);
          setHasMore(false);
        } finally {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      };

      refetch();
    }
  }, [filtersKey, enabled]);

  // Handle searchQuery changes - this should always trigger a refetch
  useEffect(() => {
    if (!hasMountedRef.current) {
      return; // Initial mount is handled separately
    }

    const searchQueryChanged = prevSearchQueryRef.current !== searchQuery;
    const filtersKeyChanged = filtersKey !== prevFiltersKeyRef.current;

    // If searchQuery changed and filtersKey hasn't changed, refetch
    // (If filtersKey changed, the previous useEffect will handle it)
    if (searchQueryChanged && !filtersKeyChanged && enabled) {
      prevSearchQueryRef.current = searchQuery;
      
      // Reset state
      setData([]);
      setPage(1);
      setHasMore(false);
      setIsLoading(false);
      setIsLoadingMore(false);
      isLoadingRef.current = false;

      // Fetch new data
      fetchData(1, false);
    } else if (searchQueryChanged) {
      // Update ref even if we don't fetch (because filtersKey changed and will handle it)
      prevSearchQueryRef.current = searchQuery;
    }
  }, [searchQuery, enabled, filtersKey, fetchData]);

  useEffect(() => {
    if (!hasMore || isLoadingMore || isLoading || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoadingMore && !isLoadingRef.current) {
            fetchData(page + 1, true);
          }
        });
      },
      { rootMargin: "400px 0px", threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, isLoading, page, fetchData, enabled]);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    sentinelRef,
    reset,
  };
}
