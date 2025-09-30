import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { AuthModal } from '@/components/user/auth/AuthModal';
import { ProductDetails } from '@/components/user/selling/ProductDetails';
import { SelectUpgradeSubscriptionFromProfile } from '@/components/user/selling/SelectUpgradeSubscriptionFromProfile';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/user/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/user/ui/avatar';
import { Badge } from '@/components/user/ui/badge';
import { Button } from '@/components/user/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/user/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/user/ui/dialog';
import { Input } from '@/components/user/ui/input';
import { Label } from '@/components/user/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/user/ui/tabs';
import { Textarea } from '@/components/user/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useCachedPagination } from '@/hooks/user/use-cached-pagination';
import { useFavorites } from '@/hooks/user/use-favorites';
import UserLayout from '@/layouts/user/user-layout';
import { SellFormData } from '@/pages/user/SellWizard';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    CheckCircle2,
    Clock,
    CreditCard, 
    Crown, 
    Edit, 
    Eye, 
    Heart, 
    Home,
    LogOut, 
    Package, 
    RotateCcw,
    Settings, 
    Shield, 
    Star, 
    Trash2, 
    TrendingUp, 
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Types
interface User {
    id: number;
    name_en: string;
    name_ar: string;
    email?: string | null;
    phone?: string;
    phone_whatsapp?: string;
    bio_en?: string;
    bio_ar?: string;
    profile_picture_url?: string;
    profile_view_counts: number;
    created_at: string;
    governorate?: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    subscription?: {
        id: number;
        created_at: string;
        is_active: boolean;
        expires_at: string;
        plan: {
            id: number;
            name_en: string;
            name_ar: string;
            price: number;
            is_lifetime: boolean;
            months_count: number;
            ad_limit: number;
            analytics?: boolean;
        };
    };
}

interface Ad {
    id: number;
    title_en: string;
    title_ar: string;
    price: number;
    status: string;
    is_approved?: boolean | null;
    reject_reason?: string | null;
    is_featured?: boolean;
    current_step: number;
    views_count: number;
    contact_count: number;
    created_at: string;
    category_id: number;
    category: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    description_en: string;
    description_ar: string;
    product_details_en?: string;
    product_details_ar?: string;
    condition_id: number;
    condition: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    governorate_id: number;
    governorate: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    price_type_id: number;
    priceType: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    is_negotiable: boolean;
    primaryImage?: {
        id: number;
        url: string;
        is_primary: boolean;
    };
    images?: {
        id: number;
        url: string;
        is_primary: boolean;
    }[];
}

interface SubscriptionPlan {
    id: number;
    name_en: string;
    name_ar: string;
    price: number;
    months_count: number;
    is_lifetime: boolean;
    analytics?: boolean;
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string;
    status: string;
    payment_method: string;
    subscription_plan?: {
        name_en: string;
        name_ar: string;
        price: number;
    };
}

interface ProfileProps {
    user: User | null;
    requiresAuth?: boolean;
    stats?: {
        active_listings: number;
        total_sales: number;
        profile_views: number;
        wishlist_items: number;
    };
    recentListings?: Ad[];
    recentWishlist?: any[];
    subscriptionPlans?: SubscriptionPlan[];
    transactions?: Transaction[];
}

