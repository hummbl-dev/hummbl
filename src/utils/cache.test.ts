import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Cache } from './cache';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache({ ttl: 1000, maxSize: 1024 * 1024, maxEntries: 10 });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('key generation', () => {
    it('should generate keys from multiple parts', () => {
      const key = Cache.key('user', 123, 'profile');
      expect(key).toBe('user:123:profile');
    });

    it('should filter out null and undefined', () => {
      const key = Cache.key('user', null, 123, undefined, 'data');
      expect(key).toBe('user:123:data');
    });
  });

  describe('get and set', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should update stats on hit', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(0);
    });

    it('should update stats on miss', () => {
      cache.get('nonexistent');
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(1);
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      cache.set('key1', 'value1', 500);
      expect(cache.get('key1')).toBe('value1');
      
      vi.advanceTimersByTime(600);
      expect(cache.get('key1')).toBeNull();
    });

    it('should use default TTL if not specified', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      
      vi.advanceTimersByTime(900);
      expect(cache.get('key1')).toBe('value1');
      
      vi.advanceTimersByTime(200);
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('delete and clear', () => {
    it('should delete specific key', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.delete('key1');
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      
      const stats = cache.getStats();
      expect(stats.entries).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe('getOrSet', () => {
    it('should fetch and cache on miss', async () => {
      const fetcher = vi.fn().mockResolvedValue('fetched-value');
      
      const result = await cache.getOrSet('key1', fetcher);
      expect(result).toBe('fetched-value');
      expect(fetcher).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const result2 = await cache.getOrSet('key1', fetcher);
      expect(result2).toBe('fetched-value');
      expect(fetcher).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should refetch after expiration', async () => {
      const fetcher = vi.fn()
        .mockResolvedValueOnce('value1')
        .mockResolvedValueOnce('value2');
      
      await cache.getOrSet('key1', fetcher, 500);
      expect(fetcher).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(600);
      
      await cache.getOrSet('key1', fetcher, 500);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });

  describe('eviction', () => {
    it('should evict oldest entry when max entries reached', () => {
      const smallCache = new Cache<string>({ maxEntries: 3 });
      
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      smallCache.set('key4', 'value4'); // Should evict key1
      
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');
      expect(smallCache.get('key4')).toBe('value4');
    });
  });

  describe('statistics', () => {
    it('should track hit rate', () => {
      cache.set('key1', 'value1');
      
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key2'); // miss
      
      expect(cache.getHitRate()).toBeCloseTo(66.67, 1);
    });

    it('should return 0 hit rate for empty cache', () => {
      expect(cache.getHitRate()).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries on cleanup', () => {
      cache.set('key1', 'value1', 500);
      cache.set('key2', 'value2', 2000);
      
      vi.advanceTimersByTime(600);
      cache.cleanup();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });
  });
});
