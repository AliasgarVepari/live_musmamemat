import { Carousel, CarouselContent, CarouselItem } from '@/components/user/ui/carousel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTopBannersQuery } from '@/hooks/user/queries/use-banners-query';
import Autoplay from 'embla-carousel-autoplay';

export const TopBanners = () => {
    const { language } = useLanguage();
    const { data: banners, isLoading, error } = useTopBannersQuery();

    if (isLoading) {
        return (
            <div className="flex h-64 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100">
                <div className="text-gray-500">Loading banners...</div>
            </div>
        );
    }

    if (error || !banners || banners.length === 0) {
        return null;
    }

    return (
        <section className="relative">
            {/* Full-bleed wrapper */}
            <div className="w-full px-0">
                <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 5000 })]} className="w-full">
                    <CarouselContent className="-ml-0 pr-0">
                        {banners.map((banner, index) => {
                            const bannerImage = language === 'ar' ? banner.image_url_ar : banner.image_url_en;

                            return (
                                <CarouselItem
                                    key={index}
                                    className="shrink-0 basis-full pl-0"
                                >
                                    <div className="relative w-full overflow-hidden bg-white sm:h-56 md:h-64 lg:h-72">
                                        <img
                                            src={bannerImage}
                                            alt={`Banner ${index + 1}`}
                                            className="w-full h-auto sm:h-full sm:object-cover"
                                        />
                                        <div className="absolute inset-0 hidden bg-black/5 sm:block" />
                                    </div>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
};
