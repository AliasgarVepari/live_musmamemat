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
import { Calendar, ChevronLeft, ChevronRight, Flag, Heart, MapPin, MessageCircle, Share2, Shield, Star } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

// Import product images
import sarahAvatar from '@/assets/user/avatars/sarah-k.jpg';
import luxuryHandbag1 from '@/assets/user/products/luxury-handbag-1.jpg';
import luxuryHandbag2 from '@/assets/user/products/luxury-handbag-2.jpg';
import luxuryHandbag3 from '@/assets/user/products/luxury-handbag-3.jpg';
import luxuryHandbag4 from '@/assets/user/products/luxury-handbag-4.jpg';
import UserLayout from '@/layouts/user/user-layout';
import { home } from '@/routes/user';
import { router } from '@inertiajs/react';

// Mock product data
const mockProduct = {
    id: '1',
    title: 'Luxury Designer Handbag - Limited Edition',
    brand: 'Hermès',
    price: 2500,
    originalPrice: 3500,
    condition: 'Excellent',
    location: 'Kuwait City',
    description:
        'This stunning pre-owned Hermès handbag is in excellent condition with minimal signs of wear. Crafted from premium leather with gold-tone hardware. Comes with original dust bag and authenticity certificate. Perfect for the discerning fashion enthusiast.',
    images: [luxuryHandbag1, luxuryHandbag2, luxuryHandbag3, luxuryHandbag4],
    features: ['100% Authentic', 'Original dust bag included', 'Professional cleaning completed', 'Minor wear on corners'],
    seller: {
        name: 'Sarah K.',
        avatar: sarahAvatar,
        rating: 4.8,
        reviews: 24,
        verified: true,
        memberSince: '2022',
    },
    postedDate: '2 days ago',
    views: 156,
    featured: true,
};

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { language } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const handleWhatsAppContact = () => {
        const message = encodeURIComponent(
            `Hi! I'm interested in your ${mockProduct.title} listed for ${mockProduct.price} KD. ${window.location.href}`,
        );
        window.open(`https://wa.me/96512345678?text=${message}`, '_blank');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: mockProduct.title,
                    text: `Check out this ${mockProduct.title} for ${mockProduct.price} KD`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === mockProduct.images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? mockProduct.images.length - 1 : prev - 1));
    };

    return (
        <UserLayout>
            <div className="bg-background min-h-screen">
                <Header />

                <main className="py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumbs */}
                        <nav
                            className={`text-muted-foreground mb-6 flex items-center space-x-2 text-sm ${language === 'ar' ? 'rtl space-x-reverse' : ''}`}
                        >
                            <span onClick={() => router.visit(home())} className="hover:text-luxury-black cursor-pointer transition-colors">
                                {language === 'ar' ? 'الرئيسية' : 'Home'}
                            </span>
                            <ChevronRight className="h-4 w-4" />
                            <span onClick={() => router.visit(home())} className="hover:text-luxury-black cursor-pointer transition-colors">
                                {language === 'ar' ? 'الحقائب' : 'Handbags'}
                            </span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-luxury-black truncate font-medium">{mockProduct.title}</span>
                        </nav>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <img
                                        src={mockProduct.images[currentImageIndex]}
                                        alt={mockProduct.title}
                                        className="h-96 w-full rounded-lg object-cover lg:h-[500px]"
                                    />

                                    {mockProduct.featured && (
                                        <Badge className="bg-luxury-gold text-luxury-black absolute left-4 top-4">
                                            <Star className="mr-1 h-3 w-3" />
                                            {language === 'ar' ? 'مميز' : 'Featured'}
                                        </Badge>
                                    )}

                                    {mockProduct.images.length > 1 && (
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
                                <div className="flex space-x-2 overflow-x-auto">
                                    {mockProduct.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`${mockProduct.title} ${index + 1}`}
                                            className={`h-20 w-20 flex-shrink-0 cursor-pointer rounded object-cover ${
                                                index === currentImageIndex ? 'ring-luxury-gold ring-2' : ''
                                            }`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        />
                                    ))}
                                </div>
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
                                            {mockProduct.title}
                                        </h1>

                                        <div className="ml-4 flex space-x-2">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => setIsWishlisted(!isWishlisted)}
                                                className={isWishlisted ? 'text-brand-red-600 border-brand-red-600' : ''}
                                            >
                                                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                                            </Button>

                                            <Button variant="secondary" size="icon" onClick={handleShare}>
                                                <Share2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground mb-4 text-lg">{mockProduct.brand}</p>

                                    <div className="mb-4 flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-luxury-black text-3xl font-bold">{mockProduct.price} KD</span>
                                            {mockProduct.originalPrice && (
                                                <span className="text-muted-foreground text-lg line-through">{mockProduct.originalPrice} KD</span>
                                            )}
                                        </div>
                                        <Badge className="bg-luxury-emerald text-white">
                                            {Math.round(((mockProduct.originalPrice! - mockProduct.price) / mockProduct.originalPrice!) * 100)}%{' '}
                                            {language === 'ar' ? 'خصم' : 'OFF'}
                                        </Badge>
                                    </div>

                                    <div className="mb-6 flex items-center gap-4">
                                        <Badge variant="secondary" className="text-sm">
                                            {language === 'ar' ? 'الحالة:' : 'Condition:'} {mockProduct.condition}
                                        </Badge>
                                        <div className="text-muted-foreground flex items-center text-sm">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            {mockProduct.location}
                                        </div>
                                        <div className="text-muted-foreground flex items-center text-sm">
                                            <Calendar className="mr-1 h-4 w-4" />
                                            {mockProduct.postedDate}
                                        </div>
                                    </div>
                                </div>

                                {/* Primary Actions */}
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleWhatsAppContact}
                                        className="bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black w-full py-3 transition-all duration-300"
                                        size="lg"
                                    >
                                        <MessageCircle className="mr-2 h-5 w-5" />
                                        {language === 'ar' ? 'تواصل مع البائع' : 'Contact Seller'}
                                    </Button>

                                    <p className="text-muted-foreground text-center text-xs">
                                        {language === 'ar' ? 'سيتم فتح واتساب مع رسالة جاهزة' : 'Opens WhatsApp with pre-filled message'}
                                    </p>
                                </div>

                                {/* Product Description */}
                                <div>
                                    <h3 className="text-luxury-black mb-3 text-lg font-semibold">{language === 'ar' ? 'الوصف' : 'Description'}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{mockProduct.description}</p>
                                </div>

                                {/* Product Features */}
                                <div>
                                    <h3 className="text-luxury-black mb-3 text-lg font-semibold">
                                        {language === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
                                    </h3>
                                    <ul className="space-y-2">
                                        {mockProduct.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm">
                                                <div className="bg-luxury-gold mr-3 h-2 w-2 flex-shrink-0 rounded-full" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Seller Information */}
                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="text-luxury-black mb-3 text-lg font-semibold">
                                            {language === 'ar' ? 'معلومات البائع' : 'Seller Information'}
                                        </h3>

                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={mockProduct.seller.avatar} />
                                                <AvatarFallback>{mockProduct.seller.name[0]}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{mockProduct.seller.name}</span>
                                                    {mockProduct.seller.verified && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <Shield className="mr-1 h-3 w-3" />
                                                            {language === 'ar' ? 'موثق' : 'Verified'}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                                    <div className="flex items-center">
                                                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        {mockProduct.seller.rating} ({mockProduct.seller.reviews}{' '}
                                                        {language === 'ar' ? 'تقييم' : 'reviews'})
                                                    </div>
                                                    <span>
                                                        {language === 'ar' ? 'عضو منذ' : 'Member since'} {mockProduct.seller.memberSince}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Report Listing */}
                                <div className="border-t pt-4">
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
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
                <BottomNavigation />
            </div>
        </UserLayout>
    );
};

export default ProductDetail;
