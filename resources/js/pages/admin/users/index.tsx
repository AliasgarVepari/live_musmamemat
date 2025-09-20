import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Input } from '@/components/admin/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { useCachedPagination } from '@/hooks/admin/use-cached-pagination';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, router } from '@inertiajs/react';
import { Eye, Filter, Search, Shield, ShieldCheck, ShieldX, Trash2, User, UserCheck, UserX } from 'lucide-react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
];

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

interface UsersIndexProps {
    users: {
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
    };
    governorates: Governorate[];
    filters: {
        search?: string;
        subscription_status?: string;
        status?: string;
        governorate_id?: string;
        per_page?: string;
    };
}

export default function UsersIndex({ users, governorates, filters }: UsersIndexProps) {
    useErrorHandler();

    // Use cached pagination hook
    const {
        data: cachedUsers,
        isLoading,
        paginationState,
        goToPage,
        setPerPage,
        setSearch,
        updateFilter,
    } = useCachedPagination<typeof users>({
        endpoint: '/admin/users',
        initialPage: users.current_page,
        initialPerPage: filters.per_page || '20',
        initialSearch: filters.search || '',
        initialFilters: {
            subscription_status: filters.subscription_status || 'all',
            status: filters.status || 'all',
            governorate_id: filters.governorate_id || 'all',
        },
    });

    // Use cached data if available, otherwise fall back to props
    const usersData = cachedUsers || users;

    // Show loading state if data is not available
    if (isLoading && !usersData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Users Management" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 overflow-x-auto rounded-xl p-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
                        <p className="text-muted-foreground">Loading users...</p>
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

    const handleToggleStatus = (userId: number) => {
        router.patch(
            `/admin/users/${userId}/toggle`,
            {},
            {
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    alert(`Error: ${errorMessage}`);
                },
            },
        );
    };

    const handleDelete = (userId: number) => {
        const reason = prompt('Please provide a reason for deleting this user account:');
        if (reason && reason.trim()) {
            router.delete(`/admin/users/${userId}`, {
                data: { deletion_reason: reason },
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    alert(`Error: ${errorMessage}`);
                },
            });
        }
    };

    const getStatusBadge = (userStatus: string) => {
        const statusConfig = {
            active: { variant: 'default' as const, icon: UserCheck, text: 'Active' },
            suspended: { variant: 'secondary' as const, icon: UserX, text: 'Suspended' },
            deleted: { variant: 'outline' as const, icon: Trash2, text: 'Deleted' },
        };

        const config = statusConfig[userStatus as keyof typeof statusConfig] || statusConfig.active;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.text}
            </Badge>
        );
    };

    const getSubscriptionBadge = (user: User) => {
        if (!user.subscription) {
            return <Badge variant="outline">No Subscription</Badge>;
        }

        const isExpired = new Date(user.subscription.expires_at) < new Date();
        const isActive = user.subscription.is_active && !isExpired;

        if (isActive) {
            return (
                <Badge variant="default" className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    {user.subscription.plan.name}
                </Badge>
            );
        } else if (isExpired) {
            return (
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Expired
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="flex items-center gap-1">
                    <ShieldX className="h-3 w-3" />
                    Inactive
                </Badge>
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Users Management" />

                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                            <p className="text-muted-foreground">Manage user accounts, subscriptions, and permissions</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                            <CardDescription>Search and filter users by various criteria</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                                {/* Search */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search</label>
                                    <div className="relative">
                                        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                        <Input
                                            placeholder="Search users..."
                                            value={paginationState.search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Subscription Status */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subscription</label>
                                    <Select
                                        value={paginationState.filters.subscription_status}
                                        onValueChange={(value) => updateFilter('subscription_status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All subscriptions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All subscriptions</SelectItem>
                                            <SelectItem value="subscribed">Subscribed</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Account Status */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={paginationState.filters.status} onValueChange={(value) => updateFilter('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                            <SelectItem value="deleted">Deleted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Governorate */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Governorate</label>
                                    <Select
                                        value={paginationState.filters.governorate_id}
                                        onValueChange={(value) => updateFilter('governorate_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All governorates" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All governorates</SelectItem>
                                            {governorates.map((governorate) => (
                                                <SelectItem key={governorate.id} value={governorate.id.toString()}>
                                                    {governorate.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Per Page */}
                                <div className="space-y-2">
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

                    {/* Users List */}
                    <div className="grid gap-4">
                        {usersData?.data?.map((user: User) => (
                            <Card key={user.id} className="transition-shadow hover:shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                                                <User className="text-primary h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{user.name_en}</h3>
                                                    {getStatusBadge(user.status)}
                                                    {getSubscriptionBadge(user)}
                                                </div>
                                                <p className="text-muted-foreground text-sm">{user.email}</p>
                                                <p className="text-muted-foreground text-sm">{user.phone}</p>
                                                {user.governorate && <p className="text-muted-foreground text-sm">{user.governorate.name_en}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <div className="text-muted-foreground text-right text-sm">
                                                <div>{user.ads_count} ads</div>
                                                <div>{user.ad_views_count} views</div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <InertiaLink href={`/admin/users/${user.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </InertiaLink>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user.id)}>
                                                    {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Empty State */}
                    {usersData?.data?.length === 0 && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Users className="mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No users found</h3>
                                <p className="text-center text-gray-500">
                                    {paginationState.search ||
                                    paginationState.filters.subscription_status !== 'all' ||
                                    paginationState.filters.status !== 'all' ||
                                    paginationState.filters.governorate_id !== 'all'
                                        ? 'No users match your current filters.'
                                        : 'No users have registered yet. Users will appear here once they sign up.'}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination - Bottom of page */}
                    {usersData?.data && usersData.data.length > 0 && (
                        <div className="flex items-center justify-between px-4">
                            {/* Record Count Information */}
                            <div className="text-base font-medium text-gray-700">
                                {usersData.from} - {usersData.to} of {usersData.total} users
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center space-x-3">
                                {/* Previous Arrow */}
                                <button
                                    onClick={() => goToPage(usersData.current_page - 1)}
                                    disabled={usersData.current_page <= 1}
                                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                                        usersData.current_page > 1
                                            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            : 'cursor-not-allowed text-gray-300'
                                    }`}
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center space-x-1">
                                    {(() => {
                                        const current = usersData.current_page;
                                        const last = usersData.last_page;
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
                                                <button
                                                    key={pageNum}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-medium transition-colors ${
                                                        isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>

                                {/* Next Arrow */}
                                <button
                                    onClick={() => goToPage(usersData.current_page + 1)}
                                    disabled={usersData.current_page >= usersData.last_page}
                                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                                        usersData.current_page < usersData.last_page
                                            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            : 'cursor-not-allowed text-gray-300'
                                    }`}
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </>
        </AppLayout>
    );
}
