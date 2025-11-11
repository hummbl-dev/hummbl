# Load Testing Guide

Comprehensive load testing for the HUMMBL backend API using k6.

## Quick Start

```bash
# Run all tests
./load-tests/run-tests.sh

# Run specific test
k6 run load-tests/health-check.js

# Run against local development server
BASE_URL=http://localhost:8787 k6 run load-tests/health-check.js

# Include stress test (12 minutes duration)
RUN_STRESS_TEST=true ./load-tests/run-tests.sh
```

## Test Suite

### 1. Health Check (`health-check.js`)

**Purpose**: Baseline performance test of the health endpoint  
**Duration**: ~3.5 minutes  
**Load Profile**:
- Ramp up to 20 users (30s)
- Hold 20 users (1m)
- Ramp up to 50 users (30s)
- Hold 50 users (1m)
- Ramp down (30s)

**Success Criteria**:
- ✓ p95 response time < 500ms
- ✓ Error rate < 1%
- ✓ Health endpoint returns valid JSON
- ✓ Database status included

**Expected Results**:
- Request rate: 15-40 req/s
- Average response: 100-300ms
- p95 response: 200-400ms

### 2. Authentication Flow (`auth-flow.js`)

**Purpose**: Test registration and login under load  
**Duration**: ~2 minutes  
**Load Profile**:
- Ramp up to 10 concurrent users
- Each user: Register → Login → Get Profile
- Hold 10 users (1m)

**Success Criteria**:
- ✓ p95 response time < 1000ms
- ✓ Error rate < 5% (accounting for rate limits)
- ✓ Successful registrations tracked
- ✓ Token-based authentication works

**Expected Results**:
- Successful registrations: 10-30
- Successful logins: 10-30
- Some 429 rate limit responses (expected)

### 3. Rate Limiting (`rate-limit.js`)

**Purpose**: Verify rate limiting is working correctly  
**Duration**: 30 seconds  
**Load Profile**:
- Single user making rapid requests
- 10 requests in quick succession

**Success Criteria**:
- ✓ Rate limits are enforced (429 responses)
- ✓ Retry-After header present
- ✓ System remains stable after rate limit

**Expected Results**:
- Should hit rate limit after 5 requests
- 429 responses with proper headers
- Auth endpoint: 5 req/min limit enforced

### 4. Spike Test (`spike-test.js`)

**Purpose**: Test behavior under sudden traffic spikes  
**Duration**: ~3 minutes  
**Load Profile**:
- Baseline: 5 users
- Spike: Jump to 100 users (10s)
- Hold spike: 30s
- Recovery: Back to 5 users

**Success Criteria**:
- ✓ p95 response time < 2000ms
- ✓ Error rate < 10%
- ✓ System recovers after spike

**Expected Results**:
- Peak request rate: 80-100 req/s
- Increased latency during spike (acceptable)
- Quick recovery after spike ends

### 5. Stress Test (`stress-test.js`) - Optional

**Purpose**: Find breaking point by gradually increasing load  
**Duration**: ~12 minutes  
**Load Profile**:
- Gradually ramp from 10 → 200 users
- 2-minute holds at each level
- Find system breaking point

**Success Criteria**:
- ✓ p95 response time < 3000ms
- ✓ Error rate < 20%
- ✓ Identify degradation point

**Expected Results**:
- System should handle 50-100 users easily
- May degrade at 150-200 concurrent users
- Cloudflare Workers should auto-scale

## Installation

### Install k6

**macOS**:
```bash
brew install k6
```

**Linux**:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows**:
```powershell
choco install k6
```

### Verify Installation

```bash
k6 version
# k6 v0.47.0
```

## Running Tests

### Run All Tests

```bash
cd /path/to/hummbl
./load-tests/run-tests.sh
```

### Run Individual Test

```bash
k6 run load-tests/health-check.js
```

### Custom Configuration

```bash
# Test against local server
BASE_URL=http://localhost:8787 k6 run load-tests/health-check.js

# Include stress test
RUN_STRESS_TEST=true ./load-tests/run-tests.sh

# Save detailed JSON output
k6 run --out json=results.json load-tests/health-check.js

# Run with specific VUs and duration
k6 run --vus 10 --duration 30s load-tests/health-check.js
```

## Interpreting Results

### Key Metrics

- **http_reqs**: Total number of HTTP requests
- **http_req_duration**: Response time statistics
  - `avg`: Average response time
  - `min/max`: Fastest/slowest request
  - `p(90)`, `p(95)`, `p(99)`: Percentile latencies
- **http_req_failed**: Percentage of failed requests
- **vus**: Virtual users (concurrent connections)
- **iterations**: Number of test iterations completed

