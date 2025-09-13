import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/user/ui/card";
import { Button } from "@/components/user/ui/button";
import { CheckCircle, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SubmissionSuccess = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className={`max-w-2xl mx-auto text-center ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Card className="p-8 bg-luxury-ivory border-luxury-gold">
        <CheckCircle className="h-16 w-16 mx-auto mb-6 text-luxury-gold" />
        
        <h2 className={`text-2xl font-bold text-luxury-black mb-4 ${
          language === 'ar' ? 'font-arabic' : 'font-serif'
        }`}>
          {t('sell.success.title')}
        </h2>
        
        <p className={`text-luxury-black/80 mb-6 leading-relaxed ${
          language === 'ar' ? 'font-arabic' : ''
        }`}>
          {t('sell.success.message')}
        </p>
        
        <div className={`bg-luxury-white p-4 rounded-lg mb-6 ${
          language === 'ar' ? 'text-right' : 'text-left'
        }`}>
          <h3 className={`font-semibold text-luxury-black mb-2 ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {t('sell.success.next-steps')}
          </h3>
          <ul className={`space-y-1 text-sm text-luxury-black/80 ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            <li>• {t('sell.success.step1')}</li>
            <li>• {t('sell.success.step2')}</li>
            <li>• {t('sell.success.step3')}</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/profile')}
            className="bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black"
          >
            <Eye className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            <span className={language === 'ar' ? 'font-arabic' : ''}>{t('sell.success.view-listings')}</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              // Clear any remaining draft and restart
              localStorage.removeItem('sell-draft');
              navigate('/sell/category');
            }}
            className="border-luxury-black text-luxury-black hover:bg-luxury-black hover:text-luxury-white"
          >
            <Plus className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            <span className={language === 'ar' ? 'font-arabic' : ''}>{t('sell.success.create-another')}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};