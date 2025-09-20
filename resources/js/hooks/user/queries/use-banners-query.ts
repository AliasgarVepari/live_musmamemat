import { useQuery } from '@tanstack/react-query';

// Banner interface
export interface Banner {
    id: number;
    image_url_en: string;
    image_url_ar: string;
    position: 'top' | 'bottom';
    status: 'active' | 'inactive';
    created_at: string;
}

// Banners Query Hook
export const useBannersQuery = (position?: 'top' | 'bottom') => {
    return useQuery({
        queryKey: ['user', 'banners', position],
        queryFn: async (): Promise<Banner[]> => {
            const params = new URLSearchParams();
            if (position) {
                params.append('position', position);
            }

            const response = await fetch(`/api/user/banners?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch banners');
            }

            const data = await response.json();
            return data.banners || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

// Top Banners Query Hook
export const useTopBannersQuery = () => {
    return useBannersQuery('top');
};

// Bottom Banners Query Hook
export const useBottomBannersQuery = () => {
    return useBannersQuery('bottom');
};
