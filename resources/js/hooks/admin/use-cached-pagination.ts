import { router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

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
    const queryKey = ['admin', endpoint, paginationState];

    // Fetch function that uses Inertia.js but returns a promise
    const fetchData = useCallback(async (): Promise<T> => {
        return new Promise((resolve, reject) => {
            const params = {
                page: paginationState.currentPage,
                per_page: paginationState.perPage,
                ...(paginationState.search && { search: paginationState.search }),
                ...Object.fromEntries(Object.entries(paginationState.filters).filter(([_, value]) => value && value !== 'all')),
            };

            router.get(endpoint, params, {
                preserveState: true,
                replace: true,
                onStart: () => setIsNavigating(true),
                onFinish: () => setIsNavigating(false),
                onSuccess: (page) => {
                    // Extract the main data from the page props
                    const dataKey = endpoint.split('/').pop(); // e.g., 'ads', 'users', 'finance'
                    const mainData = page.props[dataKey];
                    resolve(mainData as T);
                },
                onError: (errors) => {
                    reject(new Error(Object.values(errors).flat().join(', ')));
                },
            });
        });
    }, [endpoint, paginationState]);

    // React Query hook
    const query = useQuery({
        queryKey,
        queryFn: fetchData,
        staleTime,
        gcTime,
        refetchOnWindowFocus: false,
        retry: 2,
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
            currentPage: 1,
        }));
    }, []);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // This will trigger a new query with the updated search term
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [paginationState.search]);

    return {
        data: query.data,
        isLoading: query.isLoading || isNavigating,
        isError: query.isError,
        error: query.error,
        isFetching: query.isFetching,
        refetch: query.refetch,
        paginationState,
        goToPage,
        setPerPage,
        setSearch,
        setFilters,
        updateFilter,
    };
};
