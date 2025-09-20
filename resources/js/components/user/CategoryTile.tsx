import { Card } from '@/components/user/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LucideIcon } from 'lucide-react';

interface CategoryTileProps {
    icon: LucideIcon;
    iconUrl?: string;
    title: string;
    productCount?: number;
    className?: string;
    onClick?: () => void;
}

export const CategoryTile = ({ icon: Icon, iconUrl, title, productCount, className = '', onClick }: CategoryTileProps) => {
    const { language, t } = useLanguage();

    return (
        <Card
            className={`hover:bg-brand-red-50 border-border hover:border-brand-red-600 shadow-brand hover:shadow-glow animate-fade-in group relative cursor-pointer overflow-hidden border bg-white transition-all duration-300 ease-out hover:scale-105 ${className} `}
            onClick={onClick}
        >
            <div className="space-y-4 p-6 text-center">
                {/* Icon with brand styling */}
                <div className="bg-brand-red-50 group-hover:bg-brand-red-600 group-hover:shadow-glow mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-sm transition-all duration-300">
                    {iconUrl ? (
                        <img
                            src={iconUrl}
                            alt={title}
                            className="h-8 w-8 object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                        />
                    ) : (
                        <Icon className="text-brand-red-600 h-6 w-6 stroke-[1.5] transition-colors duration-300 group-hover:text-white" />
                    )}
                </div>

                {/* Title */}
                <h3
                    className={`text-ink-900 group-hover:text-brand-red-600 text-lg font-semibold transition-colors duration-300 ${
                        language === 'ar' ? 'font-arabic' : 'font-medium'
                    }`}
                >
                    {title}
                </h3>

                {/* Product Count */}
                {productCount !== undefined && productCount > 0 && (
                    <p className={`text-muted-foreground text-xs ${language === 'ar' ? 'font-arabic' : ''}`}>
                        {productCount} {t('products.count')}
                    </p>
                )}
            </div>

            {/* Brand hover overlay */}
            <div className="bg-brand-gradient absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-20" />

            {/* Premium border on hover */}
            <div className="border-brand-red-600 absolute inset-0 rounded-lg border-2 opacity-0 transition-opacity duration-300 group-hover:opacity-50" />
        </Card>
    );
};
