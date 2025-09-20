import { BottomBanners } from '@/components/user/BottomBanners';
import { CategoryGrid } from '@/components/user/CategoryGrid';
import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { LogoHero } from '@/components/user/LogoHero';
import { TopBanners } from '@/components/user/TopBanners';
import UserLayout from '@/layouts/user/user-layout';
import { Head } from '@inertiajs/react';

interface IndexProps {
    // Keep props for initial data, but we'll use cached data instead
    topBanners?: any[];
    bottomBanners?: any[];
    homeCategories?: any[];
    socialLinks?: any[];
    featuredAds?: any[];
}

export default function Index({ topBanners, bottomBanners, homeCategories, socialLinks, featuredAds }: IndexProps) {
    return (
        <UserLayout>
            <Head title="Home" />
            <div>
                <Header />
                <main className="main-content">
                    <LogoHero />
                    <TopBanners />
                    <CategoryGrid />
                    <BottomBanners />
                </main>
                <Footer />
                {/* <BottomNavigation /> */}
            </div>
        </UserLayout>
    );
}
