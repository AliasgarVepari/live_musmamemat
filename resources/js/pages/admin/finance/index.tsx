import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Input } from '@/components/admin/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { useCachedPagination } from '@/hooks/admin/use-cached-pagination';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CreditCard, DollarSign, Download, Filter, Search, TrendingUp, Users } from 'lucide-react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Finance',
        href: '/admin/finance',
    },
];

interface Transaction {
    id: number;
    transaction_id: string;
    user: {
        name_en: string;
        name_ar: string;
        email: string;
    };
    subscriptionPlan?: {
        name_en: string;
        name_ar: string;
    } | null;
    type: 'subscription' | 'upgrade' | 'renewal';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    payment_method: string | null;
    payment_gateway: string | null;
    amount: number | string;
    currency: string;
    description: string | null;
    metadata: Record<string, any> | null;
    processed_at: string | null;
    created_at: string;
}

interface TransactionsData {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    search?: string;
    status?: string;
    payment_method?: string;
    type?: string;
    date_from?: string;
    date_to?: string;
    amount_min?: string;
    amount_max?: string;
    per_page?: string;
}

interface Stats {
    total_revenue: number | string;
    total_transactions: number;
    completed_transactions: number;
    monthly_revenue: number | string;
}

interface Props {
    transactions: TransactionsData;
    filters: Filters;
    stats: Stats;
}

