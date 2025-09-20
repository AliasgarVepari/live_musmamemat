import { BottomNavigation } from '@/components/user/BottomNavigation';
import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/user/ui/avatar';
import { Badge } from '@/components/user/ui/badge';
import { Button } from '@/components/user/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/user/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/user/ui/dialog';
import { Input } from '@/components/user/ui/input';
import { Label } from '@/components/user/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/user/ui/select';
import { Switch } from '@/components/user/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/user/ui/tabs';
import { Textarea } from '@/components/user/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import UserLayout from '@/layouts/user/user-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    Calendar, 
    CheckCircle, 
    CreditCard, 
    Crown, 
    Edit, 
    Eye, 
    Heart, 
    LogOut, 
    Package, 
    Settings, 
    Shield, 
    Star, 
    Trash2, 
    TrendingUp, 
    User,
    X
} from 'lucide-react';
import { useState } from 'react';

// Types
interface User {
    id: number;
    name_en: string;
    name_ar: string;
    email: string;
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
        is_active: boolean;
        expires_at: string;
        plan: {
            id: number;
            name_en: string;
            name_ar: string;
            price: number;
        };
    };
}

interface Ad {
    id: number;
    title_en: string;
    title_ar: string;
    price: number;
    status: string;
    views_count: number;
    contact_count: number;
    created_at: string;
    category: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    primaryImage?: {
        id: number;
        url: string;
        is_primary: boolean;
    };
}

interface SubscriptionPlan {
    id: number;
    name_en: string;
    name_ar: string;
    price: number;
    months_count: number;
    is_lifetime: boolean;
}

interface ProfileProps {
    user: User;
    stats: {
        active_listings: number;
        total_sales: number;
        profile_views: number;
        wishlist_items: number;
    };
    recentListings: Ad[];
    recentWishlist: any[];
    subscriptionPlans: SubscriptionPlan[];
    transactions: any[];
}

