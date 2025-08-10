'use client';

import { createContext, useContext, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-error-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-primary-600" />;
    }
  };

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-error-50 border-error-200 text-error-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-primary-50 border-primary-200 text-primary-800';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`
              animate-slideInRight animate-delay-${index * 100}
              max-w-sm w-full bg-white rounded-lg shadow-lg border p-4
              ${getToastStyles(toast.type)}
              transform transition-all duration-300 hover:scale-105
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getToastIcon(toast.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm opacity-90 mt-1">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Global toast function
let toastContext: ToastContextType | undefined;

export const showToast = (toast: Omit<Toast, 'id'>) => {
  if (toastContext) {
    toastContext.addToast(toast);
  }
};

// Initialize global toast
if (typeof window !== 'undefined') {
  (window as typeof window & { showToast: typeof showToast }).showToast = showToast;
}
