import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SellFormData } from "./SellWizard";
import { Check, Star, Crown, Zap } from "lucide-react";

interface SelectSubscriptionProps {
  formData: SellFormData;
  updateFormData: (data: Partial<SellFormData>) => void;
}

const plans = [
  {
    id: 'free',
    name: 'sell.subscription.free.name',
    price: 'sell.subscription.free.price',
    icon: Zap,
    popular: false,
    imageLimit: 5,
    features: [
      'sell.subscription.free.feature1',
      'sell.subscription.free.feature2',
      'sell.subscription.free.feature3',
    ]
  },
  {
    id: 'silver',
    name: 'sell.subscription.silver.name',
    price: 'sell.subscription.silver.price',
    icon: Star,
    popular: true,
    imageLimit: 10,
    features: [
      'sell.subscription.silver.feature1',
      'sell.subscription.silver.feature2',
      'sell.subscription.silver.feature3',
      'sell.subscription.silver.feature4',
    ]
  },
  {
    id: 'gold',
    name: 'sell.subscription.gold.name',
    price: 'sell.subscription.gold.price',
    icon: Crown,
    popular: false,
    imageLimit: 20,
    features: [
      'sell.subscription.gold.feature1',
      'sell.subscription.gold.feature2',
      'sell.subscription.gold.feature3',
      'sell.subscription.gold.feature4',
      'sell.subscription.gold.feature5',
    ]
  }
];

export const SelectSubscription = ({ formData, updateFormData }: SelectSubscriptionProps) => {
  const { language, t } = useLanguage();
  const currentImages = formData.images?.length || 0;

  const checkImageLimit = (plan: typeof plans[0]) => {
    if (currentImages > plan.imageLimit) {
      return {
        exceeded: true,
        message: t('sell.subscription.image-limit-exceeded')
      };
    }
    return { exceeded: false };
  };

  return (
    <div className={`space-y-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = formData.subscription === plan.id;
          const imageCheck = checkImageLimit(plan);
          
          return (
            <Card 
              key={plan.id}
              className={`relative p-6 transition-all duration-200 cursor-pointer h-full flex flex-col ${
                isSelected 
                  ? 'ring-2 ring-luxury-gold bg-luxury-ivory' 
                  : 'hover:shadow-lg hover:bg-luxury-ivory/50'
              } ${imageCheck.exceeded ? 'opacity-60' : ''}`}
              onClick={() => !imageCheck.exceeded && updateFormData({ subscription: plan.id as any })}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-luxury-gold text-luxury-black">
                  <span className={language === 'ar' ? 'font-arabic' : ''}>{t('sell.subscription.popular')}</span>
                </Badge>
              )}
              
              <div className="text-center flex flex-col h-full">
                <Icon className="h-12 w-12 mx-auto mb-4 text-luxury-black stroke-[1.5]" />
                
                <h3 className={`text-xl font-bold text-luxury-black mb-2 ${
                  language === 'ar' ? 'font-arabic' : 'font-serif'
                }`}>
                  {t(plan.name)}
                </h3>
                
                <div className={`text-2xl font-bold text-luxury-gold mb-4 ${
                  language === 'ar' ? 'font-arabic' : ''
                }`}>
                  {t(plan.price)}
                </div>
                
                <div className={`text-sm text-muted-foreground mb-4 ${
                  language === 'ar' ? 'font-arabic' : ''
                }`}>
                  {t('sell.subscription.image-limit')}: {plan.imageLimit}
                </div>
                
                <ul className="space-y-2 mb-6 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-luxury-gold flex-shrink-0" />
                      <span className={`text-sm text-luxury-black ${
                        language === 'ar' ? 'font-arabic' : ''
                      }`}>
                        {t(feature)}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto">
                  {imageCheck.exceeded && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                      <p className={`text-xs text-destructive ${
                        language === 'ar' ? 'font-arabic' : ''
                      }`}>
                        {imageCheck.message}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    className={`w-full ${
                      isSelected 
                        ? 'bg-luxury-gold text-luxury-black' 
                        : 'bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black'
                    }`}
                    disabled={imageCheck.exceeded}
                  >
                    <span className={language === 'ar' ? 'font-arabic' : ''}>
                      {isSelected ? t('sell.subscription.selected') : t('sell.subscription.select')}
                    </span>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {currentImages > 0 && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <p className={`text-sm text-blue-700 ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {t('sell.subscription.current-images')}: {currentImages}
          </p>
        </Card>
      )}
    </div>
  );
};