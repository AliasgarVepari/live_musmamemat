import { ReactNode, useEffect } from 'react';
import '../../../css/admin/app.css';
import { Toaster } from '@/components/admin/ui/toaster';
import { setupGlobalErrorHandler } from '@/middleware/error-handler';
import { useForcedTheme } from '@/hooks/user/use-forced-theme';

interface BaseLayoutProps {
    children: ReactNode;
}

export default ({ children, ...props }: BaseLayoutProps) => {
    // Force light theme for admin dashboard
    useForcedTheme();
    
    useEffect(() => {
        // Initialize global error handler for admin dashboard
        setupGlobalErrorHandler();
    }, []);

    return (
        <>
            {children}
            <Toaster />
        </>
    );
};
