#!/bin/bash
# Load Test Runner for HUMMBL Backend
# Runs all k6 load tests and generates a summary report

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-https://hummbl-backend.hummbl.workers.dev}"
RESULTS_DIR="load-tests/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create results directory
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         HUMMBL Backend Load Testing Suite           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Target:${NC} $BASE_URL"
echo -e "${YELLOW}Results:${NC} $RESULTS_DIR"
echo -e "${YELLOW}Timestamp:${NC} $TIMESTAMP"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed${NC}"
    echo "Install with: brew install k6"
    exit 1
fi

# Function to run a test
run_test() {
    local test_name=$1
    local test_file=$2
    local result_file="$RESULTS_DIR/${test_name}_${TIMESTAMP}.json"
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Running: ${test_name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Run test and save JSON summary
    k6 run --out json="$result_file" --env BASE_URL="$BASE_URL" "$test_file" || true
    
    echo ""
}

# Run all tests
run_test "01_health_check" "load-tests/health-check.js"
run_test "02_auth_flow" "load-tests/auth-flow.js"
run_test "03_rate_limit" "load-tests/rate-limit.js"
run_test "04_spike_test" "load-tests/spike-test.js"

# Optional: Run stress test (long duration)
if [ "$RUN_STRESS_TEST" = "true" ]; then
    run_test "05_stress_test" "load-tests/stress-test.js"
fi

# Generate summary report
echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   Test Summary                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Count results
total_tests=$(ls -1 "$RESULTS_DIR"/*_${TIMESTAMP}.json 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Completed $total_tests load tests${NC}"
echo -e "${YELLOW}→ Results saved to: $RESULTS_DIR${NC}"
echo ""

# Instructions
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review detailed results: ls -lh $RESULTS_DIR/*_${TIMESTAMP}.json"
echo "2. Analyze metrics in k6 Cloud (if configured)"
echo "3. Compare with baseline metrics in LOAD_TEST_GUIDE.md"
echo ""

echo -e "${GREEN}Load testing complete!${NC}"
