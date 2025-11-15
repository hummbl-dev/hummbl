import { Info, X } from 'lucide-react';
import { useState } from 'react';

export default function PreviewBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center">
            <Info className="h-3 w-3 md:h-4 md:w-4 text-black dark:text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm text-black dark:text-white truncate md:whitespace-normal">
              <span className="font-bold">Preview Mode</span>
              <span className="text-gray-900 dark:text-gray-700 ml-1 md:ml-2 hidden sm:inline">
                · Interface demonstration
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 p-1 md:p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-700 hover:text-black dark:hover:text-white"
          aria-label="Dismiss preview banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
