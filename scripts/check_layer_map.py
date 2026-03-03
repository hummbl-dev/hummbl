#!/usr/bin/env python3
"""B_LAYER_UNCLASSIFIED — Verify every committed path maps to a layer.

Reads layer_map.json and checks all git-tracked files against it.
Exit codes:
  0 — All files classified
  1 — Unclassified files found (B_LAYER_UNCLASSIFIED)
  2 — Configuration error (missing layer_map.json, invalid JSON)
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def load_layer_map() -> dict:
    path = REPO_ROOT / "layer_map.json"
    if not path.exists():
        print(f"ERROR: {path} not found", file=sys.stderr)
        sys.exit(2)
    with open(path) as f:
        return json.load(f)


def get_tracked_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files"],
        capture_output=True,
        text=True,
        cwd=REPO_ROOT,
    )
    if result.returncode != 0:
        print(f"ERROR: git ls-files failed: {result.stderr}", file=sys.stderr)
        sys.exit(2)
    return [line for line in result.stdout.strip().split("\n") if line]


def is_excluded(path: str, exclusions: list[str]) -> bool:
    for pattern in exclusions:
        # Pattern like "dist/" matches any path component
        clean = pattern.rstrip("/")
        if f"/{clean}/" in f"/{path}" or path.startswith(f"{clean}/"):
            return True
        # Match file extensions like "*.egg-info/"
        if pattern.startswith("*") and clean.lstrip("*") in path:
            return True
    return False


def classify(path: str, layer_map: dict) -> str | None:
    """Return the layer for a path, or None if unclassified."""
    layers = layer_map.get("layers", {})
    root_files = layer_map.get("root_files", {})

    # Check if it's a root file (no directory separator)
    if "/" not in path:
        return root_files.get("layer", "L0")

    # Longest prefix match
    best_match = ""
    best_layer = None
    for layer_name, layer_info in layers.items():
        for prefix in layer_info.get("paths", []):
            clean_prefix = prefix.rstrip("/") + "/"
            if path.startswith(clean_prefix) and len(clean_prefix) > len(best_match):
                best_match = clean_prefix
                best_layer = layer_name
    return best_layer


def main() -> int:
    layer_map = load_layer_map()
    tracked = get_tracked_files()
    exclusions = layer_map.get("exclusions", {}).get("patterns", [])

    unclassified: list[str] = []
    for path in tracked:
        if is_excluded(path, exclusions):
            continue
        layer = classify(path, layer_map)
        if layer is None:
            unclassified.append(path)

    if unclassified:
        print(f"B_LAYER_UNCLASSIFIED: {len(unclassified)} file(s) not mapped to any layer:")
        for f in sorted(unclassified):
            print(f"  {f}")
        print("\nFix: Add the directory prefix to layer_map.json or add to exclusions.")
        return 1

    print(f"OK: All {len(tracked)} tracked files classified.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
