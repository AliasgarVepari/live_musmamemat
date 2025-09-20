import { useQuery } from '@tanstack/react-query';

// Social Link interface
export interface SocialLink {
    platform: string;
    url: string;
}

// Social Links Query Hook
export const useSocialLinksQuery = () => {
    return useQuery({
        queryKey: ['user', 'social-links'],
        queryFn: async (): Promise<SocialLink[]> => {
            const response = await fetch('/api/user/social-links');

            if (!response.ok) {
                throw new Error('Failed to fetch social links');
            }

            const data = await response.json();
            return data || [];
        },
        staleTime: 30 * 60 * 1000, // 30 minutes - social links don't change often
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        retry: 1,
    });
};
