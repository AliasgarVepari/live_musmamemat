import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/user/ui/card";
import { Button } from "@/components/user/ui/button";
import { Badge } from "@/components/user/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";

interface SelectUpgradeSubscriptionProps {
  currentSubscription: {
    id: number;
    plan: {
      id: number;
      name_en: string;
      name_ar: string;
      price: number;
    };
    expires_at: string;
  };
  onPlanSelect: (planId: number) => void;
  selectedPlanId?: number;
}

interface SubscriptionPlan {
  id: number;
  name_en: string;
  name_ar: string;
  price: number;
  months_count: number;
  is_lifetime: boolean;
  discounted_price?: number;
  original_price?: number;
  discount_amount?: number;
  features_en?: string;
  features_ar?: string;
  is_current_lifetime?: boolean;
}

export const SelectUpgradeSubscription = ({ 
  currentSubscription, 
  onPlanSelect, 
  selectedPlanId 
}: SelectUpgradeSubscriptionProps) => {
  const { language, t } = useLanguage();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpgradePlans = async () => {
      try {
        const response = await fetch(`/api/user/subscription-plans/upgrade?current_plan_id=${currentSubscription.plan.id}`);
        const data = await response.json();
        setPlans(data.data || data);
      } catch (error) {
        console.error('Error loading upgrade plans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUpgradePlans();
  }, [currentSubscription.plan.id]);

  const handlePlanSelect = (planId: number) => {
    onPlanSelect(planId);
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
            {language === 'ar' ? 'جاري تحميل خطط الترقية...' : 'Loading upgrade plans...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex-1 space-y-6">
        {/* Current Plan Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className={`text-lg font-semibold mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'خطة الاشتراك الحالية' : 'Current Subscription Plan'}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${language === 'ar' ? 'font-arabic' : ''}`}>
                {language === 'ar' ? currentSubscription.plan.name_ar : currentSubscription.plan.name_en}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentSubscription.plan.is_lifetime 
                  ? (language === 'ar' ? 'مدى الحياة' : 'Lifetime')
                  : `${language === 'ar' ? 'ينتهي في' : 'Expires on'} ${new Date(currentSubscription.expires_at).toLocaleDateString()}`
                }
              </p>
            </div>
            <Badge variant="outline">
              {language === 'ar' ? 'نشط' : 'Active'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const IconComponent = getPlanIcon(plan);
          const isSelected = selectedPlanId === plan.id;
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
                  <h4 className={`text-lg font-semibold mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {getPlanName(plan)}
                  </h4>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {plan.is_current_lifetime ? (
                      <div className="flex flex-col items-center">
                        <span className={`text-2xl font-bold ${language === 'ar' ? 'font-arabic' : ''}`}>
                          {plan.price === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `KD ${plan.price}`}
                        </span>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {language === 'ar' ? 'لا يوجد خصم للخطط الدائمة' : 'No discount for lifetime plans'}
                        </Badge>
                      </div>
                    ) : plan.discounted_price !== undefined && plan.discounted_price < plan.price ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold text-green-600 ${language === 'ar' ? 'font-arabic' : ''}`}>
                            KD {plan.discounted_price}
                          </span>
                          <span className={`text-lg line-through text-muted-foreground ${language === 'ar' ? 'font-arabic' : ''}`}>
                            KD {plan.price}
                          </span>
                        </div>
                        <Badge variant="destructive" className="mt-1">
                          {language === 'ar' ? `وفر KD ${plan.discount_amount}` : `Save KD ${plan.discount_amount}`}
                        </Badge>
                      </div>
                    ) : (
                      <span className={`text-2xl font-bold ${language === 'ar' ? 'font-arabic' : ''}`}>
                        {plan.price === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `KD ${plan.price}`}
                      </span>
                    )}
                    
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
            ? 'سيتم حساب الخصم بناءً على الأيام المتبقية في اشتراكك الحالي'
            : 'Discount will be calculated based on remaining days in your current subscription'
          }
        </p>
      </div>
    </div>
  );
};