import { router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';

interface Ad {
    id: number;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    price: number | string;
    status: 'draft' | 'active' | 'inactive' | 'expired' | 'sold' | 'delete';
    is_featured: boolean;
    is_negotiable: boolean;
    is_approved: boolean | null;
    reject_reason?: string | null;
    views_count: number;
    contact_count: number;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name_en: string;
        name_ar: string;
        email: string;
        phone: string;
    };
    category: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    priceType?: {
        id: number;
        name_en: string;
        name_ar: string;
    } | null;
    condition?: {
        id: number;
        name_en: string;
        name_ar: string;
    } | null;
    governorate?: {
        id: number;
        name_en: string;
        name_ar: string;
    } | null;
    primaryImage?: {
        id: number;
        url: string;
        is_primary: boolean;
    };
}

interface AdsResponse {
    data: Ad[];
    links: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
}

interface Category {
    id: number;
    name_en: string;
    name_ar: string;
}

interface Governorate {
    id: number;
    name_en: string;
    name_ar: string;
}

interface PriceType {
    id: number;
    name_en: string;
    name_ar: string;
}

interface Condition {
    id: number;
    name_en: string;
    name_ar: string;
}

interface AdsFilters {
    search?: string;
    status?: string;
    category_id?: string;
    governorate_id?: string;
    price_type_id?: string;
    condition_id?: string;
    is_featured?: string;
    is_approved?: string;
    is_negotiable?: string;
    min_price?: string;
    max_price?: string;
    per_page?: string;
    page?: number;
}

const fetchAds = async (filters: AdsFilters = {}): Promise<AdsResponse> => {
    return new Promise((resolve, reject) => {
        router.get('/admin/ads', filters, {
            preserveState: true,
            replace: true,
            onSuccess: (page) => {
                resolve(page.props.ads as AdsResponse);
            },
            onError: (errors) => {
                reject(new Error(Object.values(errors).flat().join(', ')));
            },
        });
    });
};

export const useAdsQuery = (filters: AdsFilters = {}) => {
    return useQuery({
        queryKey: ['admin', 'ads', filters],
        queryFn: () => fetchAds(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes - ads change frequently
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
        retry: 2,
    });
};

// Hook for categories
const fetchCategories = async (): Promise<Category[]> => {
    return new Promise((resolve, reject) => {
        router.get(
            '/admin/ads',
            {},
            {
                preserveState: true,
                onSuccess: (page) => {
                    resolve(page.props.categories as Category[]);
                },
                onError: (errors) => {
                    reject(new Error(Object.values(errors).flat().join(', ')));
                },
            },
        );
    });
};

export const useCategoriesQuery = () => {
    return useQuery({
        queryKey: ['admin', 'categories'],
        queryFn: fetchCategories,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
    });
};

// Hook for price types
const fetchPriceTypes = async (): Promise<PriceType[]> => {
    return new Promise((resolve, reject) => {
        router.get(
            '/admin/ads',
            {},
            {
                preserveState: true,
                onSuccess: (page) => {
                    resolve(page.props.priceTypes as PriceType[]);
                },
                onError: (errors) => {
                    reject(new Error(Object.values(errors).flat().join(', ')));
                },
            },
        );
    });
};

export const usePriceTypesQuery = () => {
    return useQuery({
        queryKey: ['admin', 'priceTypes'],
        queryFn: fetchPriceTypes,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
    });
};

// Hook for conditions
const fetchConditions = async (): Promise<Condition[]> => {
    return new Promise((resolve, reject) => {
        router.get(
            '/admin/ads',
            {},
            {
                preserveState: true,
                onSuccess: (page) => {
                    resolve(page.props.conditions as Condition[]);
                },
                onError: (errors) => {
                    reject(new Error(Object.values(errors).flat().join(', ')));
                },
            },
        );
    });
};

export const useConditionsQuery = () => {
    return useQuery({
        queryKey: ['admin', 'conditions'],
        queryFn: fetchConditions,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
    });
};
