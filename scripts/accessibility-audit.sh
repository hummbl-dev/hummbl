#!/bin/bash

# HUMMBL Accessibility Audit Script
# Uses axe-core CLI to scan for WCAG violations
# 
# Usage: npm run audit:a11y

set -e

echo "🔍 HUMMBL Accessibility Audit"
echo "================================"
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

# Build if needed
if [ "$1" == "--build" ]; then
    echo ""
    echo "🔨 Building application..."
    npm run build
    echo ""
fi

# Start preview server in background
echo "🚀 Starting preview server..."
npm run preview > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
sleep 3

# Check if server is running
if ! curl -s http://localhost:4173 > /dev/null; then
    echo -e "${RED}❌ Error: Server failed to start${NC}"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✅ Server running at http://localhost:4173${NC}"
echo ""

# Pages to audit
PAGES=(
    "/"
    "/workflows"
    "/agents"
    "/analytics"
    "/mental-models"
    "/templates"
    "/settings"
    "/notifications"
    "/team"
    "/login"
)

echo "📋 Auditing ${#PAGES[@]} pages..."
echo ""

TOTAL_VIOLATIONS=0
OUTPUT_FILE="ACCESSIBILITY_AUDIT_RESULTS.txt"

# Clear previous results
> "$OUTPUT_FILE"

echo "HUMMBL Accessibility Audit Results" >> "$OUTPUT_FILE"
echo "Generated: $(date)" >> "$OUTPUT_FILE"
echo "======================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Run audit on each page
for PAGE in "${PAGES[@]}"; do
    URL="http://localhost:4173${PAGE}"
    echo -e "${BLUE}📄 Auditing:${NC} $PAGE"
    
    # Run axe and capture output
    VIOLATIONS=$(npx @axe-core/cli "$URL" 2>&1 || true)
    
    # Count violations
    CRITICAL=$(echo "$VIOLATIONS" | grep -c "critical" || true)
    SERIOUS=$(echo "$VIOLATIONS" | grep -c "serious" || true)
    MODERATE=$(echo "$VIOLATIONS" | grep -c "moderate" || true)
    MINOR=$(echo "$VIOLATIONS" | grep -c "minor" || true)
    
    TOTAL=$((CRITICAL + SERIOUS + MODERATE + MINOR))
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + TOTAL))
    
    # Write to file
    echo "" >> "$OUTPUT_FILE"
    echo "========================================" >> "$OUTPUT_FILE"
    echo "PAGE: $PAGE" >> "$OUTPUT_FILE"
    echo "========================================" >> "$OUTPUT_FILE"
    echo "$VIOLATIONS" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    if [ $TOTAL -gt 0 ]; then
        echo -e "   ${YELLOW}⚠️  Violations:${NC} Critical: $CRITICAL, Serious: $SERIOUS, Moderate: $MODERATE, Minor: $MINOR"
    else
        echo -e "   ${GREEN}✅ No violations${NC}"
    fi
done

# Cleanup
echo ""
echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null || true

# Summary
echo ""
echo "================================"
echo "📊 Audit Complete"
echo "================================"
echo ""
echo "Total pages audited: ${#PAGES[@]}"
echo "Total violations: $TOTAL_VIOLATIONS"
echo ""

if [ $TOTAL_VIOLATIONS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Violations detected!${NC}"
    echo -e "📝 Full report saved to: ${BLUE}$OUTPUT_FILE${NC}"
    echo ""
    echo "💡 Common issues to fix:"
    echo "   - Missing aria-label on icon buttons"
    echo "   - Form inputs without labels"
    echo "   - Missing alt text on images"
    echo "   - Color contrast issues"
    echo "   - Missing page landmarks"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Review detailed report: cat $OUTPUT_FILE"
    echo "   2. Fix critical issues first"
    echo "   3. Run audit again: npm run audit:a11y"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ No violations found!${NC}"
    echo ""
    exit 0
fi
