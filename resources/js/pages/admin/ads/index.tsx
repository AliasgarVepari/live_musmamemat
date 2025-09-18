import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Badge } from '@/components/admin/ui/badge';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Textarea } from '@/components/admin/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/admin/ui/dialog';
import { Switch } from '@/components/admin/ui/switch';
import { 
    Search, 
    Filter, 
    Eye, 
    Trash2, 
    ToggleRight, 
    ToggleLeft, 
    CheckCircle, 
    XCircle,
    DollarSign,
    MapPin,
    Calendar,
    User,
    Image as ImageIcon,
    Check,
    X,
    ShoppingCart,
    Clock,
    Pause,
    AlertTriangle
} from 'lucide-react';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ads Management',
        href: '/admin/ads',
    },
];

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
    user: {
        id: number;
        name_en: string;
        name_ar: string;
        email: string;
        phone: string;
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
    primaryImage?: {
        id: number;
        url: string;
        is_primary: boolean;
    };
}

interface Category {
    id: number;
    name_en: string;
    name_ar: string;
}

interface Governorate {
    id: number;
    name_en: string;
    name_ar: string;
}

interface PriceType {
    id: number;
    name_en: string;
    name_ar: string;
}

interface Condition {
    id: number;
    name_en: string;
    name_ar: string;
}

interface AdsIndexProps {
    ads: {
        data: Ad[];
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
    categories: Category[];
    governorates: Governorate[];
    priceTypes: PriceType[];
    conditions: Condition[];
    filters: {
        search?: string;
        status?: string;
        category_id?: string;
        governorate_id?: string;
        price_type_id?: string;
        condition_id?: string;
        is_featured?: string;
        is_approved?: string;
        is_negotiable?: string;
        min_price?: string;
        max_price?: string;
        per_page?: string;
    };
}

export default function AdsIndex({ ads, categories, governorates, priceTypes, conditions, filters }: AdsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [governorateId, setGovernorateId] = useState(filters.governorate_id || 'all');
    const [priceTypeId, setPriceTypeId] = useState(filters.price_type_id || 'all');
    const [conditionId, setConditionId] = useState(filters.condition_id || 'all');
    const [isFeatured, setIsFeatured] = useState(filters.is_featured || 'all');
    const [isApproved, setIsApproved] = useState(filters.is_approved || 'all');
    const [isNegotiable, setIsNegotiable] = useState(filters.is_negotiable || 'all');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [perPage, setPerPage] = useState(filters.per_page || '5');
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

    // Debounced search effect
    useEffect(() => {
        // Skip the effect on initial load
        if (search === (filters.search || '') &&
            status === (filters.status || 'all') &&
            categoryId === (filters.category_id || 'all') &&
            governorateId === (filters.governorate_id || 'all') &&
            priceTypeId === (filters.price_type_id || 'all') &&
            conditionId === (filters.condition_id || 'all') &&
            isFeatured === (filters.is_featured || 'all') &&
            isApproved === (filters.is_approved || 'all') &&
            isNegotiable === (filters.is_negotiable || 'all') &&
            minPrice === (filters.min_price || '') &&
            maxPrice === (filters.max_price || '') &&
            perPage === (filters.per_page || '20')) {
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get('/admin/ads', {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
                category_id: categoryId === 'all' ? undefined : categoryId,
                governorate_id: governorateId === 'all' ? undefined : governorateId,
                price_type_id: priceTypeId === 'all' ? undefined : priceTypeId,
                condition_id: conditionId === 'all' ? undefined : conditionId,
                is_featured: isFeatured === 'all' ? undefined : isFeatured,
                is_approved: isApproved === 'all' ? undefined : isApproved,
                is_negotiable: isNegotiable === 'all' ? undefined : isNegotiable,
                min_price: minPrice || undefined,
                max_price: maxPrice || undefined,
                per_page: perPage,
            }, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, status, categoryId, governorateId, priceTypeId, conditionId, isFeatured, isApproved, isNegotiable, minPrice, maxPrice, perPage]);

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

    const handleToggleStatus = (adId: number) => {
        const ad = ads.data.find(a => a.id === adId);
        if (ad && ad.status === 'active') {
            // If ad is active and we're toggling to inactive, show reason dialog
            setInactivatingAd(adId);
            setIsInactiveDialogOpen(true);
        } else {
            // For other statuses, directly toggle
            router.patch(`/admin/ads/${adId}/toggle-status`, {}, {
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    alert(`Error: ${errorMessage}`);
                },
                preserveScroll: true,
            });
        }
    };


    const handleApprove = (adId: number) => {
        router.patch(`/admin/ads/${adId}/approve`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
            preserveScroll: true,
        });
    };

    const handleReject = (adId: number) => {
        setRejectingAd(adId);
        setIsRejectDialogOpen(true);
    };

    const confirmReject = () => {
        if (rejectingAd && rejectReason.trim()) {
            router.post(`/admin/ads/${rejectingAd}/reject`, {
                reject_reason: rejectReason
            }, {
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
            });
        }
    };

    const handleMarkAsSold = (adId: number) => {
        router.patch(`/admin/ads/${adId}/mark-sold`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
            preserveScroll: true,
        });
    };

