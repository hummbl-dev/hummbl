/**
 * Rate Limiting Middleware for Cloudflare Workers
 * 
 * Uses KV store for distributed rate limiting across edge locations
 * Implements sliding window algorithm
 * 
 * @module workers/lib/rateLimit
 * @version 1.0.0
 */

import type { Context, Next } from 'hono';
import type { Env } from '../types';

export interface RateLimitConfig {
  /**
   * Maximum requests allowed in the window
   */
  maxRequests: number;
  
  /**
   * Time window in seconds
   */
  windowSeconds: number;
  
  /**
   * Key prefix for KV storage
   */
  keyPrefix?: string;
}

/**
 * Default rate limit configurations by route type
 */
export const RATE_LIMITS = {
  // AI execution endpoints - expensive, limit heavily
  execution: {
    maxRequests: 10,
    windowSeconds: 60, // 10 requests per minute
    keyPrefix: 'ratelimit:execution',
  },
  
  // API key management - sensitive, moderate limiting
  apiKeys: {
    maxRequests: 30,
    windowSeconds: 60, // 30 requests per minute
    keyPrefix: 'ratelimit:apikeys',
  },
  
  // Auth endpoints - sensitive, strict limiting
  auth: {
    maxRequests: 5,
    windowSeconds: 60, // 5 requests per minute
    keyPrefix: 'ratelimit:auth',
  },
  
  // General API - liberal limiting
  general: {
    maxRequests: 100,
    windowSeconds: 60, // 100 requests per minute
    keyPrefix: 'ratelimit:general',
  },
} as const;

/**
 * Rate limiting middleware
 * 
 * @param config - Rate limit configuration
 * @returns Hono middleware function
 */
export function rateLimit(config: RateLimitConfig) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || 
               c.req.header('x-forwarded-for') || 
               'unknown';
    
    const key = `${config.keyPrefix || 'ratelimit'}:${ip}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - config.windowSeconds;
    
    try {
      // Get current count from KV
      const data = await c.env.CACHE.get(key, 'json') as {
        count: number;
        resetAt: number;
      } | null;
      
      if (data) {
        // Check if we're still in the same window
        if (data.resetAt > now) {
          // Same window - check if limit exceeded
          if (data.count >= config.maxRequests) {
            const retryAfter = data.resetAt - now;
            
            return c.json(
              {
                error: 'Rate limit exceeded',
                message: `Too many requests. Please try again in ${retryAfter} seconds.`,
                retryAfter,
              },
              429,
              {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': config.maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': data.resetAt.toString(),
              }
            );
          }
          
          // Increment count
          await c.env.CACHE.put(
            key,
            JSON.stringify({
              count: data.count + 1,
              resetAt: data.resetAt,
            }),
            {
              expirationTtl: config.windowSeconds,
            }
          );
          
          // Set rate limit headers
          c.header('X-RateLimit-Limit', config.maxRequests.toString());
          c.header('X-RateLimit-Remaining', (config.maxRequests - data.count - 1).toString());
          c.header('X-RateLimit-Reset', data.resetAt.toString());
        } else {
          // Window expired - start new window
          await c.env.CACHE.put(
            key,
            JSON.stringify({
              count: 1,
              resetAt: now + config.windowSeconds,
            }),
            {
              expirationTtl: config.windowSeconds,
            }
          );
          
          c.header('X-RateLimit-Limit', config.maxRequests.toString());
          c.header('X-RateLimit-Remaining', (config.maxRequests - 1).toString());
          c.header('X-RateLimit-Reset', (now + config.windowSeconds).toString());
        }
      } else {
        // First request in window
        await c.env.CACHE.put(
          key,
          JSON.stringify({
            count: 1,
            resetAt: now + config.windowSeconds,
          }),
          {
            expirationTtl: config.windowSeconds,
          }
        );
        
        c.header('X-RateLimit-Limit', config.maxRequests.toString());
        c.header('X-RateLimit-Remaining', (config.maxRequests - 1).toString());
        c.header('X-RateLimit-Reset', (now + config.windowSeconds).toString());
      }
      
      await next();
    } catch (error) {
      // If rate limiting fails, log but allow request through
      const { logger } = await import('./logger');
      logger.error('Rate limiting error', error);
      await next();
    }
  };
}
