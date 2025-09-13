import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { Toaster as Sonner, Toaster } from '@/components/user/ui/sonner';
import { TooltipProvider } from '@/components/user/ui/tooltip';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

type Props = { children: React.ReactNode };

export function Providers({ children }: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <AuthProvider>
                <TooltipProvider>
                    {children}
                    {/* Mount your toasters once at the root */}
                    <Toaster />
                    <Sonner />
                </TooltipProvider>
                </AuthProvider>
            </LanguageProvider>
        </QueryClientProvider>
    );
}