export default function Index({ transactions, filters, stats }: Props) {
    useErrorHandler();

    // Use cached pagination hook
    const {
        data: cachedTransactions,
        isLoading,
        paginationState,
        goToPage,
        setPerPage,
        setSearch,
        updateFilter,
        refetch: refetchListing,
    } = useCachedPagination<typeof transactions>({
        endpoint: '/admin/finance',
        dataKey: 'transactions',
        initialPage: transactions.current_page,
        initialPerPage: filters.per_page || '10',
        initialSearch: filters.search || '',
        initialFilters: {
            status: filters.status || 'all',
            payment_method: filters.payment_method || 'all',
            type: filters.type || 'all',
            date_from: filters.date_from || '',
            date_to: filters.date_to || '',
            amount_min: filters.amount_min || '',
            amount_max: filters.amount_max || '',
        },
    });

    // Use cached data if available, otherwise fall back to props
    const transactionsData = cachedTransactions || transactions;

    // Show loading state if data is not available
    if (isLoading && !transactionsData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Finance Management" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 overflow-x-auto rounded-xl p-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
                        <p className="text-muted-foreground">Loading transactions...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearch(paginationState.search);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [paginationState.search, setSearch]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
            case 'refunded':
                return <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'subscription':
                return <Badge className="bg-blue-100 text-blue-800">Subscription</Badge>;
            case 'upgrade':
                return <Badge className="bg-purple-100 text-purple-800">Upgrade</Badge>;
            case 'renewal':
                return <Badge className="bg-green-100 text-green-800">Renewal</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const formatCurrency = (amount: number | string) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `${numericAmount.toFixed(2)} KWD`;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams();
        if (paginationState.search && paginationState.search.trim()) params.append('search', paginationState.search);
        if (paginationState.filters.status && paginationState.filters.status !== 'all') params.append('status', paginationState.filters.status);
        if (paginationState.filters.payment_method && paginationState.filters.payment_method !== 'all')
            params.append('payment_method', paginationState.filters.payment_method);
        if (paginationState.filters.date_from && paginationState.filters.date_from.trim())
            params.append('date_from', paginationState.filters.date_from);
        if (paginationState.filters.date_to && paginationState.filters.date_to.trim()) params.append('date_to', paginationState.filters.date_to);
        if (paginationState.filters.amount_min && paginationState.filters.amount_min.trim())
            params.append('amount_min', paginationState.filters.amount_min);
        if (paginationState.filters.amount_max && paginationState.filters.amount_max.trim())
            params.append('amount_max', paginationState.filters.amount_max);
        if (paginationState.perPage) params.append('per_page', paginationState.perPage);

        window.open(`/admin/finance/export?${params.toString()}`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Finance" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
                        <p className="text-gray-600">View and manage all financial transactions</p>
                    </div>
                    <Button onClick={handleExportCsv}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <CreditCard className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_transactions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed Transactions</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.completed_transactions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-orange-100 p-2">
                                    <TrendingUp className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthly_revenue)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        placeholder="Search users..."
                                        value={paginationState.search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select value={paginationState.filters.status} onValueChange={(value) => updateFilter('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <Select value={paginationState.filters.type} onValueChange={(value) => updateFilter('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="subscription">Subscription</SelectItem>
                                        <SelectItem value="upgrade">Upgrade</SelectItem>
                                        <SelectItem value="renewal">Renewal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select
                                    value={paginationState.filters.payment_method}
                                    onValueChange={(value) => updateFilter('payment_method', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Methods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Methods</SelectItem>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Date Range</label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">From</label>
                                        <Input
                                            type="date"
                                            value={paginationState.filters.date_from}
                                            onChange={(e) => updateFilter('date_from', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">To</label>
                                        <Input
                                            type="date"
                                            value={paginationState.filters.date_to}
                                            onChange={(e) => updateFilter('date_to', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="text-sm font-medium">Amount Range</label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Min Amount</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={paginationState.filters.amount_min}
                                            onChange={(e) => updateFilter('amount_min', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Max Amount</label>
                                        <Input
                                            type="number"
                                            placeholder="1000.00"
                                            value={paginationState.filters.amount_max}
                                            onChange={(e) => updateFilter('amount_max', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Records per page</label>
                                <Select value={paginationState.perPage} onValueChange={setPerPage}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Records per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left">Transaction ID</th>
                                        <th className="px-4 py-3 text-left">User</th>
                                        <th className="px-4 py-3 text-left">Type</th>
                                        <th className="px-4 py-3 text-left">Plan</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Payment Method</th>
                                        <th className="px-4 py-3 text-left">Amount</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionsData?.data?.map((transaction: Transaction) => (
                                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-sm">
                                                <div className="font-medium">#{transaction.id}</div>
                                                <div className="text-xs text-gray-500">{transaction.transaction_id}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium">{transaction.user.name_en}</div>
                                                    <div className="text-sm text-gray-500">{transaction.user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{getTypeBadge(transaction.type)}</td>
                                            <td className="px-4 py-3">{transaction.subscriptionPlan?.name_en || 'N/A'}</td>
                                            <td className="px-4 py-3">{getStatusBadge(transaction.status)}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">{transaction.payment_method || 'N/A'}</div>
                                                {transaction.payment_gateway && (
                                                    <div className="text-xs text-gray-500">{transaction.payment_gateway}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium">{formatCurrency(transaction.amount)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                <div>{formatDate(transaction.created_at)}</div>
                                                {transaction.processed_at && (
                                                    <div className="text-xs text-gray-400">
                                                        Processed: {formatDate(transaction.processed_at)}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {transactionsData?.data?.length === 0 && (
                            <div className="py-12 text-center">
                                <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No transactions found</h3>
                                <p className="text-gray-500">
                                    {paginationState.search ||
                                    paginationState.filters.status !== 'all' ||
                                    paginationState.filters.payment_method !== 'all' ||
                                    paginationState.filters.type !== 'all' ||
                                    paginationState.filters.date_from ||
                                    paginationState.filters.date_to ||
                                    paginationState.filters.amount_min ||
                                    paginationState.filters.amount_max
                                        ? 'No transactions match your current filters.'
                                        : 'No transactions have been recorded yet.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {transactionsData?.last_page && transactionsData.last_page >= 1 ? (
                    <div className="flex items-center justify-between px-4">
                        <div className="text-sm text-gray-700">
                            Showing {transactionsData.from} - {transactionsData.to} of {transactionsData.total} transactions
                        </div>
                        <div className="flex items-center space-x-2">
                            {transactionsData.last_page > 1 && (
                                <>
                                    {/* Previous Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(transactionsData.current_page - 1)}
                                        disabled={transactionsData.current_page <= 1}
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </Button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center space-x-1">
                                        {(() => {
                                            const current = transactionsData.current_page;
                                            const last = transactionsData.last_page;
                                            const delta = 2; // Number of pages to show on each side of current page
                                            const range = [];
                                            const rangeWithDots = [];

                                            // Calculate the range of pages to show
                                            for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
                                                range.push(i);
                                            }

                                            // Always show first page
                                            if (current - delta > 2) {
                                                rangeWithDots.push(1, '...');
                                            } else {
                                                rangeWithDots.push(1);
                                            }

                                            // Add the calculated range (excluding first and last)
                                            rangeWithDots.push(...range);

                                            // Always show last page (if it's not already included)
                                            if (last > 1) {
                                                if (current + delta < last - 1) {
                                                    rangeWithDots.push('...', last);
                                                } else if (!range.includes(last)) {
                                                    rangeWithDots.push(last);
                                                }
                                            }

                                            return rangeWithDots.map((page, index) => {
                                                if (page === '...') {
                                                    return (
                                                        <span key={`dots-${index}`} className="text-muted-foreground px-2">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                const pageNum = page as number;
                                                const isActive = pageNum === current;

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={isActive ? 'default' : 'outline'}
                                                        size="sm"
                                                        className={`h-10 w-10 ${isActive ? 'bg-black text-white hover:bg-black' : ''}`}
                                                        onClick={() => goToPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            });
                                        })()}
                                    </div>

                                    {/* Next Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(transactionsData.current_page + 1)}
                                        disabled={transactionsData.current_page >= transactionsData.last_page}
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between px-4">
                        <div className="text-sm text-gray-700">
                            Showing {transactions.from} - {transactions.to} of {transactions.total} transactions
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
