#!/usr/bin/env python3
"""B_CAES_STALE_COPY — Verify governance/CAES_SPEC.md matches canonical hash.

The canonical CAES spec lives in hummbl-dev/base120. The copy in
governance/ must match the SHA256 recorded in CAES_CANONICAL.sha256.

Exit codes:
  0 — Hash matches or no CAES copy exists yet
  1 — Hash mismatch (B_CAES_STALE_COPY)
  2 — Configuration error
"""
from __future__ import annotations

import hashlib
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    caes_copy = REPO_ROOT / "governance" / "CAES_SPEC.md"
    caes_hash_file = REPO_ROOT / "governance" / "CAES_CANONICAL.sha256"

    # If no CAES copy exists yet, that's OK (Phase 1 may not have it)
    if not caes_copy.exists():
        if caes_hash_file.exists():
            print(
                "WARNING: CAES_CANONICAL.sha256 exists but governance/CAES_SPEC.md does not.",
                file=sys.stderr,
            )
        print("OK: No CAES copy present (not yet imported from base120).")
        return 0

    if not caes_hash_file.exists():
        print(
            "B_CAES_STALE_COPY: governance/CAES_SPEC.md exists but "
            "governance/CAES_CANONICAL.sha256 is missing.",
            file=sys.stderr,
        )
        print("\nFix: Create CAES_CANONICAL.sha256 with the SHA256 of the canonical CAES spec.")
        return 1

    # Compute SHA256 of local copy
    content = caes_copy.read_bytes()
    actual_hash = hashlib.sha256(content).hexdigest()

    # Read expected hash (first 64 chars of first line)
    expected_line = caes_hash_file.read_text().strip().split("\n")[0]
    expected_hash = expected_line.strip().split()[0][:64]

    if actual_hash != expected_hash:
        print(
            f"B_CAES_STALE_COPY: Hash mismatch.\n"
            f"  Expected: {expected_hash}\n"
            f"  Actual:   {actual_hash}\n"
            f"\nFix: Re-import CAES_SPEC.md from base120 and update CAES_CANONICAL.sha256."
        )
        return 1

    print(f"OK: governance/CAES_SPEC.md matches canonical hash ({actual_hash[:16]}...).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
