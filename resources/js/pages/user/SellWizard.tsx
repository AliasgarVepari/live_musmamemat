import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/user/ui/progress";
import { Button } from "@/components/user/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/user/Header";
import { Footer } from "@/components/user/Footer";
import { BottomNavigation } from "@/components/user/BottomNavigation";
import { AuthModal } from "@/components/user/auth/AuthModal";
import { SelectCategory } from "../../components/user/selling/SelectCategory";
import {ProductDetails} from "../../components/user/selling/ProductDetails";
import { SelectSubscription } from "../../components/user/selling/SelectSubscription";
import { SelectUpgradeSubscription } from "../../components/user/selling/SelectUpgradeSubscription";
import { AllowanceExhaustedModal } from "../../components/user/selling/AllowanceExhaustedModal";
import { SubmissionSuccess } from "../../components/user/selling/SubmissionSuccess";
import UserLayout from "@/layouts/user/user-layout";
import { useToast } from "@/hooks/user/use-toast";

export interface SellFormData {
  category_id?: number;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  product_details_en?: string;
  product_details_ar?: string;
  condition_id?: number;
  governorate_id?: number;
  price?: string;
  price_type_id?: number;
  is_negotiable?: boolean;
  images?: (File | string)[];
  subscription_plan_id?: number;
  draftAdId?: number;
  current_step?: number;
}

const STEPS = [
  { id: 1, path: 'category', titleKey: 'sell.step1.title' },
  { id: 2, path: 'details', titleKey: 'sell.step2.title' },
  { id: 3, path: 'subscription', titleKey: 'sell.step3.title' },
  { id: 4, path: 'submitted', titleKey: 'sell.step4.title' }
];

