import { BottomNavigation } from '@/components/user/BottomNavigation';
import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/user/ui/avatar';
import { Badge } from '@/components/user/ui/badge';
import { Button } from '@/components/user/ui/button';
import { Card, CardContent } from '@/components/user/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/user/ui/dialog';
import { Textarea } from '@/components/user/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/user/use-favorites';
import { AuthModal } from '@/components/user/auth/AuthModal';
import UserLayout from '@/layouts/user/user-layout';
import { home } from '@/routes/user';
import * as products from '@/routes/user/products';
import { Head, router } from '@inertiajs/react';
import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Flag, Heart, MapPin, MessageCircle, Share2, Shield, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductDetailProps {
    product: {
        id: number;
        title_en: string;
        title_ar: string;
        description_en: string;
        description_ar: string;
        product_details_en?: string;
        product_details_ar?: string;
        price: number;
        original_price?: number;
        brand?: string;
        condition?: {
            name_en: string;
            name_ar: string;
        };
        governorate?: {
            name_en: string;
            name_ar: string;
        };
        category?: {
            id: number;
            name_en: string;
            name_ar: string;
            slug: string;
        };
        priceType?: {
            name_en: string;
        };
        is_featured: boolean;
        is_negotiable: boolean;
        views_count: number;
        created_at: string;
        images: Array<{
            id: number;
            url: string;
            is_primary: boolean;
        }>;
        user?: {
            id: number;
            name_en: string;
            name_ar: string;
            profile_picture_url?: string;
            phone?: string;
            email?: string;
            created_at: string;
            rating?: number;
            reviews_count?: number;
        } | null;
    };
    selectedCategory?: {
        id: number;
        name_en: string;
        name_ar: string;
        slug: string;
    } | null;
}

