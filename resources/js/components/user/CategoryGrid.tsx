import { useLanguage } from '@/contexts/LanguageContext';
import { useHomeCategoriesQuery } from '@/hooks/user/queries/use-categories-query';
import products from '@/routes/user/products';
import { router } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { CategoryTile } from './CategoryTile';

export const CategoryGrid = () => {
    const { language, t } = useLanguage();
    const { data: categories, isLoading, error } = useHomeCategoriesQuery();

    // Loading state
    if (isLoading) {
        return (
            <section className="from-surface to-brand-red-50/30 bg-gradient-to-br py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className={`space-y-4 text-center ${language === 'ar' ? 'rtl' : 'ltr'}`}>
                        <h2 className={`text-3xl font-bold md:text-4xl ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}>
                            <span className="text-brand-red-600">{t('categories.title')}</span>
                        </h2>
                        <div className="flex justify-center">
                            <div className="border-brand-red-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="from-surface to-brand-red-50/30 bg-gradient-to-br py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className={`space-y-4 text-center ${language === 'ar' ? 'rtl' : 'ltr'}`}>
                        <h2 className={`text-3xl font-bold md:text-4xl ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}>
                            <span className="text-brand-red-600">{t('categories.title')}</span>
                        </h2>
                        <p className={`text-muted-foreground mx-auto max-w-2xl ${language === 'ar' ? 'font-arabic' : ''}`}>
                            {language === 'ar' ? 'حدث خطأ في تحميل الفئات' : 'Error loading categories'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // If no categories with sort_order 1-4, show empty state
    if (!categories || categories.length === 0) {
        return (
            <section className="from-surface to-brand-red-50/30 bg-gradient-to-br py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className={`space-y-4 text-center ${language === 'ar' ? 'rtl' : 'ltr'}`}>
                        <h2 className={`text-3xl font-bold md:text-4xl ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}>
                            <span className="text-brand-red-600">{t('categories.title')}</span>
                        </h2>
                        <p className={`text-muted-foreground mx-auto max-w-2xl ${language === 'ar' ? 'font-arabic' : ''}`}>
                            {language === 'ar' ? 'لا توجد فئات متاحة حالياً' : 'No categories available at the moment'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

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
                    {categories.map((category, index) => {
                        return (
                            <CategoryTile
                                key={category.id}
                                icon={Package} // Fallback icon
                                iconUrl={category.icon_url} // Use actual icon from database
                                title={language === 'ar' ? category.name_ar : category.name_en}
                                productCount={0} // We can add product count later if needed
                                className="animate-fade-in"
                                onClick={() => router.visit(products.index.get({ query: { category: category.slug } }))}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
