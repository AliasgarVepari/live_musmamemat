import { BottomNavigation } from '@/components/user/BottomNavigation';
import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/user/ui/avatar';
import { Badge } from '@/components/user/ui/badge';
import { Button } from '@/components/user/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/user/ui/card';
import { Input } from '@/components/user/ui/input';
import { Label } from '@/components/user/ui/label';
import { Switch } from '@/components/user/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/user/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreditCard, Crown, Edit, Heart, LogOut, Package, Settings, Shield, Star, Trash2, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';

// Import images
import sarahAvatar from '@/assets/user/avatars/sarah-k.jpg';
import designerSunglasses1 from '@/assets/user/products/designer-sunglasses-1.jpg';
import diamondEarrings1 from '@/assets/user/products/diamond-earrings-1.jpg';
import goldWatch1 from '@/assets/user/products/gold-watch-1.jpg';
import luxuryHandbag1 from '@/assets/user/products/luxury-handbag-1.jpg';

// Mock user data
const mockUser = {
    name: 'Sarah K.',
    email: 'sarah.k@email.com',
    phone: '+965 1234 5678',
    avatar: sarahAvatar,
    memberSince: 'March 2022',
    rating: 4.8,
    reviews: 24,
    verified: true,
    plan: 'Silver',
};

// Mock listings data
const mockListings = [
    {
        id: '1',
        title: 'Luxury Designer Handbag',
        price: 2500,
        status: 'active',
        views: 156,
        likes: 12,
        image: luxuryHandbag1,
        posted: '2 days ago',
    },
    {
        id: '2',
        title: 'Vintage Gold Watch',
        price: 5200,
        status: 'inactive',
        views: 89,
        likes: 8,
        image: goldWatch1,
        posted: '1 week ago',
    },
];

// Mock wishlist data
const mockWishlist = [
    {
        id: '3',
        title: 'Diamond Earrings',
        price: 1800,
        image: diamondEarrings1,
        seller: 'Ahmed M.',
    },
    {
        id: '4',
        title: 'Designer Sunglasses',
        price: 450,
        image: designerSunglasses1,
        seller: 'Fatima A.',
    },
];

