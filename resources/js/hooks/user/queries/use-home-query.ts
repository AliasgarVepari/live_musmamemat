import { useQuery } from '@tanstack/react-query';

// Types
interface Banner {
    id: number;
    image_url_en: string;
    image_url_ar: string;
    position: 'top' | 'bottom';
    status: 'active' | 'inactive';
    created_at: string;
}

interface Category {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    icon_url?: string;
    sort_order?: number;
}

interface SocialLink {
    platform: string;
    url: string;
}

interface FeaturedAd {
    id: number;
    title_en: string;
    title_ar: string;
    price: number | string;
    is_featured: boolean;
    is_negotiable: boolean;
    views_count: number;
    created_at: string;
    category: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    governorate?: {
        id: number;
        name_en: string;
        name_ar: string;
    } | null;
    primaryImage?: {
        id: number;
        url: string;
        is_primary: boolean;
    } | null;
}

interface HomePageData {
    topBanners: Banner[];
    bottomBanners: Banner[];
    homeCategories: Category[];
    socialLinks: SocialLink[];
    featuredAds: FeaturedAd[];
}

// Fetch function for home page data
const fetchHomePageData = async (): Promise<HomePageData> => {
    const response = await fetch('/api/user/home');

    if (!response.ok) {
        throw new Error('Failed to fetch home page data');
    }

    return response.json();
};

// Hook for fetching home page data
export const useHomePageQuery = () => {
    return useQuery({
        queryKey: ['user', 'home'],
        queryFn: fetchHomePageData,
        staleTime: 5 * 60 * 1000, // 5 minutes - home page data changes occasionally
        gcTime: 15 * 60 * 1000, // 15 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    });
};

// Fetch function for banners only
const fetchBanners = async (position?: 'top' | 'bottom'): Promise<Banner[]> => {
    const params = position ? `?position=${position}` : '';
    const response = await fetch(`/api/user/banners${params}`);

    if (!response.ok) {
        throw new Error('Failed to fetch banners');
    }

    return response.json();
};

// Hook for fetching banners
export const useBannersQuery = (position?: 'top' | 'bottom') => {
    return useQuery({
        queryKey: ['user', 'banners', position],
        queryFn: () => fetchBanners(position),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
    });
};

// Fetch function for featured ads
const fetchFeaturedAds = async (limit: number = 8): Promise<FeaturedAd[]> => {
    const response = await fetch(`/api/user/featured-ads?limit=${limit}`);

    if (!response.ok) {
        throw new Error('Failed to fetch featured ads');
    }

    return response.json();
};

// Hook for fetching featured ads
export const useFeaturedAdsQuery = (limit: number = 8) => {
    return useQuery({
        queryKey: ['user', 'featuredAds', limit],
        queryFn: () => fetchFeaturedAds(limit),
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

// Fetch function for social links
const fetchSocialLinks = async (): Promise<SocialLink[]> => {
    const response = await fetch('/api/user/social-links');

    if (!response.ok) {
        throw new Error('Failed to fetch social links');
    }

    return response.json();
};

// Hook for fetching social links
export const useSocialLinksQuery = () => {
    return useQuery({
        queryKey: ['user', 'socialLinks'],
        queryFn: fetchSocialLinks,
        staleTime: 60 * 60 * 1000, // 1 hour - social links rarely change
        gcTime: 2 * 60 * 60 * 1000, // 2 hours
        refetchOnWindowFocus: false,
    });
};
