import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { createLogger } from '../utils/logger';
import { trackError } from '../services/telemetry';

const logger = createLogger('ErrorBoundary');

/**
 * Error Boundary Component
 * 
 * @module components/ErrorBoundary
 * @version 1.0.0
 * @description Catches React errors and displays fallback UI
 * 
 * HUMMBL Systems
 */

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with production error tracking hook
    logger.error('App error caught by boundary', error, {
      componentStack: errorInfo.componentStack,
    });

    // Track error in telemetry
    trackError({
      message: error.message,
      stack: error.stack || undefined,
      componentStack: errorInfo.componentStack || undefined,
      severity: 'critical',
      context: {
        boundary: 'app',
      },
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-black dark:text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Something Went Wrong
                </h1>
              </div>

              <p className="text-gray-900 mb-4">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>

              {this.state.error && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
                    Error Details
                  </summary>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm font-mono">
                    <p className="text-black dark:text-white font-semibold mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-gray-900 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
                <a
                  href="/"
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Go Home</span>
                </a>
              </div>

              <p className="text-xs text-gray-800 mt-6">
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