function Profile({ user, stats, recentListings, recentWishlist, subscriptionPlans, transactions }: ProfileProps) {
    const { language, toggleLanguage } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
    });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [deletingAd, setDeletingAd] = useState<number | null>(null);

    // Form for profile editing
    const { data: editData, setData: setEditData, post: updateProfile, processing: updating } = useForm({
        name_en: user.name_en,
        name_ar: user.name_ar,
        email: user.email,
        phone: user.phone || '',
        phone_whatsapp: user.phone_whatsapp || '',
        bio_en: user.bio_en || '',
        bio_ar: user.bio_ar || '',
    });

    // Form for subscription upgrade
    const { data: upgradeData, setData: setUpgradeData, post: upgradeSubscription, processing: upgrading } = useForm({
        plan_id: selectedPlan || 0,
    });

    const handleEditProfile = () => {
        updateProfile(route('user.profile.update'), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
            },
        });
    };

    const handleUpgradeSubscription = () => {
        if (!selectedPlan) return;
        
        setUpgradeData('plan_id', selectedPlan);
        upgradeSubscription(route('user.profile.upgrade'), {
            onSuccess: () => {
                setIsUpgradeDialogOpen(false);
                setSelectedPlan(null);
            },
        });
    };

    const handleDeleteAd = (adId: number) => {
        if (confirm('Are you sure you want to delete this ad?')) {
            router.delete(`/admin/ads/${adId}`, {
                onSuccess: () => {
                    router.reload();
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

    const getStatusBadge = (status: string) => {
        const statusMap = {
            active: { color: 'bg-green-100 text-green-800', text: language === 'ar' ? 'نشط' : 'Active' },
            inactive: { color: 'bg-gray-100 text-gray-800', text: language === 'ar' ? 'غير نشط' : 'Inactive' },
            sold: { color: 'bg-blue-100 text-blue-800', text: language === 'ar' ? 'مباع' : 'Sold' },
            expired: { color: 'bg-yellow-100 text-yellow-800', text: language === 'ar' ? 'منتهي' : 'Expired' },
            draft: { color: 'bg-gray-100 text-gray-800', text: language === 'ar' ? 'مسودة' : 'Draft' },
        };
        
        const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.inactive;
        
        return (
            <Badge className={statusInfo.color}>
                {statusInfo.text}
            </Badge>
        );
    };

    return (
        <UserLayout>
            <Head title="Profile" />
        <div className="bg-background min-h-screen">
            <Header />

                <main className="main-content py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className={`mb-8 ${language === 'ar' ? 'rtl' : ''}`}>
                        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.profile_picture_url} />
                                <AvatarFallback className="text-2xl">
                                    {language === 'ar' ? user.name_ar[0] : user.name_en[0]}
                                </AvatarFallback>
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
                                    <div className="flex items-center">
                                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        4.8 (24 {language === 'ar' ? 'تقييم' : 'reviews'})
                                    </div>
                                    <span>
                                        {language === 'ar' ? 'عضو منذ' : 'Member since'} {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                                                    value={editData.email}
                                                    onChange={(e) => setEditData('email', e.target.value)}
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
                                                <Button onClick={handleEditProfile} disabled={updating}>
                                                    {updating ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
                                                </Button>
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
                                        <div className="text-2xl font-bold">{stats.active_listings}</div>
                                        <div className="text-muted-foreground text-sm">{language === 'ar' ? 'إعلان نشط' : 'Active Listings'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold">{stats.total_sales}</div>
                                        <div className="text-muted-foreground text-sm">{language === 'ar' ? 'مبيعات مكتملة' : 'Total Sales'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold">{stats.profile_views}</div>
                                        <div className="text-muted-foreground text-sm">{language === 'ar' ? 'مشاهدات الملف' : 'Profile Views'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold">{stats.wishlist_items}</div>
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
                                                    <div className="h-12 w-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
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
                                                            {formatPrice(listing.price)} • {listing.views_count} {language === 'ar' ? 'مشاهدة' : 'views'}
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(listing.status)}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-muted-foreground">
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
                                        {recentWishlist.length > 0 ? (
                                            recentWishlist.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                                        <Heart className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">{item.title}</div>
                                                    <div className="text-muted-foreground text-xs">
                                                            {formatPrice(item.price)} • {language === 'ar' ? 'بواسطة' : 'by'} {item.seller}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-muted-foreground">
                                                {language === 'ar' ? 'لا توجد عناصر في المفضلة' : 'No wishlist items yet'}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Wishlist Tab */}
                        <TabsContent value="wishlist" className="mt-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {recentWishlist.length > 0 ? (
                                    recentWishlist.map((item) => (
                                        <Card key={item.id} className="hover:shadow-lg group transition-all duration-300">
                                        <div className="relative">
                                                <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
                                                    <Heart className="h-12 w-12 text-gray-400" />
                                                </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute right-3 top-3 h-8 w-8 border-none bg-white/90 text-red-500 hover:bg-white"
                                            >
                                                <Heart className="h-4 w-4 fill-current" />
                                            </Button>
                                        </div>
                                        <CardContent className="p-4">
                                                <h3 className="mb-2 font-semibold">{item.title}</h3>
                                                <div className="mb-1 text-lg font-bold">{formatPrice(item.price)}</div>
                                            <div className="text-muted-foreground text-sm">
                                                {language === 'ar' ? 'بواسطة' : 'by'} {item.seller}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            {language === 'ar' ? 'لا توجد عناصر في المفضلة' : 'No wishlist items'}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {language === 'ar' ? 'ابدأ بإضافة المنتجات إلى مفضلتك' : 'Start adding products to your wishlist'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Listings Tab */}
                        <TabsContent value="listings" className="mt-6">
                            <div className="space-y-4">
                                {recentListings.length > 0 ? (
                                    recentListings.map((listing) => (
                                    <Card key={listing.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
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
                                                            {getStatusBadge(listing.status)}
                                                    </div>

                                                    <div className="text-muted-foreground mb-3 flex items-center gap-6 text-sm">
                                                            <span className="text-lg font-bold">{formatPrice(listing.price)}</span>
                                                        <span>
                                                                {listing.views_count} {language === 'ar' ? 'مشاهدة' : 'views'}
                                                        </span>
                                                        <span>
                                                                {listing.contact_count} {language === 'ar' ? 'اتصال' : 'contacts'}
                                                        </span>
                                                            <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            {language === 'ar' ? 'تعديل' : 'Edit'}
                                                        </Button>

                                                        <Button variant="outline" size="sm">
                                                            <TrendingUp className="mr-2 h-4 w-4" />
                                                                {language === 'ar' ? 'مميز' : 'Feature'}
                                                        </Button>

                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => handleDeleteAd(listing.id)}
                                                            >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            {language === 'ar' ? 'حذف' : 'Delete'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            {language === 'ar' ? 'لا توجد إعلانات' : 'No listings yet'}
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            {language === 'ar' ? 'ابدأ بإنشاء إعلانك الأول' : 'Start by creating your first listing'}
                                        </p>
                                        <Button>
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
                                                            {formatPrice(user.subscription.plan.price)} / {user.subscription.plan.is_lifetime ? 
                                                                (language === 'ar' ? 'مدى الحياة' : 'Lifetime') : 
                                                                `${user.subscription.plan.months_count} ${language === 'ar' ? 'شهر' : 'months'}`
                                                            }
                                                        </div>
                                                    </div>
                                                    <Badge className={user.subscription.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                        <Crown className="mr-1 h-3 w-3" />
                                                        {user.subscription.is_active ? 
                                                            (language === 'ar' ? 'نشط' : 'Active') : 
                                                            (language === 'ar' ? 'منتهي' : 'Expired')
                                                        }
                                                    </Badge>
                                                </div>
                                                {user.subscription.expires_at && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {language === 'ar' ? 'ينتهي في' : 'Expires on'} {new Date(user.subscription.expires_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-4">
                                                <Crown className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                <p className="text-muted-foreground">
                                                    {language === 'ar' ? 'لا توجد خطة نشطة' : 'No active subscription'}
                                                </p>
                                            </div>
                                        )}

                                        <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full">
                                                    {language === 'ar' ? 'ترقية الاشتراك' : 'Upgrade Subscription'}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{language === 'ar' ? 'ترقية الاشتراك' : 'Upgrade Subscription'}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="plan">{language === 'ar' ? 'اختر الخطة' : 'Select Plan'}</Label>
                                                        <Select value={selectedPlan?.toString()} onValueChange={(value) => setSelectedPlan(parseInt(value))}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={language === 'ar' ? 'اختر خطة' : 'Select a plan'} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {subscriptionPlans.map((plan) => (
                                                                    <SelectItem key={plan.id} value={plan.id.toString()}>
                                                                        {language === 'ar' ? plan.name_ar : plan.name_en} - {formatPrice(plan.price)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {selectedPlan && (
                                                        <div className="p-4 bg-gray-50 rounded-lg">
                                                            <div className="font-semibold">
                                                                {language === 'ar' ? 'تكلفة الترقية' : 'Upgrade Cost'}
                                                            </div>
                                                            <div className="text-2xl font-bold">
                                                                {formatPrice(subscriptionPlans.find(p => p.id === selectedPlan)?.price || 0)}
                                                            </div>
                                        </div>
                                                    )}
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
                                                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                                        </Button>
                                                        <Button 
                                                            onClick={handleUpgradeSubscription} 
                                                            disabled={!selectedPlan || upgrading}
                                                        >
                                                            {upgrading ? 
                                                                (language === 'ar' ? 'جاري الترقية...' : 'Upgrading...') : 
                                                                (language === 'ar' ? 'ترقية' : 'Upgrade')
                                                            }
                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {transactions.length > 0 ? (
                                        <div className="space-y-3">
                                                {transactions.map((transaction, index) => (
                                                    <div key={index} className="flex items-center justify-between border-b py-2">
                                                <div>
                                                            <div className="font-medium">{transaction.description}</div>
                                                            <div className="text-muted-foreground text-sm">
                                                                {new Date(transaction.date).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div className="font-semibold">{formatPrice(transaction.amount)}</div>
                                                </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <CreditCard className="mx-auto h-8 w-8 text-gray-400 mb-2" />
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
                                                <Input 
                                                    id="name" 
                                                    value={language === 'ar' ? user.name_ar : user.name_en} 
                                                    disabled 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                                                <Input 
                                                    id="email" 
                                                    type="email" 
                                                    value={user.email} 
                                                    disabled 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                                            <Input 
                                                id="phone" 
                                                value={user.phone || ''} 
                                                disabled 
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="governorate">{language === 'ar' ? 'المحافظة' : 'Governorate'}</Label>
                                            <Input 
                                                id="governorate" 
                                                value={user.governorate ? (language === 'ar' ? user.governorate.name_ar : user.governorate.name_en) : ''} 
                                                disabled 
                                            />
                                        </div>

                                        <Button 
                                            onClick={() => setIsEditDialogOpen(true)}
                                            className="w-full"
                                        >
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
                                                <div className="text-muted-foreground text-sm">
                                                    {language === 'ar' ? 'العربية' : 'English'}
                                                </div>
                                            </div>
                                            <Button variant="outline" onClick={toggleLanguage}>
                                                {language === 'ar' ? 'English' : 'العربية'}
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
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
                                        </div>

                                        <div className="border-t pt-6">
                                            <Button
                                                variant="outline"
                                                onClick={() => router.post('/logout')}
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
            <BottomNavigation />
        </div>
        </UserLayout>
    );
};

export default Profile;
