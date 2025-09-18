import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { Badge } from '@/components/admin/ui/badge';
import { 
    DollarSign, 
    Search, 
    Filter, 
    Download, 
    TrendingUp,
    Users,
    CreditCard,
    Calendar
} from 'lucide-react';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';

interface Transaction {
    id: number;
    user: {
        name_en: string;
        email: string;
    };
    subscriptionPlan: {
        name_en: string;
    };
    status: 'active' | 'cancelled' | 'expired' | 'revoked';
    payment_method: string | null;
    amount_paid: number | string;
    payment_id: string | null;
    starts_at: string | null;
    expires_at: string | null;
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
    date_from?: string;
    date_to?: string;
    amount_min?: string;
    amount_max?: string;
}

interface Stats {
    total_revenue: number | string;
    total_transactions: number;
    active_subscriptions: number;
    monthly_revenue: number | string;
}

interface Props {
    transactions: TransactionsData;
    filters: Filters;
    stats: Stats;
}

export default function Index({ transactions, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [amountMin, setAmountMin] = useState(filters.amount_min || '');
    const [amountMax, setAmountMax] = useState(filters.amount_max || '');

    useErrorHandler();

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams();
            if (search && search.trim()) params.append('search', search);
            if (status && status !== 'all') params.append('status', status);
            if (paymentMethod && paymentMethod !== 'all') params.append('payment_method', paymentMethod);
            if (dateFrom && dateFrom.trim()) params.append('date_from', dateFrom);
            if (dateTo && dateTo.trim()) params.append('date_to', dateTo);
            if (amountMin && amountMin.trim()) params.append('amount_min', amountMin);
            if (amountMax && amountMax.trim()) params.append('amount_max', amountMax);

            router.get(`/admin/finance?${params.toString()}`, {}, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, status, paymentMethod, dateFrom, dateTo, amountMin, amountMax]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case 'cancelled':
                return <Badge className="bg-orange-100 text-orange-800">Cancelled</Badge>;
            case 'expired':
                return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
            case 'revoked':
                return <Badge className="bg-red-100 text-red-800">Revoked</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number | string) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `$${numericAmount.toFixed(2)}`;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams();
        if (search && search.trim()) params.append('search', search);
        if (status && status !== 'all') params.append('status', status);
        if (paymentMethod && paymentMethod !== 'all') params.append('payment_method', paymentMethod);
        if (dateFrom && dateFrom.trim()) params.append('date_from', dateFrom);
        if (dateTo && dateTo.trim()) params.append('date_to', dateTo);
        if (amountMin && amountMin.trim()) params.append('amount_min', amountMin);
        if (amountMax && amountMax.trim()) params.append('amount_max', amountMax);

        window.open(`/admin/finance/export?${params.toString()}`, '_blank');
    };

    return (
        <AppLayout>
            <Head title="Finance" />
            
            <div className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
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
                                <div className="p-2 bg-blue-100 rounded-lg">
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
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.active_subscriptions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="revoked">Revoked</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        placeholder="From"
                                    />
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        placeholder="To"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">Amount Range</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min Amount"
                                        value={amountMin}
                                        onChange={(e) => setAmountMin(e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max Amount"
                                        value={amountMax}
                                        onChange={(e) => setAmountMax(e.target.value)}
                                    />
                                </div>
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
                                        <th className="text-left py-3 px-4">Transaction ID</th>
                                        <th className="text-left py-3 px-4">User</th>
                                        <th className="text-left py-3 px-4">Plan</th>
                                        <th className="text-left py-3 px-4">Status</th>
                                        <th className="text-left py-3 px-4">Payment Method</th>
                                        <th className="text-left py-3 px-4">Amount</th>
                                        <th className="text-left py-3 px-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map((transaction) => (
                                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-mono text-sm">#{transaction.id}</td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="font-medium">{transaction.user.name_en}</div>
                                                    <div className="text-sm text-gray-500">{transaction.user.email}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">{transaction.subscriptionPlan.name_en}</td>
                                            <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                                            <td className="py-3 px-4">{transaction.payment_method || 'N/A'}</td>
                                            <td className="py-3 px-4 font-medium">{formatCurrency(transaction.amount_paid)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {formatDate(transaction.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {transactions.data.length === 0 && (
                            <div className="text-center py-12">
                                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                                <p className="text-gray-500">
                                    {search || status !== 'all' || paymentMethod !== 'all' || dateFrom || dateTo || amountMin || amountMax
                                        ? 'No transactions match your current filters.'
                                        : 'No transactions have been recorded yet.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {transactions.from} to {transactions.to} of {transactions.total} results
                        </div>
                        <div className="flex items-center gap-2">
                            {transactions.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (search && search.trim()) params.append('search', search);
                                        if (status && status !== 'all') params.append('status', status);
                                        if (paymentMethod && paymentMethod !== 'all') params.append('payment_method', paymentMethod);
                                        if (dateFrom && dateFrom.trim()) params.append('date_from', dateFrom);
                                        if (dateTo && dateTo.trim()) params.append('date_to', dateTo);
                                        if (amountMin && amountMin.trim()) params.append('amount_min', amountMin);
                                        if (amountMax && amountMax.trim()) params.append('amount_max', amountMax);
                                        params.append('page', (transactions.current_page - 1).toString());

                                        router.get(`/admin/finance?${params.toString()}`, {}, { preserveScroll: true });
                                    }}
                                >
                                    Previous
                                </Button>
                            )}
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: transactions.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === transactions.current_page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            const params = new URLSearchParams();
                                            if (search && search.trim()) params.append('search', search);
                                            if (status && status !== 'all') params.append('status', status);
                                            if (paymentMethod && paymentMethod !== 'all') params.append('payment_method', paymentMethod);
                                            if (dateFrom && dateFrom.trim()) params.append('date_from', dateFrom);
                                            if (dateTo && dateTo.trim()) params.append('date_to', dateTo);
                                            if (amountMin && amountMin.trim()) params.append('amount_min', amountMin);
                                            if (amountMax && amountMax.trim()) params.append('amount_max', amountMax);
                                            params.append('page', page.toString());

                                            router.get(`/admin/finance?${params.toString()}`, {}, { preserveScroll: true });
                                        }}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            {transactions.current_page < transactions.last_page && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (search && search.trim()) params.append('search', search);
                                        if (status && status !== 'all') params.append('status', status);
                                        if (paymentMethod && paymentMethod !== 'all') params.append('payment_method', paymentMethod);
                                        if (dateFrom && dateFrom.trim()) params.append('date_from', dateFrom);
                                        if (dateTo && dateTo.trim()) params.append('date_to', dateTo);
                                        if (amountMin && amountMin.trim()) params.append('amount_min', amountMin);
                                        if (amountMax && amountMax.trim()) params.append('amount_max', amountMax);
                                        params.append('page', (transactions.current_page + 1).toString());

                                        router.get(`/admin/finance?${params.toString()}`, {}, { preserveScroll: true });
                                    }}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
