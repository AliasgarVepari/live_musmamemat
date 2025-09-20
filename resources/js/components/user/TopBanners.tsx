import { useLanguage } from '@/contexts/LanguageContext';
import { useTopBannersQuery } from '@/hooks/user/queries/use-banners-query';
import { useEffect, useState } from 'react';

export const TopBanners = () => {
    const { language } = useLanguage();
    const { data: banners, isLoading, error } = useTopBannersQuery();
    const [currentBanner, setCurrentBanner] = useState(0);

    // Auto-rotate banners every 5 seconds
    useEffect(() => {
        if (!banners || banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners]);

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

    const currentBannerData = banners[currentBanner];
    const bannerImage = language === 'ar' ? currentBannerData.image_url_ar : currentBannerData.image_url_en;

    const goToPrevious = () => {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const goToNext = () => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
    };

    return (
        <section className="relative">
            <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                {bannerImage && <img src={bannerImage} alt="Banner" className="h-full w-full object-cover" />}
            </div>
        </section>
    );
};
