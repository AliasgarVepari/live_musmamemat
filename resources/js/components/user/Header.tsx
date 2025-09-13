import { Search, Menu, User, Globe } from "lucide-react";
import { Button } from "@/components/user/ui/button";
import { Input } from "@/components/user/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Link, router } from "@inertiajs/react";

export const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.visit(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-brand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu */}
          <div className="lg:hidden w-10">
            <Button variant="ghost" size="sm">
              <Menu className="h-4 w-4 stroke-[1.5]" />
            </Button>
          </div>
          
          {/* Logo - centered on mobile */}
          {/* <div className="flex-shrink-0 cursor-pointer lg:ml-0 absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-auto lg:transform-none" onClick={() => navigate('/')}>
            <img 
              src="/lovable-uploads/47c0267d-3b10-4bb3-80cc-37bc500c087b.png" 
              alt="Live M9memat" 
              className="h-12 w-auto"
            />
          </div> */}
          
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute h-4 w-4 text-muted-foreground stroke-[1.5] top-1/2 transform -translate-y-1/2 ltr:left-3 rtl:right-3" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className={`bg-card border-0 focus:ring-2 focus:ring-brand-red-600 ${
                  language === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'
                }`}
              />
            </form>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Switcher */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLanguage}
              className="text-ink-900 hover:text-brand-red-600 transition-colors group"
            >
              <Globe className="h-4 w-4 stroke-[1.5] group-hover:text-brand-red-600" />
              <span className="ml-1 rtl:ml-0 rtl:mr-1 text-xs font-medium">
                {language === 'ar' ? 'EN' : 'ع'}
              </span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-ink-900 hover:text-brand-red-600">
            <Link href="/profile" preserveScroll>
              <User className="h-4 w-4 stroke-[1.5]" />
              </Link>
            </Button>
            
          </div>
        </div>
        
        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute h-4 w-4 text-muted-foreground stroke-[1.5] top-1/2 transform -translate-y-1/2 ltr:left-3 rtl:right-3" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className={`bg-card border-0 ${
                language === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'
              }`}
            />
          </form>
        </div>
      </div>
    </header>
  );
};