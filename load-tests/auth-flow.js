/**
 * Authentication Flow Load Test
 * Tests user registration and login under load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const successfulRegistrations = new Counter('successful_registrations');
const successfulLogins = new Counter('successful_logins');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% of requests under 1s
    http_req_failed: ['rate<0.05'],     // Less than 5% errors (allowing for rate limits)
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://hummbl-backend.hummbl.workers.dev';

export default function () {
  const uniqueId = randomString(8);
  const email = `test_${uniqueId}@loadtest.example.com`;
  const password = 'LoadTest123!';
  const name = `Test User ${uniqueId}`;
  
  // Register
  const registerPayload = JSON.stringify({
    email: email,
    password: password,
    name: name,
  });
  
  const registerParams = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const registerResponse = http.post(
    `${BASE_URL}/api/auth/register`,
    registerPayload,
    registerParams
  );
  
  const registerResult = check(registerResponse, {
    'register status is 201 or 429': (r) => r.status === 201 || r.status === 429,
    'register has token or rate limit': (r) => {
      if (r.status === 201) {
        const body = JSON.parse(r.body);
        return body.token !== undefined && body.user !== undefined;
      }
      return r.status === 429; // Rate limit is acceptable
    },
  });
  
  errorRate.add(!registerResult);
  
  if (registerResponse.status === 201) {
    successfulRegistrations.add(1);
    const registerBody = JSON.parse(registerResponse.body);
    
    // Verify we have a valid token
    check(registerBody, {
      'has token': (b) => b.token && b.token.length > 0,
      'has user id': (b) => b.user && b.user.id,
      'has user email': (b) => b.user && b.user.email === email,
      'has expiration': (b) => b.expiresAt && b.expiresAt > Date.now(),
    });
    
    sleep(1);
    
    // Now try to login with same credentials
    const loginPayload = JSON.stringify({
      email: email,
      password: password,
    });
    
    const loginResponse = http.post(
      `${BASE_URL}/api/auth/login`,
      loginPayload,
      registerParams
    );
    
    const loginResult = check(loginResponse, {
      'login status is 200 or 429': (r) => r.status === 200 || r.status === 429,
      'login has token': (r) => {
        if (r.status === 200) {
          const body = JSON.parse(r.body);
          return body.token !== undefined;
        }
        return r.status === 429;
      },
    });
    
    errorRate.add(!loginResult);
    
    if (loginResponse.status === 200) {
      successfulLogins.add(1);
      const loginBody = JSON.parse(loginResponse.body);
      const token = loginBody.token;
      
      sleep(1);
      
      // Test authenticated endpoint
      const meResponse = http.get(`${BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      check(meResponse, {
        'me status is 200': (r) => r.status === 200,
        'me returns user data': (r) => {
          if (r.status === 200) {
            const body = JSON.parse(r.body);
            return body.email === email;
          }
          return false;
        },
      });
    }
  }
  
  sleep(2);
}

export function handleSummary(data) {
  const requests = data.metrics.http_reqs;
  const duration = data.metrics.http_req_duration;
  const failed = data.metrics.http_req_failed;
  const registrations = data.metrics.successful_registrations;
  const logins = data.metrics.successful_logins;
  
  let summary = '\n→ Authentication Flow Load Test Summary\n';
  summary += '→ ==================================================\n\n';
  
  summary += `→ Total Requests: ${requests.values.count}\n`;
  summary += `→ Request Rate: ${requests.values.rate.toFixed(2)}/s\n\n`;
  
  summary += '→ Response Time:\n';
  summary += `→   avg: ${duration.values.avg.toFixed(2)}ms\n`;
  summary += `→   p(95): ${duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `→   p(99): ${duration.values['p(99)'].toFixed(2)}ms\n\n`;
  
  summary += `→ Successful Registrations: ${registrations.values.count}\n`;
  summary += `→ Successful Logins: ${logins.values.count}\n\n`;
  
  const errorPct = (failed.values.rate * 100).toFixed(2);
  const passFail = failed.values.rate < 0.05 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  summary += `→ Error Rate: ${errorPct}% ${passFail}\n\n`;
  
  return {
    'stdout': summary,
  };
}
