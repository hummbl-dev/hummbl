import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, description?: string, duration?: number) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, description?: string, duration: number = 5000) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { id, type, message, description, duration };
      
      setToasts((prev) => [...prev, newToast]);
      
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, description?: string) => {
    showToast('success', message, description);
  }, [showToast]);

  const error = useCallback((message: string, description?: string) => {
    showToast('error', message, description, 7000);
  }, [showToast]);

  const info = useCallback((message: string, description?: string) => {
    showToast('info', message, description);
  }, [showToast]);

  const warning = useCallback((message: string, description?: string) => {
    showToast('warning', message, description);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  // Monochrome toast styles with varying intensity for differentiation
  const styles = {
    success: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100',
    error: 'bg-gray-200 dark:bg-gray-700 border-gray-500 dark:border-gray-500 text-gray-900 dark:text-gray-100 shadow-lg',
    info: 'bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200',
    warning: 'bg-gray-150 dark:bg-gray-750 border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-100 border-2',
  };

  // Grayscale icon emphasis with varying darkness
  const iconStyles = {
    success: 'text-gray-700 dark:text-gray-300',
    error: 'text-gray-900 dark:text-gray-100',
    info: 'text-gray-600 dark:text-gray-400',
    warning: 'text-gray-800 dark:text-gray-200',
  };

  // Accessible text labels for semantic meaning
  const labels = {
    success: '[OK]',
    error: '[!]',
    info: '[i]',
    warning: '[⚠]',
  };

  const Icon = icons[toast.type];
  const label = labels[toast.type];

  // ARIA attributes for screen reader accessibility
  const ariaLabel = {
    success: 'Success notification',
    error: 'Error notification',
    info: 'Information notification',
    warning: 'Warning notification',
  }[toast.type];

  const ariaLive: 'assertive' | 'polite' = toast.type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      className={`${styles[toast.type]} border rounded-lg shadow-lg p-4 flex items-start space-x-3 animate-slide-in-right`}
      role="alert"
      aria-live={ariaLive}
      aria-label={ariaLabel}
    >
      <Icon className={`h-5 w-5 ${iconStyles[toast.type]} flex-shrink-0 mt-0.5`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">
          <span className="font-mono mr-1" aria-hidden="true">{label}</span>
          {toast.message}
        </p>
        {toast.description && (
          <p className="text-xs mt-1 opacity-90">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
