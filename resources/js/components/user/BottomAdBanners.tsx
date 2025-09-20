import adBanner1 from '@/assets/user/ad-banner-1.png';
import adBanner2 from '@/assets/user/ad-banner-2.png';
import { Carousel, CarouselContent, CarouselItem } from '@/components/user/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export const BottomAdBanners = () => {
    const banners = [
        {
            src: adBanner1,
            alt: 'Luxury Fashion Collection',
        },
        {
            src: adBanner2,
            alt: 'Premium Watches',
        },
        {
            src: adBanner1,
            alt: 'Special Offers',
        },
        {
            src: adBanner2,
            alt: 'New Arrivals',
        },
        {
            src: adBanner1,
            alt: 'Luxury Fashion Collection',
        },
        {
            src: adBanner2,
            alt: 'Premium Watches',
        },
        {
            src: adBanner1,
            alt: 'Special Offers',
        },
        {
            src: adBanner2,
            alt: 'New Arrivals',
        },
    ];

    return (
        <section className="bg-background py-4">
            {/* Full-bleed wrapper */}
            <div className="w-full px-0">
                <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 3500 })]} className="w-full">
                    <CarouselContent className="-ml-0 pr-4">
                        {banners.map((banner, index) => (
                            <CarouselItem
                                key={index}
                                className="/* ~300px on mobile; scales up responsively */ /* ↑ ~10–20% more on md to feel roomier */ /* ↑ ~20% more on lg */ /* ↑ ~25% more on xl */ /* optional 2xl tuning */ shrink-0 basis-[clamp(300px,70vw,340px)] pr-4 sm:basis-[clamp(320px,55vw,420px)] md:basis-[clamp(360px,48vw,520px)] lg:basis-[clamp(432px,36vw,648px)] xl:basis-[clamp(456px,30vw,750px)] 2xl:basis-[clamp(480px,26vw,820px)]"
                            >
                                <div className="border-border relative h-32 w-full overflow-hidden rounded-lg border-2 shadow-md sm:h-36 md:h-44 lg:h-48">
                                    <img src={banner.src} alt={banner.alt} className="h-full w-full object-cover transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/10" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
};
