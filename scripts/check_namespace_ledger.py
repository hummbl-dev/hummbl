#!/usr/bin/env python3
"""B_NAMESPACE_LEAK — Verify all package names are in the namespace ledger.

Checks that every package name referenced in dependency_pins.json, pyproject.toml,
and package.json files has a corresponding entry in namespace_ledger.json.

Exit codes:
  0 — All namespaces accounted for
  1 — Unreserved namespace found (B_NAMESPACE_LEAK)
  2 — Configuration error
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def load_json(name: str) -> dict:
    path = REPO_ROOT / name
    if not path.exists():
        return {}
    with open(path) as f:
        return json.load(f)


def find_package_json_names() -> list[tuple[str, str]]:
    """Find all package.json files and extract their names."""
    result = subprocess.run(
        ["git", "ls-files", "*/package.json", "package.json"],
        capture_output=True,
        text=True,
        cwd=REPO_ROOT,
    )
    names: list[tuple[str, str]] = []
    for rel_path in result.stdout.strip().split("\n"):
        if not rel_path:
            continue
        full = REPO_ROOT / rel_path
        if full.exists():
            try:
                pkg = json.loads(full.read_text())
                name = pkg.get("name", "")
                if name and name.startswith("@hummbl/"):
                    names.append((name, rel_path))
            except (json.JSONDecodeError, OSError):
                pass
    return names


def find_pyproject_names() -> list[tuple[str, str]]:
    """Find package names in pyproject.toml files under libs/."""
    result = subprocess.run(
        ["git", "ls-files", "libs/*/pyproject.toml"],
        capture_output=True,
        text=True,
        cwd=REPO_ROOT,
    )
    names: list[tuple[str, str]] = []
    for rel_path in result.stdout.strip().split("\n"):
        if not rel_path:
            continue
        full = REPO_ROOT / rel_path
        if full.exists():
            content = full.read_text()
            match = re.search(r'^name\s*=\s*"(hummbl-[^"]+)"', content, re.MULTILINE)
            if match:
                names.append((match.group(1), rel_path))
    return names


def main() -> int:
    ledger = load_json("namespace_ledger.json")
    pins = load_json("dependency_pins.json")

    if not ledger:
        print("ERROR: namespace_ledger.json not found", file=sys.stderr)
        sys.exit(2)

    ledger_pypi = set(ledger.get("pypi", {}).keys())
    ledger_npm = set(ledger.get("npm", {}).keys())

    errors: list[str] = []

    # Check dependency_pins.json registrations
    for name in pins.get("registrations", {}).get("pypi", []):
        if name not in ledger_pypi:
            errors.append(f"PyPI name '{name}' in dependency_pins.json but not in namespace_ledger.json")
    for name in pins.get("registrations", {}).get("npm", []):
        if name not in ledger_npm:
            errors.append(f"npm name '{name}' in dependency_pins.json but not in namespace_ledger.json")

    # Check actual package.json files
    for name, source in find_package_json_names():
        if name not in ledger_npm:
            errors.append(f"npm name '{name}' in {source} but not in namespace_ledger.json")

    # Check actual pyproject.toml files under libs/
    for name, source in find_pyproject_names():
        if name not in ledger_pypi:
            errors.append(f"PyPI name '{name}' in {source} but not in namespace_ledger.json")

    if errors:
        print(f"B_NAMESPACE_LEAK: {len(errors)} unreserved namespace(s) found:")
        for e in errors:
            print(f"  {e}")
        print("\nFix: Add entries to namespace_ledger.json for each package name.")
        return 1

    total = len(ledger_pypi) + len(ledger_npm)
    print(f"OK: All package names accounted for ({total} entries in ledger).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
