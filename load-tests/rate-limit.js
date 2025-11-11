/**
 * Rate Limiting Test
 * Verifies rate limiting behavior under rapid requests
 */

import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

// Custom metrics
const rateLimitHits = new Counter('rate_limit_hits');
const successfulRequests = new Counter('successful_requests');

export const options = {
  vus: 1,  // Single user making rapid requests
  duration: '30s',
  thresholds: {
    rate_limit_hits: ['count>0'],  // Should hit rate limits
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://hummbl-backend.hummbl.workers.dev';

export default function () {
  // Rapid-fire requests to auth endpoint (5 req/min limit)
  for (let i = 0; i < 10; i++) {
    const response = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: 'test@example.com',
        password: 'invalid',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    check(response, {
      'receives response': (r) => r.status !== 0,
      'status is 401 or 429': (r) => r.status === 401 || r.status === 429,
    });
    
    if (response.status === 429) {
      rateLimitHits.add(1);
      
      // Check for rate limit headers
      check(response, {
        'has Retry-After header': (r) => r.headers['Retry-After'] !== undefined,
      });
      
      console.log(`Rate limit hit at request ${i + 1}`);
    } else if (response.status === 401) {
      successfulRequests.add(1);
    }
  }
}

export function handleSummary(data) {
  const rateLimits = data.metrics.rate_limit_hits;
  const successful = data.metrics.successful_requests;
  
  let summary = '\n→ Rate Limiting Test Summary\n';
  summary += '→ ==================================================\n\n';
  
  summary += `→ Rate Limit Hits: ${rateLimits.values.count}\n`;
  summary += `→ Successful Requests: ${successful.values.count}\n\n`;
  
  const result = rateLimits.values.count > 0 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  summary += `→ Rate Limiting Working: ${result}\n`;
  summary += '→ (Expected: Should hit rate limits with rapid requests)\n\n';
  
  return {
    'stdout': summary,
  };
}
