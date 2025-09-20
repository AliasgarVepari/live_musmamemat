import { useQuery } from '@tanstack/react-query';

// Category interface
export interface Category {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    icon_url?: string;
    sort_order?: number;
    status: 'active' | 'inactive';
}

// Categories Query Hook
export const useCategoriesQuery = (homeOnly: boolean = false) => {
    return useQuery({
        queryKey: ['user', 'categories', homeOnly],
        queryFn: async (): Promise<Category[]> => {
            const params = new URLSearchParams();
            if (homeOnly) {
                params.append('home_only', 'true');
            }

            const response = await fetch(`/api/user/categories?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            return data.categories || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

// Home Categories Query Hook (sort_order 1-4)
export const useHomeCategoriesQuery = () => {
    return useCategoriesQuery(true);
};

// All Categories Query Hook
export const useAllCategoriesQuery = () => {
    return useCategoriesQuery(false);
};
