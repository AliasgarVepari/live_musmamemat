import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/admin/ui/dialog';
import { Label } from '@/components/admin/ui/label';
import { Textarea } from '@/components/admin/ui/textarea';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    DollarSign,
    Eye,
    Image as ImageIcon,
    MapPin,
    Shield,
    ShieldCheck,
    ShieldX,
    ShoppingCart,
    ToggleLeft,
    ToggleRight,
    Trash2,
    User,
    UserCheck,
    UserX,
    X,
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
    category: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    condition?: {
        id: number;
        name_en: string;
        name_ar: string;
    } | null;
    priceType?: {
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
    totalAds: number;
    totalViews: number;
    activeAds: number;
}

export default function UserShow({ user, totalAds, totalViews, activeAds }: UserShowProps) {
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Ad action states
    const [deletingAd, setDeletingAd] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isInactiveDialogOpen, setIsInactiveDialogOpen] = useState(false);
    const [rejectingAd, setRejectingAd] = useState<number | null>(null);
    const [inactivatingAd, setInactivatingAd] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [inactiveReason, setInactiveReason] = useState('');
    const [deleteReason, setDeleteReason] = useState('');

    useErrorHandler();

    const {
        data: revokeData,
        setData: setRevokeData,
        post: revokePost,
        processing: revokeProcessing,
    } = useForm({
        revocation_reason: '',
    });

    const {
        data: deleteData,
        setData: setDeleteData,
        delete: deleteUser,
        processing: deleteProcessing,
    } = useForm({
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

    const handleDeleteUser = (e: React.FormEvent) => {
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
        router.patch(
            `/admin/users/${user.id}/toggle`,
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

    const handleReactivate = () => {
        if (confirm('Are you sure you want to reactivate this user account?')) {
            router.post(
                `/admin/users/${user.id}/reactivate`,
                {},
                {
                    onSuccess: () => {
                        alert('User account reactivated successfully!');
                    },
                    onError: (errors) => {
                        const errorMessages = Object.values(errors).flat();
                        const errorMessage = errorMessages.join(', ');
                        alert(`Error: ${errorMessage}`);
                    },
                },
            );
        }
    };

    // Ad action handlers
    const handleToggleAdStatus = (adId: number) => {
        const ad = user.ads?.find((a) => a.id === adId);
        if (ad && ad.status === 'active') {
            // If ad is active and we're toggling to inactive, show reason dialog
            setInactivatingAd(adId);
            setIsInactiveDialogOpen(true);
        } else {
            // For other statuses, directly toggle
            router.patch(
                `/admin/ads/${adId}/toggle-status`,
                {},
                {
                    onError: (errors) => {
                        const errorMessages = Object.values(errors).flat();
                        const errorMessage = errorMessages.join(', ');
                        alert(`Error: ${errorMessage}`);
                    },
                    preserveScroll: true,
                },
            );
        }
    };

    const handleApprove = (adId: number) => {
        router.patch(
            `/admin/ads/${adId}/approve`,
            {},
            {
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    alert(`Error: ${errorMessage}`);
                },
                preserveScroll: true,
            },
        );
    };

    const handleReject = (adId: number) => {
        setRejectingAd(adId);
        setIsRejectDialogOpen(true);
    };

    const confirmReject = () => {
        if (rejectingAd && rejectReason.trim()) {
            router.post(
                `/admin/ads/${rejectingAd}/reject`,
                {
                    reject_reason: rejectReason,
                },
                {
                    onSuccess: () => {
                        setIsRejectDialogOpen(false);
                        setRejectingAd(null);
                        setRejectReason('');
                    },
                    onError: (errors) => {
                        const errorMessages = Object.values(errors).flat();
                        const errorMessage = errorMessages.join(', ');
                        alert(`Error: ${errorMessage}`);
                    },
                    preserveScroll: true,
                },
            );
        }
    };

    const handleMarkAsSold = (adId: number) => {
        router.patch(
            `/admin/ads/${adId}/mark-sold`,
            {},
            {
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    alert(`Error: ${errorMessage}`);
                },
                preserveScroll: true,
            },
        );
    };

    const handleMarkAsExpired = (adId: number) => {
        router.patch(
            `/admin/ads/${adId}/mark-expired`,
            {},
            {
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    alert(`Error: ${errorMessage}`);
                },
                preserveScroll: true,
            },
        );
    };

    const handleDeleteAd = (adId: number) => {
        setDeletingAd(adId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteReason.trim()) {
            alert('Please provide a reason for deletion.');
            return;
        }

        if (deletingAd) {
            router.post(
                `/admin/ads/${deletingAd}/delete`,
                {
                    delete_reason: deleteReason,
                },
                {
                    onSuccess: () => {
                        setIsDeleteDialogOpen(false);
                        setDeletingAd(null);
                        setDeleteReason('');
                    },
                    onError: (errors) => {
                        const errorMessages = Object.values(errors).flat();
                        const errorMessage = errorMessages.join(', ');
                        alert(`Error: ${errorMessage}`);
                    },
                    preserveScroll: true,
                },
            );
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setDeletingAd(null);
        setDeleteReason('');
    };

    const confirmInactive = () => {
        if (!inactiveReason.trim()) {
            alert('Please provide a reason for marking as inactive.');
            return;
        }

        if (inactivatingAd) {
            router.post(
                `/admin/ads/${inactivatingAd}/mark-inactive`,
                {
                    inactive_reason: inactiveReason,
                },
                {
                    onSuccess: () => {
                        setIsInactiveDialogOpen(false);
                        setInactivatingAd(null);
                        setInactiveReason('');
                    },
                    onError: (errors) => {
                        const errorMessages = Object.values(errors).flat();
                        const errorMessage = errorMessages.join(', ');
                        alert(`Error: ${errorMessage}`);
                    },
                    preserveScroll: true,
                },
            );
        }
    };

    const handleCancelInactive = () => {
        setIsInactiveDialogOpen(false);
        setInactivatingAd(null);
        setInactiveReason('');
    };

    const handleCancelReject = () => {
        setIsRejectDialogOpen(false);
        setRejectingAd(null);
        setRejectReason('');
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

    // Ad helper functions
    const getAdStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge className="bg-orange-100 text-orange-800">Inactive</Badge>;
            case 'expired':
                return <Badge className="bg-yellow-100 text-yellow-800">Expired</Badge>;
            case 'sold':
                return <Badge className="bg-blue-100 text-blue-800">Sold</Badge>;
            case 'delete':
                return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatPrice = (price: number | string, priceType?: string | null) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        const priceTypeText = priceType || 'Fixed';
        return `$${numericPrice.toFixed(2)} ${priceTypeText}`;
    };

    const getApprovalBadge = (ad: Ad) => {
        if (ad.is_approved === true) {
            return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
        } else if (ad.is_approved === false) {
            return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
        } else {
            return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
        }
    };

    // Helper functions to determine available actions
    const canApprove = (ad: Ad) => {
        return ad.is_approved === null || ad.is_approved === false;
    };

    const canReject = (ad: Ad) => {
        return ad.is_approved === null;
    };

    const canToggleStatus = (ad: Ad) => {
        return !['draft', 'sold'].includes(ad.status);
    };

    const canMarkAsSold = (ad: Ad) => {
        return ad.status === 'active' && ad.is_approved === true;
    };

    const canMarkAsExpired = (ad: Ad) => {
        return ad.status === 'active' && ad.is_approved === true;
    };

    const canDelete = (ad: Ad) => {
        return ad.status !== 'sold';
    };

    const isInFinalState = (ad: Ad) => {
        return ad.status === 'sold';
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
                                <h1 className="text-3xl font-bold tracking-tight">{user.name_en}</h1>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusBadge(user.status)}
                            {getSubscriptionBadge()}
                            {user.status === 'deleted' ? (
                                <Button variant="outline" onClick={handleReactivate}>
                                    <User className="mr-2 h-4 w-4" />
                                    Reactivate
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={handleToggleStatus}>
                                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                                    </Button>
                                    <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Profile Information */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Profile Information
                                        </CardTitle>
                                        <CardDescription>User's personal and contact details</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">English Name</p>
                                                <p className="text-sm">{user.name_en}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">Arabic Name</p>
                                                <p className="text-sm">{user.name_ar}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">Email</p>
                                                <p className="text-sm">{user.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">Phone</p>
                                                <p className="text-sm">{user.phone}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">Governorate</p>
                                                <p className="text-sm">{user.governorate?.name_en || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">Member Since</p>
                                                <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {user.suspension_reason && (
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">Suspension Reason</p>
                                                <p className="text-sm">{user.suspension_reason}</p>
                                            </div>
                                        )}
                                        {user.deletion_reason && (
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">Deletion Reason</p>
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
                                            <CardDescription>Current subscription status and history</CardDescription>
                                        </div>
                                        {user.subscription && user.subscription.is_active && (
                                            <Button variant="destructive" onClick={() => setShowRevokeModal(true)}>
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
                                                    <p className="text-muted-foreground text-sm font-medium">Plan</p>
                                                    <p className="text-sm">{user.subscription.plan.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-sm font-medium">Status</p>
                                                    {getSubscriptionBadge()}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-muted-foreground text-sm font-medium">Expires At</p>
                                                    <p className="text-sm">{new Date(user.subscription.expires_at).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-sm font-medium">Created At</p>
                                                    <p className="text-sm">{new Date(user.subscription.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {user.subscription.revocation_reason && (
                                                <div>
                                                    <p className="text-muted-foreground text-sm font-medium">Revocation Reason</p>
                                                    <p className="text-sm">{user.subscription.revocation_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No active subscription</p>
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
                                    <CardDescription>User's recently posted advertisements</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {(user.ads || []).length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {(user.ads || []).map((ad) => (
                                                <Card key={ad.id} className="overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="min-w-0 flex-1">
                                                                <CardTitle className="mb-2 line-clamp-2 text-lg">{ad.title_en}</CardTitle>
                                                                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                                                    <User className="h-4 w-4" />
                                                                    <span className="truncate">{user.name_en}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                {getAdStatusBadge(ad.status)}
                                                                {getApprovalBadge(ad)}
                                                                {ad.is_featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                                                                <div className="flex items-center gap-1">
                                                                    {ad.is_negotiable && <DollarSign className="h-4 w-4 text-blue-500" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        {/* Image */}
                                                        <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
                                                            {ad.primaryImage ? (
                                                                <img
                                                                    src={ad.primaryImage.url}
                                                                    alt={ad.title_en}
                                                                    className="h-full w-full rounded-lg object-cover"
                                                                />
                                                            ) : (
                                                                <ImageIcon className="text-muted-foreground h-12 w-12" />
                                                            )}
                                                        </div>

                                                        {/* Details */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-primary text-2xl font-bold">
                                                                    {formatPrice(ad.price, ad.priceType?.name_en)}
                                                                </span>
                                                                <div className="text-muted-foreground text-sm">{ad.views_count} views</div>
                                                            </div>

                                                            <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="h-4 w-4" />
                                                                    {ad.governorate?.name_en || 'N/A'}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    {new Date(ad.created_at).toLocaleDateString()}
                                                                </div>
                                                            </div>

                                                            <div className="text-sm">
                                                                <span className="font-medium">Category:</span> {ad.category.name_en}
                                                            </div>
                                                            <div className="text-sm">
                                                                <span className="font-medium">Condition:</span> {ad.condition?.name_en || 'N/A'}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center justify-between border-t pt-4">
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="ghost" size="sm" onClick={() => router.get(`/admin/ads/${ad.id}`)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>

                                                                {/* Draft Status - Only View and Delete */}
                                                                {ad.status === 'draft' && (
                                                                    <Dialog
                                                                        open={isDeleteDialogOpen && deletingAd === ad.id}
                                                                        onOpenChange={setIsDeleteDialogOpen}
                                                                    >
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteAd(ad.id)}
                                                                                className="text-destructive hover:text-destructive"
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent>
                                                                            <DialogHeader>
                                                                                <DialogTitle>Delete Ad</DialogTitle>
                                                                                <DialogDescription>
                                                                                    Are you sure you want to delete "{ad.title_en}"? This action
                                                                                    cannot be undone.
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <div className="space-y-4">
                                                                                <div>
                                                                                    <label className="text-sm font-medium">Reason for deletion</label>
                                                                                    <Textarea
                                                                                        value={deleteReason}
                                                                                        onChange={(e) => setDeleteReason(e.target.value)}
                                                                                        placeholder="Please provide a reason for deleting this ad..."
                                                                                        className="mt-1"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <DialogFooter>
                                                                                <Button variant="outline" onClick={handleCancelDelete}>
                                                                                    Cancel
                                                                                </Button>
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    onClick={confirmDelete}
                                                                                    disabled={!deleteReason.trim()}
                                                                                >
                                                                                    Delete Ad
                                                                                </Button>
                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                )}

                                                                {/* For all other statuses except sold and draft */}
                                                                {canToggleStatus(ad) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleToggleAdStatus(ad.id)}
                                                                        className={
                                                                            ad.status === 'active'
                                                                                ? 'text-green-600 hover:text-green-700'
                                                                                : 'text-red-600 hover:text-red-700'
                                                                        }
                                                                        title={ad.status === 'active' ? 'Deactivate' : 'Activate'}
                                                                    >
                                                                        {ad.status === 'active' ? (
                                                                            <ToggleLeft className="h-4 w-4" />
                                                                        ) : (
                                                                            <ToggleRight className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                )}

                                                                {/* Approval Actions - For all ads */}
                                                                {canApprove(ad) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleApprove(ad.id)}
                                                                        className="text-green-600 hover:text-green-700"
                                                                        title="Approve"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                )}

                                                                {canReject(ad) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleReject(ad.id)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                        title="Reject"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                )}

                                                                {/* Status Change Actions - Only for active and approved ads */}
                                                                {canMarkAsSold(ad) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleMarkAsSold(ad.id)}
                                                                        className="text-blue-600 hover:text-blue-700"
                                                                        title="Mark as Sold"
                                                                    >
                                                                        <ShoppingCart className="h-4 w-4" />
                                                                    </Button>
                                                                )}

                                                                {canMarkAsExpired(ad) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleMarkAsExpired(ad.id)}
                                                                        className="text-yellow-600 hover:text-yellow-700"
                                                                        title="Mark as Expired"
                                                                    >
                                                                        <Clock className="h-4 w-4" />
                                                                    </Button>
                                                                )}

                                                                {/* Delete Action - For all except sold and draft, or for delete status */}
                                                                {canDelete(ad) && ad.status !== 'draft' && ad.status !== 'delete' && (
                                                                    <Dialog
                                                                        open={isDeleteDialogOpen && deletingAd === ad.id}
                                                                        onOpenChange={setIsDeleteDialogOpen}
                                                                    >
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteAd(ad.id)}
                                                                                className="text-destructive hover:text-destructive"
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent>
                                                                            <DialogHeader>
                                                                                <DialogTitle>Delete Ad</DialogTitle>
                                                                                <DialogDescription>
                                                                                    Are you sure you want to delete "{ad.title_en}"? This action
                                                                                    cannot be undone.
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <div className="space-y-4">
                                                                                <div>
                                                                                    <label className="text-sm font-medium">Reason for deletion</label>
                                                                                    <Textarea
                                                                                        value={deleteReason}
                                                                                        onChange={(e) => setDeleteReason(e.target.value)}
                                                                                        placeholder="Please provide a reason for deleting this ad..."
                                                                                        className="mt-1"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <DialogFooter>
                                                                                <Button variant="outline" onClick={handleCancelDelete}>
                                                                                    Cancel
                                                                                </Button>
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    onClick={confirmDelete}
                                                                                    disabled={!deleteReason.trim()}
                                                                                >
                                                                                    Delete Ad
                                                                                </Button>
                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                )}

                                                                {/* Final State Indicator */}
                                                                {isInFinalState(ad) && (
                                                                    <div className="flex items-center gap-1 text-blue-600">
                                                                        <AlertTriangle className="h-4 w-4" />
                                                                        <span className="text-xs">Final State</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <ImageIcon className="text-muted-foreground mb-4 h-12 w-12" />
                                            <h3 className="mb-2 text-lg font-semibold">No ads found</h3>
                                            <p className="text-muted-foreground mb-4">This user hasn't posted any ads yet.</p>
                                        </div>
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
                                                <Eye className="text-muted-foreground h-4 w-4" />
                                                <span>Viewed "{view.ad?.title || 'Unknown Ad'}"</span>
                                                <span className="text-muted-foreground">{new Date(view.created_at).toLocaleDateString()}</span>
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
                                    <CardDescription>This will immediately revoke the user's subscription</CardDescription>
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
                                            <Button type="button" variant="outline" onClick={() => setShowRevokeModal(false)}>
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
                                    <CardDescription>This will permanently delete the user's account</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleDeleteUser} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Reason for deletion</label>
                                            <Textarea
                                                id="deletion_reason"
                                                value={deleteData.deletion_reason}
                                                onChange={(e) => setDeleteData('deletion_reason', e.target.value)}
                                                placeholder="Provide reason for deleting account"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)}>
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

                    {/* Rejection Reason Dialog */}
                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Ad</DialogTitle>
                                <DialogDescription>
                                    Please provide a reason for rejecting this ad. This will help the user understand what needs to be changed.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Rejection Reason</label>
                                    <Textarea
                                        id="reject-reason"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Enter the reason for rejection..."
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleCancelReject}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmReject} disabled={!rejectReason.trim()}>
                                    Reject Ad
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Inactive Reason Dialog */}
                    <Dialog open={isInactiveDialogOpen} onOpenChange={setIsInactiveDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Mark as Inactive</DialogTitle>
                                <DialogDescription>Please provide a reason for marking this ad as inactive.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Inactive Reason</label>
                                    <Textarea
                                        id="inactive-reason"
                                        value={inactiveReason}
                                        onChange={(e) => setInactiveReason(e.target.value)}
                                        placeholder="Enter the reason for marking as inactive..."
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleCancelInactive}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmInactive} disabled={!inactiveReason.trim()}>
                                    Mark as Inactive
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </>
        </AppLayout>
    );
}
