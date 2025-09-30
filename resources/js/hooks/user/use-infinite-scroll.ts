import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

interface InfiniteScrollState {
    search: string;
    filters: Record<string, string>;
}

interface UseInfiniteScrollOptions<T = any> {
    endpoint: string;
    perPage?: number;
    initialSearch?: string;
    initialFilters?: Record<string, string>;
    staleTime?: number;
    gcTime?: number;
}

export const useInfiniteScroll = <T = any>({
    endpoint,
    perPage = 10,
    initialSearch = '',
    initialFilters = {},
    staleTime = 2 * 60 * 1000, // 2 minutes
    gcTime = 5 * 60 * 1000, // 5 minutes
}: UseInfiniteScrollOptions<T>) => {
    const [scrollState, setScrollState] = useState<InfiniteScrollState>({
        search: initialSearch,
        filters: initialFilters,
    });

    // Create query key that includes all scroll parameters
    const queryKey = ['user', 'infinite', endpoint, scrollState];

    // Fetch function for infinite query
    const fetchData = useCallback(async ({ pageParam = 1 }): Promise<{
        data: T[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    }> => {
        const params = new URLSearchParams();
        params.append('page', pageParam.toString());
        params.append('per_page', perPage.toString());

        if (scrollState.search) {
            params.append('search', scrollState.search);
        }

        Object.entries(scrollState.filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.append(key, value);
            }
        });

        const response = await fetch(`${endpoint}?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        return data;
    }, [endpoint, perPage, scrollState]);

    // React Query infinite query hook
    const query = useInfiniteQuery({
        queryKey,
        queryFn: fetchData,
        getNextPageParam: (lastPage) => {
            if (lastPage.current_page < lastPage.last_page) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
        staleTime,
        gcTime,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    // Flatten all pages data
    const allData = query.data?.pages.flatMap(page => page.data) || [];

    // Get pagination info from the last page
    const lastPage = query.data?.pages[query.data.pages.length - 1];
    const paginationInfo = lastPage ? {
        current_page: lastPage.current_page,
        last_page: lastPage.last_page,
        per_page: lastPage.per_page,
        total: lastPage.total,
        from: lastPage.from,
        to: lastPage.to,
    } : null;

    // Update functions
    const setSearch = useCallback((search: string) => {
        setScrollState((prev) => ({ ...prev, search }));
        query.refetch();
    }, [query]);

    const setFilters = useCallback((filters: Record<string, string>) => {
        setScrollState((prev) => ({ ...prev, filters }));
        query.refetch();
    }, [query]);

    const updateFilter = useCallback((key: string, value: string) => {
        setScrollState((prev) => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
        }));
        query.refetch();
    }, [query]);

    const loadMore = useCallback(() => {
        if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
        }
    }, [query]);

    return {
        data: allData,
        pagination: paginationInfo,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
        scrollState,
        setSearch,
        setFilters,
        updateFilter,
        loadMore,
        refetch: query.refetch,
    };
};
