import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseFavoritesReturn {
    favorites: Set<number>;
    isFavorited: (productId: number) => boolean;
    toggleFavorite: (productId: number) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useFavorites = (): UseFavoritesReturn => {
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load user's favorites on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadFavorites();
        } else {
            setFavorites(new Set());
        }
    }, [isAuthenticated]);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/favorites', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const favoriteIds = new Set(data.data.data?.map((item: any) => item.ad?.id).filter(Boolean) || []);
                setFavorites(favoriteIds);
            }
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const isFavorited = (productId: number): boolean => {
        return favorites.has(productId);
    };

    const toggleFavorite = async (productId: number): Promise<void> => {
        if (!isAuthenticated) {
            throw new Error('Authentication required');
        }

        try {
            setLoading(true);
            setError(null);

            const isCurrentlyFavorited = isFavorited(productId);
            const method = isCurrentlyFavorited ? 'DELETE' : 'POST';
            
            const response = await fetch(`/api/user/products/${productId}/favorite`, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    if (isCurrentlyFavorited) {
                        newFavorites.delete(productId);
                    } else {
                        newFavorites.add(productId);
                    }
                    return newFavorites;
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update favorite');
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            setError(err instanceof Error ? err.message : 'Failed to update favorite');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        favorites,
        isFavorited,
        toggleFavorite,
        loading,
        error,
    };
};
