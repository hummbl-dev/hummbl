#!/usr/bin/env python3
"""B_VALIDATOR_OVERRIDE — Ensure kernel validation is only accessed via adapter.

Checks that no code outside libs/kernel_client/ and tests/ directly imports
from hummbl_eal or aaa packages. All kernel access must go through the
single adapter module.

Exit codes:
  0 — No violations
  1 — Direct kernel import found (B_VALIDATOR_OVERRIDE)
  2 — Configuration error
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# These patterns indicate direct kernel imports
KERNEL_IMPORT_PATTERNS = [
    r"from\s+hummbl_eal\b",
    r"import\s+hummbl_eal\b",
    r"from\s+aaa_eal\b",
    r"import\s+aaa_eal\b",
    r"from\s+aaa\b",
    r"import\s+aaa\b",
]

# Directories allowed to have direct kernel imports
ALLOWED_DIRS = [
    "libs/kernel_client/",
    "tests/",
]

# Kernel validation function signatures that must not be redefined
KERNEL_FUNCTIONS = [
    "sha256_hex",
    "canonical_json_bytes",
    "verify_receipt",
    "classify_compat",
]


def get_python_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files", "*.py"],
        capture_output=True,
        text=True,
        cwd=REPO_ROOT,
    )
    if result.returncode != 0:
        print(f"ERROR: git ls-files failed: {result.stderr}", file=sys.stderr)
        sys.exit(2)
    return [line for line in result.stdout.strip().split("\n") if line]


def is_allowed(path: str) -> bool:
    return any(path.startswith(d) for d in ALLOWED_DIRS)


def main() -> int:
    files = get_python_files()
    violations: list[str] = []
    redefinitions: list[str] = []

    for rel_path in files:
        if is_allowed(rel_path):
            continue

        full_path = REPO_ROOT / rel_path
        if not full_path.exists():
            continue

        content = full_path.read_text(errors="replace")

        # Check for direct kernel imports
        for pattern in KERNEL_IMPORT_PATTERNS:
            if re.search(pattern, content):
                violations.append(
                    f"Direct kernel import in {rel_path} (pattern: {pattern})"
                )

        # Check for kernel function redefinitions
        for func in KERNEL_FUNCTIONS:
            if re.search(rf"def\s+{func}\s*\(", content):
                redefinitions.append(
                    f"Kernel function '{func}' redefined in {rel_path}"
                )

    errors = violations + redefinitions
    if errors:
        print(f"B_VALIDATOR_OVERRIDE: {len(errors)} violation(s) found:")
        for e in errors:
            print(f"  {e}")
        if violations:
            print("\nFix: Route all kernel access through libs/kernel_client/.")
        if redefinitions:
            print("\nFix: Never redefine kernel functions. Use the kernel adapter instead.")
        return 1

    print("OK: No direct kernel imports or function redefinitions found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
