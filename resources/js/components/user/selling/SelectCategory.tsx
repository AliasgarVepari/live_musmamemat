import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SellFormData } from "./SellWizard";
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
  Home
} from "lucide-react";

interface SelectCategoryProps {
  formData: SellFormData;
  updateFormData: (data: Partial<SellFormData>) => void;
}

const categories = [
  { value: 'handbags', icon: ShoppingBag, labelKey: 'category.handbags' },
  { value: 'clothing', icon: Shirt, labelKey: 'category.clothing' },
  { value: 'jewelry', icon: Gem, labelKey: 'category.jewelry' },
  { value: 'beauty-care', icon: Sparkles, labelKey: 'category.beauty' },
  { value: 'accessories', icon: Watch, labelKey: 'category.accessories' },
  { value: 'children', icon: Baby, labelKey: 'category.children' },
  { value: 'toys', icon: Gamepad2, labelKey: 'category.toys' },
  { value: 'electronics', icon: Smartphone, labelKey: 'category.electronics' },
  { value: 'travel', icon: Plane, labelKey: 'category.travel' },
  { value: 'home-furniture', icon: Home, labelKey: 'category.home' },
  { value: 'watches', icon: Watch, labelKey: 'category.watches' },
];

export const SelectCategory = ({ formData, updateFormData }: SelectCategoryProps) => {
  const { language, t } = useLanguage();

  return (
    <div className={`space-y-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <RadioGroup
        value={formData.category}
        onValueChange={(value) => updateFormData({ category: value })}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.value}>
              <RadioGroupItem value={category.value} id={category.value} className="sr-only" />
              <Label
                htmlFor={category.value}
                className="cursor-pointer"
              >
                <Card className={`p-6 text-center transition-all duration-200 hover:shadow-lg ${
                  formData.category === category.value 
                    ? 'ring-2 ring-luxury-gold bg-luxury-ivory' 
                    : 'hover:bg-luxury-ivory/50'
                }`}>
                  <Icon className="h-8 w-8 mx-auto mb-3 text-luxury-black stroke-[1.5]" />
                  <span className={`text-sm font-medium text-luxury-black ${
                    language === 'ar' ? 'font-arabic' : ''
                  }`}>
                    {t(category.labelKey)}
                  </span>
                </Card>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      
      {formData.category && (
        <div className="mt-6 p-4 bg-luxury-ivory/50 rounded-lg">
          <p className={`text-sm text-luxury-black ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            <span className="font-medium">{t('sell.category.selected')}:</span> {t(`category.${formData.category}`)}
          </p>
        </div>
      )}
    </div>
  );
};