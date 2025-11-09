/**
 * Metrics Collection
 * 
 * Collects and aggregates backend metrics
 * Stores in KV for real-time dashboards
 * 
 * @module workers/lib/metrics
 * @version 1.0.0
 */

import type { KVNamespace } from '@cloudflare/workers-types';
import { createLogger } from './logger';

const logger = createLogger('Metrics');

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface MetricAggregation {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50?: number;
  p95?: number;
  p99?: number;
}

/**
 * Metric names
 */
export const METRICS = {
  // Request metrics
  REQUEST_DURATION: 'request.duration',
  REQUEST_COUNT: 'request.count',
  REQUEST_ERROR: 'request.error',
  
  // Workflow metrics
  WORKFLOW_EXECUTION_TIME: 'workflow.execution_time',
  WORKFLOW_SUCCESS: 'workflow.success',
  WORKFLOW_FAILURE: 'workflow.failure',
  
  // AI metrics
  AI_CALL_DURATION: 'ai.call_duration',
  AI_TOKEN_COUNT: 'ai.token_count',
  AI_ERROR: 'ai.error',
  
  // Database metrics
  DB_QUERY_DURATION: 'db.query_duration',
  DB_ERROR: 'db.error',
  
  // Cache metrics
  CACHE_HIT: 'cache.hit',
  CACHE_MISS: 'cache.miss',
} as const;

/**
 * Metrics collector
 */
export class MetricsCollector {
  private cache: KVNamespace;
  private buffer: Metric[] = [];
  private maxBufferSize = 100;

  constructor(cache: KVNamespace) {
    this.cache = cache;
  }

  /**
   * Record a metric
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.buffer.push(metric);

    // Flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush().catch((error) => {
        logger.error('Failed to flush metrics', error);
      });
    }
  }

  /**
   * Increment a counter
   */
  increment(name: string, tags?: Record<string, string>): void {
    this.record(name, 1, tags);
  }

  /**
   * Record timing metric
   */
  timing(name: string, duration: number, tags?: Record<string, string>): void {
    this.record(name, duration, tags);
  }

  /**
   * Flush buffered metrics to KV
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const metrics = [...this.buffer];
    this.buffer = [];

    try {
      // Aggregate metrics by name and tags
      const aggregations = this.aggregateMetrics(metrics);

      // Store aggregations in KV
      const now = Date.now();
      const promises = Object.entries(aggregations).map(([key, agg]) => {
        const kvKey = `metrics:${key}:${Math.floor(now / 60000)}`; // 1-minute buckets
        return this.cache.put(kvKey, JSON.stringify(agg), {
          expirationTtl: 86400, // Keep for 24 hours
        });
      });

      await Promise.all(promises);
      logger.debug(`Flushed ${metrics.length} metrics`);
    } catch (error) {
      logger.error('Failed to flush metrics', error);
      // Re-buffer metrics
      this.buffer.unshift(...metrics.slice(0, this.maxBufferSize - this.buffer.length));
    }
  }

  /**
   * Aggregate metrics by name and tags
   */
  private aggregateMetrics(metrics: Metric[]): Record<string, MetricAggregation> {
    const groups: Record<string, number[]> = {};

    // Group metrics by name+tags
    metrics.forEach((metric) => {
      const key = this.getMetricKey(metric);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(metric.value);
    });

    // Calculate aggregations
    const aggregations: Record<string, MetricAggregation> = {};
    Object.entries(groups).forEach(([key, values]) => {
      aggregations[key] = this.calculateAggregation(values);
    });

    return aggregations;
  }

  /**
   * Get unique key for metric
   */
  private getMetricKey(metric: Metric): string {
    if (!metric.tags) return metric.name;
    const tagStr = Object.entries(metric.tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return `${metric.name}:${tagStr}`;
  }

  /**
   * Calculate statistical aggregation
   */
  private calculateAggregation(values: number[]): MetricAggregation {
    if (values.length === 0) {
      return { count: 0, sum: 0, min: 0, max: 0, avg: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const count = values.length;

    return {
      count,
      sum,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sum / count,
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    };
  }

  /**
   * Get metrics for time range
   */
  async getMetrics(
    name: string,
    startTime: number,
    endTime: number
  ): Promise<MetricAggregation[]> {
    const startBucket = Math.floor(startTime / 60000);
    const endBucket = Math.floor(endTime / 60000);

    const promises: Promise<MetricAggregation | null>[] = [];
    for (let bucket = startBucket; bucket <= endBucket; bucket++) {
      const key = `metrics:${name}:${bucket}`;
      promises.push(
        this.cache.get(key, 'json').then((data) => data as MetricAggregation | null)
      );
    }

    const results = await Promise.all(promises);
    return results.filter((r): r is MetricAggregation => r !== null);
  }
}

/**
 * Timing decorator for async functions
 */
export function timed(metricName: string, tags?: Record<string, string>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        
        if (this.metrics && this.metrics instanceof MetricsCollector) {
          this.metrics.timing(metricName, duration, tags);
        }
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        
        if (this.metrics && this.metrics instanceof MetricsCollector) {
          this.metrics.timing(metricName, duration, { ...tags, error: 'true' });
        }
        
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Middleware to track request metrics
 */
export function metricsMiddleware(metrics: MetricsCollector) {
  return async (c: any, next: () => Promise<void>) => {
    const start = Date.now();
    const path = new URL(c.req.url).pathname;

    try {
      await next();
      
      const duration = Date.now() - start;
      const status = c.res.status;

      metrics.timing(METRICS.REQUEST_DURATION, duration, {
        path,
        status: status.toString(),
        method: c.req.method,
      });

      metrics.increment(METRICS.REQUEST_COUNT, {
        path,
        status: status.toString(),
        method: c.req.method,
      });

      if (status >= 400) {
        metrics.increment(METRICS.REQUEST_ERROR, {
          path,
          status: status.toString(),
        });
      }
    } catch (error) {
      const duration = Date.now() - start;
      
      metrics.timing(METRICS.REQUEST_DURATION, duration, {
        path,
        status: '500',
        method: c.req.method,
        error: 'true',
      });

      metrics.increment(METRICS.REQUEST_ERROR, {
        path,
        status: '500',
      });

      throw error;
    }
  };
}
