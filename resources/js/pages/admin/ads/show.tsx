import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/admin/ui/dialog';
import { Textarea } from '@/components/admin/ui/textarea';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    Image as ImageIcon,
    Mail,
    Pause,
    Phone,
    ShoppingCart,
    ToggleLeft,
    ToggleRight,
    Trash2,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ads Management',
        href: '/admin/ads',
    },
    {
        title: 'Ad Details',
        href: '/admin/ads/show',
    },
];

interface AdView {
    id: number;
    user: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    created_at: string;
}

interface Ad {
    id: number;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    product_details_en: string;
    product_details_ar: string;
    price: number | string;
    status: 'draft' | 'active' | 'inactive' | 'expired' | 'sold' | 'delete';
    is_featured: boolean;
    is_negotiable: boolean;
    is_approved: boolean | null;
    reject_reason?: string | null;
    views_count: number;
    delete_reason?: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name_en: string;
        name_ar: string;
        email: string;
        phone: string;
        profile_picture_url?: string;
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
    adImages?: Array<{
        id: number;
        url: string;
        is_primary: boolean;
        created_at: string;
    }>;
    views?: AdView[];
}

interface ShowAdProps {
    ad: Ad;
}

export default function ShowAd({ ad }: ShowAdProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isInactiveDialogOpen, setIsInactiveDialogOpen] = useState(false);
    const [rejectingAd, setRejectingAd] = useState<number | null>(null);
    const [inactivatingAd, setInactivatingAd] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [inactiveReason, setInactiveReason] = useState('');

    useErrorHandler();

    const getStatusBadge = (status: string) => {
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

    const canActivate = (ad: Ad) => {
        return ['inactive', 'expired', 'delete'].includes(ad.status);
    };

    const canDeactivate = (ad: Ad) => {
        return ad.status === 'active';
    };

    const canToggleStatus = (ad: Ad) => {
        return canActivate(ad) || canDeactivate(ad);
    };

    const canMarkAsSold = (ad: Ad) => {
        return ad.status === 'active' && ad.is_approved === true;
    };

    const canMarkAsExpired = (ad: Ad) => {
        return ad.status === 'active' && ad.is_approved === true;
    };

    const canMarkAsInactive = (ad: Ad) => {
        return ad.status === 'active' && ad.is_approved === true;
    };

    const canDelete = (ad: Ad) => {
        return ad.status !== 'sold';
    };

    const isInFinalState = (ad: Ad) => {
        return ad.status === 'sold';
    };

    const formatPrice = (price: number | string, priceType?: string | null) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        const priceTypeText = priceType || 'Fixed';
        return `$${numericPrice.toFixed(2)} ${priceTypeText}`;
    };

    const handleToggleStatus = () => {
        if (ad.status === 'active') {
            // If ad is active and we're toggling to inactive, show reason dialog
            setInactivatingAd(ad.id);
            setIsInactiveDialogOpen(true);
        } else {
            // For other statuses, directly toggle
            router.patch(
                `/admin/ads/${ad.id}/toggle-status`,
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

    const handleApprove = () => {
        router.patch(`/admin/ads/${ad.id}/approve`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        setRejectingAd(ad.id);
        setIsRejectDialogOpen(true);
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        router.post(`/admin/ads/${ad.id}/reject`, {
            reject_reason: rejectReason,
        }, {
            onSuccess: () => {
                setIsRejectDialogOpen(false);
                setRejectReason('');
                setRejectingAd(null);
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
            preserveScroll: true,
        });
    };

    const handleMarkAsSold = () => {
        router.patch(`/admin/ads/${ad.id}/mark-sold`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
            preserveScroll: true,
        });
    };

    const handleMarkAsExpired = () => {
        router.patch(`/admin/ads/${ad.id}/mark-expired`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
            preserveScroll: true,
        });
    };

    const handleMarkAsInactive = () => {
        setInactivatingAd(ad.id);
        setIsInactiveDialogOpen(true);
    };

    const confirmInactive = () => {
        if (!inactiveReason.trim()) {
            alert('Please provide a reason for marking as inactive.');
            return;
        }

        router.post(`/admin/ads/${ad.id}/mark-inactive`, {
            inactive_reason: inactiveReason,
        }, {
            onSuccess: () => {
                setIsInactiveDialogOpen(false);
                setInactiveReason('');
                setInactivatingAd(null);
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        // For all ads, show delete dialog with reason
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!inactiveReason.trim()) {
            alert('Please provide a reason for deletion.');
            return;
        }

        router.post(`/admin/ads/${ad.id}/delete`, {
            delete_reason: inactiveReason,
        }, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setInactiveReason('');
                router.visit('/admin/ads');
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
            preserveScroll: true,
        });
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setInactiveReason('');
    };

    const handleCancelReject = () => {
        setIsRejectDialogOpen(false);
        setRejectReason('');
        setRejectingAd(null);
    };

    const handleCancelInactive = () => {
        setIsInactiveDialogOpen(false);
        setInactiveReason('');
        setInactivatingAd(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ad: ${ad.title_en}`} />
            <>
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">{ad.title_en}</h1>
                                <p className="text-muted-foreground">{ad.title_ar}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(ad.status)}
                            {getApprovalBadge(ad)}
                            <div className="flex items-center gap-1">
                                {ad.is_negotiable && <DollarSign className="h-5 w-5 text-blue-500" />}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Draft Status - Only View and Delete */}
                        {ad.status === 'draft' && (
                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Ad</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete "{ad.title_en}"? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Reason for deletion</label>
                                            <Textarea
                                                value={inactiveReason}
                                                onChange={(e) => setInactiveReason(e.target.value)}
                                                placeholder="Please provide a reason for deleting this ad..."
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={handleCancelDelete}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={confirmDelete}>
                                            Delete Ad
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* For all other statuses except sold and draft */}
                        {canToggleStatus(ad) && (
                            <Button
                                variant="outline"
                                onClick={handleToggleStatus}
                                className={ad.status === 'active' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
                                title={ad.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                                {ad.status === 'active' ? (
                                    <>
                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        Activate
                                    </>
                                )}
                            </Button>
                        )}

                        {/* Approval Actions - For all ads */}
                        {canApprove(ad) && (
                            <Button
                                variant="outline"
                                onClick={handleApprove}
                                className="text-green-600 hover:text-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        )}
                        {canReject(ad) && (
                            <Button
                                variant="outline"
                                onClick={handleReject}
                                className="text-red-600 hover:text-red-700"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        )}

                        {/* Status Change Actions - Only for active and approved ads */}
                        {canMarkAsSold(ad) && (
                            <Button
                                variant="outline"
                                onClick={handleMarkAsSold}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Mark as Sold
                            </Button>
                        )}
                        {canMarkAsExpired(ad) && (
                            <Button
                                variant="outline"
                                onClick={handleMarkAsExpired}
                                className="text-yellow-600 hover:text-yellow-700"
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Mark as Expired
                            </Button>
                        )}
                        {canMarkAsInactive(ad) && (
                            <Button
                                variant="outline"
                                onClick={handleMarkAsInactive}
                                className="text-orange-600 hover:text-orange-700"
                            >
                                <Pause className="mr-2 h-4 w-4" />
                                Mark as Inactive
                            </Button>
                        )}

                        {/* Delete Action - For all except sold and draft, or for delete status */}
                        {(canDelete(ad) && ad.status !== 'draft' && ad.status !== 'delete') && (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}

                        {/* Final State Indicator */}
                        {isInFinalState(ad) && (
                            <div className="text-sm text-muted-foreground">
                                This ad is in its final state and cannot be modified.
                            </div>
                        )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Images */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Images</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {ad.adImages && ad.adImages.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {ad.adImages.map((image, index) => (
                                                <div key={image.id} className="relative">
                                                    <img
                                                        src={image.url}
                                                        alt={`${ad.title_en} - Image ${index + 1}`}
                                                        className="h-48 w-full rounded-lg object-cover"
                                                    />
                                                    {image.is_primary && <Badge className="absolute left-2 top-2">Primary</Badge>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
                                            <ImageIcon className="text-muted-foreground h-12 w-12" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Description</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="mb-2 font-semibold">English</h4>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{ad.description_en}</p>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 font-semibold">Arabic</h4>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{ad.description_ar}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Product Details */}
                            {(ad.product_details_en || ad.product_details_ar) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {ad.product_details_en && (
                                            <div>
                                                <h4 className="mb-2 font-semibold">English</h4>
                                                <p className="text-muted-foreground whitespace-pre-wrap">{ad.product_details_en}</p>
                                            </div>
                                        )}
                                        {ad.product_details_ar && (
                                            <div>
                                                <h4 className="mb-2 font-semibold">Arabic</h4>
                                                <p className="text-muted-foreground whitespace-pre-wrap">{ad.product_details_ar}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Recent Views */}
                            {ad.views && ad.views.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Eye className="h-5 w-5" />
                                            Recent Views ({ad.views_count})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {ad.views?.slice(0, 5).map((view) => (
                                                <div key={view.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{view.user.name_en}</p>
                                                            <p className="text-muted-foreground text-sm">
                                                                {new Date(view.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Price & Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Price & Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-primary mb-2 text-3xl font-bold">{formatPrice(ad.price, ad.priceType?.name_en)}</div>
                                        {ad.is_negotiable && (
                                            <Badge variant="outline" className="text-blue-600">
                                                Negotiable
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Category:</span>
                                            <span className="font-medium">{ad.category.name_en}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Condition:</span>
                                            <span className="font-medium">{ad.condition?.name_en || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Location:</span>
                                            <span className="font-medium">{ad.governorate?.name_en || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Views:</span>
                                            <span className="font-medium">{ad.views_count}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ad Owner</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                                            {ad.user.profile_picture_url ? (
                                                <img
                                                    src={ad.user.profile_picture_url}
                                                    alt={ad.user.name_en}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{ad.user.name_en}</p>
                                            <p className="text-muted-foreground text-sm">{ad.user.name_ar}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="text-muted-foreground h-4 w-4" />
                                            <span>{ad.user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="text-muted-foreground h-4 w-4" />
                                            <span>{ad.user.phone}</span>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full" onClick={() => router.get(`/admin/users/${ad.user.id}`)}>
                                        View User Profile
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Ad Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ad Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span className="font-medium">{new Date(ad.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Updated:</span>
                                        <span className="font-medium">{new Date(ad.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        {getStatusBadge(ad.status)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Featured:</span>
                                        <span className="font-medium">{ad.is_featured ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Approved:</span>
                                        <span className="font-medium">{ad.is_approved ? 'Yes' : 'No'}</span>
                                    </div>
                                    {ad.delete_reason && (
                                        <div>
                                            <span className="text-muted-foreground">Delete Reason:</span>
                                            <p className="mt-1 text-sm">{ad.delete_reason}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Rejection Reason Dialog */}
                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Ad</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this ad.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Rejection Reason</label>
                                <Textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Please provide a reason for rejecting this ad..."
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCancelReject}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmReject}>
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
                            <DialogDescription>
                                Please provide a reason for marking this ad as inactive.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Inactive Reason</label>
                                <Textarea
                                    value={inactiveReason}
                                    onChange={(e) => setInactiveReason(e.target.value)}
                                    placeholder="Please provide a reason for marking this ad as inactive..."
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCancelInactive}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmInactive}>
                                Mark as Inactive
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        </AppLayout>
    );
}
