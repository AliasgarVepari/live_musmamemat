import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, router, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Calendar, 
    Eye, 
    MapPin, 
    Phone, 
    Shield, 
    ShieldCheck, 
    ShieldX, 
    Trash2, 
    User, 
    UserCheck, 
    UserX 
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'User Details',
        href: '/admin/users/details',
    },
];

interface Governorate {
    id: number;
    name_en: string;
    name_ar: string;
}

interface SubscriptionPlan {
    id: number;
    name: string;
    price: number;
}

interface UserSubscription {
    id: number;
    is_active: boolean;
    expires_at: string;
    created_at: string;
    revoked_at?: string;
    revocation_reason?: string;
    plan: SubscriptionPlan;
}

interface Ad {
    id: number;
    title: string;
    description: string;
    price: number;
    status: string;
    created_at: string;
    category?: {
        name_en: string;
    };
    condition?: {
        name_en: string;
    };
    priceType?: {
        name_en: string;
    };
}

interface AdView {
    id: number;
    created_at: string;
    ad?: {
        id: number;
        title: string;
    };
}

interface User {
    id: number;
    name_en: string;
    name_ar: string;
    email: string;
    phone: string;
    status: 'active' | 'suspended' | 'deleted';
    created_at: string;
    suspension_reason?: string;
    deletion_reason?: string;
    governorate?: Governorate;
    subscription?: UserSubscription;
    ads?: Ad[];
    adViews?: AdView[];
}

interface UserShowProps {
    user: User;
    subscriptionHistory: UserSubscription[];
    totalAds: number;
    totalViews: number;
    activeAds: number;
}

export default function UserShow({ user, subscriptionHistory, totalAds, totalViews, activeAds }: UserShowProps) {
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useErrorHandler();

    const { data: revokeData, setData: setRevokeData, post: revokePost, processing: revokeProcessing } = useForm({
        revocation_reason: '',
    });

    const { data: deleteData, setData: setDeleteData, delete: deleteUser, processing: deleteProcessing } = useForm({
        deletion_reason: '',
    });


    const handleRevokeSubscription = (e: React.FormEvent) => {
        e.preventDefault();
        revokePost(`/admin/users/${user.id}/revoke-subscription`, {
            onSuccess: () => {
                setShowRevokeModal(false);
                setRevokeData('revocation_reason', '');
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
        });
    };

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        deleteUser(`/admin/users/${user.id}`, {
            onSuccess: () => {
                router.visit('/admin/users');
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
        });
    };

    const handleToggleStatus = () => {
        router.patch(`/admin/users/${user.id}/toggle`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
        });
    };

    const handleReactivate = () => {
        if (confirm('Are you sure you want to reactivate this user account?')) {
            router.post(`/admin/users/${user.id}/reactivate`, {}, {
                onSuccess: () => {
                    alert('User account reactivated successfully!');
                },
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
            banned: { variant: 'destructive' as const, icon: ShieldX, text: 'Banned' },
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

    const getSubscriptionBadge = () => {
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
                <Head title={`User Details - ${user.name_en}`} />

                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" asChild>
                                <InertiaLink href="/admin/users">
                                    <ArrowLeft className="h-4 w-4" />
                                </InertiaLink>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {user.name_en}
                                </h1>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusBadge(user.status)}
                            {getSubscriptionBadge()}
                            {user.status === 'deleted' ? (
                                <Button
                                    variant="outline"
                                    onClick={handleReactivate}
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Reactivate
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleToggleStatus}
                                    >
                                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Profile Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Profile Information
                                        </CardTitle>
                                        <CardDescription>
                                            User's personal and contact details
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">English Name</p>
                                                <p className="text-sm">{user.name_en}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Arabic Name</p>
                                                <p className="text-sm">{user.name_ar}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                                <p className="text-sm">{user.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                                <p className="text-sm">{user.phone}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Governorate</p>
                                                <p className="text-sm">{user.governorate?.name_en || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                                                <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {user.suspension_reason && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Suspension Reason</p>
                                                <p className="text-sm">{user.suspension_reason}</p>
                                            </div>
                                        )}
                                        {user.deletion_reason && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Deletion Reason</p>
                                                <p className="text-sm">{user.deletion_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Subscription Information */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="h-5 w-5" />
                                                Subscription Information
                                            </CardTitle>
                                            <CardDescription>
                                                Current subscription status and history
                                            </CardDescription>
                                        </div>
                                        {user.subscription && user.subscription.is_active && (
                                            <Button
                                                variant="destructive"
                                                onClick={() => setShowRevokeModal(true)}
                                            >
                                                Revoke Subscription
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {user.subscription ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                                                    <p className="text-sm">{user.subscription.plan.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                                    {getSubscriptionBadge()}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Expires At</p>
                                                    <p className="text-sm">{new Date(user.subscription.expires_at).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                                    <p className="text-sm">{new Date(user.subscription.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {user.subscription.revocation_reason && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Revocation Reason</p>
                                                    <p className="text-sm">{user.subscription.revocation_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No active subscription</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Ads */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Recent Ads ({totalAds} total)
                                    </CardTitle>
                                    <CardDescription>
                                        User's recently posted advertisements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {(user.ads || []).length > 0 ? (
                                        <div className="space-y-3">
                                            {(user.ads || []).map((ad) => (
                                                <div key={ad.id} className="border rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-medium">{ad.title}</h4>
                                                            <p className="text-sm text-muted-foreground">{ad.description}</p>
                                                        </div>
                                                        <div className="text-right text-sm text-muted-foreground">
                                                            <p>{ad.price} {ad.priceType?.name_en || 'N/A'}</p>
                                                            <p>{ad.category?.name_en || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No ads posted yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stats Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Statistics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Total Ads</span>
                                        <span className="text-2xl font-bold">{totalAds}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Active Ads</span>
                                        <span className="text-2xl font-bold">{activeAds}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Total Views</span>
                                        <span className="text-2xl font-bold">{totalViews}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {(user.adViews || []).slice(0, 5).map((view) => (
                                            <div key={view.id} className="flex items-center space-x-2 text-sm">
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                <span>Viewed "{view.ad?.title || 'Unknown Ad'}"</span>
                                                <span className="text-muted-foreground">
                                                    {new Date(view.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Revoke Subscription Modal */}
                    {showRevokeModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <Card className="w-full max-w-md">
                                <CardHeader>
                                    <CardTitle>Revoke Subscription</CardTitle>
                                    <CardDescription>
                                        This will immediately revoke the user's subscription
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleRevokeSubscription} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="revocation_reason">Reason for revocation</Label>
                                            <Textarea
                                                id="revocation_reason"
                                                value={revokeData.revocation_reason}
                                                onChange={(e) => setRevokeData('revocation_reason', e.target.value)}
                                                placeholder="Provide reason for revoking subscription"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowRevokeModal(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="destructive" disabled={revokeProcessing}>
                                                {revokeProcessing ? 'Revoking...' : 'Revoke Subscription'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Delete User Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <Card className="w-full max-w-md">
                                <CardHeader>
                                    <CardTitle>Delete User Account</CardTitle>
                                    <CardDescription>
                                        This will permanently delete the user's account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleDelete} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="deletion_reason">Reason for deletion</Label>
                                            <Textarea
                                                id="deletion_reason"
                                                value={deleteData.deletion_reason}
                                                onChange={(e) => setDeleteData('deletion_reason', e.target.value)}
                                                placeholder="Provide reason for deleting account"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowDeleteModal(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="destructive" disabled={deleteProcessing}>
                                                {deleteProcessing ? 'Deleting...' : 'Delete Account'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </>
        </AppLayout>
    );
}
