import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/user/ui/card";
import { Button } from "@/components/user/ui/button";
import { Badge } from "@/components/user/ui/badge";
import { SellFormData } from "@/pages/user/SellWizard";
import { Check, Star, Crown, Zap } from "lucide-react";

interface SelectSubscriptionProps {
  formData: SellFormData;
  updateFormData: (data: Partial<SellFormData>) => void;
}

interface SubscriptionPlan {
  id: number;
  name_en: string;
  name_ar: string;
  price: number;
  months_count: number;
  is_lifetime: boolean;
  features_en?: string;
  features_ar?: string;
}

export const SelectSubscription = ({ formData, updateFormData }: SelectSubscriptionProps) => {
  const { language, t } = useLanguage();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch('/api/user/subscription-plans');
        const data = await response.json();
        setPlans(data.data || data);
      } catch (error) {
        console.error('Error loading subscription plans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handlePlanSelect = (planId: number) => {
    updateFormData({ subscription_plan_id: planId });
  };

  const getPlanName = (plan: SubscriptionPlan) => {
    return language === 'ar' ? plan.name_ar : plan.name_en;
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    // Default features based on plan type
    const defaultFeatures = {
      free: {
        en: [
          'Up to 5 images',
          'Basic listing',
          '7 days visibility',
          'Standard support'
        ],
        ar: [
          'حتى 5 صور',
          'إعلان أساسي',
          'ظهور لمدة 7 أيام',
          'دعم قياسي'
        ]
      },
      silver: {
        en: [
          'Up to 10 images',
          'Featured listing',
          '14 days visibility',
          'Priority support',
          'Analytics dashboard'
        ],
        ar: [
          'حتى 10 صور',
          'إعلان مميز',
          'ظهور لمدة 14 يوم',
          'دعم أولوي',
          'لوحة تحليلات'
        ]
      },
      gold: {
        en: [
          'Unlimited images',
          'Premium listing',
          '30 days visibility',
          '24/7 support',
          'Advanced analytics',
          'Featured placement'
        ],
        ar: [
          'صور غير محدودة',
          'إعلان مميز',
          'ظهور لمدة 30 يوم',
          'دعم 24/7',
          'تحليلات متقدمة',
          'موضع مميز'
        ]
      }
    };

    const planName = getPlanName(plan).toLowerCase();
    let planType = 'free';
    
    if (planName.includes('silver') || planName.includes('فضي')) planType = 'silver';
    if (planName.includes('gold') || planName.includes('ذهبي')) planType = 'gold';
    
    return defaultFeatures[planType as keyof typeof defaultFeatures][language as 'en' | 'ar'];
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    const name = getPlanName(plan).toLowerCase();
    if (name.includes('free') || name.includes('مجاني')) return Zap;
    if (name.includes('silver') || name.includes('فضي')) return Star;
    if (name.includes('gold') || name.includes('ذهبي')) return Crown;
    return Star;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'جاري تحميل خطط الاشتراك...' : 'Loading subscription plans...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex-1 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const IconComponent = getPlanIcon(plan);
          const isSelected = formData.subscription_plan_id === plan.id;
          const features = getPlanFeatures(plan);
          
          return (
            <Card
              key={plan.id}
              className={`flex flex-col h-full cursor-pointer transition-all hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <CardContent className="p-6 flex flex-col h-full">
                <div className="text-center mb-4">
                  {/* <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div> */}
                  
                  <h4 className={`text-lg font-semibold mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {getPlanName(plan)}
                  </h4>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-2xl font-bold ${language === 'ar' ? 'font-arabic' : ''}`}>
                      {plan.price === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `KD ${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className={`text-sm text-muted-foreground ${language === 'ar' ? 'font-arabic' : ''}`}>
                        {plan.is_lifetime 
                          ? (language === 'ar' ? 'مدى الحياة' : 'Lifetime')
                          : `/${plan.months_count} ${language === 'ar' ? 'شهر' : 'months'}`
                        }
                      </span>
                    )}
                  </div>

                  {plan.price > 0 && (
                    <Badge variant="secondary" className="mb-4">
                      {language === 'ar' ? 'مدفوع' : 'Paid'}
                    </Badge>
                  )}
                </div>

                {features.length > 0 && (
                  <ul className="space-y-2 flex-1">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${language === 'ar' ? 'font-arabic' : ''}`}>
                          {feature.trim()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  className={`w-full mt-4 ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                  variant={isSelected ? 'default' : 'outline'}
                >
                  {isSelected 
                    ? (language === 'ar' ? 'محدد' : 'Selected')
                    : (language === 'ar' ? 'اختر هذه الخطة' : 'Select This Plan')
                  }
                </Button>
              </CardContent>
            </Card>
          );
        })}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className={`text-sm text-muted-foreground ${language === 'ar' ? 'font-arabic' : ''}`}>
          {language === 'ar' 
            ? 'يمكنك تغيير خطة الاشتراك في أي وقت من إعدادات الحساب'
            : 'You can change your subscription plan anytime from account settings'
          }
        </p>
      </div>
    </div>
  );
};