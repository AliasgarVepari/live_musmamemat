import logo from '@/assets/user/logo.png';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { HeroCardBg } from './HeroCardBg';

export const LogoHero = () => {
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
                                <div className="group cursor-pointer rounded-lg bg-white/20 backdrop-blur-sm p-3 transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-lg hover:shadow-red-600/30 border border-white/30">
                                    <Facebook className="h-5 w-5 stroke-[1.5] text-red-600 transition-colors duration-300 group-hover:text-white" />
                                </div>
                                <div className="group cursor-pointer rounded-lg bg-white/20 backdrop-blur-sm p-3 transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-lg hover:shadow-red-600/30 border border-white/30">
                                    <Instagram className="h-5 w-5 stroke-[1.5] text-red-600 transition-colors duration-300 group-hover:text-white" />
                                </div>
                                <div className="group cursor-pointer rounded-lg bg-white/20 backdrop-blur-sm p-3 transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-lg hover:shadow-red-600/30 border border-white/30">
                                    <Twitter className="h-5 w-5 stroke-[1.5] text-red-600 transition-colors duration-300 group-hover:text-white" />
                                </div>
                                <div className="group cursor-pointer rounded-lg bg-white/20 backdrop-blur-sm p-3 transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-lg hover:shadow-red-600/30 border border-white/30">
                                    <Youtube className="h-5 w-5 stroke-[1.5] text-red-600 transition-colors duration-300 group-hover:text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </HeroCardBg>
    );
};
