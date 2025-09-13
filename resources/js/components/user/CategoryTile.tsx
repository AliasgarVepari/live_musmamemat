import { LucideIcon } from "lucide-react";
import { Card } from "@/components/user/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryTileProps {
  icon: LucideIcon;
  titleKey: string;
  productCount?: number;
  className?: string;
  onClick?: () => void;
}

export const CategoryTile = ({ 
  icon: Icon, 
  titleKey, 
  productCount, 
  className = "",
  onClick 
}: CategoryTileProps) => {
  const { language, t } = useLanguage();

  return (
    <Card 
      className={`
        group relative overflow-hidden cursor-pointer 
        bg-white hover:bg-brand-red-50 
        border border-border hover:border-brand-red-600
        shadow-brand hover:shadow-glow
        transition-all duration-300 ease-out
        hover:scale-105 animate-fade-in
        ${className}
      `}
      onClick={onClick}
    >
      <div className="p-6 text-center space-y-4">
        {/* Icon with brand styling */}
        <div className="mx-auto w-16 h-16 bg-brand-red-50 rounded-full flex items-center justify-center group-hover:bg-brand-red-600 transition-all duration-300 shadow-sm group-hover:shadow-glow">
          <Icon className="h-6 w-6 stroke-[1.5] text-brand-red-600 group-hover:text-white transition-colors duration-300" />
        </div>
        
        {/* Title */}
        <h3 className={`font-semibold text-lg text-ink-900 group-hover:text-brand-red-600 transition-colors duration-300 ${
          language === 'ar' ? 'font-arabic' : 'font-medium'
        }`}>
          {t(titleKey)}
        </h3>
        
        {/* Product Count */}
        {productCount !== undefined && productCount > 0 && (
          <p className={`text-xs text-muted-foreground ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {productCount} {t('products.count')}
          </p>
        )}
      </div>
      
      {/* Brand hover overlay */}
      <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      
      {/* Premium border on hover */}
      <div className="absolute inset-0 border-2 border-brand-red-600 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-lg" />
    </Card>
  );
};