### Success Indicators

✅ **Good Performance**:
- p95 < 500ms for health checks
- p95 < 1000ms for auth operations
- Error rate < 1%
- Consistent response times

⚠️ **Degraded Performance**:
- p95 > 1000ms
- Error rate 1-5%
- Increasing response times under load

❌ **Poor Performance**:
- p95 > 2000ms
- Error rate > 5%
- Timeouts or connection errors

### Example Output

```
→ Health Check Load Test Summary
→ ==================================================

→ Total Requests: 2,450
→ Request Rate: 38.42/s

→ Response Time:
→   avg: 145.32ms
→   min: 89.15ms
→   med: 132.78ms
→   max: 456.23ms
→   p(95): 287.45ms
→   p(99): 389.12ms

→ Error Rate: 0.04% PASS
```

## Baseline Metrics

Document your baseline performance for comparison:

| Test | Metric | Target | Baseline | Current |
|------|--------|--------|----------|---------|
| Health Check | p95 latency | < 500ms | 287ms | ___ |
| Health Check | Error rate | < 1% | 0.04% | ___ |
| Auth Flow | p95 latency | < 1000ms | 654ms | ___ |
| Spike Test | Error rate | < 10% | 2.3% | ___ |
| Rate Limit | Hits | > 0 | 6 | ___ |

Update the "Current" column after each test run to track performance over time.

## CI Integration

### GitHub Actions Workflow

Create `.github/workflows/load-test.yml`:

```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:  # Manual trigger

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install k6
        run: |
          curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1
          
      - name: Run load tests
        run: |
          ./k6 run load-tests/health-check.js
          ./k6 run load-tests/auth-flow.js
          ./k6 run load-tests/rate-limit.js
          
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: load-tests/results/
```

## Best Practices

### 1. Test Against Production

Always test production endpoints (not staging) for realistic results:
```bash
BASE_URL=https://hummbl-backend.hummbl.workers.dev ./load-tests/run-tests.sh
```

### 2. Run During Low Traffic

Schedule tests during off-peak hours to minimize impact on real users.

### 3. Monitor During Tests

Watch Cloudflare Workers analytics during tests:
- Request rate
- Error rate
- CPU time
- Database connections

### 4. Compare Over Time

Save results and compare with previous runs:
```bash
# Save baseline
./load-tests/run-tests.sh | tee baseline.txt

# Compare later
./load-tests/run-tests.sh | tee current.txt
diff baseline.txt current.txt
```

### 5. Test Realistic Scenarios

The auth flow test simulates real user behavior:
- Register → Login → Use API
- Includes proper delays between requests
- Handles rate limiting gracefully

## Troubleshooting

### "Connection refused" errors

- Check if backend is running
- Verify BASE_URL is correct
- Check firewall rules

### High error rates

- Review rate limiting configuration
- Check backend logs for errors
- Verify database is healthy

### Slow response times

- Check database performance
- Review Cloudflare Workers metrics
- Consider caching strategies

### Rate limit issues

- Expected behavior in auth tests
- Verify 429 responses have Retry-After header
- Adjust test VUs if needed

## Performance Targets

Based on Cloudflare Workers capabilities:

| Metric | Target | Cloudflare Limit |
|--------|--------|------------------|
| Concurrent requests | 1000+ | Unlimited (auto-scale) |
| Request duration | < 50ms CPU | 50ms CPU limit per request |
| Error rate | < 1% | N/A |
| Uptime | 99.9% | 99.9% SLA |

## Advanced Usage

### Custom Scenarios

Create custom test scenarios by copying existing tests:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  // Your custom test logic
  const response = http.get('https://your-endpoint.com/api');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

### Cloud Execution

Run tests from k6 Cloud for distributed load:

```bash
# Sign up at k6.io
k6 login cloud

# Run from cloud with 100 VUs from multiple regions
k6 cloud --vus 100 load-tests/health-check.js
```

### Load Test Dashboard

View real-time results with k6 dashboard:

```bash
k6 run --out web-dashboard load-tests/health-check.js
```

Then open http://localhost:5665

## Results Archive

Test results are saved to `load-tests/results/` with timestamps:

```
load-tests/results/
├── 01_health_check_20240511_143022.json
├── 02_auth_flow_20240511_143356.json
├── 03_rate_limit_20240511_143628.json
└── 04_spike_test_20240511_143705.json
```

Review historical results to track performance trends over time.

## Support

For issues or questions:
- k6 Documentation: https://k6.io/docs/
- HUMMBL Issues: https://github.com/hummbl-dev/hummbl/issues
- Cloudflare Workers: https://developers.cloudflare.com/workers/
