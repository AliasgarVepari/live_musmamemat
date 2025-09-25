import { ReactNode, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/contexts/ToastContext';
import '../../../css/user/app.css';

interface UserLayoutProps {
    children: ReactNode;
}

export default ({ children, ...props }: UserLayoutProps) => {
    const { addToast } = useToast();
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            addToast({
                type: 'success',
                title: 'Success',
                message: flash.success,
                duration: 5000,
            });
        }

        if (flash?.error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: flash.error,
                duration: 7000,
            });
        }

        if (flash?.warning) {
            addToast({
                type: 'warning',
                title: 'Warning',
                message: flash.warning,
                duration: 6000,
            });
        }

        if (flash?.info) {
            addToast({
                type: 'info',
                title: 'Info',
                message: flash.info,
                duration: 5000,
            });
        }

        if (flash?.message) {
            addToast({
                type: 'info',
                title: 'Message',
                message: flash.message,
                duration: 5000,
            });
        }
    }, [flash, addToast]);

    return <>{children}</>;
};
