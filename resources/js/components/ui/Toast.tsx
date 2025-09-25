import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  };
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={cn(
        'relative flex w-full items-start gap-3 rounded-lg border-2 p-4 shadow-xl transition-all duration-500',
        getBackgroundColor()
      )}
      style={{
        position: 'relative',
        zIndex: 9999,
        backgroundColor: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
        borderColor: toast.type === 'success' ? '#bbf7d0' : '#fecaca',
        borderWidth: '2px',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        marginBottom: '8px'
      }}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900">
          {toast.title}
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {toast.message}
        </div>
      </div>
      
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
