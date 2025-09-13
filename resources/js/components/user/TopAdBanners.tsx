import topBanner1 from "@/assets/user/top-banner-1.jpg";
import topBanner2 from "@/assets/user/top-banner-2.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/user/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const TopAdBanners = () => {
  const banners = [
    {
      src: topBanner1,
      alt: "Luxury Fashion Collection",
    },
    {
      src: topBanner2,
      alt: "Luxury Fashion Collection",
    },
  ];

  return (
    // <section className="h-[130%] w-full">
    //   <div className="h-full w-full">
    //     <Carousel
    //       opts={{
    //         align: "start",
    //         loop: true,
    //       }}
    //       plugins={[
    //         Autoplay({
    //           delay: 4000,
    //         }),
    //       ]}
    //       className="w-full h-full"
    //     >
    //       <CarouselContent className="h-full">
    //         {banners.map((banner, index) => (
    //           <CarouselItem key={index} className="basis-full h-full">
    //             <div className="relative overflow-hidden h-full w-full">
    //               <img
    //                 src={banner.src}
    //                 alt={banner.alt}
    //                 className="w-full h-full object-cover transition-transform duration-300"
    //               />
    //               <div className="absolute inset-0 bg-black/20" />
    //             </div>
    //           </CarouselItem>
    //         ))}
    //       </CarouselContent>
    //     </Carousel>
    //   </div>
    // </section>
    <section className="w-screen mx-[calc(50%-50vw)]">
      <div className="relative min-h-[calc(100vh-64px)] w-full">
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 4000 })]}
          className="absolute inset-0"
        >
          {/* <CarouselContent className="absolute inset-0" >
            {banners.map((banner, i) => (
              <CarouselItem key={i} >
                <div className="relative h-full w-full">
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent> */}
          <CarouselContent className="absolute inset-0 h-full ml-0 -ml-0 gap-0 [&>*]:pl-0 [--slide-spacing:0px]">
            {banners.map((banner, i) => (
              <CarouselItem
                key={i}
                className="h-full basis-full flex-[0_0_100%] min-w-0"
              >
                <div className="relative h-full w-full">
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    className="block h-full w-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};
