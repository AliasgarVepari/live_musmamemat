import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { Badge } from '@/components/user/ui/badge';
import { Button } from '@/components/user/ui/button';
import { Card, CardContent } from '@/components/user/ui/card';
import { Input } from '@/components/user/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/user/ui/select';
import { Slider } from '@/components/user/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Heart, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react';
import { useState } from 'react';

// Import product images
import designerSunglasses1 from '@/assets/user/products/designer-sunglasses-1.jpg';
import diamondEarrings1 from '@/assets/user/products/diamond-earrings-1.jpg';
import goldWatch1 from '@/assets/user/products/gold-watch-1.jpg';
import luxuryHandbag1 from '@/assets/user/products/luxury-handbag-1.jpg';
import silkScarf1 from '@/assets/user/products/silk-scarf-1.jpg';
import UserLayout from '@/layouts/user/user-layout';
import home from '@/routes/user';
import * as productRouter from '@/routes/user/product';
import { router } from '@inertiajs/react';

// Mock product data
const mockProducts = [
    {
        id: '1',
        title: 'Luxury Designer Handbag',
        brand: 'Hermès',
        price: 2500,
        originalPrice: 3500,
        condition: 'Excellent',
        location: 'Kuwait City',
        images: [luxuryHandbag1],
        featured: true,
        seller: 'Sarah K.',
        postedDate: '2 days ago',
    },
    {
        id: '2',
        title: 'Vintage Gold Watch',
        brand: 'Rolex',
        price: 5200,
        condition: 'Very Good',
        location: 'Hawalli',
        images: [goldWatch1],
        featured: false,
        seller: 'Ahmed M.',
        postedDate: '1 week ago',
    },
    {
        id: '3',
        title: 'Diamond Earrings',
        brand: 'Tiffany & Co',
        price: 1800,
        originalPrice: 2400,
        condition: 'Excellent',
        location: 'Salmiya',
        images: [diamondEarrings1],
        featured: true,
        seller: 'Fatima A.',
        postedDate: '3 days ago',
    },
    {
        id: '4',
        title: 'Designer Sunglasses',
        brand: 'Ray-Ban',
        price: 450,
        originalPrice: 650,
        condition: 'Very Good',
        location: 'Kuwait City',
        images: [designerSunglasses1],
        featured: false,
        seller: 'Omar K.',
        postedDate: '5 days ago',
    },
    {
        id: '5',
        title: 'Silk Designer Scarf',
        brand: 'Hermès',
        price: 320,
        originalPrice: 480,
        condition: 'Excellent',
        location: 'Hawalli',
        images: [silkScarf1],
        featured: false,
        seller: 'Nour M.',
        postedDate: '1 week ago',
    },
];

const categories = [
    { key: 'all', labelEn: 'All Categories', labelAr: 'جميع الفئات' },
    { key: 'handbags', labelEn: 'Handbags', labelAr: 'الحقائب' },
    { key: 'clothing', labelEn: 'Clothing', labelAr: 'الملابس' },
    { key: 'jewelry', labelEn: 'Jewelry', labelAr: 'المجوهرات' },
    { key: 'beauty-care', labelEn: 'Beauty & Care', labelAr: 'الجمال والعناية' },
    { key: 'accessories', labelEn: 'Accessories', labelAr: 'الإكسسوارات' },
    { key: 'children', labelEn: 'Children', labelAr: 'الأطفال' },
    { key: 'toys', labelEn: 'Toys & Games', labelAr: 'الألعاب' },
    { key: 'electronics', labelEn: 'Electronics', labelAr: 'الإلكترونيات' },
    { key: 'travel', labelEn: 'Travel', labelAr: 'السفر' },
    { key: 'home-furniture', labelEn: 'Home & Furniture', labelAr: 'المنزل' },
    { key: 'watches', labelEn: 'Watches', labelAr: 'الساعات' },
];

