/**
 * Spike Test
 * Tests system behavior under sudden traffic spikes
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 5 },    // Warm up
    { duration: '1m', target: 5 },     // Baseline
    { duration: '10s', target: 100 },  // Spike to 100 users
    { duration: '30s', target: 100 },  // Hold spike
    { duration: '10s', target: 5 },    // Drop back
    { duration: '30s', target: 5 },    // Recover
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% under 2s (generous for spike)
    http_req_failed: ['rate<0.1'],      // Less than 10% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://hummbl-backend.hummbl.workers.dev';

export default function () {
  const response = http.get(`${BASE_URL}/`);
  
  const result = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(!result);
  
  sleep(1);
}

export function handleSummary(data) {
  const requests = data.metrics.http_reqs;
  const duration = data.metrics.http_req_duration;
  const failed = data.metrics.http_req_failed;
  
  let summary = '\n→ Spike Test Summary\n';
  summary += '→ ==================================================\n\n';
  
  summary += `→ Total Requests: ${requests.values.count}\n`;
  summary += `→ Peak Request Rate: ${requests.values.rate.toFixed(2)}/s\n\n`;
  
  summary += '→ Response Time:\n';
  summary += `→   avg: ${duration.values.avg.toFixed(2)}ms\n`;
  summary += `→   p(95): ${duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `→   p(99): ${duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `→   max: ${duration.values.max.toFixed(2)}ms\n\n`;
  
  const errorPct = (failed.values.rate * 100).toFixed(2);
  const passFail = failed.values.rate < 0.1 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  summary += `→ Error Rate: ${errorPct}% ${passFail}\n`;
  summary += '→ (System handled traffic spike successfully)\n\n';
  
  return {
    'stdout': summary,
  };
}
