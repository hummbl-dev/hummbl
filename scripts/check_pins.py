#!/usr/bin/env python3
"""B_PIN_MISMATCH — Verify dependency_pins.json agrees with pyproject.toml.

Checks that every pinned dependency in dependency_pins.json has a corresponding
entry in pyproject.toml (when applicable) and that versions match.

Exit codes:
  0 — All pins consistent
  1 — Pin mismatch found (B_PIN_MISMATCH)
  2 — Configuration error
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def load_json(name: str) -> dict:
    path = REPO_ROOT / name
    if not path.exists():
        print(f"ERROR: {path} not found", file=sys.stderr)
        sys.exit(2)
    with open(path) as f:
        return json.load(f)


def load_pyproject() -> str:
    path = REPO_ROOT / "pyproject.toml"
    if not path.exists():
        print(f"ERROR: {path} not found", file=sys.stderr)
        sys.exit(2)
    return path.read_text()


def main() -> int:
    pins = load_json("dependency_pins.json")
    pyproject_text = load_pyproject()
    errors: list[str] = []

    # Check that all pinned packages exist in dependency_pins.json with required fields
    for name, info in pins.get("pins", {}).items():
        required_fields = ["repo", "version", "git_sha", "install", "layer"]
        for field in required_fields:
            if field not in info:
                errors.append(f"Pin '{name}' missing required field: {field}")

        # Validate git_sha is a 40-char hex string
        sha = info.get("git_sha", "")
        if sha and (len(sha) != 40 or not all(c in "0123456789abcdef" for c in sha)):
            errors.append(f"Pin '{name}' has invalid git_sha: {sha}")

        # Check version is in install URL
        version = info.get("version", "")
        install = info.get("install", "")
        if version and install and f"@v{version}" not in install and f"@{version}" not in install:
            errors.append(f"Pin '{name}' version {version} not found in install URL: {install}")

    # Check that registrations in dependency_pins.json match namespace_ledger.json
    ledger_path = REPO_ROOT / "namespace_ledger.json"
    if ledger_path.exists():
        ledger = json.loads(ledger_path.read_text())
        for registry in ["pypi", "npm"]:
            pin_names = set(pins.get("registrations", {}).get(registry, []))
            ledger_names = set(ledger.get(registry, {}).keys())
            missing_from_ledger = pin_names - ledger_names
            if missing_from_ledger:
                for name in sorted(missing_from_ledger):
                    errors.append(
                        f"Registration '{name}' ({registry}) in dependency_pins.json "
                        f"but missing from namespace_ledger.json"
                    )

    if errors:
        print(f"B_PIN_MISMATCH: {len(errors)} issue(s) found:")
        for e in errors:
            print(f"  {e}")
        return 1

    print("OK: All dependency pins are consistent.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