const WizardContent = ({ step = 'category' }: { step?: string }) => {
  const { language, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAllowanceExhaustedModal, setShowAllowanceExhaustedModal] = useState(false);
  const [upgradeEligible, setUpgradeEligible] = useState<boolean | null>(null);
  const [upgradeError, setUpgradeError] = useState<string>('');
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [isUpgradeMode, setIsUpgradeMode] = useState(() => {
    return localStorage.getItem('sell-upgrade-mode') === 'true';
  });
  
  const [formData, setFormData] = useState<SellFormData>(() => {
    const saved = localStorage.getItem('sell-draft');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [currentAdId, setCurrentAdId] = useState<number | null>(formData.draftAdId || null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentStep = STEPS.find(s => s.path === step)?.id || 1;
  const isLastStep = currentStep === STEPS.length;
  
  // Debug logging (commented out to prevent console spam)
  // console.log('Step detection:', { step, currentStep, STEPS, foundStep: STEPS.find(s => s.path === step) });
  // console.log('Navigation should show:', currentStep < 4);
  
  // Debug logging
  // useEffect(() => {
  //   console.log('SellWizard Debug:', { step, currentStep, isLastStep, formData });
  //   console.log('Navigation should show:', currentStep < 4);
  // }, [step, currentStep, isLastStep, formData]);
  
  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      // Fetch user subscription data when authenticated
      fetchUserSubscription();
    }
  }, [isAuthenticated]);

  // Save draft on form data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem('sell-draft', JSON.stringify(formData));
    }
  }, [formData]);

  const updateFormData = (newData: Partial<SellFormData>) => {
    console.log('SellWizard: updateFormData called with newData:', newData);
    setFormData(prev => {
      const updated = { ...prev, ...newData };
      console.log('SellWizard: updated formData:', updated);
      return updated;
    });
  };

  // Fetch user subscription data
  const fetchUserSubscription = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserSubscription(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const updateCurrentStepInBackend = async (step: number) => {
    if (!currentAdId) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/user/ads/${currentAdId}/current-step`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ current_step: step }),
      });

      if (!response.ok) {
        console.error('Failed to update current step');
      }
    } catch (error) {
      console.error('Error updating current step:', error);
    }
  };

  const checkUpgradeEligibility = async () => {
    try {
     console.log('Checking upgrade eligibility');
      setCheckingEligibility(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/subscription-plans/upgrade-eligibility', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setUpgradeEligible(result.eligible);
        if (!result.eligible) {
          setUpgradeError(result.message);
        }
        setShowAllowanceExhaustedModal(true);
      } else {
        setUpgradeEligible(false);
        setUpgradeError(result.message || 'Failed to check upgrade eligibility');
        setShowAllowanceExhaustedModal(true);
      }
    } catch (error) {
      console.error('Error checking upgrade eligibility:', error);
      setUpgradeEligible(false);
      setUpgradeError('Failed to check upgrade eligibility');
      setShowAllowanceExhaustedModal(true);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleNext = async () => {
    // If we're on step 2 (product details), check subscription first
    if (currentStep === 2) {
      setIsSubmitting(true);
      try {
        console.log('User subscription:', userSubscription);
        // Check if user has active subscription with remaining allowance
        const hasActiveSubscription = userSubscription?.is_active && 
          new Date(userSubscription.expires_at) > new Date();
        const hasRemainingAllowance = (userSubscription?.usable_ad_for_this_month ?? 0) > 0;

        if (hasActiveSubscription && hasRemainingAllowance) {
          // User has subscription and allowance - create ad directly
          console.log('User has active subscription, creating active ad...');
          await createActiveAd();
          router.visit('/sell/submitted');
          return;
        } else if (hasActiveSubscription && !hasRemainingAllowance) {
          // User has subscription but no allowance - check upgrade eligibility
          await checkUpgradeEligibility();
          return;
        } else {
          // User has no subscription - go to subscription selection
          router.visit('/sell/subscription');
          return;
        }
      } finally {
        setIsSubmitting(false);
      }
    }
    
    if (currentStep < STEPS.length) {
      const nextStep = currentStep + 1;
      // Update current step in backend
      await updateCurrentStepInBackend(nextStep);
      // Navigate to the next step
      const nextStepData = STEPS.find(s => s.id === nextStep);
      if (nextStepData) {
        router.visit(`/sell/${nextStepData.path}`);
      }
    }
  };

  const createActiveAd = async () => {
    try {
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Prepare form data for ad submission
      const formDataToSubmit = new FormData();
      
      // Add all form fields
      if (formData.category_id) formDataToSubmit.append('category_id', formData.category_id.toString());
      if (formData.title_en) formDataToSubmit.append('title_en', formData.title_en);
      if (formData.title_ar) formDataToSubmit.append('title_ar', formData.title_ar);
      if (formData.description_en) formDataToSubmit.append('description_en', formData.description_en);
      if (formData.description_ar) formDataToSubmit.append('description_ar', formData.description_ar);
      if (formData.product_details_en) formDataToSubmit.append('product_details_en', formData.product_details_en);
      if (formData.product_details_ar) formDataToSubmit.append('product_details_ar', formData.product_details_ar);
      if (formData.condition_id) formDataToSubmit.append('condition_id', formData.condition_id.toString());
      if (formData.governorate_id) formDataToSubmit.append('governorate_id', formData.governorate_id.toString());
      if (formData.price) formDataToSubmit.append('price', formData.price);
      if (formData.price_type_id) formDataToSubmit.append('price_type_id', formData.price_type_id.toString());
      if (formData.is_negotiable !== undefined) formDataToSubmit.append('is_negotiable', formData.is_negotiable ? '1' : '0');
      if (formData.subscription_plan_id !== undefined) formDataToSubmit.append('subscription_plan_id', formData.subscription_plan_id.toString());
      
      // Add images
      if (formData.images) {
        formData.images.forEach((image, index) => {
          if (image instanceof File) {
            formDataToSubmit.append(`images[${index}]`, image);
          } else if (typeof image === 'string') {
            // Check if it's a base64 string or a URL
            if (image.startsWith('data:image/')) {
              try {
                // Convert base64 string back to File for submission
                const byteString = atob(image.split(',')[1]);
                const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });
                const file = new File([blob], `image_${index}.jpg`, { type: mimeString });
                formDataToSubmit.append(`images[${index}]`, file);
              } catch (error) {
                console.error('Error converting base64 image:', error);
                // Skip this image if conversion fails
              }
            } else if (image.startsWith('http')) {
              // Skip URL images as they're already uploaded
              console.log('Skipping URL image:', image);
            }
          }
        });
      }

      // Always create as active
      formDataToSubmit.append('status', 'active');

      // Submit the ad
      const response = await fetch('/api/user/ads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formDataToSubmit,
      });

      // Handle different response status codes
      if (response.status === 403) {
        console.log('Received 403 Forbidden response');
        // Handle 403 Forbidden - likely subscription/allowance issues
        try {
          const result = await response.json();
          console.log('403 response data:', result);
          if (result.error_code === 'MONTHLY_LIMIT_EXCEEDED') {
            console.log('Monthly limit exceeded, checking upgrade eligibility');
            // User has reached monthly limit, check upgrade eligibility
            await checkUpgradeEligibility();
            return;
          } else if (result.error_code === 'NO_SUBSCRIPTION') {
            console.log('No subscription, redirecting to subscription selection');
            // User needs to select a subscription plan
            router.visit('/sell/subscription');
            return;
          }
        } catch (parseError) {
          console.error('Error parsing 403 response:', parseError);
        }
        // Fallback for 403 without proper error structure
        console.log('403 fallback: checking upgrade eligibility');
        await checkUpgradeEligibility();
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Ad created successfully:', result.data.ad);
        // Clear form data after successful submission
        localStorage.removeItem('sell-draft');
        return result.data.ad.id;
      } else {
        // Handle specific error codes
        if (result.error_code === 'NO_SUBSCRIPTION') {
          // User needs to select a subscription plan
          router.visit('/sell/subscription');
          return;
        } else if (result.error_code === 'MONTHLY_LIMIT_EXCEEDED') {
          // User has reached monthly limit, check upgrade eligibility
          await checkUpgradeEligibility();
          return;
        } else if (result.errors) {
          // Handle validation errors
          const errorMessages = Object.values(result.errors).flat();
          console.log('Validation errors:', errorMessages);
          toast({
            title: language === 'ar' ? 'خطأ في التحقق' : "Validation Error",
            description: errorMessages.join(', '),
            variant: "destructive",
          });
          throw new Error(errorMessages.join(', '));
        } else {
          // Handle general errors
          console.log('General error:', result.message);
          toast({
            title: language === 'ar' ? 'خطأ' : "Error",
            description: result.message || (language === 'ar' ? 'فشل في إنشاء الإعلان' : "Failed to create ad"),
            variant: "destructive",
          });
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : "Error",
        description: language === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Clear upgrade mode when going back from subscription step
      if (currentStep === 3 && isUpgradeMode) {
        clearUpgradeMode();
      }
      router.visit(`/sell/${STEPS[currentStep - 2].path}`);
    } else {
      router.visit('/');
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('SellWizard: handleSubmit called with formData:', formData);
      console.log('SellWizard: subscription_plan_id:', formData.subscription_plan_id);
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // If in upgrade mode, handle upgrade first
      if (isUpgradeMode && formData.subscription_plan_id) {
        await handleUpgradeSubscription();
        return;
      }

      // Create active ad with subscription
      const adId = await createActiveAd();
      if (!adId) {
        return;
      }

      // If subscription is selected, assign it to the ad
      if (formData.subscription_plan_id) {
        const subscriptionResponse = await fetch(`/api/user/ads/${adId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify({
            subscription_plan_id: formData.subscription_plan_id,
          }),
        });

        const subscriptionResult = await subscriptionResponse.json();
        if (!subscriptionResult.success) {
          toast({
            title: language === 'ar' ? 'خطأ' : "Error",
            description: subscriptionResult.message || (language === 'ar' ? 'فشل في تعيين خطة الاشتراك' : "Failed to assign subscription plan"),
            variant: "destructive",
          });
          return;
        }
      }

    // Clear draft after successful submission
    localStorage.removeItem('sell-draft');
      router.visit('/sell/submitted');
    } catch (error) {
      console.error('Error submitting ad:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : "Error",
        description: language === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canContinue = () => {
    const result = (() => {
    switch (currentStep) {
      case 1:
          return !!formData.category_id;
      case 2:
          return !!(
            formData.title_en && 
            formData.title_ar && 
            formData.description_en && 
            formData.description_ar && 
            formData.condition_id && 
            formData.governorate_id && 
            formData.price && 
            formData.price_type_id &&
            formData.images && 
            formData.images.length > 0
          );
      case 3:
          console.log('SellWizard: canContinue check for step 3, subscription_plan_id:', formData.subscription_plan_id);
          return !!formData.subscription_plan_id;
      default:
        return false;
    }
    })();
    
    console.log('SellWizard: canContinue check:', { currentStep, formData, result });
    return result;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SelectCategory formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <ProductDetails formData={formData} updateFormData={updateFormData} isSubmitting={isSubmitting} />;
      case 3:
        return isUpgradeMode ? 
          <SelectUpgradeSubscription formData={formData} updateFormData={updateFormData} /> :
          <SelectSubscription formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <SubmissionSuccess />;
      default:
        return null;
    }
  };

  const currentStepData = STEPS[currentStep - 1];

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleUpgradeSubscriptionClick = async () => {
    // If eligibility hasn't been checked yet, check it now
    if (upgradeEligible === null) {
      await checkUpgradeEligibility();
      return; // The modal will be updated with the result
    }
    
    // Only proceed if eligible
    if (upgradeEligible === true) {
      setShowAllowanceExhaustedModal(false);
      setIsUpgradeMode(true);
      // Store upgrade mode in localStorage to persist across navigation
      localStorage.setItem('sell-upgrade-mode', 'true');
      router.visit('/sell/subscription');
    }
  };

  const handleGoHome = () => {
    setShowAllowanceExhaustedModal(false);
    // Clear upgrade mode when going home
    setIsUpgradeMode(false);
    localStorage.removeItem('sell-upgrade-mode');
    router.visit('/');
  };

  const clearUpgradeMode = () => {
    setIsUpgradeMode(false);
    localStorage.removeItem('sell-upgrade-mode');
  };

  const handleUpgradeSubscription = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('/api/user/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          subscription_plan_id: formData.subscription_plan_id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: language === 'ar' ? 'تم الترقية بنجاح' : 'Upgrade Successful',
          description: language === 'ar' 
            ? `تمت ترقية اشتراكك! حصلت على ${result.data.ad_limit_increase} إعلان إضافي`
            : `Your subscription has been upgraded! You received ${result.data.ad_limit_increase} extra ads`,
          variant: 'default',
        });

        // Clear upgrade mode after successful upgrade
        clearUpgradeMode();
        
        // Now submit the ad with active status
        await submitAdWithStatus('active');
      } else {
        toast({
          title: language === 'ar' ? 'خطأ في الترقية' : 'Upgrade Error',
          description: result.message || (language === 'ar' ? 'فشل في ترقية الاشتراك' : 'Failed to upgrade subscription'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const submitAdWithStatus = async (status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      let response;
      let result;

      if (formData.draftAdId) {
        // Update existing draft
        response = await fetch(`/api/user/ads/${formData.draftAdId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify({
            status: status,
          }),
        });

        result = await response.json();
      } else {
        // Create new ad
        const formDataToSubmit = new FormData();
        
        // Add all form fields
        if (formData.category_id) formDataToSubmit.append('category_id', formData.category_id.toString());
        if (formData.title_en) formDataToSubmit.append('title_en', formData.title_en);
        if (formData.title_ar) formDataToSubmit.append('title_ar', formData.title_ar);
        if (formData.description_en) formDataToSubmit.append('description_en', formData.description_en);
        if (formData.description_ar) formDataToSubmit.append('description_ar', formData.description_ar);
        if (formData.product_details_en) formDataToSubmit.append('product_details_en', formData.product_details_en);
        if (formData.product_details_ar) formDataToSubmit.append('product_details_ar', formData.product_details_ar);
        if (formData.condition_id) formDataToSubmit.append('condition_id', formData.condition_id.toString());
        if (formData.governorate_id) formDataToSubmit.append('governorate_id', formData.governorate_id.toString());
        if (formData.price) formDataToSubmit.append('price', formData.price);
        if (formData.price_type_id) formDataToSubmit.append('price_type_id', formData.price_type_id.toString());
        if (formData.is_negotiable !== undefined) formDataToSubmit.append('is_negotiable', formData.is_negotiable ? '1' : '0');
        
        // Add images
        if (formData.images) {
          formData.images.forEach((image, index) => {
            if (image instanceof File) {
              formDataToSubmit.append(`images[${index}]`, image);
            } else if (typeof image === 'string') {
              // Check if it's a base64 string or a URL
              if (image.startsWith('data:image/')) {
                try {
                  // Convert base64 string back to File for submission
                  const byteString = atob(image.split(',')[1]);
                  const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
                  const ab = new ArrayBuffer(byteString.length);
                  const ia = new Uint8Array(ab);
                  for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                  }
                  const blob = new Blob([ab], { type: mimeString });
                  const file = new File([blob], `image_${index}.jpg`, { type: mimeString });
                  formDataToSubmit.append(`images[${index}]`, file);
                } catch (error) {
                  console.error('Error converting base64 image:', error);
                  // Skip this image if conversion fails
                }
              } else if (image.startsWith('http')) {
                // Skip URL images as they're already uploaded
                console.log('Skipping URL image:', image);
              }
            }
          });
        }

        formDataToSubmit.append('status', status);

        response = await fetch('/api/user/ads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: formDataToSubmit,
        });

        result = await response.json();
      }

      if (result.success) {
        // Clear draft after successful submission
        localStorage.removeItem('sell-draft');
        router.visit('/sell/submitted');
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat();
          toast({
            title: language === 'ar' ? 'خطأ في التحقق' : "Validation Error",
            description: errorMessages.join(', '),
            variant: "destructive",
          });
        } else {
          toast({
            title: language === 'ar' ? 'خطأ' : "Error",
            description: result.message || (language === 'ar' ? 'فشل في إرسال الإعلان' : "Failed to submit ad"),
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error submitting ad:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : "Error",
        description: language === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          router.visit('/');
        }}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <UserLayout>
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-2xl font-bold text-luxury-black ${
            language === 'ar' ? 'font-arabic' : 'font-serif'
          }`}>
            {t('sell.wizard.title')}
          </h1>
          <span className="text-sm text-muted-foreground">
            {t('sell.wizard.step')} {currentStep} {t('sell.wizard.of')} {STEPS.length}
          </span>
        </div>
        
        <Progress value={(currentStep / STEPS.length) * 100} className="mb-4" />
        
        <div className="text-center">
          <h2 className={`text-xl font-semibold text-luxury-black mb-2 ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {t(currentStepData.titleKey)}
          </h2>
          <p className={`text-muted-foreground ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {t(`${currentStepData.titleKey}.subtitle`)}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep < 4 && (
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <Button
            variant="secondary"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <span className={language === 'ar' ? 'font-arabic' : ''}>{t('sell.wizard.back')}</span>
          </Button>
          
          <Button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            disabled={!canContinue() || isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className={language === 'ar' ? 'font-arabic' : ''}>
                  {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                </span>
              </>
            ) : (
              <>
            <span className={language === 'ar' ? 'font-arabic' : ''}>
              {currentStep === 3 ? t('sell.wizard.submit') : t('sell.wizard.continue')}
            </span>
            <ChevronRight className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Allowance Exhausted Modal */}
      <AllowanceExhaustedModal
        isOpen={showAllowanceExhaustedModal}
        onClose={() => setShowAllowanceExhaustedModal(false)}
        onUpgrade={handleUpgradeSubscriptionClick}
        onGoHome={handleGoHome}
        upgradeEligible={upgradeEligible}
        upgradeError={upgradeError}
        checkingEligibility={checkingEligibility}
      />
    </div>
    </UserLayout>
  );
};

interface SellWizardProps {
  step?: string;
}

export default function SellWizard({ step = 'category' }: SellWizardProps) {
  // Auto-redirect to category step if accessing /sell directly
  useEffect(() => {
    if (step === 'sell' || step === '') {
      router.visit('/sell/category', { replace: true });
    }
  }, [step]);

  // Check if we're editing a draft and redirect to the appropriate step
  useEffect(() => {
    if (step === 'category') {
      const savedDraft = localStorage.getItem('sell-draft');
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        // If we have a draftAdId, we're editing an existing draft
        if (draftData.draftAdId) {
          // Get the current step from the draft data or default to step 2
          const currentStep = draftData.current_step || 2;
          const stepMap: { [key: number]: string } = {
            1: 'category',
            2: 'details', 
            3: 'subscription',
            4: 'submitted'
          };
          const stepPath = stepMap[currentStep] || 'details';
          
          // Only redirect if we're not already on the correct step
          if (stepPath !== 'category') {
            router.visit(`/sell/${stepPath}`, { replace: true });
          }
        }
      }
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <WizardContent step={step} />
      </main>
      <Footer />
      {/* <BottomNavigation /> */}
    </div>
  );
}