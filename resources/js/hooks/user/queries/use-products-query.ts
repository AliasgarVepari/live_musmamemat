import { useQuery } from '@tanstack/react-query';

// Products Query Hook
export const useProductsQuery = (filters: any = {}) => {
    return useQuery({
        queryKey: ['user', 'products', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, String(value));
                }
            });

            const response = await fetch(`/api/user/products?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            return data.products || data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

// Categories Query Hook
export const useCategoriesQuery = () => {
    return useQuery({
        queryKey: ['user', 'categories'],
        queryFn: async () => {
            const response = await fetch('/api/user/categories');

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            return data.categories || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

// Governorates Query Hook
export const useGovernoratesQuery = () => {
    return useQuery({
        queryKey: ['user', 'governorates'],
        queryFn: async () => {
            const response = await fetch('/api/user/governorates');

            if (!response.ok) {
                throw new Error('Failed to fetch governorates');
            }

            const data = await response.json();
            return data.governorates || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

// Conditions Query Hook
export const useConditionsQuery = () => {
    return useQuery({
        queryKey: ['user', 'conditions'],
        queryFn: async () => {
            const response = await fetch('/api/user/conditions');

            if (!response.ok) {
                throw new Error('Failed to fetch conditions');
            }

            const data = await response.json();
            return data.conditions || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

// Price Types Query Hook
export const usePriceTypesQuery = () => {
    return useQuery({
        queryKey: ['user', 'priceTypes'],
        queryFn: async () => {
            const response = await fetch('/api/user/price-types');

            if (!response.ok) {
                throw new Error('Failed to fetch price types');
            }

            const data = await response.json();
            return data.priceTypes || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });
};
