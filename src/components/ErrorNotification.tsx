import { useWorkflowStore } from '../store/workflowStore';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorNotification() {
  const errors = useWorkflowStore((state) => state.errors);
  const clearErrors = useWorkflowStore((state) => state.clearErrors);

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {errors.map((error, index) => (
        <div
          key={index}
          className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 flex items-start space-x-3 animate-slide-in"
        >
          <AlertCircle className="h-5 w-5 text-gray-900 dark:text-gray-100 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black dark:text-white">Error</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 break-words">{error}</p>
          </div>
          <button
            onClick={clearErrors}
            className="flex-shrink-0 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:text-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
