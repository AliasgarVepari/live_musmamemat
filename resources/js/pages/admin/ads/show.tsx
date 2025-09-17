import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Badge } from '@/components/admin/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/admin/ui/dialog';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    ToggleRight, 
    ToggleLeft, 
    Star, 
    CheckCircle, 
    XCircle,
    DollarSign,
    MapPin,
    Calendar,
    User,
    Eye,
    Image as ImageIcon,
    Phone,
    Mail,
    Clock
} from 'lucide-react';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';

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
    is_approved: boolean;
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

    const formatPrice = (price: number | string, priceType?: string | null) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        const priceTypeText = priceType || 'Fixed';
        return `$${numericPrice.toFixed(2)} ${priceTypeText}`;
    };

    const handleToggleStatus = () => {
        router.patch(`/admin/ads/${ad.id}/toggle-status`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
        });
    };

    const handleToggleFeatured = () => {
        router.patch(`/admin/ads/${ad.id}/toggle-featured`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
        });
    };

    const handleToggleApproval = () => {
        router.patch(`/admin/ads/${ad.id}/toggle-approval`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
        });
    };

    const handleDelete = () => {
        router.delete(`/admin/ads/${ad.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                alert(`Error: ${errorMessage}`);
            },
        });
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
    };

    return (
        <AppLayout>
            <Head title={`Ad: ${ad.title_en}`} />
            <>
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">{ad.title_en}</h1>
                                <p className="text-muted-foreground">{ad.title_ar}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(ad.status)}
                            <div className="flex items-center gap-1">
                                {ad.is_featured && (
                                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                )}
                                {ad.is_approved && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                {ad.is_negotiable && (
                                    <DollarSign className="h-5 w-5 text-blue-500" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => router.get(`/admin/ads/${ad.id}/edit`)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleToggleStatus}
                            className={ad.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
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
                        <Button
                            variant="outline"
                            onClick={handleToggleFeatured}
                            className={ad.is_featured ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-600 hover:text-gray-700'}
                        >
                            <Star className={`mr-2 h-4 w-4 ${ad.is_featured ? 'fill-current' : ''}`} />
                            {ad.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleToggleApproval}
                            className={ad.is_approved ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-700'}
                        >
                            {ad.is_approved ? (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Unapprove
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                </>
                            )}
                        </Button>
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
                                <DialogFooter>
                                    <Button variant="outline" onClick={handleCancelDelete}>Cancel</Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                    >
                                        Delete Ad
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
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
                                                        className="w-full h-48 object-cover rounded-lg"
                                                    />
                                                    {image.is_primary && (
                                                        <Badge className="absolute top-2 left-2">Primary</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
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
                                        <h4 className="font-semibold mb-2">English</h4>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{ad.description_en}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Arabic</h4>
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
                                                <h4 className="font-semibold mb-2">English</h4>
                                                <p className="text-muted-foreground whitespace-pre-wrap">{ad.product_details_en}</p>
                                            </div>
                                        )}
                                        {ad.product_details_ar && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Arabic</h4>
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
                                                <div key={view.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{view.user.name_en}</p>
                                                            <p className="text-sm text-muted-foreground">
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
                                        <div className="text-3xl font-bold text-primary mb-2">
                                            {formatPrice(ad.price, ad.priceType?.name_en)}
                                        </div>
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
                                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                            {ad.user.profile_picture_url ? (
                                                <img
                                                    src={ad.user.profile_picture_url}
                                                    alt={ad.user.name_en}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{ad.user.name_en}</p>
                                            <p className="text-sm text-muted-foreground">{ad.user.name_ar}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{ad.user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{ad.user.phone}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.get(`/admin/users/${ad.user.id}`)}
                                    >
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
                                        <span className="font-medium">
                                            {new Date(ad.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Updated:</span>
                                        <span className="font-medium">
                                            {new Date(ad.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        {getStatusBadge(ad.status)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Featured:</span>
                                        <span className="font-medium">
                                            {ad.is_featured ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Approved:</span>
                                        <span className="font-medium">
                                            {ad.is_approved ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    {ad.delete_reason && (
                                        <div>
                                            <span className="text-muted-foreground">Delete Reason:</span>
                                            <p className="text-sm mt-1">{ad.delete_reason}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </>
        </AppLayout>
    );
}
