/**
 * Backend Cache Utility using Cloudflare KV
 * 
 * Distributed caching for AI responses and workflow results
 * 
 * @module workers/lib/cache
 * @version 1.0.0
 */

import { createLogger } from './logger';

const logger = createLogger('KVCache');

interface CacheOptions {
  ttl?: number; // Time to live in seconds (KV uses seconds, not ms)
  namespace?: string; // Cache namespace prefix
}

interface CacheMetadata {
  cachedAt: number;
  size: number;
}

/**
 * KV-based cache for Cloudflare Workers
 */
export class KVCache {
  private kv: KVNamespace;
  private namespace: string;

  constructor(kv: KVNamespace, namespace: string = 'cache') {
    this.kv = kv;
    this.namespace = namespace;
  }

  /**
   * Generate namespaced cache key
   */
  key(...parts: (string | number | boolean | null | undefined)[]): string {
    const keyParts = [this.namespace, ...parts]
      .filter((p) => p !== null && p !== undefined)
      .map((p) => String(p));
    return keyParts.join(':');
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.key(key);
      const value = await this.kv.get<T>(fullKey, 'json');
      
      if (value) {
        logger.debug(`KV cache hit: ${fullKey}`);
      } else {
        logger.debug(`KV cache miss: ${fullKey}`);
      }
      
      return value;
    } catch (error) {
      logger.error('KV cache get error', error, { key });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.key(key);
      const ttl = options?.ttl || 300; // Default 5 minutes
      
      const metadata: CacheMetadata = {
        cachedAt: Date.now(),
        size: JSON.stringify(value).length,
      };
      
      await this.kv.put(fullKey, JSON.stringify(value), {
        expirationTtl: ttl,
        metadata,
      });
      
      logger.debug(`KV cache set: ${fullKey} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error('KV cache set error', error, { key });
    }
  }

  /**
   * Delete specific key
   */
  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.key(key);
      await this.kv.delete(fullKey);
      logger.debug(`KV cache deleted: ${fullKey}`);
    } catch (error) {
      logger.error('KV cache delete error', error, { key });
    }
  }

  /**
   * Get or set pattern (fetch if not cached)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    logger.debug(`KV cache fetch: ${key}`);
    const value = await fetcher();
    await this.set(key, value, options);
    return value;
  }

  /**
   * List keys with prefix (for debugging/management)
   */
  async listKeys(prefix?: string): Promise<string[]> {
    try {
      const fullPrefix = prefix ? this.key(prefix) : this.namespace;
      const list = await this.kv.list({ prefix: fullPrefix, limit: 100 });
      return list.keys.map((k) => k.name);
    } catch (error) {
      logger.error('KV cache list error', error);
      return [];
    }
  }

  /**
   * Clear all keys with namespace prefix
   */
  async clear(): Promise<void> {
    try {
      const keys = await this.listKeys();
      await Promise.all(keys.map((key) => this.kv.delete(key)));
      logger.info(`KV cache cleared: ${keys.length} keys`);
    } catch (error) {
      logger.error('KV cache clear error', error);
    }
  }
}

/**
 * Cache key generators for common patterns
 */
export const CacheKeys = {
  aiResponse: (model: string, prompt: string) => {
    // Hash prompt to keep key short
    const hash = simpleHash(prompt);
    return `ai:${model}:${hash}`;
  },
  
  workflow: (workflowId: string) => `workflow:${workflowId}`,
  
  workflowExecution: (executionId: string) => `execution:${executionId}`,
  
  user: (userId: string) => `user:${userId}`,
  
  apiKey: (keyId: string) => `apikey:${keyId}`,
};

/**
 * Simple string hash function
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Cache TTLs (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
};
