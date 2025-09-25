import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/user/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/user/ui/radio-group";
import { Label } from "@/components/user/ui/label";
import { SellFormData } from "../../pages/user/SellWizard";
import { 
  ShoppingBag, 
  Shirt, 
  Gem, 
  Sparkles, 
  Watch,
  Baby,
  Gamepad2,
  Smartphone,
  Plane,
  Home,
  Package
} from "lucide-react";

interface SelectCategoryProps {
  formData: SellFormData;
  updateFormData: (data: Partial<SellFormData>) => void;
}

interface Category {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  icon_url?: string;
}

const getCategoryIcon = (categoryName: string, categorySlug: string) => {
  const name = categoryName.toLowerCase();
  const slug = categorySlug.toLowerCase();
  
  if (name.includes('handbag') || name.includes('bag') || slug.includes('handbag') || slug.includes('bag')) {
    return ShoppingBag;
  }
  if (name.includes('clothing') || name.includes('clothes') || name.includes('shirt') || slug.includes('clothing') || slug.includes('clothes')) {
    return Shirt;
  }
  if (name.includes('jewelry') || name.includes('jewellery') || name.includes('gem') || slug.includes('jewelry') || slug.includes('jewellery')) {
    return Gem;
  }
  if (name.includes('watch') || name.includes('watches') || slug.includes('watch') || slug.includes('watches')) {
    return Watch;
  }
  if (name.includes('beauty') || name.includes('care') || slug.includes('beauty') || slug.includes('care')) {
    return Sparkles;
  }
  if (name.includes('children') || name.includes('baby') || slug.includes('children') || slug.includes('baby')) {
    return Baby;
  }
  if (name.includes('gaming') || name.includes('game') || slug.includes('gaming') || slug.includes('game')) {
    return Gamepad2;
  }
  if (name.includes('phone') || name.includes('mobile') || slug.includes('phone') || slug.includes('mobile')) {
    return Smartphone;
  }
  if (name.includes('travel') || name.includes('plane') || slug.includes('travel') || slug.includes('plane')) {
    return Plane;
  }
  if (name.includes('home') || name.includes('garden') || slug.includes('home') || slug.includes('garden')) {
    return Home;
  }
  
  // Default fallback
  return Package;
};

export const SelectCategory = ({ formData, updateFormData }: SelectCategoryProps) => {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/user/categories');
        const data = await response.json();
        setCategories(data.categories || data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    updateFormData({ category_id: parseInt(categoryId) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'جاري تحميل الفئات...' : 'Loading categories...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="text-center">
        <h3 className={`text-lg font-semibold mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {language === 'ar' ? 'اختر فئة المنتج' : 'Select Product Category'}
        </h3>
        <p className={`text-muted-foreground ${language === 'ar' ? 'font-arabic' : ''}`}>
          {language === 'ar' ? 'اختر الفئة التي تنتمي إليها منتجك' : 'Choose the category that best fits your product'}
        </p>
      </div>

      <RadioGroup
        value={formData.category_id?.toString() || ''}
        onValueChange={handleCategoryChange}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {categories.map((category) => {
          const categoryName = language === 'ar' ? category.name_ar : category.name_en;
          const IconComponent = getCategoryIcon(categoryName, category.slug);
          const isSelected = formData.category_id === category.id;
          
          return (
            <div key={category.id}>
              <RadioGroupItem
                value={category.id.toString()}
                id={`category-${category.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`category-${category.id}`}
                onClick={() => handleCategoryChange(category.id.toString())}
                className={`group flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/10 shadow-md' 
                    : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <div className={`mb-3 p-3 rounded-full transition-all ${
                  isSelected 
                    ? 'bg-primary text-white' 
                    : 'bg-muted/20 text-muted-foreground group-hover:bg-primary group-hover:text-white'
                }`}>
                  {category.icon_url ? (
                    <img
                      src={category.icon_url}
                      alt={categoryName}
                      className={`h-12 w-12 object-contain transition-all ${
                        isSelected 
                          ? 'brightness-0 invert' 
                          : 'group-hover:brightness-0 group-hover:invert'
                      }`}
                    />
                  ) : (
                    <IconComponent className="h-12 w-12" />
                  )}
                </div>
                <span className={`text-sm font-medium text-center ${language === 'ar' ? 'font-arabic' : ''} ${
                  isSelected ? 'text-primary' : ''
                }`}>
                  {categoryName}
                </span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};