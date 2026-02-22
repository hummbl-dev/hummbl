"""CLI entrypoint for HUMMBL repository health checks."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Sequence

from hummbl import __version__

REQUIRED_DIRS = (
    "core",
    "shared",
    "shared/agents",
    "shared/avatars",
    "shared/memory",
    "platform",
    "platform/gaas",
    "platform/mcp",
    "platform/infra",
    "ecosystem",
    "governance",
    "docs",
    "tests",
    "scripts",
    "hummbl",
    "hummbl/core",
)

REQUIRED_FILES = (
    "README.md",
    "AGENTS.md",
    "LICENSE",
    "pyproject.toml",
    ".gitignore",
    "ecosystem/founder-mode.md",
    "scripts/verify-layout.sh",
    "hummbl/__init__.py",
    "hummbl/core/__init__.py",
)


def repo_root() -> Path:
    """Return repository root based on package location."""
    return Path(__file__).resolve().parents[1]


def verify_layout(root: Path | None = None) -> tuple[bool, list[str], list[str]]:
    """Verify required HUMMBL bootstrap layout.

    Returns:
        (is_valid, missing_items, warnings)
    """
    project_root = root or repo_root()
    missing: list[str] = []
    warnings: list[str] = []

    for rel_path in REQUIRED_DIRS:
        if not (project_root / rel_path).is_dir():
            missing.append(f"dir:{rel_path}")

    for rel_path in REQUIRED_FILES:
        if not (project_root / rel_path).is_file():
            missing.append(f"file:{rel_path}")

    git_dir = project_root / ".git"
    if not git_dir.exists():
        missing.append("dir:.git")

    # Remote check is advisory only. Local scaffolding still works without remote.
    config_path = project_root / ".git/config"
    if config_path.exists():
        config_text = config_path.read_text(encoding="utf-8", errors="ignore")
        if "github.com:hummbl-dev/hummbl" not in config_text:
            warnings.append("origin does not appear to point at hummbl-dev/hummbl")
    else:
        warnings.append(".git/config missing; cannot verify origin")

    return (len(missing) == 0), missing, warnings


def cmd_verify_layout(_: argparse.Namespace) -> int:
    """Run layout verification and print operator-friendly output."""
    project_root = repo_root()
    is_valid, missing, warnings = verify_layout(project_root)

    print("=== HUMMBL Layout Verification ===")
    print(f"repo_root: {project_root}")
    if warnings:
        for warning in warnings:
            print(f"WARN: {warning}")
    if missing:
        for item in missing:
            print(f"MISSING: {item}")
    if is_valid:
        print("RESULT: OK")
        return 0
    print("RESULT: FAIL")
    return 1


def build_parser() -> argparse.ArgumentParser:
    """Build CLI parser."""
    parser = argparse.ArgumentParser(description="HUMMBL repository tooling")
    parser.add_argument("--version", action="version", version=f"hummbl {__version__}")
    sub = parser.add_subparsers(dest="command")

    verify = sub.add_parser("verify-layout", help="Verify expected HUMMBL repo layout")
    verify.set_defaults(handler=cmd_verify_layout)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """CLI entrypoint."""
    parser = build_parser()
    args = parser.parse_args(argv)

    if not hasattr(args, "handler"):
        parser.print_help()
        return 0

    return args.handler(args)


if __name__ == "__main__":
    raise SystemExit(main())
