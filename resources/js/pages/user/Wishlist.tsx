import { BottomNavigation } from '@/components/user/BottomNavigation';
import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';

const Wishlist = () => {
    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-luxury-black mb-8 text-3xl font-bold">My Wishlist</h1>
                    <p className="text-muted-foreground">Wishlist page - coming soon</p>
                </div>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
};

export default Wishlist;
