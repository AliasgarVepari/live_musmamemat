import React from 'react';
import { useToast } from '@/contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] flex flex-col gap-2 w-full px-4 pt-4 sm:top-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:max-w-md"
    >
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
          index={index}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
