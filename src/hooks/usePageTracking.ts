/**
 * Page Tracking Hook
 * 
 * @module hooks/usePageTracking
 * @version 1.0.0
 * @description Track page views and user interactions with analytics
 * 
 * HUMMBL Systems
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';

export const usePageTracking = (): void => {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    track('pageview', {
      path: location.pathname,
      search: location.search,
    });
  }, [location]);
};

// Helper function for tracking custom events
export const trackEvent = (eventName: string, properties?: Record<string, string | number | boolean>): void => {
  track(eventName, properties as Record<string, string | number | boolean>);
};
