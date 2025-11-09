/**
 * Cache Utility
 * 
 * Intelligent caching for AI responses and workflow results
 * Uses in-memory cache with TTL and size limits
 * 
 * @module utils/cache
 * @version 1.0.0
 */

import { createLogger } from './logger';

const logger = createLogger('Cache');

interface CacheEntry<T> {
  value: T;
  expiry: number;
  size: number; // Approximate size in bytes
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number; // Max cache size in bytes (default: 10MB)
  maxEntries?: number; // Max number of entries (default: 1000)
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  entries: number;
}

export class Cache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private stats: CacheStats;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      entries: 0,
    };
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes
      maxSize: options.maxSize || 10 * 1024 * 1024, // 10MB
      maxEntries: options.maxEntries || 1000,
    };
  }

  /**
   * Generate cache key from components
   */
  static key(...parts: (string | number | boolean | null | undefined)[]): string {
    return parts
      .filter((p) => p !== null && p !== undefined)
      .map((p) => String(p))
      .join(':');
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      logger.debug(`Cache miss: ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.size -= entry.size;
      this.stats.entries--;
      this.stats.misses++;
      logger.debug(`Cache expired: ${key}`);
      return null;
    }

    this.stats.hits++;
    logger.debug(`Cache hit: ${key}`);
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const size = this.estimateSize(value);
    const expiry = Date.now() + (ttl || this.options.ttl);

    // Remove old entry if exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.stats.size -= oldEntry.size;
      this.stats.entries--;
    }

    // Check if we need to evict
    while (
      this.stats.size + size > this.options.maxSize ||
      this.stats.entries >= this.options.maxEntries
    ) {
      this.evictOldest();
    }

    // Add new entry
    this.cache.set(key, { value, expiry, size });
    this.stats.size += size;
    this.stats.entries++;

    logger.debug(`Cache set: ${key} (${size} bytes, TTL: ${ttl || this.options.ttl}ms)`);
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.stats.size -= entry.size;
      this.stats.entries--;
      logger.debug(`Cache deleted: ${key}`);
      return true;
    }
    return false;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.entries = 0;
    logger.info('Cache cleared');
  }

  /**
   * Get or set pattern (fetch if not cached)
   */
  async getOrSet(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    logger.debug(`Cache fetch: ${key}`);
    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get hit rate percentage
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Evict oldest entry (LRU-style)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestExpiry = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < oldestExpiry) {
        oldestExpiry = entry.expiry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      if (entry) {
        this.stats.size -= entry.size;
        this.stats.entries--;
        this.stats.evictions++;
      }
      logger.debug(`Cache evicted: ${oldestKey}`);
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: T): number {
    try {
      const json = JSON.stringify(value);
      return new Blob([json]).size;
    } catch {
      // Rough estimate if can't stringify
      return 1024;
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        this.stats.size -= entry.size;
        this.stats.entries--;
        removed++;
      }
    }

    if (removed > 0) {
      logger.info(`Cache cleanup: removed ${removed} expired entries`);
    }
  }
}

// Export singleton instances for common use cases
export const aiResponseCache = new Cache({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 20 * 1024 * 1024, // 20MB
  maxEntries: 500,
});

export const workflowCache = new Cache({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 10 * 1024 * 1024, // 10MB
  maxEntries: 200,
});

export const apiCache = new Cache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 5 * 1024 * 1024, // 5MB
  maxEntries: 100,
});

// Periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    aiResponseCache.cleanup();
    workflowCache.cleanup();
    apiCache.cleanup();
  }, 60 * 1000); // Every minute
}
