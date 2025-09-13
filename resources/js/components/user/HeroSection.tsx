import { Button } from "@/components/user/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative bg-brand-gradient-hero overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D73A3A' fill-opacity='0.08'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className={`text-center space-y-8 animate-fade-in ${language === 'ar' ? 'rtl' : 'ltr'}`}>
          {/* Main heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-glow">
              <Sparkles className="h-5 w-5 stroke-[1.5] text-brand-red-600 animate-pulse" />
              <span className={`text-sm font-semibold text-ink-900 ${
                language === 'ar' ? 'font-arabic' : ''
              }`}>
                {t('hero.badge')}
              </span>
            </div>
            
            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${
              language === 'ar' ? 'font-arabic' : 'font-serif'
            }`}>
              <span className="block text-brand-red-600">{t('hero.title')}</span>
            </h1>
            
            <p className={`max-w-2xl mx-auto text-lg text-text-800 leading-relaxed ${
              language === 'ar' ? 'font-arabic' : ''
            }`}>
              {t('hero.subtitle')}
            </p>
          </div>
          
          {/* Call to action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => navigate('/products?category=all')}
              className="group"
            >
              <span className={language === 'ar' ? 'font-arabic' : ''}>{t('hero.cta.shop')}</span>
              <ChevronRight className={`h-4 w-4 stroke-[1.5] group-hover:translate-x-1 transition-transform ${
                language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'
              }`} />
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/sell')}
              className="group"
            >
              <span className={language === 'ar' ? 'font-arabic' : ''}>{t('hero.cta.sell')}</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-brand-red-600/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-champagne/30 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-brand-red-600/10 rounded-full blur-lg animate-pulse delay-500" />
    </section>
  );
};