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
    dataKey?: string; // key to extract from JSON response
    initialPage?: number;
    initialPerPage?: string;
    initialSearch?: string;
    initialFilters?: Record<string, string>;
    staleTime?: number;
    gcTime?: number;
}

export const useCachedPagination = <T = any>({
    endpoint,
    dataKey,
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

    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [isNavigating, setIsNavigating] = useState(false);

    // Create query key that includes all pagination parameters with debounced search
    const queryKey = ['admin', endpoint, {
        ...paginationState,
        search: debouncedSearch
    }];

    // Fetch function that uses fetch API for AJAX requests
    const fetchData = useCallback(async (): Promise<T> => {
        try {
            setIsNavigating(true);
            
            const params = {
                page: paginationState.currentPage,
                per_page: paginationState.perPage,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...Object.fromEntries(Object.entries(paginationState.filters).filter(([_, value]) => value && value !== 'all')),
            };

            // Build query string from params
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
            
            const queryString = queryParams.toString();
            const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'J-Json': 'true',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Extract the main data from the response
            const key = dataKey || endpoint.split('/').pop(); // e.g., 'transactions'
            const mainData = key ? data[key] : data;
            
            return mainData as T;
        } catch (error) {
            console.error('Error fetching paginated data:', error);
            console.error('Error fetching paginated data:', endpoint);
            throw error;
        } finally {
            setIsNavigating(false);
        }
    }, [endpoint, paginationState, debouncedSearch]);

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
            setDebouncedSearch(paginationState.search);
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
