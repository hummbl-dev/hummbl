import { Info, X } from 'lucide-react';
import { useState } from 'react';

export default function PreviewBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-b border-primary-100 dark:border-primary-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
            <Info className="h-3 w-3 md:h-4 md:w-4 text-primary-700 dark:text-primary-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm text-primary-900 dark:text-primary-100 truncate md:whitespace-normal">
              <span className="font-bold">Preview Mode</span>
              <span className="text-primary-700 dark:text-primary-300 ml-1 md:ml-2 hidden sm:inline">
                · Interface demonstration
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 p-1 md:p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
          aria-label="Dismiss preview banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