    const handleMarkAsExpired = (adId: number) => {
        router.patch(`/admin/ads/${adId}/mark-expired`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
            preserveScroll: true,
        });
    };


    const handleDelete = (adId: number) => {
        setDeletingAd(adId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteReason.trim()) {
            alert('Please provide a reason for deletion.');
            return;
        }

        if (deletingAd) {
            router.post(`/admin/ads/${deletingAd}/delete`, {
                delete_reason: deleteReason
            }, {
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
            });
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
            router.post(`/admin/ads/${inactivatingAd}/mark-inactive`, {
                inactive_reason: inactiveReason
            }, {
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
            });
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
            <Head title="Ads Management" />
            <>
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Ads Management</h1>
                            <p className="text-muted-foreground">Manage and monitor all advertisements</p>
                        </div>
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
                            <div className="grid gap-4 lg:grid-cols-6">
                                {/* Search */}
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Search ads..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                            <SelectItem value="delete">Deleted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Governorate */}
                                <div className="space-y-2">
                                    <Label htmlFor="governorate">Governorate</Label>
                                    <Select value={governorateId} onValueChange={setGovernorateId}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Governorates</SelectItem>
                                            {governorates.map((governorate) => (
                                                <SelectItem key={governorate.id} value={governorate.id.toString()}>
                                                    {governorate.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Price Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="priceType">Price Type</Label>
                                    <Select value={priceTypeId} onValueChange={setPriceTypeId}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Price Types</SelectItem>
                                            {priceTypes.map((priceType) => (
                                                <SelectItem key={priceType.id} value={priceType.id.toString()}>
                                                    {priceType.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Records per page */}
                                <div className="space-y-2">
                                    <Label htmlFor="perPage">Records per page</Label>
                                    <Select value={perPage} onValueChange={setPerPage}>
                                        <SelectTrigger>
                                            <SelectValue />
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

                            {/* Additional Filters Row */}
                            <div className="grid gap-4 lg:grid-cols-6 mt-4">
                                {/* Condition */}
                                <div className="space-y-2">
                                    <Label htmlFor="condition">Condition</Label>
                                    <Select value={conditionId} onValueChange={setConditionId}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Conditions</SelectItem>
                                            {conditions.map((condition) => (
                                                <SelectItem key={condition.id} value={condition.id.toString()}>
                                                    {condition.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Featured */}
                                <div className="space-y-2">
                                    <Label htmlFor="featured">Featured</Label>
                                    <Select value={isFeatured} onValueChange={setIsFeatured}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="true">Featured</SelectItem>
                                            <SelectItem value="false">Not Featured</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Approved */}
                                <div className="space-y-2">
                                    <Label htmlFor="approved">Approval Status</Label>
                                    <Select value={isApproved} onValueChange={setIsApproved}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="true">Approved</SelectItem>
                                            <SelectItem value="false">Rejected</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Negotiable */}
                                <div className="space-y-2">
                                    <Label htmlFor="negotiable">Negotiable</Label>
                                    <Select value={isNegotiable} onValueChange={setIsNegotiable}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="true">Negotiable</SelectItem>
                                            <SelectItem value="false">Fixed Price</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Min Price */}
                                <div className="space-y-2">
                                    <Label htmlFor="minPrice">Min Price</Label>
                                    <Input
                                        id="minPrice"
                                        type="number"
                                        placeholder="0"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                </div>

                                {/* Max Price */}
                                <div className="space-y-2">
                                    <Label htmlFor="maxPrice">Max Price</Label>
                                    <Input
                                        id="maxPrice"
                                        type="number"
                                        placeholder="1000"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ads List */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {ads.data.map((ad) => (
                            <Card key={ad.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg line-clamp-2 mb-2">
                                                {ad.title_en}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                <span className="truncate">{ad.user.name_en}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(ad.status)}
                                            {getApprovalBadge(ad)}
                                            {ad.is_featured && (
                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                    Featured
                                                </Badge>
                                            )}
                                            <div className="flex items-center gap-1">
                                                {ad.is_negotiable && (
                                                    <DollarSign className="h-4 w-4 text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Image */}
                                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                        {ad.primaryImage ? (
                                            <img
                                                src={ad.primaryImage.url}
                                                alt={ad.title_en}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-primary">
                                                {formatPrice(ad.price, ad.priceType?.name_en)}
                                            </span>
                                            <div className="text-sm text-muted-foreground">
                                                {ad.views_count} views
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.get(`/admin/ads/${ad.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            
                                            {/* Draft Status - Only View and Delete */}
                                            {ad.status === 'draft' && (
                                                <Dialog open={isDeleteDialogOpen && deletingAd === ad.id} onOpenChange={setIsDeleteDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(ad.id)}
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
                                                                Are you sure you want to delete "{ad.title_en}"? This action cannot be undone.
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
                                                            <Button variant="outline" onClick={handleCancelDelete}>Cancel</Button>
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
                                                    onClick={() => handleToggleStatus(ad.id)}
                                                    className={ad.status === 'active' ?'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700' }
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
                                            {(canDelete(ad) && ad.status !== 'draft' && ad.status !== 'delete') && (
                                                <Dialog open={isDeleteDialogOpen && deletingAd === ad.id} onOpenChange={setIsDeleteDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(ad.id)}
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
                                                                Are you sure you want to delete "{ad.title_en}"? This action cannot be undone.
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
                                                            <Button variant="outline" onClick={handleCancelDelete}>Cancel</Button>
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

                    {/* Empty State */}
                    {ads.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No ads found</h3>
                            <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {ads.data.length > 0 && (
                        <div className="flex items-center justify-between px-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {ads.from} - {ads.to} of {ads.total} ads
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Previous Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(ads.prev_page_url || '', {}, { preserveScroll: true })}
                                    disabled={!ads.prev_page_url}
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Button>

                                {/* Page Numbers */}
                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: Math.min(5, ads.last_page) }, (_, i) => {
                                        const page = i + 1;
                                        const isActive = page === ads.current_page;
                                        
                                        return (
                                            <Button
                                                key={page}
                                                variant={isActive ? "default" : "outline"}
                                                size="sm"
                                                className={`w-10 h-10 ${isActive ? 'bg-black text-white hover:bg-black' : ''}`}
                                                onClick={() => {
                                                    const params = new URLSearchParams();
                                                    if (search && search.trim()) params.append('search', search);
                                                    if (status && status !== 'all') params.append('status', status);
                                                    if (isApproved && isApproved !== 'all') params.append('is_approved', isApproved);
                                                    if (categoryId && categoryId !== 'all') params.append('category_id', categoryId);
                                                    if (governorateId && governorateId !== 'all') params.append('governorate_id', governorateId);
                                                    if (priceTypeId && priceTypeId !== 'all') params.append('price_type_id', priceTypeId);
                                                    if (conditionId && conditionId !== 'all') params.append('condition_id', conditionId);
                                                    if (isNegotiable && isNegotiable !== 'all') params.append('is_negotiable', isNegotiable);
                                                    if (minPrice && minPrice.trim()) params.append('min_price', minPrice);
                                                    if (maxPrice && maxPrice.trim()) params.append('max_price', maxPrice);
                                                    if (perPage && perPage !== 'all') params.append('per_page', perPage);
                                                    params.append('page', page.toString());
                                                    
                                                    router.get(`/admin/ads?${params.toString()}`, {}, { preserveScroll: true });
                                                }}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    })}
                                    
                                    {ads.last_page > 5 && (
                                        <>
                                            <span className="px-2 text-muted-foreground">...</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-10 h-10"
                                                onClick={() => {
                                                    const params = new URLSearchParams();
                                                    if (search && search.trim()) params.append('search', search);
                                                    if (status && status !== 'all') params.append('status', status);
                                                    if (isApproved && isApproved !== 'all') params.append('is_approved', isApproved);
                                                    if (categoryId && categoryId !== 'all') params.append('category_id', categoryId);
                                                    if (governorateId && governorateId !== 'all') params.append('governorate_id', governorateId);
                                                    if (priceTypeId && priceTypeId !== 'all') params.append('price_type_id', priceTypeId);
                                                    if (conditionId && conditionId !== 'all') params.append('condition_id', conditionId);
                                                    if (isNegotiable && isNegotiable !== 'all') params.append('is_negotiable', isNegotiable);
                                                    if (minPrice && minPrice.trim()) params.append('min_price', minPrice);
                                                    if (maxPrice && maxPrice.trim()) params.append('max_price', maxPrice);
                                                    if (perPage && perPage !== 'all') params.append('per_page', perPage);
                                                    params.append('page', ads.last_page.toString());
                                                    
                                                    router.get(`/admin/ads?${params.toString()}`, {}, { preserveScroll: true });
                                                }}
                                            >
                                                {ads.last_page}
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {/* Next Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(ads.next_page_url || '', {}, { preserveScroll: true })}
                                    disabled={!ads.next_page_url}
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

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
                                <Label htmlFor="reject-reason">Rejection Reason</Label>
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
                            <Button variant="outline" onClick={handleCancelReject}>Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={confirmReject}
                                disabled={!rejectReason.trim()}
                            >
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
                                <Label htmlFor="inactive-reason">Inactive Reason</Label>
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
                            <Button variant="outline" onClick={handleCancelInactive}>Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={confirmInactive}
                                disabled={!inactiveReason.trim()}
                            >
                                Mark as Inactive
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </>
        </AppLayout>
    );
}