const ProductListing = () => {
    const { language } = useLanguage();

    // ✨ Local-only state (no URL syncing)
    const [currentCategory, setCurrentCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const selectedCategory = categories.find((cat) => cat.key === currentCategory);

    const handleCategoryChange = (categoryKey: string) => {
        setCurrentCategory(categoryKey);
        // If you later want to fetch filtered data, do it here (e.g., inertia visit or API call)
        // router.visit(productsIndex.url({ query: { category: categoryKey }}))
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // Likewise, trigger fetch here if needed
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
                            <span onClick={() => router.visit(home.home())} className="hover:text-luxury-black cursor-pointer transition-colors">
                                {language === 'ar' ? 'الرئيسية' : 'Home'}
                            </span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-luxury-black font-medium">
                                {language === 'ar' ? selectedCategory?.labelAr : selectedCategory?.labelEn}
                            </span>
                        </nav>

                        {/* Page Title */}
                        <div className={`mb-8 ${language === 'ar' ? 'rtl' : ''}`}>
                            <h1
                                className={`text-luxury-black mb-2 text-3xl font-bold md:text-4xl ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}
                            >
                                {language === 'ar' ? selectedCategory?.labelAr : selectedCategory?.labelEn}
                            </h1>
                            <p className="text-muted-foreground">
                                {language === 'ar' ? 'منتج متاح' : 'products available'} {mockProducts.length}
                            </p>
                        </div>

                        {/* Category Pills */}
                        <div className="mb-6 overflow-x-auto">
                            <div className="flex min-w-max space-x-2 pb-2">
                                {categories.map((category) => (
                                    <Button
                                        key={category.key}
                                        variant={currentCategory === category.key ? 'default' : 'secondary'}
                                        size="sm"
                                        onClick={() => handleCategoryChange(category.key)}
                                        className="whitespace-nowrap"
                                    >
                                        {language === 'ar' ? category.labelAr : category.labelEn}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className={`mb-8 flex flex-col gap-4 md:flex-row ${language === 'ar' ? 'rtl' : ''}`}>
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                                <Input
                                    placeholder={language === 'ar' ? 'البحث في المنتجات...' : 'Search products...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-luxury-black/20">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    {language === 'ar' ? 'فلاتر' : 'Filters'}
                                </Button>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">{language === 'ar' ? 'الأحدث' : 'Newest'}</SelectItem>
                                        <SelectItem value="price-high">{language === 'ar' ? 'السعر: عالي لمنخفض' : 'Price: High to Low'}</SelectItem>
                                        <SelectItem value="price-low">{language === 'ar' ? 'السعر: منخفض لعالي' : 'Price: Low to High'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <Card className="mb-8 p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'نطاق السعر' : 'Price Range'}</label>
                                        <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={100} className="mb-2" />
                                        <div className="text-muted-foreground flex justify-between text-sm">
                                            <span>{priceRange[0]} KD</span>
                                            <span>{priceRange[1]} KD</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'الموقع' : 'Location'}</label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder={language === 'ar' ? 'اختر الموقع' : 'Select location'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kuwait-city">{language === 'ar' ? 'مدينة الكويت' : 'Kuwait City'}</SelectItem>
                                                <SelectItem value="hawalli">{language === 'ar' ? 'حولي' : 'Hawalli'}</SelectItem>
                                                <SelectItem value="salmiya">{language === 'ar' ? 'السالمية' : 'Salmiya'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'الحالة' : 'Condition'}</label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder={language === 'ar' ? 'اختر الحالة' : 'Select condition'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">{language === 'ar' ? 'جديد' : 'New'}</SelectItem>
                                                <SelectItem value="excellent">{language === 'ar' ? 'ممتاز' : 'Excellent'}</SelectItem>
                                                <SelectItem value="very-good">{language === 'ar' ? 'جيد جداً' : 'Very Good'}</SelectItem>
                                                <SelectItem value="good">{language === 'ar' ? 'جيد' : 'Good'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Products Grid - Desktop */}
                        <div className="mb-12 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-3 xl:grid-cols-4">
                            {mockProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="hover:shadow-luxury group cursor-pointer overflow-hidden transition-all duration-300"
                                    onClick={() => router.visit(productRouter.show(product.id))}
                                >
                                    <div className="relative">
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {product.featured && (
                                            <Badge className="bg-luxury-gold text-luxury-black absolute left-3 top-3">
                                                <Star className="mr-1 h-3 w-3" />
                                                {language === 'ar' ? 'مميز' : 'Featured'}
                                            </Badge>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="absolute right-3 top-3 h-8 w-8 border-none bg-white/90 hover:bg-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Handle wishlist toggle
                                            }}
                                        >
                                            <Heart className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-luxury-black line-clamp-2 text-sm font-semibold">{product.title}</h3>
                                            </div>

                                            <p className="text-muted-foreground text-xs">{product.brand}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-luxury-black text-lg font-bold">{product.price} KD</span>
                                                        {product.originalPrice && (
                                                            <span className="text-muted-foreground text-sm line-through">
                                                                {product.originalPrice} KD
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {product.condition}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
                                                <div className="flex items-center">
                                                    <MapPin className="mr-1 h-3 w-3" />
                                                    {product.location}
                                                </div>
                                                <span>{product.postedDate}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Products List - Mobile */}
                        <div className="mb-12 space-y-3 md:hidden">
                            {mockProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
                                    onClick={() => router.visit(productRouter.show(product.id))}
                                >
                                    <div className="flex gap-3 p-3">
                                        {/* Product Image */}
                                        <div className="relative flex-shrink-0">
                                            <img src={product.images[0]} alt={product.title} className="h-24 w-24 rounded-lg object-cover" />
                                            {product.featured && (
                                                <Badge className="bg-luxury-gold text-luxury-black absolute -left-1 -top-1 px-1 py-0 text-xs">
                                                    {language === 'ar' ? 'مميز' : 'Featured'}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-start justify-between">
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <h3 className="text-luxury-black line-clamp-1 text-sm font-medium">{product.brand}</h3>
                                                    <p className="text-muted-foreground line-clamp-2 text-xs">{product.title}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 flex-shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Handle wishlist toggle
                                                    }}
                                                >
                                                    <Heart className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="mt-2">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="text-lg font-bold text-blue-600">{product.price} KWD</span>
                                                    {product.originalPrice && (
                                                        <span className="text-muted-foreground text-xs line-through">
                                                            {product.originalPrice} KWD
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="text-muted-foreground flex items-center justify-between text-xs">
                                                    <span>
                                                        {product.condition} • {product.location}
                                                    </span>
                                                    <span className="text-blue-500">{language === 'ar' ? 'مثبت اليوم' : 'Pinned today'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination (local-only demo) */}
                        <div className="flex justify-center">
                            <div className="flex items-center space-x-2">
                                <Button variant="secondary" size="sm" disabled>
                                    <ChevronLeft className="h-4 w-4" />
                                    {language === 'ar' ? 'السابق' : 'Previous'}
                                </Button>

                                <div className="flex space-x-1">
                                    {[1, 2, 3].map((page) => (
                                        <Button key={page} variant={page === 1 ? 'default' : 'secondary'} size="sm" className="w-10">
                                            {page}
                                        </Button>
                                    ))}
                                </div>

                                <Button variant="secondary" size="sm">
                                    {language === 'ar' ? 'التالي' : 'Next'}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </UserLayout>
    );
};

export default ProductListing;

// const ProductListing = () => {
//     const { language } = useLanguage();
//     const [searchParams, setSearchParams] = useSearchParams();

//     const currentCategory = searchParams.get('category') || 'all';
//     const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
//     const [sortBy, setSortBy] = useState('newest');
//     const [priceRange, setPriceRange] = useState([0, 10000]);
//     const [showFilters, setShowFilters] = useState(false);

//     const selectedCategory = categories.find((cat) => cat.key === currentCategory);

//     const handleCategoryChange = (categoryKey: string) => {
//         const newParams = new URLSearchParams(searchParams);
//         newParams.set('category', categoryKey);
//         setSearchParams(newParams);
//     };

//     const handleSearch = (query: string) => {
//         const newParams = new URLSearchParams(searchParams);
//         if (query) {
//             newParams.set('q', query);
//         } else {
//             newParams.delete('q');
//         }
//         setSearchParams(newParams);
//     };

//     return (
//         <div className="bg-background min-h-screen">
//             <Header />

//             <main className="py-16">
//                 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                     {/* Breadcrumbs */}
//                     <nav
//                         className={`text-muted-foreground mb-6 flex items-center space-x-2 text-sm ${language === 'ar' ? 'rtl space-x-reverse' : ''}`}
//                     >
//                         <span onClick={() => router.visit('user.home')} className="hover:text-luxury-black cursor-pointer transition-colors">
//                             {language === 'ar' ? 'الرئيسية' : 'Home'}
//                         </span>
//                         <ChevronRight className="h-4 w-4" />
//                         <span className="text-luxury-black font-medium">
//                             {language === 'ar' ? selectedCategory?.labelAr : selectedCategory?.labelEn}
//                         </span>
//                     </nav>

//                     {/* Page Title */}
//                     <div className={`mb-8 ${language === 'ar' ? 'rtl' : ''}`}>
//                         <h1 className={`text-luxury-black mb-2 text-3xl font-bold md:text-4xl ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}>
//                             {language === 'ar' ? selectedCategory?.labelAr : selectedCategory?.labelEn}
//                         </h1>
//                         <p className="text-muted-foreground">
//                             {language === 'ar' ? 'منتج متاح' : 'products available'} {mockProducts.length}
//                         </p>
//                     </div>

//                     {/* Category Pills */}
//                     <div className="mb-6 overflow-x-auto">
//                         <div className="flex min-w-max space-x-2 pb-2">
//                             {categories.map((category) => (
//                                 <Button
//                                     key={category.key}
//                                     variant={currentCategory === category.key ? 'default' : 'secondary'}
//                                     size="sm"
//                                     onClick={() => handleCategoryChange(category.key)}
//                                     className="whitespace-nowrap"
//                                 >
//                                     {language === 'ar' ? category.labelAr : category.labelEn}
//                                 </Button>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Search and Filters Bar */}
//                     <div className={`mb-8 flex flex-col gap-4 md:flex-row ${language === 'ar' ? 'rtl' : ''}`}>
//                         <div className="relative flex-1">
//                             <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
//                             <Input
//                                 placeholder={language === 'ar' ? 'البحث في المنتجات...' : 'Search products...'}
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
//                                 className="pl-10"
//                             />
//                         </div>

//                         <div className="flex gap-2">
//                             <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-luxury-black/20">
//                                 <SlidersHorizontal className="mr-2 h-4 w-4" />
//                                 {language === 'ar' ? 'فلاتر' : 'Filters'}
//                             </Button>

//                             <Select value={sortBy} onValueChange={setSortBy}>
//                                 <SelectTrigger className="w-40">
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="newest">{language === 'ar' ? 'الأحدث' : 'Newest'}</SelectItem>
//                                     <SelectItem value="price-high">{language === 'ar' ? 'السعر: عالي لمنخفض' : 'Price: High to Low'}</SelectItem>
//                                     <SelectItem value="price-low">{language === 'ar' ? 'السعر: منخفض لعالي' : 'Price: Low to High'}</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>

//                     {/* Filters Panel */}
//                     {showFilters && (
//                         <Card className="mb-8 p-6">
//                             <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//                                 <div>
//                                     <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'نطاق السعر' : 'Price Range'}</label>
//                                     <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={100} className="mb-2" />
//                                     <div className="text-muted-foreground flex justify-between text-sm">
//                                         <span>{priceRange[0]} KD</span>
//                                         <span>{priceRange[1]} KD</span>
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'الموقع' : 'Location'}</label>
//                                     <Select>
//                                         <SelectTrigger>
//                                             <SelectValue placeholder={language === 'ar' ? 'اختر الموقع' : 'Select location'} />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             <SelectItem value="kuwait-city">{language === 'ar' ? 'مدينة الكويت' : 'Kuwait City'}</SelectItem>
//                                             <SelectItem value="hawalli">{language === 'ar' ? 'حولي' : 'Hawalli'}</SelectItem>
//                                             <SelectItem value="salmiya">{language === 'ar' ? 'السالمية' : 'Salmiya'}</SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 <div>
//                                     <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'الحالة' : 'Condition'}</label>
//                                     <Select>
//                                         <SelectTrigger>
//                                             <SelectValue placeholder={language === 'ar' ? 'اختر الحالة' : 'Select condition'} />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             <SelectItem value="new">{language === 'ar' ? 'جديد' : 'New'}</SelectItem>
//                                             <SelectItem value="excellent">{language === 'ar' ? 'ممتاز' : 'Excellent'}</SelectItem>
//                                             <SelectItem value="very-good">{language === 'ar' ? 'جيد جداً' : 'Very Good'}</SelectItem>
//                                             <SelectItem value="good">{language === 'ar' ? 'جيد' : 'Good'}</SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </div>
//                             </div>
//                         </Card>
//                     )}

//                     {/* Products Grid - Desktop */}
//                     <div className="mb-12 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-3 xl:grid-cols-4">
//                         {mockProducts.map((product) => (
//                             <Card
//                                 key={product.id}
//                                 className="hover:shadow-luxury group cursor-pointer overflow-hidden transition-all duration-300"
//                                 onClick={() => router.visit(productRouter.index.get({ query: { id: product.id } }))}
//                             >
//                                 <div className="relative">
//                                     <img
//                                         src={product.images[0]}
//                                         alt={product.title}
//                                         className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
//                                     />
//                                     {product.featured && (
//                                         <Badge className="bg-luxury-gold text-luxury-black absolute left-3 top-3">
//                                             <Star className="mr-1 h-3 w-3" />
//                                             {language === 'ar' ? 'مميز' : 'Featured'}
//                                         </Badge>
//                                     )}
//                                     <Button
//                                         variant="outline"
//                                         size="icon"
//                                         className="absolute right-3 top-3 h-8 w-8 border-none bg-white/90 hover:bg-white"
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             // Handle wishlist toggle
//                                         }}
//                                     >
//                                         <Heart className="h-4 w-4" />
//                                     </Button>
//                                 </div>

//                                 <CardContent className="p-4">
//                                     <div className="space-y-2">
//                                         <div className="flex items-start justify-between">
//                                             <h3 className="text-luxury-black line-clamp-2 text-sm font-semibold">{product.title}</h3>
//                                         </div>

//                                         <p className="text-muted-foreground text-xs">{product.brand}</p>

//                                         <div className="flex items-center justify-between">
//                                             <div className="space-y-1">
//                                                 <div className="flex items-center gap-2">
//                                                     <span className="text-luxury-black text-lg font-bold">{product.price} KD</span>
//                                                     {product.originalPrice && (
//                                                         <span className="text-muted-foreground text-sm line-through">{product.originalPrice} KD</span>
//                                                     )}
//                                                 </div>
//                                                 <Badge variant="secondary" className="text-xs">
//                                                     {product.condition}
//                                                 </Badge>
//                                             </div>
//                                         </div>

//                                         <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
//                                             <div className="flex items-center">
//                                                 <MapPin className="mr-1 h-3 w-3" />
//                                                 {product.location}
//                                             </div>
//                                             <span>{product.postedDate}</span>
//                                         </div>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         ))}
//                     </div>

//                     {/* Products List - Mobile */}
//                     <div className="mb-12 space-y-3 md:hidden">
//                         {mockProducts.map((product) => (
//                             <Card
//                                 key={product.id}
//                                 className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
//                                 onClick={() => router.visit(productRouter.index.get({ query: { id: product.id } }))}
//                             >
//                                 <div className="flex gap-3 p-3">
//                                     {/* Product Image */}
//                                     <div className="relative flex-shrink-0">
//                                         <img src={product.images[0]} alt={product.title} className="h-24 w-24 rounded-lg object-cover" />
//                                         {product.featured && (
//                                             <Badge className="bg-luxury-gold text-luxury-black absolute -left-1 -top-1 px-1 py-0 text-xs">
//                                                 {language === 'ar' ? 'مميز' : 'Featured'}
//                                             </Badge>
//                                         )}
//                                     </div>

//                                     {/* Product Details */}
//                                     <div className="min-w-0 flex-1">
//                                         <div className="mb-1 flex items-start justify-between">
//                                             <div className="min-w-0 flex-1 pr-2">
//                                                 <h3 className="text-luxury-black line-clamp-1 text-sm font-medium">{product.brand}</h3>
//                                                 <p className="text-muted-foreground line-clamp-2 text-xs">{product.title}</p>
//                                             </div>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="icon"
//                                                 className="h-8 w-8 flex-shrink-0"
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     // Handle wishlist toggle
//                                                 }}
//                                             >
//                                                 <Heart className="h-4 w-4" />
//                                             </Button>
//                                         </div>

//                                         <div className="mt-2">
//                                             <div className="mb-1 flex items-center gap-2">
//                                                 <span className="text-lg font-bold text-blue-600">{product.price} KWD</span>
//                                                 {product.originalPrice && (
//                                                     <span className="text-muted-foreground text-xs line-through">{product.originalPrice} KWD</span>
//                                                 )}
//                                             </div>

//                                             <div className="text-muted-foreground flex items-center justify-between text-xs">
//                                                 <span>
//                                                     {product.condition} • {product.location}
//                                                 </span>
//                                                 <span className="text-blue-500">{language === 'ar' ? 'مثبت اليوم' : 'Pinned today'}</span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </Card>
//                         ))}
//                     </div>

//                     {/* Pagination */}
//                     <div className="flex justify-center">
//                         <div className="flex items-center space-x-2">
//                             <Button variant="secondary" size="sm" disabled>
//                                 <ChevronLeft className="h-4 w-4" />
//                                 {language === 'ar' ? 'السابق' : 'Previous'}
//                             </Button>

//                             <div className="flex space-x-1">
//                                 {[1, 2, 3].map((page) => (
//                                     <Button key={page} variant={page === 1 ? 'default' : 'secondary'} size="sm" className="w-10">
//                                         {page}
//                                     </Button>
//                                 ))}
//                             </div>

//                             <Button variant="secondary" size="sm">
//                                 {language === 'ar' ? 'التالي' : 'Next'}
//                                 <ChevronRight className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </main>

//             <Footer />
//         </div>
//     );
// };
