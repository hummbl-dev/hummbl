/**
 * 404 Not Found Page
 * 
 * @module pages/NotFound
 * @version 1.0.0
 * 
 * HUMMBL Systems
 */

import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
          <Link
            to="/mental-models"
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>Browse Mental Models</span>
          </Link>
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-primary-600 hover:text-primary-700 flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
