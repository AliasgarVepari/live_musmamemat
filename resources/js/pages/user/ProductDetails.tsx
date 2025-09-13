import { BottomNavigation } from '@/components/user/BottomNavigation';
import { Footer } from '@/components/user/Footer';
import { Header } from '@/components/user/Header';
import { useParams } from 'react-router-dom';

export const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-luxury-black mb-8 text-3xl font-bold">Product Details</h1>
                    <p className="text-muted-foreground">Product details page for ID: {id} - coming soon</p>
                </div>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
};
