import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

interface PaginationState {
    currentPage: number;
    perPage: string;
    search: string;
    filters: Record<string, string>;
}

interface UseCachedPaginationOptions<T = any> {
    endpoint: string;
    initialPage?: number;
    initialPerPage?: string;
    initialSearch?: string;
    initialFilters?: Record<string, string>;
    staleTime?: number;
    gcTime?: number;
}

export const useCachedPagination = <T = any>({
    endpoint,
    initialPage = 1,
    initialPerPage = '20',
    initialSearch = '',
    initialFilters = {},
    staleTime = 2 * 60 * 1000, // 2 minutes
    gcTime = 5 * 60 * 1000, // 5 minutes
}: UseCachedPaginationOptions<T>) => {
    const [paginationState, setPaginationState] = useState<PaginationState>({
        currentPage: initialPage,
        perPage: initialPerPage,
        search: initialSearch,
        filters: initialFilters,
    });
    const [isNavigating, setIsNavigating] = useState(false);

    // Create query key that includes all pagination parameters
    const queryKey = ['user', endpoint, paginationState];

    // Fetch function that uses fetch API
    const fetchData = useCallback(async (): Promise<T> => {
        setIsNavigating(true);

        try {
            const params = new URLSearchParams();
            params.append('page', paginationState.currentPage.toString());
            params.append('per_page', paginationState.perPage);

            if (paginationState.search) {
                params.append('search', paginationState.search);
            }

            Object.entries(paginationState.filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    params.append(key, value);
                }
            });

            const response = await fetch(`${endpoint}?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            return data as T;
        } finally {
            setIsNavigating(false);
        }
    }, [endpoint, paginationState]);

    // React Query hook
    const query = useQuery({
        queryKey,
        queryFn: fetchData,
        staleTime,
        gcTime,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    // Navigation functions
    const goToPage = useCallback((page: number) => {
        setPaginationState((prev) => ({ ...prev, currentPage: page }));
    }, []);

    const setPerPage = useCallback((perPage: string) => {
        setPaginationState((prev) => ({ ...prev, perPage, currentPage: 1 }));
    }, []);

    const setSearch = useCallback((search: string) => {
        setPaginationState((prev) => ({ ...prev, search, currentPage: 1 }));
    }, []);

    const setFilters = useCallback((filters: Record<string, string>) => {
        setPaginationState((prev) => ({ ...prev, filters, currentPage: 1 }));
    }, []);

    const updateFilter = useCallback((key: string, value: string) => {
        setPaginationState((prev) => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
            currentPage: 1, // Reset to first page when a filter changes
        }));
    }, []);

    return {
        data: query.data,
        isLoading: query.isLoading || isNavigating, // Consider it loading if Inertia is navigating
        isError: query.isError,
        error: query.error,
        paginationState,
        goToPage,
        setPerPage,
        setSearch,
        setFilters,
        updateFilter,
        refetch: query.refetch,
    };
};
