import { useLanguage } from '@/contexts/LanguageContext';
import products from '@/routes/user/products';
import { router } from '@inertiajs/react';
import { Crown, Shirt, ShoppingBag, Watch } from 'lucide-react';
import { CategoryTile } from './CategoryTile';
export const CategoryGrid = () => {
    const { language, t } = useLanguage();
    // const navigate = useNavigate();

    const categories = [
        { icon: ShoppingBag, titleKey: 'category.handbags', productCount: 156, slug: 'handbags' },
        { icon: Shirt, titleKey: 'category.clothing', productCount: 324, slug: 'clothing' },
        { icon: Crown, titleKey: 'category.jewelry', productCount: 89, slug: 'jewelry' },
        { icon: Watch, titleKey: 'category.watches', productCount: 56, slug: 'watches' },
    ];

    return (
        <section className="from-surface to-brand-red-50/30 bg-gradient-to-br py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className={`mb-12 space-y-4 text-center ${language === 'ar' ? 'rtl' : 'ltr'}`}>
                    <h2 className={`text-3xl font-bold md:text-4xl ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}>
                        <span className="text-brand-red-600">{t('categories.title')}</span>
                    </h2>
                    <p className={`text-muted-foreground mx-auto max-w-2xl ${language === 'ar' ? 'font-arabic' : ''}`}>{t('categories.subtitle')}</p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    {categories.map((category, index) => (
                        // <Link href={products.index.get({ query: { category: category.slug } })}>
                        <CategoryTile
                            key={index}
                            icon={category.icon}
                            titleKey={category.titleKey}
                            productCount={category.productCount}
                            className="animate-fade-in"
                            onClick={() => router.visit(products.index.get({ query: { category: category.slug } }))}
                        />
                        // </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
