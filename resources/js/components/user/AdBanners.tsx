import adBanner1 from "@/assets/user/ad-banner-1.png";
import adBanner2 from "@/assets/user/ad-banner-2.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/user/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const AdBanners = () => {
  const banners = [
    {
      src: adBanner1,
      alt: "Luxury Fashion Collection",
    },
    {
      src: adBanner2,
      alt: "Premium Watches",
    },
    {
      src: adBanner1,
      alt: "Special Offers",
    },
    {
      src: adBanner2,
      alt: "New Arrivals",
    },
  ];

  return (
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 3500 })]}
        >
          <CarouselContent>
            {banners.map((banner, index) => (
              <CarouselItem key={index}>
                <img src={banner.src} alt={banner.alt} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
  );
};
