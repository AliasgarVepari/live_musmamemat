import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Input } from '@/components/admin/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Eye, 
    Filter, 
    MoreHorizontal, 
    Search, 
    Shield, 
    ShieldCheck, 
    ShieldX, 
    Trash2, 
    User, 
    UserCheck, 
    UserX 
} from 'lucide-react';

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
    const [search, setSearch] = useState(filters.search || '');
    const [subscriptionStatus, setSubscriptionStatus] = useState(filters.subscription_status || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [governorateId, setGovernorateId] = useState(filters.governorate_id || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || '5');

    useErrorHandler();

    // Auto-refresh when filters change (but not on initial load)
    useEffect(() => {
        // Skip the effect on initial load
        if (search === (filters.search || '') && 
            subscriptionStatus === (filters.subscription_status || 'all') && 
            status === (filters.status || 'all') && 
            governorateId === (filters.governorate_id || 'all') && 
            perPage === (filters.per_page || '20')) {
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get('/admin/users', {
                search,
                subscription_status: subscriptionStatus === 'all' ? '' : subscriptionStatus,
                status: status === 'all' ? '' : status,
                governorate_id: governorateId === 'all' ? '' : governorateId,
                per_page: perPage,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 300); // Debounce for 300ms

        return () => clearTimeout(timeoutId);
    }, [search, subscriptionStatus, status, governorateId, perPage]);


    const handleToggleStatus = (userId: number) => {
        router.patch(`/admin/users/${userId}/toggle`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
        });
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
                            <p className="text-muted-foreground">
                                Manage user accounts, subscriptions, and permissions
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                            <CardDescription>
                                Search and filter users by various criteria
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                                {/* Search */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search users..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Subscription Status */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subscription</label>
                                    <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
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
                                    <Select value={status} onValueChange={setStatus}>
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
                                    <Select value={governorateId} onValueChange={setGovernorateId}>
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
                                    <Select value={perPage} onValueChange={setPerPage}>
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
                        {users.data.map((user) => (
                            <Card key={user.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">
                                                        {user.name_en}
                                                    </h3>
                                                    {getStatusBadge(user.status)}
                                                    {getSubscriptionBadge(user)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                <p className="text-sm text-muted-foreground">{user.phone}</p>
                                                {user.governorate && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {user.governorate.name_en}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <div className="text-right text-sm text-muted-foreground">
                                                <div>{user.ads_count} ads</div>
                                                <div>{user.ad_views_count} views</div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <InertiaLink href={`/admin/users/${user.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </InertiaLink>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(user.id)}
                                                >
                                                    {user.status === 'active' ? (
                                                        <UserX className="h-4 w-4" />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4" />
                                                    )}
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

                    {/* Pagination - Bottom of page */}
                    {users.links && users.links.length > 0 && users.total && (
                        <div className="flex items-center justify-between px-4">
                            {/* Record Count Information */}
                            <div className="text-base text-gray-700 font-medium">
                                {users.from} - {users.to} of {users.total} users
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center space-x-3">
                                {/* Previous Arrow */}
                                <button
                                    onClick={() => users.links[0]?.url && router.get(users.links[0].url, {}, { preserveScroll: true })}
                                    disabled={!users.links[0]?.url}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                                        users.links[0]?.url 
                                            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center space-x-2">
                                    {users.links.slice(1, -1).map((link, index) => {
                                        // Skip "..." labels and show only actual page numbers
                                        if (link.label === '...') {
                                            return (
                                                <span key={index} className="px-3 text-gray-500 text-base">
                                                    ...
                                                </span>
                                            );
                                        }
                                        
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                                disabled={!link.url}
                                                className={`w-10 h-10 flex items-center justify-center rounded-full text-base font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-black text-white'
                                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                                }`}
                                            >
                                                {link.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next Arrow */}
                                <button
                                    onClick={() => users.links[users.links.length - 1]?.url && router.get(users.links[users.links.length - 1].url, {}, { preserveScroll: true })}
                                    disabled={!users.links[users.links.length - 1]?.url}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                                        users.links[users.links.length - 1]?.url 
                                            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
