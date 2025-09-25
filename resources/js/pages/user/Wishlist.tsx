import { BottomNavigation } from '@/components/user/BottomNavigation';
import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { Card, CardContent } from '@/components/user/ui/card';
import { Button } from '@/components/user/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Eye, MapPin, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface WishlistItem {
    id: number;
    title_en: string;
    title_ar: string;
    price: number;
    category: {
        name_en: string;
        name_ar: string;
    };
    governorate: {
        name_en: string;
        name_ar: string;
    };
    condition: {
        name_en: string;
        name_ar: string;
    };
    priceType: {
        name_en: string;
        name_ar: string;
    };
    primaryImage?: {
        url: string;
    };
    user: {
        name_en: string;
        name_ar: string;
        profile_picture_url?: string;
    };
    created_at: string;
}

const Wishlist = () => {
    const { language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<number | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
                const response = await fetch('/api/user/favorites', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                    },
                });

            if (response.ok) {
                const data = await response.json();
                setWishlistItems(data.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (adId: number) => {
        setRemoving(adId);
        try {
                const response = await fetch(`/api/user/products/${adId}/favorite`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                    },
                });

            if (response.ok) {
                setWishlistItems(prev => prev.filter(item => item.id !== adId));
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        } finally {
            setRemoving(null);
        }
    };

    const handleViewProduct = (adId: number) => {
        router.visit(`/product/${adId}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-KW', {
            style: 'currency',
            currency: 'KWD',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-KW' : 'en-KW');
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-background min-h-screen">
                <Header />
                <main className="py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold mb-4">
                                {language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}
                            </h1>
                            <p className="text-muted-foreground">
                                {language === 'ar' ? 'يجب عليك تسجيل الدخول لعرض قائمة الأمنيات' : 'Please login to view your wishlist'}
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-luxury-black mb-8 text-3xl font-bold">
                        {language === 'ar' ? 'قائمة الأمنيات' : 'My Wishlist'}
                    </h1>
                    
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                            </p>
                        </div>
                    ) : wishlistItems.length === 0 ? (
                        <div className="text-center py-8">
                            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {language === 'ar' ? 'قائمة الأمنيات فارغة' : 'Your wishlist is empty'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {language === 'ar' ? 'ابدأ بإضافة المنتجات التي تعجبك إلى قائمة الأمنيات' : 'Start adding products you like to your wishlist'}
                            </p>
                            <Button onClick={() => router.visit('/products')}>
                                {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {wishlistItems.map((item) => (
                                <Card key={item.id} className="hover:shadow-lg group transition-all duration-300">
                                    <div className="relative">
                                        <div className="h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {item.primaryImage ? (
                                                <img
                                                    src={item.primaryImage.url}
                                                    alt={language === 'ar' ? item.title_ar : item.title_en}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Heart className="h-12 w-12 text-gray-400" />
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="absolute right-3 top-3 h-8 w-8 border-none bg-white/90 text-red-500 hover:bg-white"
                                            onClick={() => handleRemoveFromWishlist(item.id)}
                                            disabled={removing === item.id}
                                        >
                                            <Heart className="h-4 w-4 fill-current" />
                                        </Button>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="mb-2 font-semibold line-clamp-2">
                                            {language === 'ar' ? item.title_ar : item.title_en}
                                        </h3>
                                        <div className="mb-2 text-lg font-bold text-brand-red-600">
                                            {formatPrice(item.price)}
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-2">
                                            <span className="font-medium">
                                                {language === 'ar' ? item.category.name_ar : item.category.name_en}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {language === 'ar' ? item.governorate.name_ar : item.governorate.name_en}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {formatDate(item.created_at)}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleViewProduct(item.id)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                {language === 'ar' ? 'عرض' : 'View'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            {/* <BottomNavigation /> */}
        </div>
    );
};

export default Wishlist;
