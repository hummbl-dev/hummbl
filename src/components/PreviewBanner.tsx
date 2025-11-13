import { Info } from 'lucide-react';

export default function PreviewBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <Info className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">
          <span className="font-bold">Preview Mode:</span> This is a demonstration of HUMMBL's interface and design. 
          Workflow execution and data persistence are coming in the production release.
        </p>
      </div>
    </div>
  );
}
