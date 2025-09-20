import { router } from '@inertiajs/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MutationOptions {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

// User mutations
export const useToggleUserStatus = (options?: MutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => {
            return new Promise<void>((resolve, reject) => {
                router.patch(
                    `/admin/users/${userId}/toggle`,
                    {},
                    {
                        onSuccess: () => {
                            resolve();
                        },
                        onError: (errors) => {
                            const errorMessage = Object.values(errors).flat().join(', ');
                            reject(new Error(errorMessage));
                        },
                    },
                );
            });
        },
        onSuccess: () => {
            // Invalidate users queries to refetch data
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            options?.onSuccess?.();
        },
        onError: (error: Error) => {
            options?.onError?.(error.message);
        },
    });
};

export const useRevokeUserSubscription = (options?: MutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => {
            return new Promise<void>((resolve, reject) => {
                router.post(
                    `/admin/users/${userId}/revoke-subscription`,
                    {},
                    {
                        onSuccess: () => {
                            resolve();
                        },
                        onError: (errors) => {
                            const errorMessage = Object.values(errors).flat().join(', ');
                            reject(new Error(errorMessage));
                        },
                    },
                );
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            options?.onSuccess?.();
        },
        onError: (error: Error) => {
            options?.onError?.(error.message);
        },
    });
};

export const useReactivateUser = (options?: MutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => {
            return new Promise<void>((resolve, reject) => {
                router.post(
                    `/admin/users/${userId}/reactivate`,
                    {},
                    {
                        onSuccess: () => {
                            resolve();
                        },
                        onError: (errors) => {
                            const errorMessage = Object.values(errors).flat().join(', ');
                            reject(new Error(errorMessage));
                        },
                    },
                );
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            options?.onSuccess?.();
        },
        onError: (error: Error) => {
            options?.onError?.(error.message);
        },
    });
};

// Ad mutations
export const useToggleAdStatus = (options?: MutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (adId: number) => {
            return new Promise<void>((resolve, reject) => {
                router.patch(
                    `/admin/ads/${adId}/toggle-status`,
                    {},
                    {
                        onSuccess: () => {
                            resolve();
                        },
                        onError: (errors) => {
                            const errorMessage = Object.values(errors).flat().join(', ');
                            reject(new Error(errorMessage));
                        },
                    },
                );
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
            options?.onSuccess?.();
        },
        onError: (error: Error) => {
            options?.onError?.(error.message);
        },
    });
};

export const useApproveAd = (options?: MutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (adId: number) => {
            return new Promise<void>((resolve, reject) => {
                router.patch(
                    `/admin/ads/${adId}/approve`,
                    {},
                    {
                        onSuccess: () => {
                            resolve();
                        },
                        onError: (errors) => {
                            const errorMessage = Object.values(errors).flat().join(', ');
                            reject(new Error(errorMessage));
                        },
                    },
                );
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
            options?.onSuccess?.();
        },
        onError: (error: Error) => {
            options?.onError?.(error.message);
        },
    });
};

export const useRejectAd = (options?: MutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ adId, reason }: { adId: number; reason: string }) => {
            return new Promise<void>((resolve, reject) => {
                router.post(
                    `/admin/ads/${adId}/reject`,
                    { reason },
                    {
                        onSuccess: () => {
                            resolve();
                        },
                        onError: (errors) => {
                            const errorMessage = Object.values(errors).flat().join(', ');
                            reject(new Error(errorMessage));
                        },
                    },
                );
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
            options?.onSuccess?.();
        },
        onError: (error: Error) => {
            options?.onError?.(error.message);
        },
    });
};
