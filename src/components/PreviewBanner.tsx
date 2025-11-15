import { Info, X } from 'lucide-react';
import { useState } from 'react';

export default function PreviewBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <Info className="h-4 w-4 text-primary-700" />
          </div>
          <div>
            <p className="text-sm text-primary-900">
              <span className="font-bold">Preview Mode</span>
              <span className="text-primary-700 ml-2">
                · Interface demonstration · Full execution coming in production release
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-primary-100 transition-colors text-primary-600 hover:text-primary-800"
          aria-label="Dismiss preview banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
