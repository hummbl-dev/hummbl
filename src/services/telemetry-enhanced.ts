/**
 * HUMMBL Telemetry SDK (Enhanced)
 * 
 * BaseN Component tracking and metrics collection
 * 
 * @module services/telemetry-enhanced
 * @version 2.0.0
 * 
 * Mental Models:
 * - T4 (Observation): Measure everything
 * - P1 (Perspective): Privacy-first analytics
 * 
 * HUMMBL Systems
 */

// API URL - switches between local dev and production
const API_URL = import.meta.env.DEV
  ? 'http://localhost:8787'
  : 'https://hummbl-backend.hummbl.workers.dev';

export interface BaseNEvent {
  component: string;
  action: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export interface BaseNMetric {
  component: string;
  name: string;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * HUMMBL Telemetry Service
 * Tracks user actions and component metrics for BaseN components
 */
export class HUMMBLTelemetry {
  private static sessionId: string | null = null;
  private static userId: string | null = null;
  private static queue: Array<BaseNEvent | BaseNMetric> = [];
  private static flushInterval: number | null = null;

  /**
   * Initialize telemetry
   */
  static init(): void {
    // Get or create session ID
    this.sessionId = this.getSessionId();
    
    // Get user ID if logged in
    this.userId = localStorage.getItem('user_id');

    // Start flush interval (every 5 seconds)
    if (typeof window !== 'undefined' && !this.flushInterval) {
      this.flushInterval = window.setInterval(() => {
        this.flush();
      }, 5000);
    }

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  /**
   * Track user action
   */
  static track(event: BaseNEvent): void {
    const fullEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: this.sessionId!,
      userId: this.userId,
    };

    // Add to queue
    this.queue.push(fullEvent);

    // Flush if queue is large
    if (this.queue.length >= 10) {
      this.flush();
    }

    // Also send to Vercel Analytics if available
    if (typeof window !== 'undefined' && 'va' in window) {
      (window as { va?: (type: string, name: string, data?: unknown) => void }).va?.('event', event.action, event.properties);
    }
  }

  /**
   * Track page view
   */
  static pageView(component: string, properties?: Record<string, unknown>): void {
    // Track the page view action
    this.track({
      component,
      action: 'page_view',
      properties: {
        ...properties,
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      },
    });

    // Also track page load time
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        this.metric({
          component,
          name: 'page_load_time',
          value: loadTime,
          metadata: {
            path: window.location.pathname,
          },
        });
      });
    }
  }

  /**
   * Track component metric
   */
  static metric(metric: BaseNMetric): void {
    const fullMetric = {
      ...metric,
      timestamp: Date.now(),
      sessionId: this.sessionId!,
      userId: this.userId,
    };

    // Add to queue
    this.queue.push(fullMetric);

    // Flush if queue is large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Flush queued events to backend
   */
  private static async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      // Send all events in parallel
      await Promise.all(
        batch.map(item => {
          if ('action' in item) {
            // It's an event
            return fetch(`${API_URL}/api/telemetry/track`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            });
          } else {
            // It's a metric
            return fetch(`${API_URL}/api/telemetry/metric`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            });
          }
        })
      );
    } catch (error) {
      console.warn('Telemetry flush failed:', error);
      // Don't throw - telemetry should never break the app
    }
  }

  /**
   * Register a BaseN component
   */
  static async registerComponent(component: {
    id: string;
    name: string;
    domain: string;
    route: string;
    transformations: string[];
    version?: string;
  }): Promise<void> {
    try {
      await fetch(`${API_URL}/api/telemetry/register-component`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(component),
      });
    } catch (error) {
      console.warn('Component registration failed:', error);
    }
  }

  /**
   * Get component metrics
   */
  static async getMetrics(
    componentId: string,
    options?: {
      since?: number;
      limit?: number;
    }
  ): Promise<{
    component: string;
    metrics: Array<{
      metric_name: string;
      value: number;
      metadata: string;
      timestamp: number;
    }>;
    count: number;
  }> {
    const params = new URLSearchParams();
    if (options?.since) params.append('since', options.since.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await fetch(
      `${API_URL}/api/telemetry/metrics/${componentId}?${params}`
    );
    return response.json();
  }

  /**
   * Get analytics summary
   */
  static async getSummary(since?: number): Promise<{
    period: { since: number; until: number };
    summary: Record<string, number>;
    topComponents: Array<Record<string, unknown>>;
    performance: { avgLoadTime: number };
  }> {
    const params = new URLSearchParams();
    if (since) params.append('since', since.toString());

    const response = await fetch(
      `${API_URL}/api/telemetry/summary?${params}`
    );
    return response.json();
  }

  /**
   * Get or create session ID
   */
  private static getSessionId(): string {
    if (typeof window === 'undefined') return 'ssr-session';

    let sessionId = sessionStorage.getItem('hummbl_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('hummbl_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Set user ID (call after login)
   */
  static setUserId(userId: string): void {
    this.userId = userId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_id', userId);
    }
  }

  /**
   * Clear user ID (call after logout)
   */
  static clearUserId(): void {
    this.userId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id');
    }
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  HUMMBLTelemetry.init();
}

// Export singleton
export const telemetry = HUMMBLTelemetry;
