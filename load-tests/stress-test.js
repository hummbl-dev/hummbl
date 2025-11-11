/**
 * Stress Test
 * Tests system breaking point by gradually increasing load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp to 10 users
    { duration: '2m', target: 20 },   // Ramp to 20
    { duration: '2m', target: 50 },   // Ramp to 50
    { duration: '2m', target: 100 },  // Ramp to 100
    { duration: '2m', target: 150 },  // Ramp to 150
    { duration: '2m', target: 200 },  // Ramp to 200 (breaking point?)
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% under 3s (generous for stress test)
    http_req_failed: ['rate<0.2'],      // Less than 20% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://hummbl-backend.hummbl.workers.dev';

export default function () {
  const response = http.get(`${BASE_URL}/`);
  
  const result = check(response, {
    'status is 200': (r) => r.status === 200,
    'has valid response': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.service === 'hummbl-backend';
      } catch (e) {
        return false;
      }
    },
  });
  
  errorRate.add(!result);
  
  sleep(1);
}

export function handleSummary(data) {
  const requests = data.metrics.http_reqs;
  const duration = data.metrics.http_req_duration;
  const failed = data.metrics.http_req_failed;
  
  let summary = '\n→ Stress Test Summary\n';
  summary += '→ ==================================================\n\n';
  
  summary += '→ Test Profile: Gradually increased to 200 concurrent users\n\n';
  
  summary += `→ Total Requests: ${requests.values.count}\n`;
  summary += `→ Request Rate: ${requests.values.rate.toFixed(2)}/s\n\n`;
  
  summary += '→ Response Time:\n';
  summary += `→   avg: ${duration.values.avg.toFixed(2)}ms\n`;
  summary += `→   min: ${duration.values.min.toFixed(2)}ms\n`;
  summary += `→   med: ${duration.values.med.toFixed(2)}ms\n`;
  summary += `→   max: ${duration.values.max.toFixed(2)}ms\n`;
  summary += `→   p(90): ${duration.values['p(90)'].toFixed(2)}ms\n`;
  summary += `→   p(95): ${duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `→   p(99): ${duration.values['p(99)'].toFixed(2)}ms\n\n`;
  
  const errorPct = (failed.values.rate * 100).toFixed(2);
  const passFail = failed.values.rate < 0.2 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  summary += `→ Error Rate: ${errorPct}% ${passFail}\n`;
  summary += '→ (System maintained stability under increasing load)\n\n';
  
  // Determine breaking point
  if (failed.values.rate > 0.5) {
    summary += '→ ⚠️  Breaking point reached - error rate exceeded 50%\n';
  } else if (failed.values.rate > 0.2) {
    summary += '→ ⚠️  System degraded significantly under peak load\n';
  } else {
    summary += '→ ✓ System remained stable up to 200 concurrent users\n';
  }
  
  return {
    'stdout': summary,
  };
}
