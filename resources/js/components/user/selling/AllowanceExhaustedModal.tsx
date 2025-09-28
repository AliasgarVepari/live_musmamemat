import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/user/ui/dialog';
import { Button } from '@/components/user/ui/button';
import { AlertTriangle, Home, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AllowanceExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onGoHome: () => void;
  upgradeEligible?: boolean | null;
  upgradeError?: string;
  checkingEligibility?: boolean;
}

export const AllowanceExhaustedModal: React.FC<AllowanceExhaustedModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  onGoHome,
  upgradeEligible = null,
  upgradeError = '',
  checkingEligibility = false,
}) => {
  const { language, t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto mx-auto my-4 sm:my-0">
        <DialogHeader className="text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <div className="w-full">
              <DialogTitle className={`text-xl sm:text-2xl font-bold text-gray-900 leading-tight ${
                language === 'ar' ? 'font-arabic' : ''
              }`}>
                {language === 'ar' ? 'تم استنفاد حد الإعلانات' : 'Ad Limit Exhausted'}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-5">
          <p className={`text-sm sm:text-base text-gray-600 leading-relaxed text-center px-2 ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {language === 'ar' 
              ? 'لقد وصلت إلى الحد الأقصى من الإعلانات لهذا الشهر. يمكنك المحاولة مرة أخرى الشهر القادم أو ترقية اشتراكك للحصول على المزيد من الإعلانات.'
              : 'Your ad limit for this month has been exhausted. You can try adding next month or upgrade your subscription to get more ads.'
            }
          </p>

          {/* Show eligibility status */}
          {checkingEligibility ? (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center mx-2">
              <p className={`text-sm text-blue-700 ${language === 'ar' ? 'font-arabic' : ''}`}>
                {language === 'ar' ? 'جاري التحقق من الأهلية...' : 'Checking eligibility...'}
              </p>
            </div>
          ) : upgradeEligible !== null && (
            <div className={`p-4 rounded-lg text-center mx-2 ${
              upgradeEligible 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-medium leading-relaxed ${
                upgradeEligible ? 'text-green-700' : 'text-red-700'
              } ${language === 'ar' ? 'font-arabic' : ''}`}>
                {upgradeEligible 
                  ? (language === 'ar' ? 'يمكنك ترقية اشتراكك' : 'You are eligible for upgrade')
                  : upgradeError || (language === 'ar' ? 'لا يمكنك ترقية اشتراكك' : 'No upgrade options available. You already have the highest plan or no better plans exist.')
                }
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3 pt-2 px-2">
            <Button
              variant="outline"
              onClick={onGoHome}
              className="flex items-center justify-center gap-2 w-full h-14 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 touch-manipulation"
            >
              <Home className="w-5 h-5" />
              <span className={`font-medium text-base ${language === 'ar' ? 'font-arabic' : ''}`}>
                {language === 'ar' ? 'إلغاء الإدراج والعودة للرئيسية' : 'Cancel Listing and Go Home'}
              </span>
            </Button>
            
            <Button
              onClick={onUpgrade}
              disabled={checkingEligibility || upgradeEligible === false}
              className={`flex items-center justify-center gap-2 w-full h-14 font-medium text-base touch-manipulation ${
                (checkingEligibility || upgradeEligible === false)
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400' 
                  : 'bg-brand-red-600 hover:bg-brand-red-700 text-white border-brand-red-600'
              }`}
            >
              {checkingEligibility ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className={language === 'ar' ? 'font-arabic' : ''}>
                    {language === 'ar' ? 'جاري التحقق...' : 'Checking...'}
                  </span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span className={language === 'ar' ? 'font-arabic' : ''}>
                    {language === 'ar' ? 'ترقية الاشتراك' : 'Upgrade Subscription'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
