import { BottomAdBanners } from '@/components/user/BottomAdBanners';
import { CategoryGrid } from '@/components/user/CategoryGrid';
import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { LogoHero } from '@/components/user/LogoHero';
import { TopSecondaryBanner } from '@/components/user/TopSecondaryBanner';
import UserLayout from '@/layouts/user/user-layout';
export default function Index() {
    return (
        <UserLayout>
            <div>
                <Header />
                <main>
                    <LogoHero />
                    <TopSecondaryBanner />
                    <CategoryGrid />
                    <BottomAdBanners />
                </main>
                <Footer />
                {/* <BottomNavigation /> */}
            </div>
        </UserLayout>
    );
}