const ProductDetail = ({ product, selectedCategory }: ProductDetailProps) => {
    console.log(product);

    const { language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const { isFavorited, toggleFavorite, loading: favoriteLoading } = useFavorites();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    const productTitle = language === 'ar' ? product.title_ar : product.title_en;
    const productDescription = language === 'ar' ? product.description_ar : product.description_en;
    const productImages = product.images || [];
    const primaryImage = productImages.find((img) => img.is_primary) || productImages[0];

    const handleWhatsAppContact = async () => {
        if (!product.user?.phone) {
            alert(language === 'ar' ? 'رقم الهاتف غير متوفر' : 'Phone number not available');
            return;
        }

        try {
            // Increment contact count
            await fetch(`/api/user/products/${product.id}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
        } catch (error) {
            console.error('Failed to increment contact count:', error);
            // Continue with WhatsApp opening even if contact count fails
        }

        const message = encodeURIComponent(
            `Hi! I'm interested in your ${productTitle} listed for ${product.price} ${product.priceType?.name_en || 'KD'}. ${window.location.href}`,
        );
        
        // Clean the phone number (remove any non-digit characters except +)
        const cleanPhone = product.user.phone.replace(/[^\d+]/g, '');
        // Ensure it starts with +965 for Kuwait
        const whatsappNumber = cleanPhone.startsWith('+') ? cleanPhone : `+965${cleanPhone}`;
        
        window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`, '_blank');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: productTitle,
                    text: `Check out this ${productTitle} for ${product.price} ${product.priceType?.name_en || 'KD'}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        try {
            await toggleFavorite(product.id);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
    };

    return (
        <UserLayout>
            <Head title={productTitle} />
            <div className="bg-background min-h-screen">
                <Header />

                <main className="main-content pb-16 pt-4">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumbs */}
                        <nav
                            className={`text-muted-foreground mb-6 flex items-center space-x-2 text-sm ${language === 'ar' ? 'rtl space-x-reverse' : ''}`}
                        >
                            <span onClick={() => router.visit(home())} className="hover:text-luxury-black cursor-pointer transition-colors">
                                {language === 'ar' ? 'الرئيسية' : 'Home'}
                            </span>
                            <ChevronRight className="h-4 w-4" />
                            <span 
                                onClick={() => router.visit(products.index.get({ query: selectedCategory ? { category: selectedCategory.slug } : {} }))} 
                                className="hover:text-luxury-black cursor-pointer transition-colors"
                            >
                                {selectedCategory 
                                    ? (language === 'ar' ? selectedCategory.name_ar : selectedCategory.name_en)
                                    : (language === 'ar' ? 'جميع الفئات' : 'All Categories')
                                }
                            </span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-luxury-black truncate font-medium">{productTitle}</span>
                        </nav>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <img
                                        src={productImages[currentImageIndex]?.url || '/placeholder-product.svg'}
                                        alt={productTitle}
                                        className="h-96 w-full rounded-lg object-cover lg:h-[500px]"
                                    />

                                    {product.is_featured && (
                                        <Badge className="bg-luxury-gold text-luxury-black absolute left-4 top-4">
                                            <Star className="mr-1 h-3 w-3" />
                                            {language === 'ar' ? 'مميز' : 'Featured'}
                                        </Badge>
                                    )}

                                    {productImages.length > 1 && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 transform bg-white/90 shadow-md hover:bg-white"
                                                onClick={prevImage}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 transform bg-white/90 shadow-md hover:bg-white"
                                                onClick={nextImage}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                {productImages.length > 1 && (
                                    <div className="flex space-x-2 overflow-x-auto">
                                        {productImages.map((image, index) => (
                                            <img
                                                key={image.id}
                                                src={image.url}
                                                alt={`${productTitle} ${index + 1}`}
                                                className={`h-20 w-20 flex-shrink-0 cursor-pointer rounded object-cover ${
                                                    index === currentImageIndex ? 'ring-luxury-gold ring-2' : ''
                                                }`}
                                                onClick={() => setCurrentImageIndex(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className={`space-y-6 ${language === 'ar' ? 'rtl' : ''}`}>
                                <div>
                                    <div className="mb-2 flex items-start justify-between">
                                        <h1
                                            className={`text-luxury-black text-2xl font-bold leading-tight lg:text-3xl ${
                                                language === 'ar' ? 'font-arabic' : 'font-serif'
                                            }`}
                                        >
                                            {product.title_en}
                                        </h1>

                                        <div className="ml-4 flex space-x-2">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={handleFavoriteToggle}
                                                disabled={favoriteLoading}
                                                className={isFavorited(product.id) ? 'text-brand-red-600 border-brand-red-600' : ''}
                                            >
                                                <Heart className={`h-4 w-4 ${isFavorited(product.id) ? 'fill-current' : ''}`} />
                                            </Button>

                                            <Button variant="secondary" size="icon" onClick={handleShare}>
                                                <Share2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Brand */}
                                    {product.brand && <p className="text-muted-foreground mb-4 text-lg font-medium">{product.brand}</p>}

                                    {/* Price */}
                                    <div className="mb-4 flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-luxury-black text-3xl font-bold">
                                                {product.price} {product.priceType?.name_en || 'KD'}
                                            </span>
                                            {product.original_price && product.original_price > product.price && (
                                                <span className="text-muted-foreground text-lg line-through">
                                                    {product.original_price} {product.priceType?.name_en || 'KD'}
                                                </span>
                                            )}
                                            {product.is_negotiable && (
                                                <Badge variant="outline" className="text-sm">
                                                    {language === 'ar' ? 'قابل للتفاوض' : 'Negotiable'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="mb-6 flex items-center gap-4">
                                        {product.condition && (
                                            <Badge variant="secondary" className="text-sm">
                                                {language === 'ar' ? 'الحالة:' : 'Condition:'}{' '}
                                                {language === 'ar' ? product.condition.name_ar : product.condition.name_en}
                                            </Badge>
                                        )}
                                        {product.governorate && (
                                            <div className="text-muted-foreground flex items-center text-sm">
                                                <MapPin className="mr-1 h-4 w-4" />
                                                {language === 'ar' ? product.governorate.name_ar : product.governorate.name_en}
                                            </div>
                                        )}
                                        <div className="text-muted-foreground flex items-center text-sm">
                                            <Calendar className="mr-1 h-4 w-4" />
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-muted-foreground flex items-center text-sm">
                                            <span>
                                                {product.views_count} {language === 'ar' ? 'مشاهدة' : 'views'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Primary Actions */}
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleWhatsAppContact}
                                        disabled={!product.user?.phone}
                                        className="bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black w-full py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        size="lg"
                                    >
                                        <MessageCircle className="mr-2 h-5 w-5" />
                                        {language === 'ar' ? 'تواصل مع البائع' : 'Contact Seller'}
                                    </Button>

                                    <p className="text-muted-foreground text-center text-xs">
                                        {product.user?.phone 
                                            ? (language === 'ar' ? 'سيتم فتح واتساب مع رسالة جاهزة' : 'Opens WhatsApp with pre-filled message')
                                            : (language === 'ar' ? 'رقم الهاتف غير متوفر' : 'Phone number not available')
                                        }
                                    </p>
                                </div>

                                {/* Product Description */}
                                <div>
                                    <h3 className="text-luxury-black mb-3 text-lg font-semibold">{language === 'ar' ? 'الوصف' : 'Description'}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{productDescription}</p>
                                </div>

                                {/* Product Details */}
                                {(product.product_details_en || product.product_details_ar) && (
                                    <div>
                                        <h3 className="text-luxury-black mb-3 text-lg font-semibold">
                                            {language === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
                                        </h3>
                                        <div className="space-y-2">
                                            {(() => {
                                                const productDetails = language === 'ar' ? product.product_details_ar : product.product_details_en;
                                                if (!productDetails) return null;
                                                
                                                // Split by line breaks and filter out empty lines
                                                const details = productDetails
                                                    .split(/\r?\n/)
                                                    .filter(detail => detail.trim() !== '');
                                                
                                                return details.map((detail, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        <span className="text-sm">{detail.trim()}</span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Seller Information */}
                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="text-luxury-black mb-3 text-lg font-semibold">
                                            {language === 'ar' ? 'معلومات البائع' : 'Seller Information'}
                                        </h3>

                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={product.user?.profile_picture_url || ''} />
                                                <AvatarFallback>
                                                    {product.user ? (language === 'ar' ? product.user.name_ar?.[0] : product.user.name_en?.[0]) : 'U'}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {product.user
                                                            ? language === 'ar'
                                                                ? product.user.name_ar
                                                                : product.user.name_en
                                                            : 'Unknown User'}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Shield className="mr-1 h-3 w-3" />
                                                        {language === 'ar' ? 'موثق' : 'Verified'}
                                                    </Badge>
                                                </div>

                                                {/* Rating and Reviews */}
                                                {product.user?.rating && product.user?.reviews_count && (
                                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-medium">{product.user.rating}</span>
                                                        </div>
                                                        <span>
                                                            ({product.user.reviews_count} {language === 'ar' ? 'تقييم' : 'reviews'})
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                                    <span>
                                                        {product.user
                                                            ? `${language === 'ar' ? 'عضو منذ' : 'Member since'} ${new Date(product.user.created_at).getFullYear()}`
                                                            : 'Unknown'}
                                                    </span>
                                                    {product.user?.phone && (
                                                        <span>
                                                            {language === 'ar' ? 'الهاتف:' : 'Phone:'} {product.user.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Report Listing */}
                                {/* <div className="border-t pt-4">
                                    <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                                                <Flag className="mr-2 h-4 w-4" />
                                                {language === 'ar' ? 'الإبلاغ عن الإعلان' : 'Report Listing'}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{language === 'ar' ? 'الإبلاغ عن الإعلان' : 'Report Listing'}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <Textarea
                                                    placeholder={language === 'ar' ? 'اكتب سبب الإبلاغ...' : 'Please describe the issue...'}
                                                    value={reportReason}
                                                    onChange={(e) => setReportReason(e.target.value)}
                                                />
                                                <Button
                                                    onClick={() => {
                                                        // Handle report submission
                                                        setShowReportModal(false);
                                                        setReportReason('');
                                                    }}
                                                    className="w-full"
                                                >
                                                    {language === 'ar' ? 'إرسال البلاغ' : 'Submit Report'}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
                {/* <BottomNavigation /> */}
            </div>

            {/* Auth Modal */}
            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => setShowAuthModal(false)}
            />
        </UserLayout>
    );
};

export default ProductDetail;
