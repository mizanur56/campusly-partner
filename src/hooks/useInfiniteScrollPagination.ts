import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  RefObject,
} from "react";

export type PaginationMeta = {
  total: number;
  totalPages: number;
};

type FetchFunction<T> = (
  page: number
) => Promise<{ data: T[]; meta: PaginationMeta } | undefined>;

type UseInfiniteScrollPaginationOptions<T> = {
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
  /** True after the first non-append page fetch finishes (success or error). */
  initialFetchDone: boolean;
};

export function useInfiniteScrollPagination<T>({
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
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(false);
    setIsLoading(false);
    setIsLoadingMore(false);
    setInitialFetchDone(false);
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
        if (!append) {
          setInitialFetchDone(true);
        }
      }
    },
    [enabled, reset]
  );

  /** Avoid “empty state” flash before the first fetch is scheduled (tab switch / mount). */
  useLayoutEffect(() => {
    if (enabled) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [enabled]);

  const prevFiltersKeyRef = useRef<string | undefined>(undefined);
  /** After remount or `enabled` false→true, run exactly one page-1 fetch */
  const pendingInitialFetchRef = useRef(true);

  /**
   * Single place for page-1 fetch on: first enable (e.g. Institutions tab mount),
   * or filtersKey change. Avoids duplicate calls when the old "initial" effect and the
   * old filtersKey effect both ran after `enabled` flipped true.
   */
  useEffect(() => {
    if (!enabled) {
      pendingInitialFetchRef.current = true;
      prevFiltersKeyRef.current = undefined;
      reset();
      return;
    }

    const isFirstEnable = pendingInitialFetchRef.current;
    const filtersKeyChanged =
      prevFiltersKeyRef.current !== undefined &&
      prevFiltersKeyRef.current !== filtersKey;

    if (isFirstEnable) {
      pendingInitialFetchRef.current = false;
      prevFiltersKeyRef.current = filtersKey;
      fetchData(1, false);
      return;
    }

    if (filtersKeyChanged) {
      prevFiltersKeyRef.current = filtersKey;
      setData([]);
      setPage(1);
      setHasMore(false);
      isLoadingRef.current = false;
      fetchData(1, false);
    }
  }, [enabled, filtersKey, fetchData, reset]);

  /**
   * Observe the sentinel when it exists. Include `data.length` so we re-bind after the first
   * page renders (sentinel mounts under `hasMore`); otherwise `sentinelRef` could stay null on
   * the first effect pass and infinite scroll never attaches.
   */
  useEffect(() => {
    if (!hasMore || isLoadingMore || isLoading || !enabled) {
      return;
    }

    const el = sentinelRef.current;
    if (!el) {
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
      { rootMargin: "400px 0px", threshold: 0 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [
    hasMore,
    isLoadingMore,
    isLoading,
    page,
    fetchData,
    enabled,
    data.length,
  ]);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    sentinelRef,
    reset,
    initialFetchDone,
  };
}
