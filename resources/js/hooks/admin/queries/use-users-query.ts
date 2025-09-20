import { router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';

interface Governorate {
    id: number;
    name_en: string;
    name_ar: string;
}

interface User {
    id: number;
    name_en: string;
    name_ar: string;
    email: string;
    phone: string;
    status: 'active' | 'suspended' | 'deleted';
    created_at: string;
    governorate?: Governorate;
    subscription?: {
        id: number;
        is_active: boolean;
        expires_at: string;
        plan: {
            name: string;
        };
    };
    ads_count: number;
    ad_views_count: number;
}

interface UsersResponse {
    data: User[];
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

interface UsersFilters {
    search?: string;
    subscription_status?: string;
    status?: string;
    governorate_id?: string;
    per_page?: string;
    page?: number;
}

const fetchUsers = async (filters: UsersFilters = {}): Promise<UsersResponse> => {
    return new Promise((resolve, reject) => {
        router.get('/admin/users', filters, {
            preserveState: true,
            replace: true,
            onSuccess: (page) => {
                resolve(page.props.users as UsersResponse);
            },
            onError: (errors) => {
                reject(new Error(Object.values(errors).flat().join(', ')));
            },
        });
    });
};

export const useUsersQuery = (filters: UsersFilters = {}) => {
    return useQuery({
        queryKey: ['admin', 'users', filters],
        queryFn: () => fetchUsers(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    });
};

// Hook for governorates (used in filters)
const fetchGovernorate = async (): Promise<Governorate[]> => {
    return new Promise((resolve, reject) => {
        router.get(
            '/admin/users',
            {},
            {
                preserveState: true,
                onSuccess: (page) => {
                    resolve(page.props.governorates as Governorate[]);
                },
                onError: (errors) => {
                    reject(new Error(Object.values(errors).flat().join(', ')));
                },
            },
        );
    });
};

export const useGovernoratesQuery = () => {
    return useQuery({
        queryKey: ['admin', 'governorates'],
        queryFn: fetchGovernorate,
        staleTime: 30 * 60 * 1000, // 30 minutes - governorates don't change often
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
    });
};