function Profile({
    user,
    requiresAuth,
    stats,
    recentListings: initialRecentListings,
    recentWishlist: initialRecentWishlist,
    subscriptionPlans,
    transactions,
}: ProfileProps) {
    const { language, toggleLanguage } = useLanguage();
    const { isAuthenticated, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
    });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
    const [isEditAdDialogOpen, setIsEditAdDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<number | undefined>(undefined);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [deletingAd, setDeletingAd] = useState<number | null>(null);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState<string>('');
    const [showInactiveModal, setShowInactiveModal] = useState(false);
    const [inactiveMessage, setInactiveMessage] = useState<string>('');
    const [recentListings, setRecentListings] = useState(initialRecentListings || []);
    const [recentWishlist, setRecentWishlist] = useState(initialRecentWishlist || []);
    const [editFormData, setEditFormData] = useState<SellFormData>({});
    const [isLoading, setIsLoading] = useState(false);
    const { toggleFavorite } = useFavorites();
    const { addToast } = useToast();

    // Test function for toaster
    const testToaster = () => {
        addToast({
            type: 'success',
            title: 'Test Success',
            message: 'This is a test success message to verify the toaster is working!',
            duration: 5000,
        });
    };

    // Pagination for listings
    const {
        data: listingsData,
        paginationState,
        goToPage,
        setPerPage,
        refetch: refetchListings,
    } = useCachedPagination<any>({
        endpoint: '/profile/listings',
        initialPage: 1,
        initialPerPage: '5',
        initialSearch: '',
        initialFilters: {},
    });

    // Use paginated data if available, otherwise fall back to initial data
    const listings = listingsData?.data || initialRecentListings || [];
    const pagination = listingsData;

    // Custom pagination handlers that preserve scroll position
    const handlePageChange = (newPage: number) => {
        // Store current scroll position
        const scrollPosition = window.scrollY;

        // Change page
        goToPage(newPage);

        // Restore scroll position after a short delay to allow for data loading
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        }, 100);
    };

    // Update function for edit form data
    const updateEditFormData = (data: Partial<SellFormData>) => {
        console.log('Updating edit form data:', data);
        setEditFormData((prev) => {
            const newData = { ...prev, ...data };
            console.log('New edit form data:', newData);
            return newData;
        });
    };

    // Debug: Log form data changes
    useEffect(() => {
        console.log('Edit form data changed:', editFormData);
    }, [editFormData]);

    // Handle remove from wishlist
    const handleRemoveFromWishlist = async (adId: number) => {
        try {
            await toggleFavorite(adId);
            // Update local state to remove the item from display
            setRecentWishlist((prev) => prev?.filter((item) => item.id !== adId) || []);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    // Form for profile editing - only initialize if user exists
    const {
        data: editData,
        setData: setEditData,
        post: updateProfile,
        processing: updating,
    } = useForm({
        name_en: '',
        name_ar: '',
        email: '',
        phone: '',
        phone_whatsapp: '',
        bio_en: '',
        bio_ar: '',
        governorate_id: '',
    });

    // Populate form data when user data is available
    useEffect(() => {
        if (user) {
            setEditData({
                name_en: user.name_en || '',
                name_ar: user.name_ar || '',
                email: user.email || '',
        phone: user.phone || '',
        phone_whatsapp: user.phone_whatsapp || '',
        bio_en: user.bio_en || '',
        bio_ar: user.bio_ar || '',
                governorate_id: user.governorate?.id?.toString() || '',
    });
        }
    }, [user, setEditData]);

    // Form for subscription upgrade
    const {
        data: upgradeData,
        setData: setUpgradeData,
        post: upgradeSubscription,
        processing: upgrading,
    } = useForm({
        plan_id: selectedUpgradePlan || 0,
    });

    const handleEditProfile = () => {
        updateProfile('/profile', {
            onSuccess: () => {
                setIsEditDialogOpen(false);
            },
        });
    };

    const handleUpgradeSubscription = async (planId: number) => {
        setIsUpgrading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('/api/user/subscription/upgrade-from-profile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription_plan_id: planId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsUpgradeDialogOpen(false);
                setSelectedUpgradePlan(undefined);
                addToast({
                    type: 'success',
                    title: language === 'ar' ? 'تم ترقية الاشتراك' : 'Subscription Upgraded',
                    message: language === 'ar' ? 'تم ترقية الاشتراك بنجاح' : 'Subscription upgraded successfully',
                });
                // Refresh the page to show updated subscription info
                window.location.reload();
            } else {
                throw new Error(data.message || 'Upgrade failed');
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
            addToast({
                type: 'error',
                title: language === 'ar' ? 'فشل في الترقية' : 'Upgrade Failed',
                message: language === 'ar' ? 'فشل في ترقية الاشتراك' : 'Failed to upgrade subscription',
            });
        } finally {
            refetchListings();
            setIsUpgrading(false);
        }
    };

    const handleDeleteAd = (adId: number) => {
        router.delete(`/profile/ads/${adId}`, {
                onSuccess: () => {
                // Refetch listings to update the UI
                refetchListings();
            },
            onError: (errors) => {
                console.error('Failed to delete ad:', errors);
                },
            });
    };

    // Handle expiring an ad
    const handleExpireAd = (adId: number) => {
        router.put(
            `/profile/ads/${adId}`,
            {
                status: 'expired',
            },
            {
                onSuccess: () => {
                    // Refetch listings to update the UI
                    refetchListings();
                },
                onError: (errors) => {
                    console.error('Failed to expire ad:', errors);
                },
            },
        );
    };

    // Handle reactivating an ad
    const handleReactivateAd = (adId: number) => {
        router.put(
            `/profile/ads/${adId}`,
            {
                status: 'active',
            },
            {
                onSuccess: () => {
                    // Refetch listings to update the UI
                    refetchListings();
                },
                onError: (errors) => {
                    console.error('Failed to reactivate ad:', errors);
                },
            },
        );
    };

    // Handle marking an ad as sold
    const handleMarkAsSold = (adId: number) => {
        router.put(
            `/profile/ads/${adId}`,
            {
                status: 'sold',
            },
            {
                onSuccess: () => {
                    // Refetch listings to update the UI
                    refetchListings();
                },
                onError: (errors) => {
                    console.error('Failed to mark ad as sold:', errors);
                },
            },
        );
    };

    // Handle viewing inactive message
    const handleViewInactiveMessage = (ad: Ad) => {
        // Set the inactive message based on the ad status
        let message = '';
        if (ad.status === 'inactive') {
            message =
                language === 'ar'
                    ? 'تم إلغاء تفعيل هذا الإعلان. يرجى التواصل مع الدعم الفني لإعادة تفعيله.'
                    : 'This ad has been deactivated. Please contact support to reactivate it.';
        } else if (ad.status === 'expired') {
            message =
                language === 'ar'
                    ? 'انتهت صلاحية هذا الإعلان. يرجى التواصل مع الدعم الفني لإعادة تفعيله.'
                    : 'This ad has expired. Please contact support to reactivate it.';
        } else {
            message =
                language === 'ar'
                    ? 'هذا الإعلان غير نشط حالياً. يرجى التواصل مع الدعم الفني لإعادة تفعيله.'
                    : 'This ad is currently inactive. Please contact support to reactivate it.';
        }

        setInactiveMessage(message);
        setShowInactiveModal(true);
    };

    // Handle featuring an ad
    const handleFeatureAd = (adId: number) => {
        router.post(
            `/profile/ads/${adId}/feature`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Refetch listings to update the UI
                    refetchListings();
                },
                onError: (errors) => {
                    console.error('Failed to feature ad:', errors);
                },
            },
        );
    };

    const handleEditAd = (ad: Ad) => {
        console.log('Editing ad:', ad); // Debug log

        // If ad is draft, redirect to selling wizard based on current_step
        if (ad.status === 'draft') {
            // Store the ad data in localStorage for the selling wizard
            const formData = {
                category_id: ad.category_id,
                title_en: ad.title_en,
                title_ar: ad.title_ar,
                description_en: ad.description_en,
                description_ar: ad.description_ar,
                product_details_en: ad.product_details_en || '',
                product_details_ar: ad.product_details_ar || '',
                condition_id: ad.condition_id,
                governorate_id: ad.governorate_id,
                price: ad.price?.toString() || '',
                price_type_id: ad.price_type_id,
                is_negotiable: ad.is_negotiable || false,
                images: ad.images?.map((img: any) => img.url) || [],
                draftAdId: ad.id, // Include the draft ad ID
                current_step: ad.current_step || 1, // Include the current step
            };

            // Save to localStorage for the selling wizard to pick up
            localStorage.setItem('sell-draft', JSON.stringify(formData));

            // Determine which step to redirect to based on current_step
            const stepMap: { [key: number]: string } = {
                1: 'category',
                2: 'details',
                3: 'subscription',
                4: 'submitted',
            };

            const currentStep = ad.current_step || 1;
            const stepPath = stepMap[currentStep] || 'details';

            // Redirect to the appropriate step
            router.visit(`/sell/${stepPath}`);
            return;
        }

        // For active ads (under review, approved, or rejected), use the existing edit modal
        setEditingAd(ad);
        const formData = {
            category_id: ad.category_id,
            title_en: ad.title_en,
            title_ar: ad.title_ar,
            description_en: ad.description_en,
            description_ar: ad.description_ar,
            product_details_en: ad.product_details_en || '',
            product_details_ar: ad.product_details_ar || '',
            condition_id: ad.condition_id,
            governorate_id: ad.governorate_id,
            price: ad.price?.toString() || '',
            price_type_id: ad.price_type_id,
            is_negotiable: ad.is_negotiable || false,
            images: ad.images?.map((img: any) => img.url) || [],
        };
        console.log('Form data:', formData); // Debug log
        setEditFormData(formData);
        setIsEditAdDialogOpen(true);
    };

    const handleUpdateAd = () => {
        if (!editingAd) return;

        // Set loading state
        setIsLoading(true);

        // Prepare the data for submission
        const submitData = {
            category_id: editFormData.category_id,
            title_en: editFormData.title_en,
            title_ar: editFormData.title_ar,
            description_en: editFormData.description_en,
            description_ar: editFormData.description_ar,
            product_details_en: editFormData.product_details_en,
            product_details_ar: editFormData.product_details_ar,
            condition_id: editFormData.condition_id,
            governorate_id: editFormData.governorate_id,
            price: editFormData.price,
            price_type_id: editFormData.price_type_id,
            is_negotiable: editFormData.is_negotiable ? '1' : '0',
        };

        // If the ad was rejected, set is_approved to null for re-review
        if (editingAd.is_approved === false) {
            (submitData as any).is_approved = null;
        }

        // Check if there are any new images (base64 data URLs) to upload
        const hasNewImages = editFormData.images && editFormData.images.some((img) => typeof img === 'string' && img.startsWith('data:image/'));
        const hasNoImages = !editFormData.images || editFormData.images.length === 0;

        // Find which existing images were removed (they have IDs but are not in the current images array)
        const existingImageIds = editingAd.images?.map((img) => img.id) || [];
        const currentImageIds = editFormData.images?.filter((img) => typeof img === 'object' && 'id' in img).map((img) => (img as any).id) || [];
        const removedImageIds = existingImageIds.filter((id) => !currentImageIds.includes(id));
        console.log(hasNewImages, 'hasNewImages');
        if (hasNewImages) {
            // Handle images with FormData
            const formData = new FormData();

            // Add all the form fields
            Object.entries(submitData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Add removed image IDs
            removedImageIds.forEach((id, index) => {
                formData.append(`removed_images[${index}]`, id.toString());
            });

            // Add only new images (base64 data URLs converted to File objects)
            let imageIndex = 0;
            editFormData.images?.forEach((img) => {
                if (typeof img === 'string' && img.startsWith('data:image/')) {
                    // Convert base64 data URL to File object
                    const byteString = atob(img.split(',')[1]);
                    const mimeString = img.split(',')[0].split(':')[1].split(';')[0];
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], { type: mimeString });
                    const file = new File([blob], `image_${imageIndex}.jpg`, { type: mimeString });
                    formData.append(`images[${imageIndex}]`, file);
                    imageIndex++;
                    console.log('Added image:', file);
                }
            });

            formData.append('_method', 'PUT');

            router.post(`/profile/ads/${editingAd.id}`, formData, {
                forceFormData: true,
                onSuccess: () => {
                    setIsLoading(false);
                    refetchListings();
                    setIsEditAdDialogOpen(false);
                    setEditingAd(null);
                    setEditFormData({});
                },
                onError: (errors) => {
                    setIsLoading(false);
                    console.error('Failed to update ad:', errors);
                },
            });
        } else if (hasNoImages && editingAd.images && editingAd.images.length > 0) {
            // User removed all images, send clear_images flag
            const submitDataWithClear = {
                ...submitData,
                clear_images: true,
            };

            router.put(`/profile/ads/${editingAd.id}`, submitDataWithClear, {
                onSuccess: () => {
                    setIsLoading(false);
                    refetchListings();
                    setIsEditAdDialogOpen(false);
                    setEditingAd(null);
                    setEditFormData({});
                },
                onError: (errors) => {
                    setIsLoading(false);
                    console.error('Failed to update ad:', errors);
                },
            });
        } else if (removedImageIds.length > 0) {
            // Some images were removed, send the removed image IDs
            const submitDataWithRemoved = {
                ...submitData,
                removed_images: removedImageIds,
            };

            router.put(`/profile/ads/${editingAd.id}`, submitDataWithRemoved, {
                onSuccess: () => {
                    setIsLoading(false);
                    refetchListings();
                    setIsEditAdDialogOpen(false);
                    setEditingAd(null);
                    setEditFormData({});
                },
                onError: (errors) => {
                    setIsLoading(false);
                    console.error('Failed to update ad:', errors);
                },
            });
        } else {
            // No image changes, use regular PUT request
            router.put(`/profile/ads/${editingAd.id}`, submitData, {
                onSuccess: () => {
                    setIsLoading(false);
                    refetchListings();
                    setIsEditAdDialogOpen(false);
                    setEditingAd(null);
                    setEditFormData({});
                },
                onError: (errors) => {
                    setIsLoading(false);
                    console.error('Failed to update ad:', errors);
                },
            });
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-KW', {
            style: 'currency',
            currency: 'KWD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Check if user has analytics enabled
    const hasAnalyticsEnabled = () => {
        if (!user?.subscription?.is_active) return false;
        if (!user.subscription.plan.analytics) return false;
        return true;
    };

    const getDisplayStatus = (ad: Ad) => {
        if (ad.status === 'draft') return 'draft';
        if (ad.status === 'active' && ad.is_approved === null) return 'pending';
        if (ad.status === 'active' && ad.is_approved === false) return 'rejected';
        if (ad.status === 'active' && ad.is_approved === true) return 'active';
        return ad.status;
    };

    const getStatusBadge = (ad: Ad) => {
        const displayStatus = getDisplayStatus(ad);

        const statusMap = {
            active: { color: 'bg-green-100 text-green-800', text: language === 'ar' ? 'نشط' : 'Active' },
            inactive: { color: 'bg-gray-100 text-gray-800', text: language === 'ar' ? 'غير نشط' : 'Inactive' },
            sold: { color: 'bg-blue-100 text-blue-800', text: language === 'ar' ? 'مباع' : 'Sold' },
            expired: { color: 'bg-yellow-100 text-yellow-800', text: language === 'ar' ? 'منتهي' : 'Expired' },
            draft: { color: 'bg-gray-100 text-gray-800', text: language === 'ar' ? 'مسودة' : 'Draft' },
            pending: { color: 'bg-yellow-100 text-yellow-800', text: language === 'ar' ? 'قيد المراجعة' : 'Under Review' },
            rejected: { color: 'bg-red-100 text-red-800', text: language === 'ar' ? 'مرفوض' : 'Rejected' },
        };
        
        const statusInfo = statusMap[displayStatus as keyof typeof statusMap] || statusMap.inactive;
        
        return (
            <div className="flex items-center gap-2">
                <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
                {displayStatus === 'rejected' && ad.reject_reason && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setRejectReason(ad.reject_reason || '');
                            setShowRejectModal(true);
                        }}
                        className="text-xs"
                    >
                        {language === 'ar' ? 'عرض السبب' : 'View Reason'}
                    </Button>
                )}
            </div>
        );
    };

    // Handle authentication requirement
    if (requiresAuth && !isAuthenticated) {
    return (
        <UserLayout>
            <Head title="Profile" />
        <div className="bg-background min-h-screen">
            <Header />
                    <main className="main-content py-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h1 className="mb-4 text-3xl font-bold">Authentication Required</h1>
                                <p className="mb-6 text-gray-600">Please log in to view your profile.</p>
                                <Button onClick={() => setShowAuthModal(true)}>Login</Button>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>

                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => {
                        setShowAuthModal(false);
                        // Refresh the page to get authenticated data
                        window.location.reload();
                    }}
                />
            </UserLayout>
        );
    }

    // If no user data, show loading or error
    if (!user) {
        router.visit('/');
        return;
    }

    return (
        <UserLayout>
            <Head title="Profile" />
        <div className="bg-background min-h-screen">
            <Header />

                <main className="main-content py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className={`mb-8 ${language === 'ar' ? 'rtl' : ''}`}>
                            {/* Go to Home Button */}
                            <div className="mb-4">
                                <Button variant="outline" onClick={() => router.visit('/')} className="flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    <span className={language === 'ar' ? 'font-arabic' : ''}>
                                        {language === 'ar' ? 'العودة للرئيسية' : 'Go to Home'}
                                    </span>
                                </Button>
                            </div>

                        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.profile_picture_url} />
                                    <AvatarFallback className="text-2xl">{language === 'ar' ? user.name_ar[0] : user.name_en[0]}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-3">
                                    <h1 className={`text-3xl font-bold ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}>
                                        {language === 'ar' ? user.name_ar : user.name_en}
                                    </h1>

                                    <Badge className="bg-green-100 text-green-800">
                                            <Shield className="mr-1 h-3 w-3" />
                                            {language === 'ar' ? 'موثق' : 'Verified'}
                                    </Badge>

                                    {user.subscription && (
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                            <Crown className="mr-1 h-3 w-3" />
                                            {language === 'ar' ? user.subscription.plan.name_ar : user.subscription.plan.name_en}
                                        </Badge>
                                    )}
                                </div>

                                <div className="text-muted-foreground mb-4 flex items-center gap-6 text-sm">
                                    {/* <div className="flex items-center">
                                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        4.8 (24 {language === 'ar' ? 'تقييم' : 'reviews'})
                                    </div> */}
                                    <span>
                                            {language === 'ar' ? 'عضو منذ' : 'Member since'}{' '}
                                            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>

                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                                </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>{language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="name_en">{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                                                    <Input
                                                        id="name_en"
                                                        value={editData.name_en}
                                                        onChange={(e) => setEditData('name_en', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="name_ar">{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                                                    <Input
                                                        id="name_ar"
                                                        value={editData.name_ar}
                                                        onChange={(e) => setEditData('name_ar', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                        value={editData.email || ''}
                                                    onChange={(e) => setEditData('email', e.target.value)}
                                                        placeholder={
                                                            language === 'ar' ? 'أدخل البريد الإلكتروني (اختياري)' : 'Enter email (optional)'
                                                        }
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                                                    <Input
                                                        id="phone"
                                                        value={editData.phone}
                                                        onChange={(e) => setEditData('phone', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone_whatsapp">{language === 'ar' ? 'واتساب' : 'WhatsApp'}</Label>
                                                    <Input
                                                        id="phone_whatsapp"
                                                        value={editData.phone_whatsapp}
                                                        onChange={(e) => setEditData('phone_whatsapp', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="bio_en">{language === 'ar' ? 'نبذة (إنجليزي)' : 'Bio (English)'}</Label>
                                                <Textarea
                                                    id="bio_en"
                                                    value={editData.bio_en}
                                                    onChange={(e) => setEditData('bio_en', e.target.value)}
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="bio_ar">{language === 'ar' ? 'نبذة (عربي)' : 'Bio (Arabic)'}</Label>
                                                <Textarea
                                                    id="bio_ar"
                                                    value={editData.bio_ar}
                                                    onChange={(e) => setEditData('bio_ar', e.target.value)}
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                                </Button>
                                                    <Button onClick={handleEditProfile}>{language === 'ar' ? 'حفظ' : 'Save'}</Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    {/* Profile Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className={language === 'ar' ? 'rtl' : ''}>
                        <TabsList className="grid w-full grid-cols-5 lg:inline-flex lg:w-auto lg:grid-cols-none">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">{language === 'ar' ? 'نظرة عامة' : 'Overview'}</span>
                            </TabsTrigger>
                            <TabsTrigger value="wishlist" className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                <span className="hidden sm:inline">{language === 'ar' ? 'المفضلة' : 'Wishlist'}</span>
                            </TabsTrigger>
                            <TabsTrigger value="listings" className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span className="hidden sm:inline">{language === 'ar' ? 'إعلاناتي' : 'My Listings'}</span>
                            </TabsTrigger>
                            <TabsTrigger value="billing" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                <span className="hidden sm:inline">{language === 'ar' ? 'الفواتير' : 'Billing'}</span>
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">{language === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-6">
                            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardContent className="p-4 text-center">
                                            <div className="text-2xl font-bold">{stats?.active_listings ?? 0}</div>
                                        <div className="text-muted-foreground text-sm">{language === 'ar' ? 'إعلان نشط' : 'Active Listings'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                            <div className="text-2xl font-bold">{stats?.total_sales ?? 0}</div>
                                        <div className="text-muted-foreground text-sm">{language === 'ar' ? 'مبيعات مكتملة' : 'Total Sales'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                             <div className="text-2xl font-bold">
                                                 {hasAnalyticsEnabled() 
                                                     ? listings.reduce((total: number, ad: Ad) => total + (ad.views_count || 0), 0)
                                                     : '-'
                                                 }
                                             </div>
                                             <div className="text-muted-foreground text-sm">
                                                 {language === 'ar' ? 'إجمالي المشاهدات' : 'Total Ad Views'}
                                             </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                            <div className="text-2xl font-bold">{stats?.wishlist_items ?? 0}</div>
                                        <div className="text-muted-foreground text-sm">{language === 'ar' ? 'عنصر مفضل' : 'Wishlist Items'}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            {language === 'ar' ? 'الإعلانات الأخيرة' : 'Recent Listings'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {recentListings.length > 0 ? (
                                            recentListings.slice(0, 3).map((listing) => (
                                            <div key={listing.id} className="flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-gray-100">
                                                        {listing.primaryImage ? (
                                                            <img 
                                                                src={listing.primaryImage.url} 
                                                                alt={language === 'ar' ? listing.title_ar : listing.title_en} 
                                                                className="h-full w-full object-cover" 
                                                            />
                                                        ) : (
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        )}
                                                    </div>
                                                <div className="flex-1">
                                                        <div className="text-sm font-medium">
                                                            {language === 'ar' ? listing.title_ar : listing.title_en}
                                                        </div>
                                                    <div className="text-muted-foreground text-xs">
                                                                {formatPrice(listing.price)}
                                                                {hasAnalyticsEnabled() && (
                                                                    <>
                                                                        {' '}
                                                                        • {listing.views_count} {language === 'ar' ? 'مشاهدة' : 'views'}
                                                                    </>
                                                                )}
                                                        </div>
                                                    </div>
                                                        {getStatusBadge(listing)}
                                                </div>
                                            ))
                                        ) : (
                                                <div className="text-muted-foreground py-4 text-center">
                                                {language === 'ar' ? 'لا توجد إعلانات' : 'No listings yet'}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Heart className="h-5 w-5" />
                                            {language === 'ar' ? 'المفضلة الأخيرة' : 'Recent Wishlist'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                            {(recentWishlist?.length ?? 0) > 0 ? (
                                                recentWishlist?.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-gray-100">
                                                            {item.primaryImage ? (
                                                                <img
                                                                    src={item.primaryImage.url}
                                                                    alt={language === 'ar' ? item.title_ar : item.title_en}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                        <Heart className="h-6 w-6 text-gray-400" />
                                                            )}
                                                    </div>
                                                <div className="flex-1">
                                                            <div className="text-sm font-medium">
                                                                {language === 'ar' ? item.title_ar : item.title_en}
                                                            </div>
                                                    <div className="text-muted-foreground text-xs">
                                                                {formatPrice(item.price)} • {language === 'ar' ? 'بواسطة' : 'by'}{' '}
                                                                {language === 'ar' ? item.user?.name_ar : item.user?.name_en}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                                <div className="text-muted-foreground py-4 text-center">
                                                {language === 'ar' ? 'لا توجد عناصر في المفضلة' : 'No wishlist items yet'}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Wishlist Tab */}
                        <TabsContent value="wishlist" className="mt-6">
                            {/* Desktop Grid */}
                            <div className="hidden grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:grid">
                                    {(recentWishlist?.length ?? 0) > 0 ? (
                                        recentWishlist?.map((item) => (
                                            <Card
                                                key={item.id}
                                                className="group cursor-pointer transition-all duration-300 hover:shadow-lg"
                                                onClick={() => router.visit(`/product/${item.id}`)}
                                            >
                                        <div className="relative">
                                                    <div className="flex h-48 w-full items-center justify-center overflow-hidden bg-gray-100">
                                                        {item.primaryImage ? (
                                                            <img
                                                                src={item.primaryImage.url}
                                                                alt={language === 'ar' ? item.title_ar : item.title_en}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                    <Heart className="h-12 w-12 text-gray-400" />
                                                        )}
                                                </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute right-3 top-3 h-8 w-8 border-none bg-white/90 text-red-500 hover:bg-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFromWishlist(item.id);
                                                        }}
                                            >
                                                <Heart className="h-4 w-4 fill-current" />
                                            </Button>
                                        </div>
                                        <CardContent className="p-4">
                                                    <h3 className="mb-2 line-clamp-2 font-semibold">
                                                        {language === 'ar' ? item.title_ar : item.title_en}
                                                    </h3>
                                                    <div className="text-brand-red-600 mb-2 text-lg font-bold">{formatPrice(item.price)}</div>
                                                    <div className="text-muted-foreground mb-1 text-sm">
                                                        <span className="font-medium">
                                                            {language === 'ar' ? item.category?.name_ar : item.category?.name_en}
                                                        </span>
                                                    </div>
                                            <div className="text-muted-foreground text-sm">
                                                        {language === 'ar' ? 'بواسطة' : 'by'}{' '}
                                                        {language === 'ar' ? item.user?.name_ar : item.user?.name_en}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    ))
                                ) : (
                                        <div className="col-span-full py-12 text-center">
                                            <Heart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-semibold">
                                            {language === 'ar' ? 'لا توجد عناصر في المفضلة' : 'No wishlist items'}
                                        </h3>
                                            <p className="text-muted-foreground mb-4">
                                            {language === 'ar' ? 'ابدأ بإضافة المنتجات إلى مفضلتك' : 'Start adding products to your wishlist'}
                                        </p>
                                            <Button onClick={() => router.visit('/products')}>
                                                {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                                            </Button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile List */}
                            <div className="space-y-3 md:hidden">
                                {(recentWishlist?.length ?? 0) > 0 ? (
                                    recentWishlist?.map((item) => (
                                        <Card
                                            key={item.id}
                                            className="group cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                                            onClick={() => router.visit(`/product/${item.id}`)}
                                        >
                                            <div className="flex gap-3 p-3">
                                                {/* Product Image */}
                                                <div className="relative flex-shrink-0">
                                                    <div className="h-20 w-20 items-center justify-center overflow-hidden rounded bg-gray-100 flex">
                                                        {item.primaryImage ? (
                                                            <img
                                                                src={item.primaryImage.url}
                                                                alt={language === 'ar' ? item.title_ar : item.title_en}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Heart className="h-8 w-8 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-2">
                                                        <h3 className="text-luxury-black line-clamp-2 text-sm font-semibold leading-tight">
                                                            {language === 'ar' ? item.title_ar : item.title_en}
                                                        </h3>
                                                        <p className="text-muted-foreground text-xs mt-0.5">
                                                            {language === 'ar' ? item.category?.name_ar : item.category?.name_en}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="text-lg font-bold text-brand-red-600">
                                                            {formatPrice(item.price)}
                                                        </div>

                                                        <div className="text-muted-foreground text-xs">
                                                            {language === 'ar' ? 'بواسطة' : 'by'}{' '}
                                                            {language === 'ar' ? item.user?.name_ar : item.user?.name_en}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <Heart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-semibold">
                                            {language === 'ar' ? 'لا توجد عناصر في المفضلة' : 'No wishlist items'}
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            {language === 'ar' ? 'ابدأ بإضافة المنتجات إلى مفضلتك' : 'Start adding products to your wishlist'}
                                        </p>
                                        <Button onClick={() => router.visit('/products')}>
                                            {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Listings Tab */}
                        <TabsContent value="listings" className="mt-6">
                            <div className="space-y-4">
                                    {/* Create Listing Button - Always visible */}
                                    <div className="mb-4 flex justify-end">
                                        <Button
                                            onClick={() => {
                                                // Clear any existing draft data for new listing
                                                localStorage.removeItem('sell-draft');
                                                router.visit('/sell/category');
                                            }}
                                            className="bg-brand-red-600 hover:bg-brand-red-700"
                                        >
                                            <Package className="mr-2 h-4 w-4" />
                                            {language === 'ar' ? 'إنشاء إعلان جديد' : 'Create New Listing'}
                                        </Button>
                                    </div>

                                    {listings.length > 0 ? (
                                        <>
                                            {/* Desktop Layout */}
                                            <div className="hidden space-y-4 md:block">
                                                {listings.map((listing: Ad) => (
                                    <Card key={listing.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-100">
                                                        {listing.primaryImage ? (
                                                            <img 
                                                                src={listing.primaryImage.url} 
                                                                alt={language === 'ar' ? listing.title_ar : listing.title_en} 
                                                                className="h-full w-full object-cover" 
                                                            />
                                                        ) : (
                                                            <Package className="h-8 w-8 text-gray-400" />
                                                        )}
                                                    </div>

                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center justify-between">
                                                            <h3 className="font-semibold">
                                                                {language === 'ar' ? listing.title_ar : listing.title_en}
                                                            </h3>
                                                                        <div className="flex items-center gap-2">
                                                                            {getStatusBadge(listing)}
                                                                            {listing.is_featured && (
                                                                                <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
                                                                                    <TrendingUp className="mr-1 h-3 w-3" />
                                                                                    {language === 'ar' ? 'مميز' : 'Featured'}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                    </div>

                                                    <div className="text-muted-foreground mb-3 flex items-center gap-6 text-sm">
                                                            <span className="text-lg font-bold">{formatPrice(listing.price)}</span>
                                                                        {hasAnalyticsEnabled() && (
                                                        <span>
                                                                {listing.views_count} {language === 'ar' ? 'مشاهدة' : 'views'}
                                                        </span>
                                                                        )}
                                                                        {hasAnalyticsEnabled() && (
                                                        <span>
                                                                {listing.contact_count} {language === 'ar' ? 'اتصال' : 'contacts'}
                                                        </span>
                                                                        )}
                                                            <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                                                    </div>

                                                    <div className="flex gap-2">
                                                                        {/* Only show action buttons if ad is not sold */}
                                                                        {listing.status !== 'sold' && (
                                                                            <>
                                                                                <Button variant="outline" size="sm" onClick={() => handleEditAd(listing)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            {language === 'ar' ? 'تعديل' : 'Edit'}
                                                        </Button>

                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => handleFeatureAd(listing.id)}
                                                                                    className={
                                                                                        listing.is_featured
                                                                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                                            : ''
                                                                                    }
                                                                                >
                                                            <TrendingUp className="mr-2 h-4 w-4" />
                                                                                    {listing.is_featured
                                                                                        ? language === 'ar'
                                                                                            ? 'إلغاء التمييز'
                                                                                            : 'Unfeature'
                                                                                        : language === 'ar'
                                                                                          ? 'مميز'
                                                                                      : 'Feature'}
                                                        </Button>
                                                                        </>
                                                                    )}

                                                                    {/* Expire button - only show for active ads */}
                                                                    {listing.status === 'active' && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleExpireAd(listing.id)}
                                                                            className="text-orange-600 hover:text-orange-700"
                                                                        >
                                                                            <Clock className="mr-2 h-4 w-4" />
                                                                            {language === 'ar' ? 'انتهاء' : 'Expire'}
                                                                        </Button>
                                                                    )}

                                                                    {/* Reactivate button - only show for expired ads */}
                                                                    {listing.status === 'expired' && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleReactivateAd(listing.id)}
                                                                            className="text-green-600 hover:text-green-700"
                                                                        >
                                                                            <RotateCcw className="mr-2 h-4 w-4" />
                                                                            {language === 'ar' ? 'إعادة تفعيل' : 'Reactivate'}
                                                                        </Button>
                                                                    )}

                                                                    {/* View inactive message button - only show for inactive ads */}
                                                                    {listing.status === 'inactive' && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleViewInactiveMessage(listing)}
                                                                            className="text-gray-600 hover:text-gray-700"
                                                                        >
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            {language === 'ar' ? 'عرض الرسالة' : 'View Message'}
                                                                        </Button>
                                                                    )}

                                                                    {/* Mark as sold button - only show for approved and active ads */}
                                                                    {listing.status === 'active' && listing.is_approved === true && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleMarkAsSold(listing.id)}
                                                                            className="text-blue-600 hover:text-blue-700"
                                                                        >
                                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                            {language === 'ar' ? 'تم البيع' : 'Mark as Sold'}
                                                                        </Button>
                                                                    )}

                                                                    {/* Delete button - only show if ad is not sold */}
                                                                    {listing.status !== 'sold' && (
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            {language === 'ar' ? 'حذف' : 'Delete'}
                                                        </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>
                                                                                        {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                                                                                    </AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        {language === 'ar'
                                                                                            ? 'هل أنت متأكد من أنك تريد حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.'
                                                                                            : 'Are you sure you want to delete this ad? This action cannot be undone.'}
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>
                                                                                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                                                                    </AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={() => handleDeleteAd(listing.id)}
                                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                    >
                                                                                        {language === 'ar' ? 'حذف' : 'Delete'}
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                                ))}
                                            </div>

                                            {/* Mobile Layout */}
                                            <div className="space-y-3 md:hidden">
                                                {listings.map((listing: Ad) => (
                                                    <Card key={listing.id} className="group transition-all duration-300 hover:shadow-lg active:scale-[0.98]">
                                                        <CardContent className="p-4">
                                                            <div className="flex gap-3">
                                                                {/* Product Image */}
                                                                <div className="relative flex-shrink-0">
                                                                    <div className="h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-100 flex">
                                                                        {listing.primaryImage ? (
                                                                            <img 
                                                                                src={listing.primaryImage.url} 
                                                                                alt={language === 'ar' ? listing.title_ar : listing.title_en} 
                                                                                className="h-full w-full object-cover" 
                                                                            />
                                                                        ) : (
                                                                            <Package className="h-6 w-6 text-gray-400" />
                                                                        )}
                                                                    </div>
                                                                    {listing.is_featured && (
                                                                        <Badge className="absolute -right-1 -top-1 border-yellow-200 bg-yellow-100 text-yellow-800 px-1.5 py-0.5 text-xs">
                                                                            <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                                                                            {language === 'ar' ? 'مميز' : 'Featured'}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                {/* Product Details */}
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="mb-2 flex items-start justify-between">
                                                                        <div className="min-w-0 flex-1 pr-2">
                                                                            <h3 className="text-luxury-black line-clamp-2 text-sm font-semibold leading-tight">
                                                                                {language === 'ar' ? listing.title_ar : listing.title_en}
                                                                            </h3>
                                                                            <div className="mt-1 flex items-center gap-2">
                                                                                {getStatusBadge(listing)}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="text-lg font-bold text-brand-red-600">
                                                                            {formatPrice(listing.price)}
                                                                        </div>

                                                                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                                                                            {hasAnalyticsEnabled() && (
                                                                                <span>
                                                                                    {listing.views_count} {language === 'ar' ? 'مشاهدة' : 'views'}
                                                                                </span>
                                                                            )}
                                                                            {hasAnalyticsEnabled() && (
                                                                                <span>
                                                                                    {listing.contact_count} {language === 'ar' ? 'اتصال' : 'contacts'}
                                                                                </span>
                                                                            )}
                                                                            <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                                                                        </div>

                                                                        {/* Action Buttons - Mobile */}
                                                                        {listing.status !== 'sold' && (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                <Button 
                                                                                    variant="outline" 
                                                                                    size="sm" 
                                                                                    className="text-xs px-2 py-1 h-7"
                                                                                    onClick={() => handleEditAd(listing)}
                                                                                >
                                                                                    <Edit className="mr-1 h-3 w-3" />
                                                                                    {language === 'ar' ? 'تعديل' : 'Edit'}
                                                                                </Button>

                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className={`text-xs px-2 py-1 h-7 ${
                                                                                        listing.is_featured
                                                                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                                            : ''
                                                                                    }`}
                                                                                    onClick={() => handleFeatureAd(listing.id)}
                                                                                >
                                                                                    <TrendingUp className="mr-1 h-3 w-3" />
                                                                                    {listing.is_featured
                                                                                        ? language === 'ar'
                                                                                            ? 'إلغاء'
                                                                                            : 'Unfeature'
                                                                                        : language === 'ar'
                                                                                          ? 'مميز'
                                                                                        : 'Feature'}
                                                                                </Button>

                                                                                {listing.status === 'active' && (
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="text-xs px-2 py-1 h-7 text-orange-600 hover:text-orange-700"
                                                                                        onClick={() => handleExpireAd(listing.id)}
                                                                                    >
                                                                                        <Clock className="mr-1 h-3 w-3" />
                                                                                        {language === 'ar' ? 'انتهاء' : 'Expire'}
                                                                                    </Button>
                                                                                )}

                                                                                {listing.status === 'expired' && (
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="text-xs px-2 py-1 h-7 text-green-600 hover:text-green-700"
                                                                                        onClick={() => handleReactivateAd(listing.id)}
                                                                                    >
                                                                                        <RotateCcw className="mr-1 h-3 w-3" />
                                                                                        {language === 'ar' ? 'إعادة' : 'Reactivate'}
                                                                                    </Button>
                                                                                )}

                                                                                {listing.status === 'inactive' && (
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="text-xs px-2 py-1 h-7 text-gray-600 hover:text-gray-700"
                                                                                        onClick={() => handleViewInactiveMessage(listing)}
                                                                                    >
                                                                                        <Eye className="mr-1 h-3 w-3" />
                                                                                        {language === 'ar' ? 'عرض' : 'View'}
                                                                                    </Button>
                                                                                )}

                                                                                {listing.status === 'active' && listing.is_approved === true && (
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="text-xs px-2 py-1 h-7 text-blue-600 hover:text-blue-700"
                                                                                        onClick={() => handleMarkAsSold(listing.id)}
                                                                                    >
                                                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                                        {language === 'ar' ? 'تم البيع' : 'Sold'}
                                                                                    </Button>
                                                                                )}

                                                                                <AlertDialog>
                                                                                    <AlertDialogTrigger asChild>
                                                                                        <Button 
                                                                                            variant="outline" 
                                                                                            size="sm" 
                                                                                            className="text-xs px-2 py-1 h-7 text-destructive hover:text-destructive"
                                                                                        >
                                                                                            <Trash2 className="mr-1 h-3 w-3" />
                                                                                            {language === 'ar' ? 'حذف' : 'Delete'}
                                                                                        </Button>
                                                                                    </AlertDialogTrigger>
                                                                                    <AlertDialogContent>
                                                                                        <AlertDialogHeader>
                                                                                            <AlertDialogTitle>
                                                                                                {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                                                                                            </AlertDialogTitle>
                                                                                            <AlertDialogDescription>
                                                                                                {language === 'ar'
                                                                                                    ? 'هل أنت متأكد من أنك تريد حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.'
                                                                                                    : 'Are you sure you want to delete this ad? This action cannot be undone.'}
                                                                                            </AlertDialogDescription>
                                                                                        </AlertDialogHeader>
                                                                                        <AlertDialogFooter>
                                                                                            <AlertDialogCancel>
                                                                                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                                                                            </AlertDialogCancel>
                                                                                            <AlertDialogAction
                                                                                                onClick={() => handleDeleteAd(listing.id)}
                                                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                            >
                                                                                                {language === 'ar' ? 'حذف' : 'Delete'}
                                                                                            </AlertDialogAction>
                                                                                        </AlertDialogFooter>
                                                                                    </AlertDialogContent>
                                                                                </AlertDialog>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>

                                            {/* Pagination Controls */}
                                            {pagination && (
                                                <div className="mt-6 flex items-center justify-between">
                                                    <div className="text-muted-foreground text-sm">
                                                        {language === 'ar'
                                                            ? `عرض ${pagination.from || 0} إلى ${pagination.to || 0} من ${pagination.total || 0} إعلان`
                                                            : `Showing ${pagination.from || 0} to ${pagination.to || 0} of ${pagination.total || 0} listings`}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePageChange(paginationState.currentPage - 1)}
                                                            disabled={paginationState.currentPage <= 1}
                                                        >
                                                            {language === 'ar' ? 'السابق' : 'Previous'}
                                                        </Button>

                                                        <span className="text-sm">
                                                            {language === 'ar'
                                                                ? `صفحة ${paginationState.currentPage} من ${pagination.last_page}`
                                                                : `Page ${paginationState.currentPage} of ${pagination.last_page}`}
                                                        </span>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePageChange(paginationState.currentPage + 1)}
                                                            disabled={!pagination.next_page_url}
                                                        >
                                                            {language === 'ar' ? 'التالي' : 'Next'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-semibold">
                                            {language === 'ar' ? 'لا توجد إعلانات' : 'No listings yet'}
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            {language === 'ar' ? 'ابدأ بإنشاء إعلانك الأول' : 'Start by creating your first listing'}
                                        </p>
                                            <Button
                                                onClick={() => {
                                                    // Clear any existing draft data for new listing
                                                    localStorage.removeItem('sell-draft');
                                                    router.visit('/sell/category');
                                                }}
                                            >
                                            {language === 'ar' ? 'إنشاء إعلان' : 'Create Listing'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Billing Tab */}
                        <TabsContent value="billing" className="mt-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{language === 'ar' ? 'الخطة الحالية' : 'Current Plan'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {user.subscription ? (
                                            <>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                        <div className="font-semibold">
                                                            {language === 'ar' ? user.subscription.plan.name_ar : user.subscription.plan.name_en}
                                                        </div>
                                                <div className="text-muted-foreground text-sm">
                                                                {formatPrice(user.subscription.plan.price)} /{' '}
                                                                {user.subscription.plan.is_lifetime
                                                                    ? language === 'ar'
                                                                        ? 'مدى الحياة'
                                                                        : 'Lifetime'
                                                                    : `${user.subscription.plan.months_count} ${language === 'ar' ? 'شهر' : 'months'}`}
                                                        </div>
                                                    </div>
                                                        <Badge
                                                            className={
                                                                user.subscription.is_active
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }
                                                        >
                                                            <Crown className="mr-1 h-3 w-3" />
                                                            {user.subscription.is_active
                                                                ? language === 'ar'
                                                                    ? 'نشط'
                                                                    : 'Active'
                                                                : language === 'ar'
                                                                  ? 'منتهي'
                                                                  : 'Expired'}
                                                    </Badge>
                                                </div>
                                                {user.subscription.expires_at && (
                                                        <div className="text-muted-foreground text-sm">
                                                            {language === 'ar' ? 'ينتهي في' : 'Expires on'}{' '}
                                                            {new Date(user.subscription.expires_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                                <div className="py-4 text-center">
                                                    <Crown className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                <p className="text-muted-foreground">
                                                    {language === 'ar' ? 'لا توجد خطة نشطة' : 'No active subscription'}
                                                </p>
                                            </div>
                                        )}
                                            {user.subscription ? (
                                        <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full">
                                                    {language === 'ar' ? 'ترقية الاشتراك' : 'Upgrade Subscription'}
                                                </Button>
                                            </DialogTrigger>
                                                    <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>{language === 'ar' ? 'ترقية الاشتراك' : 'Upgrade Subscription'}</DialogTitle>
                                                </DialogHeader>
                                                        <div className="py-4">
                                                            {user?.subscription && (
                                                                <SelectUpgradeSubscriptionFromProfile
                                                                    currentSubscription={{
                                                                        created_at: user.subscription.created_at,
                                                                        id: user.subscription.id,
                                                                        plan: user.subscription.plan,
                                                                        expires_at: user.subscription.expires_at,
                                                                        subscription_plan_id: user.subscription.id,
                                                                        analytics: user.subscription.plan.analytics || false,
                                                                    }}
                                                                    onPlanSelect={setSelectedUpgradePlan}
                                                                    selectedPlanId={selectedUpgradePlan}
                                                                    onUpgrade={handleUpgradeSubscription}
                                                                    isUpgrading={isUpgrading}
                                                                />
                                                            )}
                                                        </div>
                                                        <DialogFooter>
                                                        <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
                                                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                                        </Button>
                                                        </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                            ) : (
                                                <></>
                                            )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                            {(transactions?.length ?? 0) > 0 ? (
                                        <div className="space-y-3">
                                                    {transactions?.map((transaction, index) => (
                                                        <div
                                                            key={transaction.id || index}
                                                            className="flex items-center justify-between border-b py-3"
                                                        >
                                                            <div className="flex-1">
                                                            <div className="font-medium">{transaction.description}</div>
                                                                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                                                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                                                    <span>•</span>
                                                                    <span className="capitalize">{transaction.payment_method}</span>
                                                                    {transaction.subscription_plan && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span>
                                                                                {language === 'ar'
                                                                                    ? transaction.subscription_plan.name_ar
                                                                                    : transaction.subscription_plan.name_en}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                            </div>
                                                        </div>
                                                            <div className="text-right">
                                                        <div className="font-semibold">{formatPrice(transaction.amount)}</div>
                                                                <div
                                                                    className={`text-xs ${
                                                                        transaction.status === 'completed'
                                                                            ? 'text-green-600'
                                                                            : transaction.status === 'pending'
                                                                              ? 'text-yellow-600'
                                                                              : transaction.status === 'failed'
                                                                                ? 'text-red-600'
                                                                                : 'text-gray-600'
                                                                    }`}
                                                                >
                                                                    {transaction.status === 'completed'
                                                                        ? language === 'ar'
                                                                            ? 'مكتمل'
                                                                            : 'Completed'
                                                                        : transaction.status === 'pending'
                                                                          ? language === 'ar'
                                                                              ? 'معلق'
                                                                              : 'Pending'
                                                                          : transaction.status === 'failed'
                                                                            ? language === 'ar'
                                                                                ? 'فشل'
                                                                                : 'Failed'
                                                                            : transaction.status}
                                                                </div>
                                                            </div>
                                                </div>
                                                ))}
                                            </div>
                                        ) : (
                                                <div className="py-4 text-center">
                                                    <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                <p className="text-muted-foreground">
                                                    {language === 'ar' ? 'لا توجد معاملات' : 'No transactions yet'}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="mt-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{language === 'ar' ? 'معلومات الحساب' : 'Account Information'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                                                    <Input id="name" value={language === 'ar' ? user.name_ar : user.name_en} disabled />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                                                <Input 
                                                    id="email" 
                                                    type="email" 
                                                        value={user.email || (language === 'ar' ? 'غير محدد' : 'Not set')}
                                                    disabled 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                                                <Input id="phone" value={user.phone || ''} disabled />
                                        </div>

                                        <div>
                                            <Label htmlFor="governorate">{language === 'ar' ? 'المحافظة' : 'Governorate'}</Label>
                                            <Input 
                                                id="governorate" 
                                                    value={
                                                        user.governorate
                                                            ? language === 'ar'
                                                                ? user.governorate.name_ar
                                                                : user.governorate.name_en
                                                            : ''
                                                    }
                                                disabled 
                                            />
                                        </div>

                                            <Button onClick={() => setIsEditDialogOpen(true)} className="w-full">
                                            <Edit className="mr-2 h-4 w-4" />
                                            {language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{language === 'ar' ? 'التفضيلات' : 'Preferences'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{language === 'ar' ? 'اللغة' : 'Language'}</div>
                                                    <div className="text-muted-foreground text-sm">{language === 'ar' ? 'العربية' : 'English'}</div>
                                            </div>
                                            <Button variant="outline" onClick={toggleLanguage}>
                                                {language === 'ar' ? 'English' : 'العربية'}
                                            </Button>
                                        </div>

                                            {/* <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="email-notifications">
                                                    {language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                                                </Label>
                                                <Switch
                                                    id="email-notifications"
                                                    checked={notifications.email}
                                                    onCheckedChange={(checked: boolean) => setNotifications((prev) => ({ ...prev, email: checked }))}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="sms-notifications">
                                                    {language === 'ar' ? 'إشعارات الرسائل النصية' : 'SMS Notifications'}
                                                </Label>
                                                <Switch
                                                    id="sms-notifications"
                                                    checked={notifications.sms}
                                                    onCheckedChange={(checked: boolean) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="push-notifications">
                                                    {language === 'ar' ? 'الإشعارات الفورية' : 'Push Notifications'}
                                                </Label>
                                                <Switch
                                                    id="push-notifications"
                                                    checked={notifications.push}
                                                    onCheckedChange={(checked: boolean) => setNotifications((prev) => ({ ...prev, push: checked }))}
                                                />
                                            </div>
                                        </div> */}

                                        <div className="border-t pt-6">
                                            <Button
                                                variant="outline"
                                                    onClick={() => logout()}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
                {/* <BottomNavigation /> */}

                {/* Edit Ad Dialog */}
                <Dialog open={isEditAdDialogOpen} onOpenChange={setIsEditAdDialogOpen}>
                    <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col rounded-lg p-0">
                        {/* Sticky Header */}
                        <DialogHeader className="bg-background flex-shrink-0 rounded-t-lg border-b p-6">
                            <DialogTitle>{language === 'ar' ? 'تعديل الإعلان' : 'Edit Ad'}</DialogTitle>
                        </DialogHeader>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <ProductDetails formData={editFormData} updateFormData={updateEditFormData} isSubmitting={isLoading} />
                        </div>

                        {/* Sticky Footer */}
                        <div className="bg-background flex flex-shrink-0 justify-end gap-2 rounded-b-lg border-t p-6">
                            <Button variant="outline" onClick={() => setIsEditAdDialogOpen(false)}>
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </Button>
                            <Button onClick={handleUpdateAd}>
                                {editingAd && editingAd.is_approved === false
                                    ? language === 'ar'
                                        ? 'حفظ وإرسال للمراجعة'
                                        : 'Save and Send to Review'
                                    : language === 'ar'
                                      ? 'حفظ التغييرات'
                                      : 'Save Changes'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Reject Reason Modal */}
                <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{language === 'ar' ? 'سبب الرفض' : 'Rejection Reason'}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-muted-foreground text-sm">{rejectReason}</p>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setShowRejectModal(false)}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Inactive Message Modal */}
                <Dialog open={showInactiveModal} onOpenChange={setShowInactiveModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{language === 'ar' ? 'رسالة الإعلان غير النشط' : 'Inactive Ad Message'}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-muted-foreground mb-4 text-sm">{inactiveMessage}</p>
                            <div className="border-t pt-4">
                                <p className="text-muted-foreground text-xs">
                                    {language === 'ar'
                                        ? 'لإعادة تفعيل هذا الإعلان، يرجى التواصل معنا على: live-musamemat@support.com'
                                        : 'To reactivate this ad, please contact us at: live-musamemat@support.com'}
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setShowInactiveModal(false)}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        </div>
        </UserLayout>
    );
}

export default Profile;
