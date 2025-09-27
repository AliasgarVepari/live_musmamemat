import { Button } from '@/components/user/ui/button';
import { Input } from '@/components/user/ui/input';
import { AuthModal } from '@/components/user/auth/AuthModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, router } from '@inertiajs/react';
import { Globe, Menu, Search, User } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // Check if we're in admin area
    const isAdmin = window.location.pathname.startsWith('/admin');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.visit(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleProfileClick = () => {
        if (isAuthenticated) {
            router.visit('/profile');
        } else {
            setShowAuthModal(true);
        }
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        // Navigate to profile after successful authentication
        router.visit('/profile');
    };

    return (
        <>
            <header className="border-border shadow-brand sticky top-0 z-50 border-b bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Mobile menu */}
                        <div className="w-10 lg:hidden">
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
                        <div className="mx-8 hidden flex-1 md:flex">
                            <form onSubmit={handleSearch} className="relative w-full">
                                <Search className="text-muted-foreground absolute top-1/2 h-4 w-4 -translate-y-1/2 transform stroke-[1.5] ltr:left-3 rtl:right-3" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('search.placeholder')}
                                    className={`bg-card focus:ring-brand-red-600 border-0 focus:ring-2 ${
                                        language === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'
                                    }`}
                                />
                            </form>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            {/* Language Switcher - Only show in user area */}
                            {!isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleLanguage}
                                    className="text-ink-900 hover:text-brand-red-600 group transition-colors"
                                >
                                    <Globe className="group-hover:text-brand-red-600 h-4 w-4 stroke-[1.5]" />
                                    <span className="ml-1 text-xs font-medium rtl:ml-0 rtl:mr-1">{language === 'ar' ? 'EN' : 'ع'}</span>
                                </Button>
                            )}

                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-ink-900 hover:text-brand-red-600"
                                onClick={handleProfileClick}
                            >
                                <User className="h-4 w-4 stroke-[1.5]" />
                            </Button>
                        </div>
                    </div>

                    {/* Mobile search */}
                    <div className="pb-3 md:hidden">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 h-4 w-4 -translate-y-1/2 transform stroke-[1.5] ltr:left-3 rtl:right-3" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('search.placeholder')}
                                className={`bg-card border-0 ${language === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'}`}
                            />
                        </form>
                    </div>
                </div>
            </header>

            <AuthModal 
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
            />
        </>
    );
};
