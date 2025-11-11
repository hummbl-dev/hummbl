#!/bin/bash
# HUMMBL Security Audit Script
# Validates security headers, CORS, CSP, and other security controls

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-https://hummbl-backend.hummbl.workers.dev}"
FRONTEND_URL="${FRONTEND_URL:-https://hummbl.vercel.app}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         HUMMBL Security Audit                        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Backend:${NC} $BACKEND_URL"
echo -e "${YELLOW}Frontend:${NC} $FRONTEND_URL"
echo ""

# Test counter
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✓ PASS${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠ WARN${NC} $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}→${NC} $1"
}

# Test 1: HTTPS Enforcement
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}1. HTTPS Enforcement${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [[ "$BACKEND_URL" == https://* ]]; then
    pass "Backend uses HTTPS"
else
    fail "Backend does not use HTTPS"
fi

if [[ "$FRONTEND_URL" == https://* ]]; then
    pass "Frontend uses HTTPS"
else
    fail "Frontend does not use HTTPS"
fi

# Test 2: Security Headers (Backend)
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}2. Backend Security Headers${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

BACKEND_HEADERS=$(curl -s -I "$BACKEND_URL" || echo "ERROR")

if [[ $BACKEND_HEADERS == "ERROR" ]]; then
    fail "Unable to fetch backend headers"
else
    # Check CORS headers
    if echo "$BACKEND_HEADERS" | grep -qi "access-control-allow-origin"; then
        pass "CORS headers present"
        CORS_ORIGIN=$(echo "$BACKEND_HEADERS" | grep -i "access-control-allow-origin" | cut -d: -f2- | tr -d '\r\n ')
        info "Origin: $CORS_ORIGIN"
    else
        fail "CORS headers missing"
    fi
    
    # Check Content-Type
    if echo "$BACKEND_HEADERS" | grep -qi "content-type"; then
        pass "Content-Type header present"
    else
        warn "Content-Type header missing"
    fi
fi

# Test 3: Security Headers (Frontend)
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}3. Frontend Security Headers${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

FRONTEND_HEADERS=$(curl -s -I "$FRONTEND_URL" || echo "ERROR")

if [[ $FRONTEND_HEADERS == "ERROR" ]]; then
    fail "Unable to fetch frontend headers"
else
    # X-Frame-Options
    if echo "$FRONTEND_HEADERS" | grep -qi "x-frame-options"; then
        pass "X-Frame-Options header present"
        XFO=$(echo "$FRONTEND_HEADERS" | grep -i "x-frame-options" | cut -d: -f2- | tr -d '\r\n ')
        info "Value: $XFO"
    else
        warn "X-Frame-Options header missing (clickjacking protection)"
    fi
    
    # Content-Security-Policy
    if echo "$FRONTEND_HEADERS" | grep -qi "content-security-policy"; then
        pass "Content-Security-Policy header present"
        CSP=$(echo "$FRONTEND_HEADERS" | grep -i "content-security-policy" | cut -d: -f2- | tr -d '\r\n ')
        info "CSP configured"
    else
        fail "Content-Security-Policy header missing"
    fi
    
    # X-Content-Type-Options
    if echo "$FRONTEND_HEADERS" | grep -qi "x-content-type-options"; then
        pass "X-Content-Type-Options header present"
    else
        warn "X-Content-Type-Options header missing (MIME sniffing protection)"
    fi
    
    # Referrer-Policy
    if echo "$FRONTEND_HEADERS" | grep -qi "referrer-policy"; then
        pass "Referrer-Policy header present"
    else
        warn "Referrer-Policy header missing"
    fi
    
    # Permissions-Policy
    if echo "$FRONTEND_HEADERS" | grep -qi "permissions-policy"; then
        pass "Permissions-Policy header present"
    else
        warn "Permissions-Policy header missing (feature policy)"
    fi
fi

# Test 4: Rate Limiting
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}4. Rate Limiting${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test auth endpoint rate limiting (5 req/min)
info "Testing auth endpoint rate limiting (5 req/min)..."
RATE_LIMIT_HIT=false

for i in {1..7}; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"test"}' 2>/dev/null)
    
    STATUS=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$STATUS" = "429" ]; then
        RATE_LIMIT_HIT=true
        break
    fi
    sleep 0.5
done

if [ "$RATE_LIMIT_HIT" = true ]; then
    pass "Rate limiting working (received 429 response)"
else
    warn "Rate limiting not triggered in test (may need more requests)"
fi

# Test 5: Authentication Security
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}5. Authentication Security${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test unauthenticated access to protected endpoint
AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/auth/me" 2>/dev/null)
AUTH_STATUS=$(echo "$AUTH_RESPONSE" | tail -n1)

if [ "$AUTH_STATUS" = "401" ]; then
    pass "Protected endpoints require authentication"
else
    fail "Protected endpoints may not require authentication (expected 401, got $AUTH_STATUS)"
fi

# Test invalid credentials
INVALID_LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"nonexistent@example.com","password":"wrongpassword"}' 2>/dev/null)
INVALID_STATUS=$(echo "$INVALID_LOGIN" | tail -n1)

if [ "$INVALID_STATUS" = "401" ]; then
    pass "Invalid credentials rejected"
else
    warn "Invalid credentials handling unclear (status: $INVALID_STATUS)"
fi

# Test 6: Input Validation
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}6. Input Validation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test malformed JSON
MALFORMED_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{invalid json}' 2>/dev/null)
MALFORMED_STATUS=$(echo "$MALFORMED_RESPONSE" | tail -n1)

if [ "$MALFORMED_STATUS" = "400" ]; then
    pass "Malformed JSON rejected with 400"
else
    warn "Malformed JSON handling unclear (status: $MALFORMED_STATUS)"
fi

# Test missing required fields
MISSING_FIELDS=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null)
MISSING_STATUS=$(echo "$MISSING_FIELDS" | tail -n1)

if [ "$MISSING_STATUS" = "400" ]; then
    pass "Missing required fields rejected"
else
    warn "Missing field validation unclear (status: $MISSING_STATUS)"
fi

# Test 7: SQL Injection Protection
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}7. SQL Injection Protection${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test SQL injection attempt
SQL_INJECTION=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin'\'' OR 1=1--","password":"test"}' 2>/dev/null)
SQL_STATUS=$(echo "$SQL_INJECTION" | tail -n1)

if [ "$SQL_STATUS" = "400" ] || [ "$SQL_STATUS" = "401" ]; then
    pass "SQL injection attempt handled safely"
else
    warn "SQL injection handling unclear (status: $SQL_STATUS)"
fi

# Test 8: XSS Protection
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}8. XSS Protection${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check CSP for XSS protection
if echo "$FRONTEND_HEADERS" | grep -qi "content-security-policy"; then
    pass "CSP configured for XSS protection"
    if echo "$FRONTEND_HEADERS" | grep -i "content-security-policy" | grep -q "script-src"; then
        pass "CSP script-src directive present"
    else
        warn "CSP missing script-src directive"
    fi
else
    fail "No CSP configured - vulnerable to XSS"
fi

# Test 9: CORS Configuration
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}9. CORS Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test CORS with valid origin
CORS_RESPONSE=$(curl -s -I -H "Origin: https://hummbl.vercel.app" "$BACKEND_URL" 2>/dev/null)

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
    pass "CORS headers present"
    
    # Check if wildcard
    if echo "$CORS_RESPONSE" | grep -i "access-control-allow-origin" | grep -q "\*"; then
        warn "CORS allows all origins (*) - consider restricting"
    else
        pass "CORS restricted to specific origins"
    fi
else
    warn "CORS headers not found"
fi

# Test 10: Health Endpoint Information Disclosure
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}10. Information Disclosure${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

HEALTH_RESPONSE=$(curl -s "$BACKEND_URL" 2>/dev/null)

# Check for sensitive information
if echo "$HEALTH_RESPONSE" | grep -qi "password\|secret\|key\|token"; then
    fail "Health endpoint may expose sensitive information"
else
    pass "No obvious sensitive information in health endpoint"
fi

# Check for version disclosure
if echo "$HEALTH_RESPONSE" | grep -qi "version"; then
    warn "Version information disclosed (could aid attackers)"
else
    pass "Version information not disclosed"
fi

# Summary
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   Summary                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Passed:   $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed:   $FAILED${NC}"
echo ""

# Overall result
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Security audit passed!${NC}"
    exit 0
elif [ $FAILED -le 2 ]; then
    echo -e "${YELLOW}⚠ Security audit passed with warnings${NC}"
    exit 0
else
    echo -e "${RED}✗ Security audit failed - address critical issues${NC}"
    exit 1
fi
