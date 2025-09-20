import { router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';

interface Transaction {
    id: number;
    user: {
        name_en: string;
        email: string;
    };
    subscriptionPlan?: {
        name_en: string;
    } | null;
    status: 'active' | 'cancelled' | 'expired' | 'revoked';
    payment_method: string | null;
    amount_paid: number | string;
    payment_id: string | null;
    starts_at: string | null;
    expires_at: string | null;
    created_at: string;
}

interface TransactionsResponse {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface FinanceStats {
    total_revenue: number | string;
    total_transactions: number;
    active_subscriptions: number;
    monthly_revenue: number | string;
}

interface FinanceFilters {
    search?: string;
    status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    amount_min?: string;
    amount_max?: string;
    per_page?: string;
    page?: number;
}

interface FinanceData {
    transactions: TransactionsResponse;
    stats: FinanceStats;
}

const fetchFinanceData = async (filters: FinanceFilters = {}): Promise<FinanceData> => {
    return new Promise((resolve, reject) => {
        router.get('/admin/finance', filters, {
            preserveState: true,
            replace: true,
            onSuccess: (page) => {
                resolve({
                    transactions: page.props.transactions as TransactionsResponse,
                    stats: page.props.stats as FinanceStats,
                });
            },
            onError: (errors) => {
                reject(new Error(Object.values(errors).flat().join(', ')));
            },
        });
    });
};

export const useFinanceQuery = (filters: FinanceFilters = {}) => {
    return useQuery({
        queryKey: ['admin', 'finance', filters],
        queryFn: () => fetchFinanceData(filters),
        staleTime: 1 * 60 * 1000, // 1 minute - financial data should be fresh
        gcTime: 3 * 60 * 1000, // 3 minutes
        refetchOnWindowFocus: true,
        retry: 3, // More retries for financial data
    });
};

// Hook for finance stats only (can be used separately)
export const useFinanceStatsQuery = () => {
    return useQuery({
        queryKey: ['admin', 'finance', 'stats'],
        queryFn: async () => {
            const data = await fetchFinanceData();
            return data.stats;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
    });
};
