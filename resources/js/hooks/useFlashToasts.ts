import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/contexts/ToastContext';

export const useFlashToasts = () => {
  const { addToast } = useToast();
  const { props } = usePage();

  useEffect(() => {
    const flash = (props as any).flash;
    
    // Debug logging
    console.log('useFlashToasts - props:', props);
    console.log('useFlashToasts - flash:', flash);

    if (flash?.success) {
      console.log('Adding success toast:', flash.success);
      addToast({
        type: 'success',
        title: 'Success',
        message: flash.success,
        duration: 5000,
      });
    }

    if (flash?.error) {
      console.log('Adding error toast:', flash.error);
      addToast({
        type: 'error',
        title: 'Error',
        message: flash.error,
        duration: 7000,
      });
    }

    if (flash?.warning) {
      console.log('Adding warning toast:', flash.warning);
      addToast({
        type: 'warning',
        title: 'Warning',
        message: flash.warning,
        duration: 6000,
      });
    }

    if (flash?.info) {
      console.log('Adding info toast:', flash.info);
      addToast({
        type: 'info',
        title: 'Info',
        message: flash.info,
        duration: 5000,
      });
    }
  }, [props, addToast]);
};
