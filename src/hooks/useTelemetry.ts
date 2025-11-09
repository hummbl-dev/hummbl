/**
 * Telemetry Hook
 * 
 * React hook for tracking events and metrics
 * 
 * @module hooks/useTelemetry
 * @version 1.0.0
 */

import { useEffect, useCallback } from 'react';
import { track } from '@vercel/analytics';

export function useTelemetry() {
  return {
    track: useCallback(
      (event: string, properties?: Record<string, string | number | boolean>) => {
        track(event, properties);
      },
      []
    ),

    trackAction: useCallback((action: string, details?: Record<string, string | number | boolean>) => {
      track(action, details);
    }, []),

    trackPageView: useCallback((pageName: string, path: string) => {
      track('page_view', { page: pageName, path });
    }, []),
  };
}

/**
 * Hook to track page view on mount
 */
export function usePageView(pageName: string) {
  const { trackPageView } = useTelemetry();

  useEffect(() => {
    trackPageView(pageName, window.location.pathname);
  }, [pageName, trackPageView]);
}
