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
          className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-start space-x-3 animate-slide-in"
        >
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-800 mt-1 break-words">{error}</p>
          </div>
          <button
            onClick={clearErrors}
            className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
