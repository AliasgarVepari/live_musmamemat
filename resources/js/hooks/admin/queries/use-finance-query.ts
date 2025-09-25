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
    try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });
        
        const queryString = queryParams.toString();
        const url = `/admin/finance${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        return {
            transactions: data.transactions as TransactionsResponse,
            stats: data.stats as FinanceStats,
        };
    } catch (error) {
        console.error('Error fetching finance data:', error);
        throw error;
    }
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
