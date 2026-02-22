#!/bin/bash
# Verify HUMMBL repository layout

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=== HUMMBL Layout Verification ==="
echo ""

ERRORS=0

# Required directories
dirs=(
    "core"
    "shared"
    "platform"
    "ecosystem"
    "governance"
    "docs"
    "tests"
    "scripts"
)

for dir in "${dirs[@]}"; do
    if [[ -d "${REPO_ROOT}/${dir}" ]]; then
        echo "✓ ${dir}/"
    else
        echo "✗ ${dir}/ — MISSING"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# Required files
files=(
    "README.md"
    "AGENTS.md"
    "LICENSE"
    "pyproject.toml"
    ".gitignore"
)

for file in "${files[@]}"; do
    if [[ -f "${REPO_ROOT}/${file}" ]]; then
        echo "✓ ${file}"
    else
        echo "✗ ${file} — MISSING"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# Check git remote
cd "${REPO_ROOT}"
REMOTE=$(git remote get-url origin 2>/dev/null || echo "none")
echo "Git remote: ${REMOTE}"

if [[ "${REMOTE}" == *"hummbl"* ]]; then
    echo "✓ Remote is hummbl repo"
else
    echo "⚠ Remote doesn't appear to be hummbl repo"
fi

echo ""

if [[ ${ERRORS} -eq 0 ]]; then
    echo "=== ✓ Layout valid ==="
    exit 0
else
    echo "=== ✗ ${ERRORS} issues found ==="
    exit 1
fi
