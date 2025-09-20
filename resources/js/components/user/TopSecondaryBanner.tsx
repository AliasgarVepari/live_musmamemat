import topBanner3 from '@/assets/user/ad-banner-1.png';
import topBanner1 from '@/assets/user/secondary-banner-1.png';
import topBanner2 from '@/assets/user/secondary-banner-2.png';
import { Carousel, CarouselContent, CarouselItem } from '@/components/user/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export const TopSecondaryBanner = () => {
    const banners = [
        { src: topBanner1, alt: 'Luxury Fashion Collection' },
        { src: topBanner2, alt: 'Luxury Fashion Collection' },
        { src: topBanner3, alt: 'Luxury Fashion Collection' },
    ];

    return (
        <section className="w-full">
            {/* Height = 10% of viewport; keep a small min-height for usability */}
            <div className="relative h-[30vh] min-h-[120px] w-full">
                <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 2500 })]} className="absolute inset-0 overflow-hidden">
                    {/* No gutters; slides are 100% width */}
                    <CarouselContent className="absolute inset-0 -ml-0 ml-0 h-full gap-0 [--slide-spacing:0px] [&>*]:pl-0">
                        {banners.map((banner, i) => (
                            <CarouselItem key={i} className="h-full min-w-0 flex-[0_0_100%] basis-full">
                                <div className="relative h-full w-full">
                                    <img src={banner.src} alt={banner.alt} className="object-fit block h-full w-full" />
                                    {/* optional tint: <div className="absolute inset-0 bg-black/10" /> */}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
};
