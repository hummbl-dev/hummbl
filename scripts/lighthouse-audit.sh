#!/bin/bash

# HUMMBL Lighthouse Accessibility Audit
# Uses Lighthouse CI to check accessibility compliance
# 
# Usage: npm run audit:lighthouse

set -e

echo "🔍 HUMMBL Lighthouse Accessibility Audit"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if dist exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: dist/ directory not found${NC}"
    echo "   Run: npm run build"
    exit 1
fi

echo -e "${GREEN}✅ Found dist/ directory${NC}"

# Start preview server in background
echo "🚀 Starting preview server..."
npm run preview > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server
sleep 3

if ! curl -s http://localhost:4173 > /dev/null; then
    echo -e "${RED}❌ Server failed to start${NC}"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✅ Server running at http://localhost:4173${NC}"
echo ""

# Create reports directory
mkdir -p lighthouse-reports

# Pages to audit
PAGES=(
    "/:home"
    "/workflows:workflows"
    "/agents:agents"
    "/analytics:analytics"  
    "/settings:settings"
    "/login:login"
)

echo "📋 Running Lighthouse on ${#PAGES[@]} pages..."
echo ""

TOTAL_SCORE=0
COUNT=0

for PAGE_INFO in "${PAGES[@]}"; do
    IFS=':' read -r PAGE NAME <<< "$PAGE_INFO"
    URL="http://localhost:4173${PAGE}"
    
    echo -e "${BLUE}📄 Auditing:${NC} $PAGE"
    
    # Run Lighthouse
    npx lighthouse "$URL" \
        --only-categories=accessibility \
        --output=json \
        --output-path="lighthouse-reports/${NAME}.json" \
        --quiet \
        --chrome-flags="--headless" 2>/dev/null || true
    
    # Extract score
    if [ -f "lighthouse-reports/${NAME}.json" ]; then
        SCORE=$(cat "lighthouse-reports/${NAME}.json" | grep -o '"accessibility":[^}]*"score":[0-9.]*' | grep -o '[0-9.]*$' || echo "0")
        SCORE_PERCENT=$(echo "$SCORE * 100" | bc | cut -d'.' -f1)
        
        TOTAL_SCORE=$(echo "$TOTAL_SCORE + $SCORE" | bc)
        COUNT=$((COUNT + 1))
        
        if [ "$SCORE_PERCENT" -ge 90 ]; then
            echo -e "   ${GREEN}✅ Score: ${SCORE_PERCENT}%${NC}"
        elif [ "$SCORE_PERCENT" -ge 70 ]; then
            echo -e "   ${YELLOW}⚠️  Score: ${SCORE_PERCENT}%${NC}"
        else
            echo -e "   ${RED}❌ Score: ${SCORE_PERCENT}%${NC}"
        fi
    else
        echo -e "   ${YELLOW}⚠️  Could not generate report${NC}"
    fi
done

# Cleanup
echo ""
echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null || true

# Calculate average
if [ $COUNT -gt 0 ]; then
    AVG_SCORE=$(echo "scale=2; ($TOTAL_SCORE / $COUNT) * 100" | bc | cut -d'.' -f1)
else
    AVG_SCORE=0
fi

# Summary
echo ""
echo "=========================================="
echo "📊 Audit Complete"
echo "=========================================="
echo ""
echo "Pages audited: $COUNT"
echo "Average accessibility score: ${AVG_SCORE}%"
echo ""
echo -e "📁 Detailed reports in: ${BLUE}lighthouse-reports/${NC}"
echo ""

if [ "$AVG_SCORE" -ge 90 ]; then
    echo -e "${GREEN}✅ Excellent accessibility!${NC}"
    echo ""
    exit 0
elif [ "$AVG_SCORE" -ge 70 ]; then
    echo -e "${YELLOW}⚠️  Good, but needs improvement${NC}"
    echo ""
    echo "🔧 Review reports for specific issues"
    exit 0
else
    echo -e "${RED}❌ Accessibility needs significant work${NC}"
    echo ""
    echo "🔧 Review reports and fix critical issues"
    exit 1
fi
