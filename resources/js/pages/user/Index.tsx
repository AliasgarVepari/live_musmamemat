import { BottomBanners } from '@/components/user/BottomBanners';
import { CategoryGrid } from '@/components/user/CategoryGrid';
import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { LogoHero } from '@/components/user/LogoHero';
import { TopBanners } from '@/components/user/TopBanners';
import UserLayout from '@/layouts/user/user-layout';
import { useAuth } from '@/contexts/AuthContext';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

interface IndexProps {
    // Keep props for initial data, but we'll use cached data instead
    topBanners?: any[];
    bottomBanners?: any[];
    homeCategories?: any[];
    socialLinks?: any[];
    featuredAds?: any[];
    auth?: {
        user: any;
        isAuthenticated: boolean;
    };
}

export default function Index({ topBanners, bottomBanners, homeCategories, socialLinks, featuredAds, auth }: IndexProps) {
    const { setServerAuth } = useAuth();

    // Set server-side auth state when component mounts
    useEffect(() => {
        if (auth) {
            setServerAuth(auth.user, auth.isAuthenticated);
        }
    }, [auth, setServerAuth]);

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
