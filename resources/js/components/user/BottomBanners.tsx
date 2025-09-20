// import { useLanguage } from '@/contexts/LanguageContext';
// import { useBottomBannersQuery } from '@/hooks/user/queries/use-banners-query';

// export const BottomBanners = () => {
//     const { language } = useLanguage();
//     const { data: banners, isLoading, error } = useBottomBannersQuery();

//     if (isLoading) {
//         return (
//             <div className="flex h-32 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100">
//                 <div className="text-gray-500">Loading banners...</div>
//             </div>
//         );
//     }

//     if (error || !banners || banners.length === 0) {
//         return null;
//     }

//     return (
//         <section className="mt-12">
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {banners.map((banner) => {
//                     const bannerImage = language === 'ar' ? banner.image_url_ar : banner.image_url_en;

//                     return (
//                         <div key={banner.id} className="group relative overflow-hidden rounded-lg bg-gray-100 transition-all hover:shadow-lg">
//                             {bannerImage && (
//                                 <img src={bannerImage} alt="Banner" className="h-32 w-full object-cover transition-transform group-hover:scale-105" />
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>
//         </section>
//     );
// };

import { Carousel, CarouselContent, CarouselItem } from '@/components/user/ui/carousel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBottomBannersQuery } from '@/hooks/user/queries/use-banners-query';
import Autoplay from 'embla-carousel-autoplay';

export const BottomBanners = () => {
    const { language } = useLanguage();
    const { data: banners, isLoading, error } = useBottomBannersQuery();

    if (isLoading) {
        return (
            <div className="flex h-32 w-full animate-pulse items-center justify-center rounded-lg bg-gray-100">
                <div className="text-gray-500">Loading banners...</div>
            </div>
        );
    }

    if (error || !banners || banners.length === 0) {
        return null;
    }
    return (
        <section className="bg-background py-4">
            {/* Full-bleed wrapper */}
            <div className="w-full px-0">
                <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 3500 })]} className="w-full">
                    <CarouselContent className="-ml-0 pr-4">
                        {banners.map((banner, index) => {
                            const bannerImage = language === 'ar' ? banner.image_url_ar : banner.image_url_en;

                            return (
                                <CarouselItem
                                    key={index}
                                    className="/* ~300px on mobile; scales up responsively */ /* ↑ ~10–20% more on md to feel roomier */ /* ↑ ~20% more on lg */ /* ↑ ~25% more on xl */ /* optional 2xl tuning */ shrink-0 basis-[clamp(300px,70vw,340px)] pr-4 sm:basis-[clamp(320px,55vw,420px)] md:basis-[clamp(360px,48vw,520px)] lg:basis-[clamp(432px,36vw,648px)] xl:basis-[clamp(456px,30vw,750px)] 2xl:basis-[clamp(480px,26vw,820px)]"
                                >
                                    <div className="border-border relative h-32 w-full overflow-hidden rounded-lg border-2 shadow-md sm:h-36 md:h-44 lg:h-48">
                                        <img
                                            src={bannerImage}
                                            alt={banner.id.toString()}
                                            className="h-full w-full object-cover transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/10" />
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
