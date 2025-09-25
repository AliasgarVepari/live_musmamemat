import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { Badge } from '@/components/user/ui/badge';
import { Button } from '@/components/user/ui/button';
import { Card, CardContent } from '@/components/user/ui/card';
import { Input } from '@/components/user/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/user/ui/select';
import { Slider } from '@/components/user/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/user/use-favorites';
import { AuthModal } from '@/components/user/auth/AuthModal';
import { useCachedPagination } from '@/hooks/user/use-cached-pagination';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Heart, Loader2, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react';
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


interface ProductListingProps {
    products: any;
    categories: any[];
    governorates: any[];
    conditions: any[];
    priceTypes: any[];
    filters: any;
}

const ProductListing = ({
    products: initialProducts,
    categories: initialCategories,
    governorates: initialGovernorates,
    conditions: initialConditions,
    priceTypes: initialPriceTypes,
    filters: initialFilters,
}: ProductListingProps) => {
    const { language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const { isFavorited, toggleFavorite, loading: favoriteLoading } = useFavorites();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Use cached pagination hook
    const {
        data: productsData,
        isLoading,
        paginationState,
        goToPage,
        setPerPage,
        setSearch,
        updateFilter,
    } = useCachedPagination<typeof initialProducts>({
        endpoint: '/api/user/products',
        initialPage: initialProducts?.current_page || 1,
        initialPerPage: initialFilters?.per_page || '20',
        initialSearch: initialFilters?.search || '',
        initialFilters: {
            category: initialFilters?.category || 'all',
            governorate_id: initialFilters?.governorate_id || 'all',
            condition_id: initialFilters?.condition_id || 'all',
            price_type_id: initialFilters?.price_type_id || 'all',
            min_price: initialFilters?.min_price || '',
            max_price: initialFilters?.max_price || '',
            is_negotiable: initialFilters?.is_negotiable || 'all',
            sort: initialFilters?.sort || 'newest',
        },
    });

    // Use cached data if available, otherwise fall back to props
    const products = productsData || initialProducts;
    const categories = initialCategories || [];
    const governorates = initialGovernorates || [];
    const conditions = initialConditions || [];
    const priceTypes = initialPriceTypes || [];

    // Local state for UI
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [priceRange, setPriceRange] = useState([0, 10000]);

    const selectedCategory = categories.find((cat) => cat.slug === paginationState.filters.category);

    const handleCategoryChange = (categorySlug: string) => {
        updateFilter('category', categorySlug);
    };

    const handleSearch = (query: string) => {
        setSearch(query);
    };

    const handleFavoriteToggle = async (productId: number) => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        try {
            await toggleFavorite(productId);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleSortChange = (sort: string) => {
        updateFilter('sort', sort);
    };

    const handlePriceRangeChange = (range: number[]) => {
        setPriceRange(range);
        updateFilter('min_price', range[0].toString());
        updateFilter('max_price', range[1].toString());
    };

    // Show loading state
    if (isLoading && !products) {
        return (
            <UserLayout>
                <div className="bg-background min-h-screen">
                    <Header />
                    <main className="main-content py-16">
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                <p className="text-muted-foreground mt-2">Loading products...</p>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <Head title="Products" />
            <div className="bg-background min-h-screen">
                <Header />

                <main className="main-content py-16">
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
                                {language === 'ar' ? selectedCategory?.name_ar : selectedCategory?.name_en}
                            </span>
                        </nav>

                        {/* Page Title */}
                        <div className={`mb-8 ${language === 'ar' ? 'rtl' : ''}`}>
                            <h1
                                className={`text-luxury-black mb-2 text-3xl font-bold md:text-4xl ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}
                            >
                                {language === 'ar' ? selectedCategory?.name_ar || 'All Products' : selectedCategory?.name_en || 'All Products'}
                            </h1>
                            <p className="text-muted-foreground">
                                {language === 'ar' ? 'منتج متاح' : 'products available'} {products?.total || 0}
                            </p>
                        </div>

                        {/* Category Pills */}
                        <div className="mb-6 overflow-x-auto">
                            <div className="flex min-w-max space-x-2 pb-2">
                                <Button
                                    variant={paginationState.filters.category === 'all' ? 'default' : 'secondary'}
                                    size="sm"
                                    onClick={() => handleCategoryChange('all')}
                                    className="whitespace-nowrap"
                                >
                                    {language === 'ar' ? 'جميع الفئات' : 'All Categories'}
                                </Button>
                                {categories.map((category) => (
                                    <Button
                                        key={category.slug}
                                        variant={paginationState.filters.category === category.slug ? 'default' : 'secondary'}
                                        size="sm"
                                        onClick={() => handleCategoryChange(category.slug)}
                                        className="whitespace-nowrap"
                                    >
                                        {language === 'ar' ? category.name_ar : category.name_en}
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
                                    value={paginationState.search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-luxury-black/20">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    {language === 'ar' ? 'فلاتر' : 'Filters'}
                                </Button>

                                <Select value={paginationState.filters.sort} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">{language === 'ar' ? 'الأحدث' : 'Newest'}</SelectItem>
                                        <SelectItem value="price-high">{language === 'ar' ? 'السعر: عالي لمنخفض' : 'Price: High to Low'}</SelectItem>
                                        <SelectItem value="price-low">{language === 'ar' ? 'السعر: منخفض لعالي' : 'Price: Low to High'}</SelectItem>
                                        <SelectItem value="popular">{language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <Card className="mb-8 p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'نطاق السعر' : 'Price Range'}</label>
                                        <Slider value={priceRange} onValueChange={handlePriceRangeChange} max={10000} step={100} className="mb-2" />
                                        <div className="text-muted-foreground flex justify-between text-sm">
                                            <span>{priceRange[0]} KD</span>
                                            <span>{priceRange[1]} KD</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'الموقع' : 'Location'}</label>
                                        <Select
                                            value={paginationState.filters.governorate_id}
                                            onValueChange={(value) => updateFilter('governorate_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={language === 'ar' ? 'اختر الموقع' : 'Select location'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{language === 'ar' ? 'جميع المواقع' : 'All Locations'}</SelectItem>
                                                {governorates.map((governorate) => (
                                                    <SelectItem key={governorate.id} value={governorate.id.toString()}>
                                                        {language === 'ar' ? governorate.name_ar : governorate.name_en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'الحالة' : 'Condition'}</label>
                                        <Select
                                            value={paginationState.filters.condition_id}
                                            onValueChange={(value) => updateFilter('condition_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={language === 'ar' ? 'اختر الحالة' : 'Select condition'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'All Conditions'}</SelectItem>
                                                {conditions.map((condition) => (
                                                    <SelectItem key={condition.id} value={condition.id.toString()}>
                                                        {language === 'ar' ? condition.name_ar : condition.name_en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">{language === 'ar' ? 'نوع السعر' : 'Price Type'}</label>
                                        <Select
                                            value={paginationState.filters.price_type_id}
                                            onValueChange={(value) => updateFilter('price_type_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={language === 'ar' ? 'اختر نوع السعر' : 'Select price type'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                                                {priceTypes.map((priceType) => (
                                                    <SelectItem key={priceType.id} value={priceType.id.toString()}>
                                                        {language === 'ar' ? priceType.name_ar : priceType.name_en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Products Grid - Desktop */}
                        <div className="mb-12 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-3 xl:grid-cols-4">
                            {products?.data?.map((product: any) => (
                                console.log(product),
                                <Card
                                    key={product.id}
                                    className="hover:shadow-luxury group cursor-pointer overflow-hidden transition-all duration-300"
                                    onClick={() => router.visit(productRouter.show(product.id, { 
                                        query: selectedCategory ? { selected_category: selectedCategory.slug } : {} 
                                    }))}
                                >
                                    <div className="relative">
                                        <img
                                            src={product.primaryImage?.url || '/placeholder-product.svg'}
                                            alt={language === 'ar' ? product.title_ar : product.title_en}
                                            className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {product.is_featured && (
                                            <Badge className="bg-luxury-gold text-luxury-black absolute left-3 top-3">
                                                <Star className="mr-1 h-3 w-3" />
                                                {language === 'ar' ? 'مميز' : 'Featured'}
                                            </Badge>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={`absolute right-3 top-3 h-8 w-8 border-none bg-white/90 hover:bg-white ${
                                                isFavorited(product.id) ? 'text-brand-red-600' : ''
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFavoriteToggle(product.id);
                                            }}
                                            disabled={favoriteLoading}
                                        >
                                            <Heart className={`h-4 w-4 ${isFavorited(product.id) ? 'fill-current' : ''}`} />
                                        </Button>
                                    </div>

                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-luxury-black line-clamp-2 text-sm font-semibold">
                                                    {language === 'ar' ? product.title_ar : product.title_en}
                                                </h3>
                                            </div>

                                            <p className="text-muted-foreground text-xs">{product.category?.name_en}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-luxury-black text-lg font-bold">
                                                            {product.price} {product.priceType?.name_en || 'KD'}
                                                        </span>
                                                        {product.is_negotiable && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {language === 'ar' ? 'قابل للتفاوض' : 'Negotiable'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {language === 'ar' ? product.condition?.name_ar : product.condition?.name_en}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
                                                <div className="flex items-center">
                                                    <MapPin className="mr-1 h-3 w-3" />
                                                    {language === 'ar' ? product.governorate?.name_ar : product.governorate?.name_en}
                                                </div>
                                                <span>{new Date(product.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Products List - Mobile */}
                        <div className="mb-12 space-y-3 md:hidden">
                            {products?.data?.map((product: any) => (
                                <Card
                                    key={product.id}
                                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
                                    onClick={() => router.visit(productRouter.show(product.id, { 
                                        query: selectedCategory ? { selected_category: selectedCategory.slug } : {} 
                                    }))}
                                >
                                    <div className="flex gap-3 p-3">
                                        {/* Product Image */}
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={product.primaryImage?.url || '/placeholder-product.svg'}
                                                alt={language === 'ar' ? product.title_ar : product.title_en}
                                                className="h-24 w-24 rounded-lg object-cover"
                                            />
                                            {product.is_featured && (
                                                <Badge className="bg-luxury-gold text-luxury-black absolute -left-1 -top-1 px-1 py-0 text-xs">
                                                    {language === 'ar' ? 'مميز' : 'Featured'}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-start justify-between">
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <h3 className="text-luxury-black line-clamp-1 text-sm font-medium">
                                                        {language === 'ar' ? product.title_ar : product.title_en}
                                                    </h3>
                                                    <p className="text-muted-foreground line-clamp-2 text-xs">{product.category?.name_en}</p>
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
                                                    <span className="text-lg font-bold text-blue-600">
                                                        {product.price} {product.priceType?.name_en || 'KD'}
                                                    </span>
                                                    {product.is_negotiable && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {language === 'ar' ? 'قابل للتفاوض' : 'Negotiable'}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="text-muted-foreground flex items-center justify-between text-xs">
                                                    <span>
                                                        {language === 'ar' ? product.condition?.name_ar : product.condition?.name_en} •
                                                        {language === 'ar' ? product.governorate?.name_ar : product.governorate?.name_en}
                                                    </span>
                                                    <span className="text-blue-500">{new Date(product.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {products?.data && products.data.length > 0 && (
                            <div className="flex justify-center">
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={products.current_page <= 1}
                                        onClick={() => goToPage(products.current_page - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        {language === 'ar' ? 'السابق' : 'Previous'}
                                    </Button>

                                    <div className="flex space-x-1">
                                        {(() => {
                                            const current = products.current_page;
                                            const last = products.last_page;
                                            const delta = 2;
                                            const range = [];
                                            const rangeWithDots = [];

                                            // Calculate the range of pages to show
                                            for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
                                                range.push(i);
                                            }

                                            // Always show first page
                                            if (current - delta > 2) {
                                                rangeWithDots.push(1, '...');
                                            } else {
                                                rangeWithDots.push(1);
                                            }

                                            // Add the calculated range (excluding first and last)
                                            rangeWithDots.push(...range);

                                            // Always show last page (if it's not already included)
                                            if (last > 1) {
                                                if (current + delta < last - 1) {
                                                    rangeWithDots.push('...', last);
                                                } else if (!range.includes(last)) {
                                                    rangeWithDots.push(last);
                                                }
                                            }

                                            return rangeWithDots.map((page, index) => {
                                                if (page === '...') {
                                                    return (
                                                        <span key={`dots-${index}`} className="text-muted-foreground px-2">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                const pageNum = page as number;
                                                const isActive = pageNum === current;

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={isActive ? 'default' : 'secondary'}
                                                        size="sm"
                                                        className={`w-10 ${isActive ? 'bg-luxury-black hover:bg-luxury-black text-white' : ''}`}
                                                        onClick={() => goToPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            });
                                        })()}
                                    </div>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={products.current_page >= products.last_page}
                                        onClick={() => goToPage(products.current_page + 1)}
                                    >
                                        {language === 'ar' ? 'التالي' : 'Next'}
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
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
