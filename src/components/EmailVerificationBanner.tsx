import { useState } from 'react';
import { AlertCircle, X, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function EmailVerificationBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  // Don't show if user is verified or banner was dismissed
  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setResending(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        'https://hummbl-backend.hummbl.workers.dev/api/auth/resend-verification',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to send email. Please try again later.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-gray-50 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <AlertCircle className="h-5 w-5 text-gray-900 dark:text-gray-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black dark:text-white">
                Please verify your email address
              </p>
              <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">
                Check your inbox for the verification link.
              </p>
              {message && (
                <p className="text-xs text-gray-900 dark:text-gray-100 mt-1 font-medium">
                  {message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="h-4 w-4" />
              <span>{resending ? 'Sending...' : 'Resend Email'}</span>
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:text-gray-100 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
