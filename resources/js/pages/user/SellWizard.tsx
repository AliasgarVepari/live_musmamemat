import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { SubmissionSuccess } from "../../components/user/selling/SubmissionSuccess";

export interface SellFormData {
  category?: string;
  title?: string;
  description?: string;
  condition?: string;
  price?: string;
  location?: string;
  images?: File[];
  subscription?: 'free' | 'silver' | 'gold';
}

const STEPS = [
  { id: 1, path: 'category', titleKey: 'sell.step1.title' },
  { id: 2, path: 'details', titleKey: 'sell.step2.title' },
  { id: 3, path: 'subscription', titleKey: 'sell.step3.title' },
  { id: 4, path: 'submitted', titleKey: 'sell.step4.title' }
];

const WizardContent = () => {
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [formData, setFormData] = useState<SellFormData>(() => {
    const saved = localStorage.getItem('sell-draft');
    return saved ? JSON.parse(saved) : {};
  });
  
  const currentPath = location.pathname.split('/').pop() || 'category';
  const currentStep = STEPS.find(step => step.path === currentPath)?.id || 1;
  const isLastStep = currentStep === STEPS.length;
  
  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  // Save draft on form data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem('sell-draft', JSON.stringify(formData));
    }
  }, [formData]);

  const updateFormData = (newData: Partial<SellFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      navigate(`/sell/${STEPS[currentStep].path}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      navigate(`/sell/${STEPS[currentStep - 2].path}`);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = () => {
    // Clear draft after successful submission
    localStorage.removeItem('sell-draft');
    // In a real app, this would submit to backend
    console.log('Submitting listing:', formData);
    navigate('/sell/submitted');
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return !!formData.category;
      case 2:
        return !!(formData.title && formData.description && formData.condition && formData.price && formData.location);
      case 3:
        return !!formData.subscription;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SelectCategory formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <ProductDetails formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <SelectSubscription formData={formData} updateFormData={updateFormData} />;
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

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          navigate('/');
        }}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
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
            disabled={!canContinue()}
            className="flex items-center gap-2"
          >
            <span className={language === 'ar' ? 'font-arabic' : ''}>
              {currentStep === 3 ? t('sell.wizard.submit') : t('sell.wizard.continue')}
            </span>
            <ChevronRight className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      )}
    </div>
  );
};

export const SellWizard = () => {
  // Auto-redirect to category step if accessing /sell directly
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/sell' || location.pathname === '/sell/') {
      navigate('/sell/category', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <WizardContent />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};