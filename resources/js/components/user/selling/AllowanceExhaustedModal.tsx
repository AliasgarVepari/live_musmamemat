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
}

export const AllowanceExhaustedModal: React.FC<AllowanceExhaustedModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  onGoHome,
}) => {
  const { language, t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className={`text-xl font-semibold text-gray-900 ${
                language === 'ar' ? 'font-arabic' : ''
              }`}>
                {language === 'ar' ? 'تم استنفاد حد الإعلانات' : 'Ad Limit Exhausted'}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className={`text-gray-600 leading-relaxed ${
            language === 'ar' ? 'font-arabic text-right' : ''
          }`}>
            {language === 'ar' 
              ? 'لقد وصلت إلى الحد الأقصى من الإعلانات لهذا الشهر. يمكنك المحاولة مرة أخرى الشهر القادم أو ترقية اشتراكك للحصول على المزيد من الإعلانات.'
              : 'Your ad limit for this month has been exhausted. You can try adding next month or upgrade your subscription to get more ads.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onGoHome}
              className="flex items-center justify-center gap-2 flex-1"
            >
              <Home className="w-4 h-4" />
              <span className={language === 'ar' ? 'font-arabic' : ''}>
                {language === 'ar' ? 'إلغاء الإدراج والعودة للرئيسية' : 'Cancel Listing and Go Home'}
              </span>
            </Button>
            
            <Button
              onClick={onUpgrade}
              className="flex items-center justify-center gap-2 flex-1 bg-brand-red-600 hover:bg-brand-red-700"
            >
              <CreditCard className="w-4 h-4" />
              <span className={language === 'ar' ? 'font-arabic' : ''}>
                {language === 'ar' ? 'ترقية الاشتراك' : 'Upgrade Subscription'}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
