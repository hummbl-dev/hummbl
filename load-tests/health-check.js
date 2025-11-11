/**
 * Health Check Load Test
 * Tests the basic health endpoint under load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://hummbl-backend.hummbl.workers.dev';

export default function () {
  const response = http.get(`${BASE_URL}/`);
  
  const result = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has service field': (r) => JSON.parse(r.body).service === 'hummbl-backend',
    'has status field': (r) => JSON.parse(r.body).status === 'operational',
    'has database info': (r) => JSON.parse(r.body).database !== undefined,
  });
  
  errorRate.add(!result);
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '→', enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  const green = enableColors ? '\x1b[32m' : '';
  const red = enableColors ? '\x1b[31m' : '';
  const reset = enableColors ? '\x1b[0m' : '';
  
  let summary = `\n${indent}Health Check Load Test Summary\n`;
  summary += `${indent}${'='.repeat(50)}\n\n`;
  
  // Requests
  const requests = data.metrics.http_reqs;
  summary += `${indent}Total Requests: ${requests.values.count}\n`;
  summary += `${indent}Request Rate: ${requests.values.rate.toFixed(2)}/s\n\n`;
  
  // Response Time
  const duration = data.metrics.http_req_duration;
  summary += `${indent}Response Time:\n`;
  summary += `${indent}  avg: ${duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  min: ${duration.values.min.toFixed(2)}ms\n`;
  summary += `${indent}  med: ${duration.values.med.toFixed(2)}ms\n`;
  summary += `${indent}  max: ${duration.values.max.toFixed(2)}ms\n`;
  summary += `${indent}  p(95): ${duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  p(99): ${duration.values['p(99)'].toFixed(2)}ms\n\n`;
  
  // Pass/Fail
  const failed = data.metrics.http_req_failed;
  const errorPct = (failed.values.rate * 100).toFixed(2);
  const passFail = failed.values.rate < 0.01 ? `${green}PASS${reset}` : `${red}FAIL${reset}`;
  summary += `${indent}Error Rate: ${errorPct}% ${passFail}\n`;
  
  return summary;
}
