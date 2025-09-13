import { Button } from '@/components/user/ui/button';
import { Separator } from '@/components/user/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Instagram, MessageCircle, Phone } from 'lucide-react';

export const Footer = () => {
    const { language, t } = useLanguage();

    return (
        <footer className="bg-ink-900 text-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className={`grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
                    {/* Brand & Description */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className={'font-cursive text-3xl font-bold text-white'}>{t('brand.name')}</h3>
                            <p className={`text-sm leading-relaxed text-gray-300 ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}>
                                {t('footer.description')}
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-4 rtl:space-x-reverse">
                            <Button variant="icon" size="icon" className="hover:text-brand-red-600 text-white">
                                <Instagram className="h-4 w-4 stroke-[1.5]" />
                            </Button>
                            <Button variant="icon" size="icon" className="hover:text-brand-red-600 text-white">
                                <MessageCircle className="h-4 w-4 stroke-[1.5]" />
                            </Button>
                            <Button variant="icon" size="icon" className="hover:text-brand-red-600 text-white">
                                <Phone className="h-4 w-4 stroke-[1.5]" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4
                            className={`border-brand-red-600 inline-block border-b-2 pb-1 text-lg font-medium text-white ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}
                        >
                            {t('footer.quicklinks')}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="#"
                                    className={`hover:text-brand-red-600 text-white opacity-85 transition-colors ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}
                                >
                                    {t('footer.menu')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`hover:text-brand-red-600 text-white opacity-85 transition-colors ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}
                                >
                                    {t('footer.status')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`hover:text-brand-red-600 text-white opacity-85 transition-colors ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}
                                >
                                    {t('footer.about')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`hover:text-brand-red-600 text-white opacity-85 transition-colors ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}
                                >
                                    {t('footer.branches')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4
                            className={`border-brand-red-600 inline-block border-b-2 pb-1 text-lg font-medium text-white ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}
                        >
                            {t('footer.contact')}
                        </h4>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p className={language === 'ar' ? 'font-arabic' : 'font-sans'}>{t('footer.location')}</p>
                            <p className="font-mono">+965 XXXX XXXX</p>
                            <p className="font-sans">info@onothah.com</p>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-4">
                        <h4
                            className={`border-brand-red-600 inline-block border-b-2 pb-1 text-lg font-medium text-white ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}
                        >
                            {language === 'ar' ? 'طرق الدفع' : 'Payment Methods'}
                        </h4>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <div className="flex h-6 w-10 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white transition-opacity hover:opacity-80">
                                VISA
                            </div>
                            <div className="flex h-6 w-10 items-center justify-center rounded bg-red-600 text-xs font-bold text-white transition-opacity hover:opacity-80">
                                MC
                            </div>
                            <div className="flex h-6 w-10 items-center justify-center rounded bg-blue-800 text-xs font-bold text-white transition-opacity hover:opacity-80">
                                AMEX
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-border my-8 opacity-40" />

                {/* Bottom Footer */}
                <div className={`flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
                    <p className={`text-sm text-gray-400 ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}>{t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
};
