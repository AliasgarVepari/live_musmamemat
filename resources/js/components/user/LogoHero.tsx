import logo from '@/assets/user/logo.png';
import { useSocialLinksQuery } from '@/hooks/user/queries/use-social-links-query';
import { Facebook, Instagram, Linkedin, MessageCircle, Phone, Twitter, Youtube } from 'lucide-react';
import { HeroCardBg } from './HeroCardBg';

// Icon mapping for social platforms
const getSocialIcon = (platform: string) => {
    const iconMap: { [key: string]: any } = {
        facebook: Facebook,
        instagram: Instagram,
        twitter: Twitter,
        youtube: Youtube,
        linkedin: Linkedin,
        whatsapp: MessageCircle,
        telegram: Phone,
    };
    return iconMap[platform.toLowerCase()] || Facebook;
};

export const LogoHero = () => {
    const { data: socialLinks, isLoading, error } = useSocialLinksQuery();

    const handleSocialClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <HeroCardBg>
            <section className="relative overflow-hidden py-20">
                {/* Ad Banners as Background */}
                <div className="absolute inset-0">{/* <TopAdBanners /> */}</div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mx-auto max-w-md">
                            <img src={logo} alt="Live M9memat" className="mx-auto mb-4 h-32 w-auto object-contain md:h-40 lg:h-48" />
                            <div className="mt-6 flex items-center justify-center space-x-3">
                                {isLoading ? (
                                    <div className="flex space-x-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="h-11 w-11 animate-pulse rounded-lg bg-white/20" />
                                        ))}
                                    </div>
                                ) : error || !socialLinks || socialLinks.length === 0 ? (
                                    // Fallback to default social links if no data
                                    <>
                                        <div className="group cursor-pointer rounded-lg border border-white/30 bg-white/20 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-lg hover:shadow-red-600/30">
                                            <Facebook className="h-5 w-5 stroke-[1.5] text-red-600 transition-colors duration-300 group-hover:text-white" />
                                        </div>
                                        <div className="group cursor-pointer rounded-lg border border-white/30 bg-white/20 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-lg hover:shadow-red-600/30">
                                            <Instagram className="h-5 w-5 stroke-[1.5] text-red-600 transition-colors duration-300 group-hover:text-white" />
                                        </div>
                                        <div className="group cursor-pointer rounded-lg border border-white/30 bg-white/20 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-lg hover:shadow-red-600/30">
                                            <Twitter className="h-5 w-5 stroke-[1.5] text-red-600 transition-colors duration-300 group-hover:text-white" />
                                        </div>
                                        <div className="group cursor-pointer rounded-lg border border-white/30 bg-white/20 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-lg hover:shadow-red-600/30">
                                            <Youtube className="h-5 w-5 stroke-[1.5] text-red-600 transition-colors duration-300 group-hover:text-white" />
                                        </div>
                                    </>
                                ) : (
                                    socialLinks.map((socialLink, index) => {
                                        const IconComponent = getSocialIcon(socialLink.platform);
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => handleSocialClick(socialLink.url)}
                                                className="group cursor-pointer rounded-lg border border-white/30 bg-white/20 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-lg hover:shadow-red-600/30"
                                                title={`Visit our ${socialLink.platform}`}
                                            >
                                                <IconComponent className="h-5 w-5 stroke-[1.5] text-red-600 transition-colors duration-300 group-hover:text-white" />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </HeroCardBg>
    );
};
