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
  slug: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  months_count: number;
  is_lifetime: boolean;
  readable_billing_cycle?: string;
  ad_limit: number;
  featured_ads?: number;
  featured_ads_count?: number;
  has_unlimited_featured_ads?: boolean;
  priority_support?: boolean;
  analytics?: boolean;
  status: string;
  features_en?: string;
  features_ar?: string;
}

export const SelectSubscription = ({ formData, updateFormData }: SelectSubscriptionProps) => {
  const { language, t } = useLanguage();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load subscription plans
        const plansResponse = await fetch('/api/user/subscription-plans');
        const plansData = await plansResponse.json();
        const allPlans = plansData.data || plansData;

        // Load user subscription
        const token = localStorage.getItem('authToken');
        if (token) {
          const subscriptionResponse = await fetch('/api/user/subscription', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            if (subscriptionData.success) {
              setUserSubscription(subscriptionData.data);
            }
          }
        }
          // For non-subscribed users, show all plans
          setPlans(allPlans);
        
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to showing all plans
        const response = await fetch('/api/user/subscription-plans');
        const data = await response.json();
        setPlans(data.data || data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePlanSelect = (planId: number) => {
    console.log('SelectSubscription: handlePlanSelect called with planId:', planId);
    updateFormData({ subscription_plan_id: planId });
    console.log('SelectSubscription: updateFormData called with subscription_plan_id:', planId);
  };

  const getPlanName = (plan: SubscriptionPlan) => {
    return language === 'ar' ? plan.name_ar : plan.name_en;
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const features: string[] = [];
    
    // Add ad limit feature
    if (plan.ad_limit > 0) {
      if (language === 'ar') {
        features.push(`${plan.ad_limit} إعلان شهرياً`);
      } else {
        features.push(`${plan.ad_limit} ads per month`);
      }
    }
    
    // Add featured ads feature
    if (plan.has_unlimited_featured_ads) {
      if (language === 'ar') {
        features.push('إعلانات مميزة غير محدودة');
      } else {
        features.push('Unlimited featured ads');
      }
    } else if (plan.featured_ads_count && plan.featured_ads_count > 0) {
      if (language === 'ar') {
        features.push(`${plan.featured_ads_count} إعلان مميز`);
      } else {
        features.push(`${plan.featured_ads_count} featured ads`);
      }
    }
    
    // Add priority support feature
    if (plan.priority_support) {
      if (language === 'ar') {
        features.push('دعم أولوي');
      } else {
        features.push('Priority support');
      }
    }
    
    // Add analytics feature
    if (plan.analytics) {
      if (language === 'ar') {
        features.push('تحليلات متقدمة');
      } else {
        features.push('Analytics');
      }
    }
      
    
    // Add lifetime feature
    if (plan.is_lifetime) {
      if (language === 'ar') {
        features.push('اشتراك مدى الحياة');
      } else {
        features.push('Lifetime subscription');
      }
    }
    
    // If no features found, add basic features based on ad limit
    if (features.length === 0) {
      if (language === 'ar') {
        features.push('إعلانات أساسية');
        features.push('دعم قياسي');
      } else {
        features.push('Basic listings');
        features.push('Standard support');
      }
    }
    
    return features;
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

                  
                  <h4 className={`text-lg font-semibold mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {getPlanName(plan)}
                  </h4>
                  
                  {(plan.description_en || plan.description_ar) && (
                    <p className={`text-sm text-muted-foreground mb-3 ${language === 'ar' ? 'font-arabic' : ''}`}>
                      {language === 'ar' ? plan.description_ar : plan.description_en}
                    </p>
                  )}
                  
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
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('SelectSubscription: Button clicked for plan:', plan.id);
                    handlePlanSelect(plan.id);
                  }}
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