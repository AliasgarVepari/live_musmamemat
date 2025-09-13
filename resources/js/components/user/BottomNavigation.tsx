import { Home, Search, ShoppingBag, CreditCard, User } from "lucide-react";
import { Button } from "@/components/user/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const BottomNavigation = () => {
  const { language, t } = useLanguage();

  const navItems = [
    { icon: Home, labelKey: "nav.home", active: true },
    { icon: Search, labelKey: "nav.shop", active: false },
    { icon: CreditCard, labelKey: "nav.payments", active: false },
    { icon: ShoppingBag, labelKey: "nav.cashback", active: false },
    { icon: User, labelKey: "nav.account", active: false }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-luxury-white border-t border-border z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center space-y-1 p-2 transition-colors duration-200 ${
              item.active 
                ? 'text-luxury-gold' 
                : 'text-muted-foreground hover:text-luxury-black'
            }`}
          >
            <item.icon className="h-4 w-4 stroke-[1.5]" />
            <span className={`text-xs ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t(item.labelKey)}
            </span>
          </Button>
        ))}
      </div>
    </nav>
  );
};