function Profile() {
    const { language, toggleLanguage } = useLanguage();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
    });

    return (
        <div className="bg-background min-h-screen">
            <Header />

            <main className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className={`mb-8 ${language === 'ar' ? 'rtl' : ''}`}>
                        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={mockUser.avatar} />
                                <AvatarFallback className="text-2xl">{mockUser.name[0]}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-3">
                                    <h1 className={`text-luxury-black text-3xl font-bold ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}>
                                        {mockUser.name}
                                    </h1>

                                    {mockUser.verified && (
                                        <Badge className="bg-luxury-emerald text-white">
                                            <Shield className="mr-1 h-3 w-3" />
                                            {language === 'ar' ? 'موثق' : 'Verified'}
                                        </Badge>
                                    )}

                                    <Badge className="bg-luxury-gold text-luxury-black">
                                        <Crown className="mr-1 h-3 w-3" />
                                        {mockUser.plan}
                                    </Badge>
                                </div>

                                <div className="text-muted-foreground mb-4 flex items-center gap-6 text-sm">
                                    <div className="flex items-center">
                                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        {mockUser.rating} ({mockUser.reviews} {language === 'ar' ? 'تقييم' : 'reviews'})
                                    </div>
                                    <span>
                                        {language === 'ar' ? 'عضو منذ' : 'Member since'} {mockUser.memberSince}
                                    </span>
                                </div>

                                <Button className="bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black">
                                    <Edit className="mr-2 h-4 w-4" />
                                    {language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                                </Button>
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
                                        <div className="text-luxury-black text-2xl font-bold">12</div>
                                        <div className="text-muted-foreground text-sm">{language === 'ar' ? 'إعلان نشط' : 'Active Listings'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-luxury-black text-2xl font-bold">48</div>
                                        <div className="text-muted-foreground text-sm">{language === 'ar' ? 'مبيعات مكتملة' : 'Total Sales'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-luxury-black text-2xl font-bold">1.2K</div>
                                        <div className="text-muted-foreground text-sm">{language === 'ar' ? 'مشاهدات الملف' : 'Profile Views'}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-luxury-black text-2xl font-bold">24</div>
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
                                        {mockListings.slice(0, 3).map((listing) => (
                                            <div key={listing.id} className="flex items-center gap-3">
                                                <img src={listing.image} alt={listing.title} className="h-12 w-12 rounded object-cover" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">{listing.title}</div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {listing.price} KD • {listing.views} {language === 'ar' ? 'مشاهدة' : 'views'}
                                                    </div>
                                                </div>
                                                <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                                                    {listing.status === 'active'
                                                        ? language === 'ar'
                                                            ? 'نشط'
                                                            : 'Active'
                                                        : language === 'ar'
                                                          ? 'غير نشط'
                                                          : 'Inactive'}
                                                </Badge>
                                            </div>
                                        ))}
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
                                        {mockWishlist.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex items-center gap-3">
                                                <img src={item.image} alt={item.title} className="h-12 w-12 rounded object-cover" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">{item.title}</div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {item.price} KD • {language === 'ar' ? 'بواسطة' : 'by'} {item.seller}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Wishlist Tab */}
                        <TabsContent value="wishlist" className="mt-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {mockWishlist.map((item) => (
                                    <Card key={item.id} className="hover:shadow-luxury group transition-all duration-300">
                                        <div className="relative">
                                            <img src={item.image} alt={item.title} className="h-48 w-full object-cover" />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute right-3 top-3 h-8 w-8 border-none bg-white/90 text-red-500 hover:bg-white"
                                            >
                                                <Heart className="h-4 w-4 fill-current" />
                                            </Button>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="text-luxury-black mb-2 font-semibold">{item.title}</h3>
                                            <div className="text-luxury-black mb-1 text-lg font-bold">{item.price} KD</div>
                                            <div className="text-muted-foreground text-sm">
                                                {language === 'ar' ? 'بواسطة' : 'by'} {item.seller}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Listings Tab */}
                        <TabsContent value="listings" className="mt-6">
                            <div className="space-y-4">
                                {mockListings.map((listing) => (
                                    <Card key={listing.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <img src={listing.image} alt={listing.title} className="h-16 w-16 rounded object-cover" />

                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <h3 className="text-luxury-black font-semibold">{listing.title}</h3>
                                                        <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                                                            {listing.status === 'active'
                                                                ? language === 'ar'
                                                                    ? 'نشط'
                                                                    : 'Active'
                                                                : language === 'ar'
                                                                  ? 'غير نشط'
                                                                  : 'Inactive'}
                                                        </Badge>
                                                    </div>

                                                    <div className="text-muted-foreground mb-3 flex items-center gap-6 text-sm">
                                                        <span className="text-luxury-black text-lg font-bold">{listing.price} KD</span>
                                                        <span>
                                                            {listing.views} {language === 'ar' ? 'مشاهدة' : 'views'}
                                                        </span>
                                                        <span>
                                                            {listing.likes} {language === 'ar' ? 'إعجاب' : 'likes'}
                                                        </span>
                                                        <span>{listing.posted}</span>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            {language === 'ar' ? 'تعديل' : 'Edit'}
                                                        </Button>

                                                        <Button variant="outline" size="sm">
                                                            <TrendingUp className="mr-2 h-4 w-4" />
                                                            {language === 'ar' ? 'ترقية' : 'Boost'}
                                                        </Button>

                                                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            {language === 'ar' ? 'حذف' : 'Delete'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
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
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-luxury-black font-semibold">Silver Plan</div>
                                                <div className="text-muted-foreground text-sm">
                                                    {language === 'ar' ? '10 إعلانات مميزة شهرياً' : '10 featured listings per month'}
                                                </div>
                                            </div>
                                            <Badge className="bg-luxury-gold text-luxury-black">
                                                <Crown className="mr-1 h-3 w-3" />
                                                {language === 'ar' ? 'نشط' : 'Active'}
                                            </Badge>
                                        </div>

                                        <Button className="bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black w-full">
                                            {language === 'ar' ? 'ترقية للخطة الذهبية' : 'Upgrade to Gold'}
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b py-2">
                                                <div>
                                                    <div className="font-medium">Silver Plan</div>
                                                    <div className="text-muted-foreground text-sm">Dec 15, 2024</div>
                                                </div>
                                                <div className="text-luxury-black font-semibold">15 KD</div>
                                            </div>

                                            <div className="flex items-center justify-between border-b py-2">
                                                <div>
                                                    <div className="font-medium">Featured Boost</div>
                                                    <div className="text-muted-foreground text-sm">Dec 10, 2024</div>
                                                </div>
                                                <div className="text-luxury-black font-semibold">5 KD</div>
                                            </div>
                                        </div>
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
                                                <Input id="name" defaultValue={mockUser.name} />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                                                <Input id="email" type="email" defaultValue={mockUser.email} />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                                            <Input id="phone" defaultValue={mockUser.phone} />
                                        </div>

                                        <Button className="bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black">
                                            {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
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

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="email-notifications">
                                                    {language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                                                </Label>
                                                <Switch
                                                    id="email-notifications"
                                                    checked={notifications.email}
                                                    onCheckedChange={(checked: any) => setNotifications((prev) => ({ ...prev, email: checked }))}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="sms-notifications">
                                                    {language === 'ar' ? 'إشعارات الرسائل النصية' : 'SMS Notifications'}
                                                </Label>
                                                <Switch
                                                    id="sms-notifications"
                                                    checked={notifications.sms}
                                                    onCheckedChange={(checked: any) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="push-notifications">
                                                    {language === 'ar' ? 'الإشعارات الفورية' : 'Push Notifications'}
                                                </Label>
                                                <Switch
                                                    id="push-notifications"
                                                    checked={notifications.push}
                                                    onCheckedChange={(checked: any) => setNotifications((prev) => ({ ...prev, push: checked }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <Button
                                                variant="outline"
                                                onClick={logout}
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
    );
};

export default Profile;
